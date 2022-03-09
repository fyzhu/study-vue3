const data = {
  ok: true,
  foo: 1,
  bar: 2,
  text: 123,
};
let activeEffect = null;
const effectStack = [];
const jobQueue = new Set();
const p = Promise.resolve();
let isFlushing = false;
function flushJob() {
  if (isFlushing) return;
  isFlushing = true;
  p.then(() => {
    jobQueue.forEach((job) => job());
  }).finally(() => {
    isFlushing = false;
  });
}
function effect(fn, options = {}) {
  function effectFn() {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(activeEffect);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  }
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}
const bucket = new WeakMap();
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key);
    // return true;
  },
});

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

function trigger(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) return;
  let deps = depsMap.get(key);
  let oldDeps = new Set(deps);
  deps &&
    deps.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        oldDeps.add(effectFn);
      }
    });
  oldDeps.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
  // deps && deps.forEach((fn) => fn());
}
function cleanup(effectFn) {
  for (const deps of effectFn.deps) {
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

function computed(getter) {
  let value
  let dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler(fn) {
      dirty = true
      trigger(obj, 'value')
    },
  });

  const obj = {
    get value() {
      if(dirty){
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value;
    },
  };
  return obj;
}
const sum = computed(()=> obj.bar + obj.foo)
// console.log(sum.value);
// console.log(sum.value);

effect(()=> console.log(sum.value))
obj.bar = 300
// obj.foo++;
// obj.foo++;
// obj.foo++;
// console.log('end');
// setTimeout(() => {
//   console.log("5");
//   obj.text = 489;
// }, 4000);

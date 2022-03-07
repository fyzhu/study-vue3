const data = {
  ok: true,
  foo: 1,
  bar: true,
  text: 123,
};
let activeEffect = null;
const effectStack = [];
function effect(fn) {
  function effectFn() {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(activeEffect);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  }
  effectFn.deps = [];
  effectFn();
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
  // deps &&
  //   deps.forEach((effectFn) => {
  //     if (effectFn !== activeEffect) {
  //       oldDeps.add(effectFn);
  //     }
  //   });
  oldDeps.forEach((fn) => fn !== activeEffect && fn());
  // deps && deps.forEach((fn) => fn());
}
function cleanup(effectFn) {
  for (const deps of effectFn.deps) {
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}
let temp1, temp2;
effect(function () {
  console.log("effect1 run");

  obj.foo = obj.foo + 1;
  console.log("foo", obj.foo);
  // document.body.innerText = obj.ok ? obj.text : "not";
});

setTimeout(() => {
  // console.log("");
  obj.foo = 999;
}, 1000);

// setTimeout(() => {
//   console.log("5");
//   obj.text = 489;
// }, 4000);

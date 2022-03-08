const data = {
  ok: true,
  foo: true,
  bar: true,
  text: 123,
};
let activeEffect = null;
const effectStack = []
function effect(fn) {
  function effectFn() {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(activeEffect)
    fn();
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
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
  oldDeps.forEach((fn) => fn());
  // deps && deps.forEach((fn) => fn());
}
function cleanup(effectFn) {
  for (const deps of effectFn.deps) {
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}
let temp1, temp2
effect(function () {
  console.log("effect1 run");
  effect(function test(){
    console.log('effect2 run');
    temp2 = obj.bar
  })
  temp1 = obj.foo
  // document.body.innerText = obj.ok ? obj.text : "not";
});

setTimeout(() => {
  console.log('给 obj.foo 赋值，应该依次执行 effect1，effect2');
  obj.foo = false;
}, 1000);
// setTimeout(() => {
//   obj.foo = true;
// }, 1500);
setTimeout(() => {
  console.log('给 obj.bar 赋值，应该执行 effect2 一次');
  obj.bar = false;
}, 2000);
setTimeout(() => {
  console.log('给 obj.bar 赋值，应该执行 effect2 一次');
  obj.bar = true
}, 3000);
setTimeout(() => {
  console.log("读取 obj 的属性，不应该报错");
  console.log(obj.bar);
}, 3000);

// setTimeout(() => {
//   console.log("5");
//   obj.text = 489;
// }, 4000);

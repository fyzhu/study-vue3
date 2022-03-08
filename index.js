const data = {
  ok: true,
  text: 123,
};
let activeEffect = null;
function effect(fn) {
  function effectFn() {
    cleanup(effectFn);
    activeEffect = effectFn;
    fn();
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
effect(function () {
  console.log("effect run");
  console.log(obj.ok ? obj.text : "not");
  // document.body.innerText = obj.ok ? obj.text : "not";
});

setTimeout(() => {
  console.log('obj.ok 设置为 false');
  obj.ok = false;
}, 1000);

setTimeout(() => {
  console.log("更改 obj.txt 的值，不应该执行 effect");
  obj.text = 789;
}, 2000);
setTimeout(() => {
  console.log("obj.ok 设置为 true");
  obj.ok = true;
}, 3000);

setTimeout(() => {
  console.log("更改 obj.txt 的值，应该执行 effect");
  obj.text = 489;
}, 4000);

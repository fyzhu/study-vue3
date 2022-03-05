const data = {
  text: 123,
};
let activeEffect = null;
function effect(fn) {
  activeEffect = fn;
  activeEffect();
}
const bucket = new WeakMap();
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key)
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
}

function trigger(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) return;
  let deps = depsMap.get(key);
  deps && deps.forEach((fn) => fn());
}

effect(function () {
  console.log("effect run");
  document.body.innerText = obj.text;
});

setTimeout(() => {
  obj.text = 456;
}, 1000);

setTimeout(() => {
  obj.noExist = 789;
}, 2000);
setTimeout(() => {
  obj.noExist = 389;
}, 3000);

setTimeout(() => {
  obj.noExist = 389;
}, 4000);

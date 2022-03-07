const data = {
  text: 123,
};
let activeEffect = null
let temp
function effect(fn) {
  activeEffect = fn
  activeEffect()
}
const bucket = new Set;
const obj = new Proxy(data, {
  get(target, key) {
    if(activeEffect) {
      bucket.add(activeEffect);
      // activeEffect = null
    }
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    bucket.forEach((fn) => fn());
    return true
  },
});



effect(function () {
  console.log('effect run');
  // document.body.innerText = obj.text;
  temp = obj.text
});

setTimeout(() => {
  obj.text = 456;
}, 1000);

setTimeout(() => {
  obj.noExist = 789
}, 2000);
setTimeout(() => {
  obj.noExist = 389
}, 3000);

setTimeout(() => {
  obj.noExist = 389
}, 4000);
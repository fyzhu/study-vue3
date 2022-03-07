const data = {
  text: 1234,
};
const bucket = [];
let temp
const obj = new Proxy(data, {
  get(target, key) {
    bucket.push(effect);
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    bucket.forEach((item) => item());
  },
});
function effect() {
  // document.body.innerText = obj.text;
  temp = obj.text
  console.log(temp);
}
effect();

setTimeout(() => {
  obj.text = 456;
}, 1000);

// document.body.appendChild(test)

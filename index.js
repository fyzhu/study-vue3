const o = {
  text: 12344
}
const buket = []
const obj = new Proxy(o, {
  get(target, key) {
    buket.push(effect)
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    buket.forEach(item => item())
  }
})
function effect() {
  let test = document.querySelector('#test')
  test.innerHTML  = obj.text
}
effect()

setTimeout(() => {
  
  obj.text = 456
}, 1000);


// document.body.appendChild(test)
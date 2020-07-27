// 定义依赖
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm
    //expOrFn 支持函数
    if(typeof expOrFn === 'function'){
      this.getter = expOrFn
    } else { // 如果是字符串形式
      // 执行this.getter 就能读取数据的内容
      this.getter = parsePath(expOrFn)
    }
    this.deps = []
    // 用来判断当前watcher是否订阅了该dep
    this.depIds = new Set()
    this.cb = cb
    this.value = this.get()
  }
  addDep(dep){
    const id = dep.id
    if(!this.depIds.has(id)){
      this.depIds.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  get() {
    /**
     * 先在window.target设置成了this，也就是当前watcher实例，
     * 然后在读一下绑定的数据，触发getter
     * 就可以把this主动添加到dep中
     */
    window.target = this
    let value = this.getter.call(this.vm, this.vm)
    window.target = undefined
    return value
  }
  update() {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}

// 读取类似"obj.a.b.c" 这样的嵌套数据
function parsePath(path) {
  const bailRE = /[^\w.$]/
  if (bailRE.text(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
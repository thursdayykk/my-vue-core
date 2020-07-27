  // 工具函数
 function def(obj, key, val, enumerable){
   Object.defineProperty(obj, key, {
     value:val,
     enumerable:!!enumerable,
     writable:true,
     configurable:true
   })
 }
 
 // 侦测数据中的所有属性
 class Observer {
  constructor(value) {
    this.value = value
    // Vue将Array的依赖存放在Observer中（必须要要使得getter和拦截器都能访问到依赖列表）
    this.dep = new Dep()
    def(value,'__ob__', this)
    if (!Array.isArray(value)) {
      this.walk(value)
    } else {
      this.observeArray(value)
    }
  }
  /** 侦测数组中的每一项 */
  observeArray(items){
    for(let i = 0 ,l = items.length; i< l; i ++){
      observe(items[i])
    }
  }
  /**
   * 将每个属性都转换成getter/setter形式
   * 只有在数据类型为Object时被调用
   */
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}

function defineReactive(data, key, val) {
  // 只有object类型才会调用walk将每一个属性转换成getter/setter
  // if (typeof val === 'object') {
  //   new Observer(val)
  // }
  let childOb = observe(val) // 返回一个Observer实例
  let dep = new Dep()
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get() {
      // dep.depend()
      if(childOb){
        childOb.dep.depend()
      }
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
      dep.notify()
    },
  })
}
/** 
 * 尝试为value 创建一个Observer实例
 * 如果value已经有有一个Observer实例，直接返回它。
 * 没有则返回一个新创建的
 */
function observe(value, asRootData){
  if(!isObject(value)){
    return 
  }
  let ob
  if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer){
    // 如果value已经是响应式数据 不需要再次创建
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}
function $set(target, key, value){
  // target是数组
  if(Array.isArray(target) && isValidArrayIndex(key)){
    target.length = Math.max(target.length, key)
    // 拦截器可以侦测到
    target.splice(key, l, val)
    return val
  }
  // 如果key已经存在target中 属于修改数据会被侦测到
  if(key in target && !(key in Object.prototype)){
    target[key] = val
    return val
  }
  // 处理新增属性
  const ob = target.__ob__
  // target不能是Vue实例或者Vue实例的根数据对象
  if(target._isVue || (ob && ob.vmCount)){
    // this.$data就是根数据
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data' + 
      'at runtime - declare it upfront in the data option'
    )
    return val
  }
  // 如果target不是响应式 直接设置值
  if(!ob){
    target[key] = val
    return val
  }
  // 前面都不满足 则是在响应式数据上新增了一个属性 需要转化成getter/setter
  defineReactive(ob.value, key, val)
  ob.dep.notify() // 并触发依赖
  return val
}
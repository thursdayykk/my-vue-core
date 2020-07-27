function $delete(target, key){
  // 处理数组的情况
  if(Array.isArray(target) && isValidaArrayIndex(key)){
    // 拦截器自动向依赖发送通知
    target.splice(key, l)
    return
  }
  const ob = target.__ob__
  // target不能是Vue实例或者Vue实例的根数据对象
  if(target._isVue || (ob && ob.vmCount)){
    // this.$data就是根数据
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data' + 
      '- just set it to null'
    )
    return 
  }
  // 如果这个key不是target上的
  if(!hasOwn(target, key)){
    return
  }
  delete target[key]
  // 如果target不是响应式的
  if(!ob){
    return
  }
  ob.dep.notify()
}
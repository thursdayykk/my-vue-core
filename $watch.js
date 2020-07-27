Vue.prototype.$watch = function (expOrFn, cb, options){
  const vm = this
  options = options || {}
  const watcher = new Watcher(vm, expOrFn, cb, options)
  if(options.immediate){
    cb.call(vm, watcher.value)
  }
  return function unwatchFn(){
    watcher.teardown()
  }

}
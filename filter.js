Vue.options['filters'] = Object.create(null)
Vue.filters = function(id, definition){
  if(!definition){
    return this.options['filters'][id]
  }else{
    this.options['filters'][id] = definition
    return definition
  }
}
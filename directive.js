Vue.directive(id, [definition])

// 注册
Vue.directive('my-directive', {
  bind(){},

  inserted(){},

  update(){},

  componentUpdated(){},

  unbind(){}
})

Vue.directive('my-directive', ()=>{
  // 这里会被bind和update调用
})

Vue.options = Object.create(null)
Vue.options['directives'] = Object.create(null)

Vue.directive = function(id, definition){
  if(!definiton){ // 如果不存在 则获取指令
    return this.options['directives'][id]
  }else{
    if(typeof definiton === 'function'){ // 如果是函数 默认监听bind和update
      definition = {bind : definition, update: definition}
    }
    this.options['directives'][id] = definition
    return definition
  }
}
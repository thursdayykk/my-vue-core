function Vue(options){
  // ...略
  this._init(options)
}
/** 向Vue的原型中挂载方法 */
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
//初始化
function initMixin(Vue){
  Vue.prototype._init = function (options){
    //  包括生命周期的流程 响应式系统流程的启动等
    vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor),options || {}, vm)
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // 在data/props钱初始化inject
    initState(vm)
    initProvide(vm) // 在data/props后初始化provide
    callHook(vm, 'created')

    // 如果传了el选项，则自动开启模板编译阶段与挂载阶段
    // 没有el 则不进入下一个生命周期流程 需要用户手动执行vm.$mount
    if(vm.$options.el){
      vm.$mount(vm.$options.el)
    }
  }
}

// 数据相关的实例方法
function stateMixin(Vue){
  Vue.prototype.$set = set
  Vue.prototype.$delete = del
  Vue.prototype.$watch = function(expOrFn, cb, options){}
}

// 事件相关的实例方法
function eventsMixin(Vue){
  Vue.prototype.$on = function(event, fn){ //event可以是string，array
    const vm = this
    if(Array.isArray(event)){ // 依次注册到事件列表
      for(let i =0;i< event.length;i++){
        this.$on(event[i], fn)
      }
    }else{
      (vm._events[event] || (vm._events[event] = [])).push(fn)
    }
    return vm
  }
  Vue.prototype.$once = function(event, fn){
    const vm = this
    function on(){ //拦截器：先移除 后执行fn
      vm.$off(event,on)
      fn.apply(vm, arguments)
    }
    /**
     * 将原始监听器保存到拦截器的fn属性上
     * 当vm.$off遍历事件监听器列表时，同时检查监听器的fn属性，是否与用户提供的监听器函数相同
     * 只要有一个相同，则找到需要移除的监听器
     */
    on.fn = fn
     // 用拦截器代替监听器注册到事件列表
    vm.$on(event, on)
    return vm
  }
  Vue.prototype.$off = function(event, fn){
    const vm = this
    if(!arguments.length){// 没有参数时 移除所有事件的监听器
      vm._events = Object.create(null)
      return vm
    }
    // event是数组
    if(Array.isArray(event)){
      for(let i =0 ;i< event.length; i++){
        this.$off(event[i], fn)
        return vm
      }
    }
    
    // 安全检测 如果这个事件没有监听器 直接退出
    const cbs = vm._events[event]
    if(!cbs){
      return vm
    }
    // 只提供了事件名 则移除该事件所有的监听器
    if(arguments.length === 1){
      vm._events[event] = null
      return vm
    }
    // 同时提供了事件和回调 则移除事件对应的回调
    if(fn){
      const cbs = vm._events[event]
      let cb
      let i = cbs.length
      while(i--){
        cb = cbs[i]
        if(cb === fn || cb.fn === fn){
          cbs.splice(i, 1)
          break
        }
      }
    }
    return vm
  }
  Vue.prototype.$emit = function(event, fn){
    const vm = this
    let cbs = vm._events[event] // 取出回调函数列表
    if(cbs){
      const arg = toArray(arguments, 1)
      for(let i = 0; i< cbs.length; i++){
        try{
          cbs[i].apply(vm.args)
        }catch(e){
          handleError(e, vm, `event handler for "${event}"`)
        }
      }
    }
    return vm
  }
}

// 生命周期相关实例方法
function lifecycleMixin(Vue){
  Vue.prototype.$forceUpdate = function(){
    const vm = this
    if(vm._watcher){
      vm._watcher.update() // 其实每当组件内部依赖的数据发生变化时，都会自动触发
    }
  }
  Vue.prototype.$destroy = function (){
    const vm = this
   
    if(vm._isBeingDestroyed){ // 为了防止反复被销毁
      return 
    }
    callHook(vm, 'beforeDestroy') // 触发钩子
    vm._isBeingDestroyed  = true
    // 清理当前组件与父组件之间的连接（从父组件的$children属性中移除)
    const parent = vm.$parent
    // 父级存在 且 父级没有被销毁 且自己不是抽象组件
    if(parent && !parent._isBeingDestroyed && !vm.$options.abstract){
      // 把自己从父元素的子组件列表中删除
      remove(parent.$children, vm)
    }
    // 从watcher监听的所有状态的依赖列表中移除watcher
    if(vm._watcher){
        vm._watcher.teardown()
    }
    // 销毁用户使用vm.$watch创建的watcher
    let i = vm._watchers.length // 它存在vm._watchers里
    while(i --){
        vm._watchers[i].teardown
    }
    vm._isDestoryed = true // 表示实例已经被销毁

    /** vm.$destory执行时，不会将已经渲染到页面中的DOM移除，
     * 但会将模板中的所有指令解绑 */

    // 在vnode树上触发destroy钩子函数解绑指令
    vm.__patch__(vm._vnode, null) 
    // 触发destroyed钩子
    callHook(vm, 'destroyed')
    // 移除所有事件监听器
    vm.$off()
  }
}
function remove(arr, item){
  if(arr.length){
    const index = arr.indexOf(item)
    if(index > -1){
      return arr.splice(index, 1)
    }
  }
}
function renderMixin(Vue){
  Vue.prototype.$nextTick = function(fn){
    return nextTick(fn, this)
  }
}

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function(el){ // 被覆盖之后调用原来的
  el = el && query(el)

  const options = this.$options
  if(!options.render){ // 如果不存在render函数 将编译模板
    let template = options.template
    /** =====获取模板逻辑===== */
    if(template){
      // 解析模板
      if(typeof template === 'string'){
        if(template.charAt(0) === '#'){ // 字符串以#开头，选择符获取模板
          template = idToTemplate(tempalte)
        }
      }else if(tempalte.nodeType){ // template是元素
        template = template.innerHTML // 获取它的innerHTML作为模板
      }else{ // template选项既不是字符串又不是DOM元素
        if(process.env.NODE_ENV !== 'production'){ // 提示无效template选项
          warn('invalid template options:' + template , this)
        }
        return this
      }
    }else if(el){ // 获取模板
      template = getOuterHTML(el)
    }

    /** ===== 获取完模板之后，将模板编译成render函数===== */
    if(template){
      const {render} = compileToFunctions(
        template,
        {...},
        this
      )
      options.render = render
    }
  }
  return this.$mount.call(this, el)
}
/** 获取DOM */
function query(el){
  if(typeof el === 'string'){
    const selected = document.querySelector(el)
    if(!selected){ // 不存在则创建
      return document.createElement('div')
    }
    return selected
  } else { // 认为el为元素类型 直接返回
    return el 
  }
}
/** 根据el获取模板 */
function getOuterHTML(el){
  if(el.outerHTML){
    return outerHTML
  }else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}
/** 从选择符中获取模板 */
function idTotemplate(id){
  const el = query(id)
  return el && el.innerHTML
}
/** 模板 -> 代码字符串 -> 渲染函数 */
function compileToFunctions(template, options, vm){
  options = extend({}, options) // 混合options到空对象，让options成为可选参数

  // 缓存检查 检查是否已经存在编译后的模板
  const key = options.delimiters ? String(options.delimiters) + template: template
  if(cache[key]){
    return cache[key]
  }

  // 编译
  const compiled = compile(template, options)

  // 将代码字符串转换为函数
  const res = {}
  res.render = createFunction(compiled.render)
  return (cache[key] = res)
}

function createFunction(code){
  return new Function(code)
}

// 只包含运行时版本的$mount
Vue.prototype.$mount = function(el){
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el)
}

/** 挂载实例 */
function mountComponent(vm, el){
  /** 不存在渲染函数时，设置一个默认的渲染函数 */
  if(!vm.$options.render){
    vm.$options.render = createEmptyVNode
    if(process.env.NODE_ENV !== 'production'){
      // 开发环境警告
    }
  }
  // 挂载实例前触发beforeMount
  callHook(vm, 'beforeMount')
  // 挂载 持续性的渲染 当数据发生变化，依然可以渲染到指定DOM，所以需要watcher
  vm_watcher = new Watcher(vm, ()=>{
    // 执行渲染函数，得到一份新的VNode节点树
    // 调用虚拟DOM中patch执行节点比对与渲染
    vm._update(vm._render())
  }, noop)

  callHook(vm,'mounted')
  return vm
}
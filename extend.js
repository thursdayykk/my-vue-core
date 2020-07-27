var Profile = Vue.extend({
  template:'<p>{{name}}{{age}}{{sex}}</p>',
  data(){
    return {
      name:'john',
      age:18,
      sex:'o'
    }
  }
})
// 创建profile实例 挂载到#app上
new Profile().$mount('#app')

/** 功能：创建一个子类，从Vue上继承一些功能 */
let cid = 1
Vue.extend = function (extendOptions){
  extendOptions = extendOptions || {}
  const Super = this
  const SuperId = Super.cid 
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
  if(cachedCtors[SuperId]){
    return cachedCtors[SuperId]
  }
  const name = extendOptions.name || Super.options.name
  if(process.env.NODE_ENV !== 'production'){
    if(!/^[a-zA-Z][\w-]*$/.test(name)){
      // 开发环境下警告 name选项不合格
    }
  }
  // 子类构造函数
  const Sub = function VueComponent(options){
    this._init(options)
  }
  // 继承父类原型
  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub
  Sub.cid = cid ++
  // 合并父类选项和子类选项
  Sub.options = mergeOptions(Super.options,extendOptions)
  // 保存父类到子类里
  Sub['super'] = Super

  // 如果存在props，则初始化它
  if(Sub.options.props){
    initProps(Sub)
  }
  // 如果存在computed 则初始化
  if(Sub.options.computed){
    initComputed(Sub)
  }
  Sub.extend = Super.extend
  Sub.mixin = Super.mixin
  Sub.use = Super.use
  // ASSET_TYPES= ['componet','directive','filter']
  ASSET_TYPES.forEach(type => {
    Sub[type] = Super[type]
  })
  if(name){
    Sub.options.components[name] = Sub
  }
  Sub.superOptions = Super.options
  Sub.extendOptions = extendOptions
  Sub.sealedOptions = extend({}, Sub.options)
  // 父类id作为缓存的key 缓存子类构造函数
  cachedCtors[SuperId] = Sub
  // 继承原型
  return Sub
}

/** 初始化props 将key代理到_props中 */
function initProps(Comp){
  const props = Comp.options.props
  for(const key in props){
    proxy(Comp.prototype, `_props`, key)
  }
}
function initComputed(Comp){
  const computed = Comp.options.computed
  for(let key in computed){
    defineComputed(Comp.prototype, key, computed[key])
  }
}
function proxy(target, sourceKey, key){
  sharedPropertyDefinition.get = function proxyGetter(){
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter(val){
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

let demo = Vue.extend({
  template:`<li>{{text}}</li>`,
  props:{
    text:{
      type:String,
      default:''
    }
  }
})
let demo1 = Vue.extend({
  template:`<ul><demo v-for="(item,index) in datas" :key="index">{{item.text}} </demo></ul>`,
  data(){
    return {
      datas:[{id:0,text:'apple'}]
    }
  },
  components:{ // 局部注册
    demo:demo
  }
})
new demo1({
  propsData:{
   datas:[{id:0,text:'apple'}] 
  }
})
// 全局注册
Vue.component('demo',demo)
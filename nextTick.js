const callbacks = []
let pending = false
function flushCallbacks(){ // 一轮事件循环中这个函数只执行一次
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for(let i = 0; i< copies.length; i++){
    copies[i]()
  }
}

let mircoTimerFunc
let marcoTimerFunc 
let useMacroTask = false

// 优选setImmediate（仅IE）备选MesssageChannel 最后setTimeout添加到宏任务队列
if(typeof setImmediate !== 'undefined' && isNative(setImmediate)){
  marcoTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
}
else if(typeof MessageChannel !== 'undefined' && (isNative(MessageChannel) ||
MessageChannel.toString() === '[Object MessageChannelConstructor]')){
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  marcoTimerFunc = () => {
    port.postMessage(1)
  }
}else{
  marcoTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

if(typeof Promise !== 'undefined' && isNative(Promise)){
  const p = Pormise.resolve()
  mircoTimerFunc = () => { // 添加到微任务队列中
    p.then(flushCallbacks)
  }
}else{
  // 不支持Promise的时候 降级为宏任务
  mircoTimerFunc = marcoTimerFunc
}

/**
 * 给回调函数做一层包装
 * 保证在整个回调函数的执行过程中，如果修改了状态
 * 那么更新dom的操作会被推到宏任务队列中
 * （更新DOM的事件会晚于回调函数的执行时间）
 */
function withMacroTask(fn){ 
  return fn._withTask || (fn._withTask = function(){
    useMacroTask = true
    const res = fn.apply(null, arguments)
    useMacroTask = false
    return res
  })
}
function nextTick (cb, ctx){
  let _resolve 
  callbacks.push(()=>{
    if(cb){
      cb.call(ctx)
    }else if(_resolve){
      _resolve(ctx)
    }
  })
  if(!pending){
    pending = true
    if(useMacroTask){
      marcoTimerFunc()
    }else{
      mircoTimerFunc()
    }
  }
  if(!cb && typeof Promise !== 'undefined'){
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
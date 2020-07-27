class VNode {
  constructor(tag, data, children, text,elm,context,componentOptions,asyncFactory){
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text 
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.functionalContext = undefined
    this.functionalOptions =undefined
    this.functionalScopedId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }
  get child(){
    return this.componentInstance
  }
}

/** 注释节点有两个有效属性 text和isComment */
const createEmptyVNode = text => {
  const node = new VNode()
  node.text = text 
  node.isComment = true
  return node
}

/** 文本节点 只有一个有效属性 text */
const createTextVNode = text => {
  return new VNode(undefined,undefined,undefined,String(text))
}
/** 克隆节点 （性能提升）
 * 将现有节点的属性复制到新节点中，
 * 让新创建的节点和被克隆节点的属性保持一致，从而实现克隆效果。
 * 作用是优化静态节点 和 插槽节点
*/
const cloneVNode = (vnode, deep) => {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.isCloned = true // 与被克隆元素的差别在这里
  if(deep && vnode.children){
    cloned.children = cloneVNodes(vnode.children)
  }
  return cloned
}
/** 元素节点 */
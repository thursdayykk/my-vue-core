  // 依赖收集器 专门管理依赖（Watcher）
  class Dep {
    constructor() {
      this.subs = []
    }
    addSub(sub) {
      this.subs.push(sub)
    }
    removeSub() {
      // 删除
      remove(this.subs, sub)
    }
    depend() {
      // 收集
      if (window.target) {
        this.addSub(window.target)
      }
    }
    notify() {
      // 通知
      const subs = this.subs.slice()
      for (let i = 0, l = subs.length; i < l; i++) {
        subs[i].update()
      }
    }
  }

  function remove(arr, item) {
    if (arr.length) {
      if (arr.indexOf(item) > -1) {
        return arr.splice(index, 1)
      }
    }
  }
// HTML解析器 整体逻辑
function parseHTML(html, options){
  while(html){
    if(父元素为正常元素){
      // 文本、注释、条件注释、DOCTYPE、结束标签、开始标签
      if(标签类){
        if(注释){
          // ...
          continue
        }
        if(条件注释){
          // ...
          continue
        }
        if(是DOCTYPE){
          // ...
          continue 
        }
        if(结束标签){
          // ...
          continue
        }
        if(开始标签){
          // ...
          continue
        }
      } 
      if(文本类){
        // 解析文本
      }
      if(都没匹配上){
        text = html
        html = ''
      }
      if(options.chars && text){
        options.chars(text)
      }
    }else{ 
      // 父元素为script、style、textarea这种纯文本内容元素
    }
  }
}
function genNode(node, state){
  if(node.type === 1){
    return SVGLinearGradientElement(node, state)
  }
  if(node.type === 3 && node.isComment){
    return genComment(node)
  }
  else{
    return genText(node)
  }
}
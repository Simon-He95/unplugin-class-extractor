import { extractorCode } from './constant'

export function extractor(code: string) {
  // 用正则提取出 class 和 className，然后记录，最后一起输出到 output 地址

  // 先提取所有字符串字面量中的 class 内容
  const extractFromString = (str: string) => {
    str.split(/\s+/).forEach((name: string) => {
      if (name.trim()) {
        extractorCode.add(name.trim())
      }
    })
  }

  // 将换行符替换为空格，然后匹配 class/className 属性
  const normalizedCode = code.replace(/\s+/g, ' ')

  // 支持 class, className, :class 等多种写法
  const classRegex = /:?class(?:Name)?\s*[:=]\s*/g

  let match

  // eslint-disable-next-line no-cond-assign
  while ((match = classRegex.exec(normalizedCode)) !== null) {
    const startIndex = match.index + match[0].length

    // 从匹配位置开始，找到完整的表达式
    const remaining = normalizedCode.slice(startIndex)
    let expression = ''
    let depth = 0
    let inString = false
    let stringChar = ''
    let i = 0

    for (i = 0; i < remaining.length; i++) {
      const char = remaining[i]

      if (!inString) {
        if (char === '"' || char === '\'' || char === '`') {
          inString = true
          stringChar = char
          expression += char
        }
        else if (char === '(' || char === '{' || char === '[') {
          depth++
          expression += char
        }
        else if (char === ')' || char === '}' || char === ']') {
          if (depth > 0) {
            depth--
            expression += char
          }
          else {
            break
          }
        }
        else if ((char === ',' || char === ';' || char === '\n') && depth === 0) {
          break
        }
        else {
          expression += char
        }
      }
      else {
        expression += char
        if (char === stringChar && remaining[i - 1] !== '\\') {
          inString = false
          stringChar = ''
        }
      }
    }

    // 特殊处理模板字符串，只提取静态部分和嵌套的字符串字面量
    if (expression.includes('`')) {
      // 提取模板字符串中的静态文本部分
      const templateRegex = /`([^`]*)`/g
      let templateMatch
      // eslint-disable-next-line no-cond-assign
      while ((templateMatch = templateRegex.exec(expression)) !== null) {
        const templateContent = templateMatch[1]
        // 分割模板字符串，提取静态部分
        const parts = templateContent.split(/\$\{[^}]*\}/)
        parts.forEach((part) => {
          if (part.trim()) {
            extractFromString(part)
          }
        })

        // 同时提取模板字符串内嵌套的字符串字面量
        const nestedStringRegex = /['"]([^'"]*)['"]/g
        let nestedMatch
        // eslint-disable-next-line no-cond-assign
        while ((nestedMatch = nestedStringRegex.exec(templateContent)) !== null) {
          extractFromString(nestedMatch[1])
        }
      }
    }
    else {
      // 从表达式中提取所有字符串字面量
      const stringRegex = /["'`]([^"'`]*)["'`]/g
      let stringMatch
      // eslint-disable-next-line no-cond-assign
      while ((stringMatch = stringRegex.exec(expression)) !== null) {
        extractFromString(stringMatch[1])
      }

      // 特殊处理 Vue.js 的对象语法：{ 'class': condition }
      // 从对象字面量中提取键名（这些通常是 class 名）
      const vueObjectRegex = /(['"][^'"]*['"])\s*:/g
      let vueMatch
      // eslint-disable-next-line no-cond-assign
      while ((vueMatch = vueObjectRegex.exec(expression)) !== null) {
        const keyWithQuotes = vueMatch[1]
        // 移除引号并提取类名
        const className = keyWithQuotes.replace(/['"]/g, '')
        extractFromString(className)
      }
    }

    // 更新正则的 lastIndex 来避免重复匹配
    classRegex.lastIndex = startIndex + i
  }

  return code
}

export function extractorAll(code: string) {
  // 提取所有 '"([^"]*)"' 之间的内容
  code.replace(/(["'])(.*)\1/g, (_: string, _quote: string, classValue: string) => {
    classValue.split(/\s+/).forEach((name: string) => {
      if (name) {
        // 过滤一些特殊字符
        if (/^[0-9@./"'<>\]~]/.test(name))
          return
        extractorCode.add(name)
      }
    })
    return _
  })
  return code
}

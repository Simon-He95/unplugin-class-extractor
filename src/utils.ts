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
  // helper: 检查方括号是否不合法（未闭合或顺序错误）
  function hasInvalidBrackets(token: string) {
    const firstOpenIdx = token.indexOf('[')
    const firstCloseIdx = token.indexOf(']')
    // 如果存在 `[` 但后面没有对应的 `]`
    if (firstOpenIdx !== -1 && !/\]/.test(token.slice(firstOpenIdx)))
      return true
    // 如果存在 `]` 且它在第一个 `[` 之前，视为顺序错误
    if (firstCloseIdx !== -1 && firstOpenIdx !== -1 && firstCloseIdx < firstOpenIdx)
      return true
    return false
  }

  code.replace(/(["'])(.*)\1/g, (_: string, _quote: string, classValue: string) => {
    classValue.split(/\s+/).forEach((name: string) => {
      if (name) {
        // 支持开头为 ! 的 Tailwind 重要符号（例如 !px-0）。
        // 在做一系列验证时使用去掉开头 ! 的 "bare" 版本，但最终仍把原始 name（含 !）写入集合中。
        const originalName = name.replace(/,$/, '').replace(/^"|"$/g, '')
        const bare = originalName.replace(/^!+/, '')

        if (bare.startsWith('props.') || bare.endsWith('.value') || bare.startsWith('lucide:'))
          return

        // 过滤单个字符（包括单独的引号、空格等）
        // 严格检测不成对的方括号或顺序错误的方括号（例如 "]xxx[")
        // - 如果存在一个 `[` 但后面没有对应的 `]`，则视为不合法
        // - 如果存在 `]` 且其位置在 `[` 之前，视为顺序错误
        if (hasInvalidBrackets(bare))
          return

        if (bare.length <= 1)
          return

        if (name.startsWith('=') || (/[A-Z]/i.test(bare[0]) && bare[0] === bare[0].toUpperCase()))
          return

        // 过滤包含空格的字符串（CSS 类名不应该包含空格）
        if (/\s/.test(bare))
          return

        // 过滤一些明显的非类名字符串
        // 单独的引号、双引号
        if (bare === '\'' || bare === '"' || bare === '`')
          return

        // 包含明显的 JavaScript 关键字 —— 只在整个 token 完全等于关键字时过滤
        // 之前使用的 \b 边界会导致像 from-sky-500/90 中的 "from" 被匹配，误伤类名。
        if (/^(?:as|import|export|from|function|return|if|else|for|while|let|const|null|undefined|true|false)$/.test(bare))
          return
        // 过滤一些特殊字符开头的明显非类名字符串
        // 注意：不过滤 ! 因为它是 Tailwind 的 !important 语法
        if (/^[0-9@./"'<>\]~:;,=+\-*%&|^`\\(){}#]/.test(bare))
          return

        // 过滤 Vue 编译相关的字符串
        if (/^(?:plugin-vue:|_[a-zA-Z]|__[a-zA-Z])/.test(bare))
          return

        // 过滤常见的 HTML 标签名（单独出现时）
        if (/^(?:div|span|p|h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|img|svg|path|circle|rect|line|br|hr|input|button|form|label|select|option|textarea|a|strong|em|del|ins|sub|sup|code|pre|blockquote|figure|figcaption|iframe|video|audio|canvas|script|style|link|meta|head|body|html|title|base|noscript)$/.test(bare))
          return

        // 过滤纯数字
        if (/^\d+$/.test(bare))
          return

        // 过滤看起来像文件扩展名的字符串
        if (/^(?:js|ts|vue|jsx|tsx|css|scss|sass|less|html|xml|json|md|txt|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp4|mp3|wav|pdf|zip|rar|tar|gz)$/.test(bare))
          return

        // 过滤 MIME 类型
        if (/^[a-z]+\/[a-z0-9-+.]+/.test(bare))
          return

        // 过滤看起来像邮箱或域名的字符串
        if (/@/.test(bare) || /\.(?:com|org|net|io|dev|app|co|me|info|biz|edu|gov|mil)$/.test(bare))
          return

        // 过滤包含模板字符串变量插值的内容
        if (/\$\{/.test(bare))
          return

        // 过滤包含 emoji 表情的内容
        // 包括常见的 Emoji 区间以及某些符号（例如 U+2139 INFORMATION SOURCE ℹ️），
        // 并允许跟随可选的变体选择符 U+FE0F
        if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2139}]\u{FE0F}?/u.test(bare))
          return

        // 过滤结尾包含特殊符号的字符串（代码片段）
        // 但允许 Tailwind 的 arbitrary value 语法，例如 p-[calc(4/7*1em)]
        // 先检测是否以特殊符号结尾（不包括 `[`），再排除像 prefix-[...] 这样的合法任意值语法
        const endsWithSpecialChar = /[,;"'`\\(){}<>+=|&^%*@#:.]$/.test(bare)
        const arbitraryBracketPattern = /^[^\s[\]]+\[[^\]]+\]$/.test(bare)
        if (endsWithSpecialChar && !arbitraryBracketPattern)
          return
        // 额外启发式过滤：排除明显不是 Tailwind 类名的 token

        // 1) URL / 协议 / 邮箱 等
        if (bare.includes('://') || bare.includes('http') || bare.startsWith('www.') || /@/.test(bare))
          return

        // 2) Vue 的编译标记或作用域 id（data-v-...）
        if (/\bdata-v-[0-9a-fA-F]+\b/.test(bare) || bare.startsWith('data-v-'))
          return

        // 4) 含有圆括号的（如 translate3d(0px）且不是在方括号内的 arbitrary value，通常不是类名
        // 允许 prefix-[calc(...)] 这种形式，通过检测 arbitraryBracketPattern 来判断
        // 如果 token 中包含任意方括号片段（例如 [calc(...)]），则允许其中包含圆括号
        const hasBracketed = /\[[^\]]+\]/.test(bare)
        if (/[()]/.test(bare) && !hasBracketed)
          return

        // 4) 过长的 token（防止把整段文本或句子当成一个类名），阈值可调整
        if (bare.length > 80)
          return

        // 5) 含有明显的域名后缀（.com/.io 等）或以点号结尾的碎片
        if (/\.(?:com|org|net|io|dev|app|co|me|info|biz|edu|gov|mil)\b/i.test(bare) || /\.$/.test(bare))
          return

        // 其他的都保留（包括 Tailwind 的各种语法）
        extractorCode.add(originalName)
      }
    })
    return _
  })
  return code
}

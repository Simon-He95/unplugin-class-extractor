import { extractorCode } from './constant'

export function extractor(code: string) {
  // 用正则提取出 class 和 className，然后记录，最后一起输出到 output 地址
  code.replace(/\s*([\][])\s*/g, '$1').replace(/class(?:Name)?\s*[:=]\s*(.*)/g, (match, className) => {
    // className 提取 ""之间的内容
    className.replace(/"([^"]*)"/g, (_: string, classValue: string) => {
      classValue.split(/\s+/).forEach((name: string) => {
        if (name) {
          extractorCode.add(name)
        }
      })
    })

    return match
  })
  return code
}

export function extractorAll(code: string) {
  // 提取所有 '"([^"]*)"' 之间的内容
  code.replace(/(["'])(.*)\1/g, (_: string, _quote: string, classValue: string) => {
    classValue.split(/\s+/).forEach((name: string) => {
      if (name) {
        // 过滤一些特殊字符
        if (/^[^0-9@./"<>[\]]/.test(name))
          return
        extractorCode.add(name)
      }
    })
    return _
  })
  return code
}

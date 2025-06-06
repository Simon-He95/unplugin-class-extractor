import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import type { Options } from './types'
import { PLUGIN_NAME } from './constant'

const extractorCode = new Set<string>()
export const unpluginFactory: UnpluginFactory<Options> = (options) => {
  const filter = createFilter(options.include, options.exclude)
  extractorCode.clear()
  options.safeList?.forEach((className) => {
    extractorCode.add(className)
  })
  return {
    name: PLUGIN_NAME,
    apply: 'build', // 只在构建时应用
    enforce: 'post', // 确保在所有转换之后执行
    transformInclude(id) {
      return filter(id)
    },
    transform(code, id) {
      console.warn(`[${PLUGIN_NAME}] Development mode detected, transform for ${id}`)
      return extractor(code)
    },
    writeBundle() {
      if (extractorCode.size > 0) {
        const output = options.output
        if (typeof output !== 'string' || output.trim() === '') {
          throw new Error('Output path must be a non-empty string')
        }
        const resolvedPath = path.resolve(process.cwd(), output) // 将相对路径解析为绝对路径
        const content = `export default \`${Array.from(extractorCode).join(' ')}\`;` // 拼接成 export default 字符串
        try {
          fs.writeFileSync(resolvedPath, content, 'utf-8') // 写入文件
          // eslint-disable-next-line no-console
          console.log(`Extracted class names written to ${resolvedPath}`)
        }
        catch (error) {
          console.error(`Failed to write extracted class names to ${resolvedPath}:`, error)
        }
      }
      else {
        // eslint-disable-next-line no-console
        console.log('No class names extracted.')
      }
    },
  }

  function extractor(code: string) {
    // 用正则提取出 class 和 className，然后记录，最后一起输出到 output 地址
    code.replace(/class(?:Name)?\s*[:=]\s*(.*)/g, (match, className) => {
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
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin

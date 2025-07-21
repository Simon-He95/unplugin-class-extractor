import type { UnpluginFactory } from 'unplugin'
import type { Options } from './types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createFilter } from '@rollup/pluginutils'
import { createUnplugin } from 'unplugin'
import { extractorCode, PLUGIN_NAME } from './constant'
import { extractor, extractorAll } from './utils'

export const unpluginFactory: UnpluginFactory<Options> = (options) => {
  const filter = createFilter(options.include, options.exclude)
  const fullScanFilesfilter = createFilter(options.fullScanFiles)
  extractorCode.clear()
  options.safeList?.forEach((className) => {
    className.split(/\s+/g).forEach(name => extractorCode.add(name))
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
      return fullScanFilesfilter(id) ? extractorAll(code) : extractor(code)
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
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin

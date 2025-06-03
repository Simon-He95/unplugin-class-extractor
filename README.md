# unplugin-class-extractor

一个基于 [unplugin](https://github.com/unplugin/unplugin) 的插件，用于解析指定文件类型，自动提取 `class` 和 `className` 属性，并将其拼接成一个新的字符串，供 TailwindCSS 或 UnoCSS 等工具进行样式提取。

## 特性

- 支持多种构建工具（Vite、Webpack、Rollup、esbuild、Rspack、Nuxt、Astro 等）
- 自动扫描并提取文件中的 `class` 和 `className`
- 生成合并后的 class 字符串，方便 Tailwind CSS 进行样式扫描
- 零配置开箱即用，支持自定义选项

## 安装

```bash
pnpm add -D unplugin-class-extractor
# 或
npm install -D unplugin-class-extractor
# 或
yarn add -D unplugin-class-extractor
```

## 使用

### Vite

```ts
// vite.config.ts
import classExtractor from 'unplugin-class-extractor/vite'

export default {
  plugins: [
    classExtractor({
      include: ['**/*.html', '**/*.vue', '**/*.jsx'], // 指定需要处理的文件类型
      exclude: ['node_modules/**'], // 排除不需要处理的文件
      output: 'extracted-classes.txt', // 输出文件路径
      safeList: ['container', 'mx-auto'], // 额外需要保留的 class
    }),
  ],
}
```

### Webpack

```js
// webpack.config.js
const classExtractor = require('unplugin-class-extractor/webpack')

module.exports = {
  plugins: [
    classExtractor({
      include: ['**/*.html', '**/*.vue', '**/*.jsx'],
      exclude: ['node_modules/**'],
      output: 'extracted-classes.txt',
      safeList: ['container', 'mx-auto'],
    }),
  ],
}
```

### Rollup

```js
// rollup.config.js
import classExtractor from 'unplugin-class-extractor/rollup'

export default {
  plugins: [
    classExtractor({
      include: ['**/*.html', '**/*.vue', '**/*.jsx'],
      exclude: ['node_modules/**'],
      output: 'extracted-classes.txt',
      safeList: ['container', 'mx-auto'],
    }),
  ],
}
```

### Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'unplugin-class-extractor/nuxt',
  ],
  unpluginClassExtractor: {
    include: ['**/*.html', '**/*.vue', '**/*.jsx'],
    exclude: ['node_modules/**'],
    output: 'extracted-classes.txt',
    safeList: ['container', 'mx-auto'],
  },
})
```

### 配置选项

| 参数       | 类型          | 默认值           | 描述                                                                 |
|------------|---------------|------------------|----------------------------------------------------------------------|
| `include`  | `string[]`    | `['**/*.html']`  | 指定需要处理的文件类型                                               |
| `exclude`  | `string[]`    | `['node_modules/**']` | 排除不需要处理的文件                                               |
| `output`   | `string`      | `extracted-classes.txt` | 输出文件路径                                                       |
| `safeList` | `string[]`    | `[]`             | 额外需要保留的 class 名称                                           |

## 典型场景

适用于 Tailwind CSS 的 JIT 模式，自动收集所有 class，避免遗漏样式。

## License

[MIT](./LICENSE)

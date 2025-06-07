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

### 1. 提升 Tailwind CSS/UnoCSS JIT 模式的扫描效率

在 Tailwind CSS 的 JIT (Just-In-Time) 模式或 UnoCSS 中，构建工具会扫描你的项目文件以查找使用到的工具类，并按需生成对应的 CSS。`unplugin-class-extractor` 可以：

-   **自动收集**：自动从 HTML、Vue、React (JSX/TSX) 等多种文件中提取 `class` 和 `className` 属性中定义的所有类名。
-   **避免遗漏**：确保所有动态拼接或条件渲染的类名也能被有效捕获（如果它们以静态字符串形式存在于提取目标中）。
-   **生成聚合文件**：将所有提取到的类名输出到一个单一的文件（如 `extracted-classes.txt`）。你可以将这个文件加入到 Tailwind CSS 或 UnoCSS 的 `content` 配置中。在某些情况下，特别是对于大型或复杂项目，扫描这个聚合文件可能比扫描大量原始源文件更快。

### 2. 优化外部 UI 组件库与宿主项目的集成

当你开发一个独立的 UI 组件库（例如使用 Vue、React 或 Web Components，并采用 Tailwind CSS 或 UnoCSS 进行样式设计），并希望在其他项目中使用这个库时，通常会遇到以下挑战：

-   **样式处理策略**：为了确保最终项目中样式的统一性和避免 CSS 重复，组件库本身不应预先编译其 Tailwind/UnoCSS 类。相反，这些类应当由使用该库的宿主项目中的 Tailwind/UnoCSS 引擎来扫描和生成。
-   **扫描性能瓶颈**：如果组件库包含大量文件，宿主项目在其 `tailwind.config.js` (或 UnoCSS 配置文件) 的 `content` 数组中直接包含组件库的整个源码路径 (例如 `node_modules/my-ui-lib/src/**/*.{vue,js,ts,jsx,tsx}`)，可能会导致宿主项目的构建过程和开发时的热模块替换 (HMR) 速度显著下降。

**`unplugin-class-extractor` 如何提供帮助：**

此插件为上述场景提供了一个高效的解决方案：

1.  **在你的 UI 组件库项目中**：
    *   在构建组件库的流程中配置并使用 `unplugin-class-extractor`。
    *   插件会扫描你组件库中所有指定类型的文件，提取出所有用到的 `class` 和 `className` 字符串。
    *   这些提取出的类名会被写入到一个单一的输出文件（例如，配置 `output: 'dist/styles/extracted-classes.txt'`）。
    *   当你发布你的组件库时，将这个生成的 `extracted-classes.txt` 文件一同发布（例如，将其包含在 npm 包的 `files` 数组中）。

2.  **在宿主项目中（即使用你的 UI 组件库的项目）**：
    *   在其 `tailwind.config.js` (或等效的 UnoCSS 配置文件) 的 `content` 配置中，不再指向组件库的庞大源码目录。
    *   而是指向组件库发布包中那个预先提取好的类名文件，例如：`'./node_modules/your-component-library/dist/styles/extracted-classes.txt'`。

通过这种方式，宿主项目的 Tailwind/UnoCSS 引擎只需扫描一个轻量级的、仅包含纯类名列表的文本文件，而不是遍历组件库的全部源文件。这极大地减少了需要分析的内容，从而显著提升了宿主项目的构建速度和开发服务器的启动/热更新性能，同时确保了组件库中所有必需的原子化 CSS 类都能被宿主项目正确识别和生成。

## License

[MIT](./LICENSE)

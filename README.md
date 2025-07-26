# unplugin-class-extractor

一个基于 [unplugin](https://github.com/unplugin/unplugin) 的插件，用于解析指定文件类型，自动提取 `class` 和 `className` 属性，并将其拼接成一个新的字符串，供 TailwindCSS 或 UnoCSS 等工具进行样式提取。

## 背景

在开发基于 Tailwind CSS 或 UnoCSS 的 UI 组件库时，开发者通常面临一个两难的选择：

### 选择一：打包原子化 CSS 结果
- **优势**：使用者可以直接使用预编译的样式，无需额外配置
- **问题**：
  - 预编译的 CSS 与使用者项目中的原子化 CSS 无法复用和合并
  - 会产生样式冗余，增加最终包体积
  - 失去了原子化 CSS 按需生成的核心优势

### 选择二：不打包 CSS，通过 content 扫描源码
- **优势**：保持原子化 CSS 的按需生成特性，样式可以完全复用
- **问题**：
  - 需要在 `tailwind.config.js` 或 UnoCSS 配置中添加组件库源码路径到 `content` 数组
  - 扫描大量源码文件会显著增加构建时间
  - 开发环境的热更新性能会受到严重影响
  - 随着组件库规模增长，性能问题会愈发严重

### 我们的解决方案

`unplugin-class-extractor` 提供了第三种方案：**预提取 + 按需生成**

- 在组件库构建时，提前扫描并提取所有用到的类名
- 将提取结果输出为轻量级的文本文件
- 使用者只需将这个文本文件加入到 `content` 配置中
- 既保持了原子化 CSS 的按需生成特性，又避免了扫描大量源码文件的性能开销

这种方案完美平衡了性能与功能，让 UI 组件库的开发者和使用者都能享受到最佳的开发体验。

## 特性

- 支持多种构建工具（Vite、Webpack、Rollup、esbuild、Rspack、Nuxt、Astro 等）
- 自动扫描并提取文件中的 `class` 和 `className`
- 生成合并后的 class 字符串，方便 Tailwind CSS 进行样式扫描
- 零配置开箱即用，支持自定义选项

### 新特性：全量字符串分割扫描（fullScanFiles）

有些文件（如第三方模板、特殊业务文件）可能 class 并不在 class/className 属性中，而是以字符串形式存在。你可以通过 `fullScanFiles` 选项指定这些文件，插件会自动提取所有字符串字面量并分割为 class 进行扫描。

#### 用法示例

```js
classExtractor({
  include: ['src/**/*.{vue,jsx,tsx}'],
  output: 'dist/extracted-classes.txt',
  fullScanFiles: ['src/special-template.js', '**/raw-*.js'], // 这些文件会全量字符串分割
})
```

#### 适用场景

- 业务中有部分 class 以字符串变量、模板等形式存在，无法通过常规 class/className 属性提取时。
- 需要最大化提取所有潜在 class，避免遗漏。

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
| `fullScanFiles` | `string[]` | `[]` | 指定需要全量字符串分割扫描的文件（glob 支持），适用于 class 以字符串形式存在的场景 |

## 典型场景

### 1. 提升 Tailwind CSS/UnoCSS JIT 模式的扫描效率

在 Tailwind CSS 的 JIT (Just-In-Time) 模式或 UnoCSS 中，构建工具会扫描你的项目文件以查找使用到的工具类，并按需生成对应的 CSS。`unplugin-class-extractor` 可以：

-   **自动收集**：自动从 HTML、Vue、React (JSX/TSX) 等多种文件中提取 `class` 和 `className` 属性中定义的所有类名。
-   **避免遗漏**：确保所有动态拼接或条件渲染的类名也能被有效捕获（如果它们以静态字符串形式存在于提取目标中）。
-   **生成聚合文件**：将所有提取到的类名输出到一个单一的文件（如 `extracted-classes.txt`）。你可以将这个文件加入到 Tailwind CSS 或 UnoCSS 的 `content` 配置中。在某些情况下，特别是对于大型或复杂项目，扫描这个聚合文件可能比扫描大量原始源文件更快。

### 2. 解决 UI 组件库的原子化 CSS 困境

这是本插件最重要的应用场景。当你开发一个基于 Tailwind CSS 或 UnoCSS 的 UI 组件库时，你会面临前面提到的两难选择。

**传统做法的问题：**
- 如果将 CSS 打包到组件库中，使用者项目中的原子化 CSS 无法与组件库的 CSS 进行复用和合并
- 如果不打包 CSS，要求使用者在 `content` 中配置组件库源码路径（如 `node_modules/your-ui-lib/src/**/*.{vue,js,ts,jsx,tsx}`），会导致构建和开发时的性能问题

**`unplugin-class-extractor` 的解决方案：**

1.  **在你的 UI 组件库项目中**：
    ```ts
    // 在构建配置中使用插件
    classExtractor({
      include: ['src/**/*.{vue,jsx,tsx}'],
      output: 'dist/extracted-classes.txt',
    })
    ```

    插件会扫描你组件库中所有指定类型的文件，提取出所有用到的 `class` 和 `className` 字符串，并将结果写入 `dist/extracted-classes.txt` 文件。

2.  **在宿主项目中（即使用你的 UI 组件库的项目）**：
    ```js
    // tailwind.config.js
    module.exports = {
      content: [
        './src/**/*.{js,ts,jsx,tsx,vue}',
        // 不再需要扫描整个组件库源码，只需要包含预提取的类名文件
        './node_modules/your-ui-lib/dist/extracted-classes.txt'
      ],
      // ...
    }
    ```

**带来的好处：**
- ✅ **性能优化**：宿主项目只需要扫描一个轻量级的文本文件，而不是遍历组件库的全部源文件
- ✅ **开发体验**：显著提升构建速度和开发服务器的启动/热更新性能
- ✅ **样式复用**：保持原子化 CSS 的按需生成特性，确保样式可以完全复用
- ✅ **零冗余**：避免了预编译 CSS 带来的样式冗余问题
- ✅ **易于维护**：组件库开发者无需为样式打包策略烦恼，使用者也无需复杂的配置

这种方式既解决了性能问题，又保持了原子化 CSS 的核心优势，为 UI 组件库的开发和使用提供了最佳实践。

## License

[MIT](./LICENSE)

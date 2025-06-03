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

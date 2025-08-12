import { beforeEach, describe, expect, it } from 'vitest'
import { extractorCode } from '../src/constant'
import { extractor, extractorAll } from '../src/utils'

describe('extractor function', () => {
  beforeEach(() => {
    extractorCode.clear()
  })

  it('should extract basic class attributes', () => {
    const code = `<div class="flex items-center justify-center">Test</div>`
    extractor(code)
    expect(Array.from(extractorCode)).toContain('flex')
    expect(Array.from(extractorCode)).toContain('items-center')
    expect(Array.from(extractorCode)).toContain('justify-center')
  })

  it('should extract className attributes', () => {
    const code = `<div className="bg-red-500 text-white">Test</div>`
    extractor(code)
    expect(Array.from(extractorCode)).toContain('bg-red-500')
    expect(Array.from(extractorCode)).toContain('text-white')
  })

  it('should extract classes from complex expressions with _normalizeClass', () => {
    const code = `class: _normalizeClass(
      _unref(cn)(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-ring disabled:cursor-not-allowed disabled:opacity-50",
        props.class
      )
    )`
    extractor(code)
    expect(Array.from(extractorCode)).toContain('flex')
    expect(Array.from(extractorCode)).toContain('h-9')
    expect(Array.from(extractorCode)).toContain('w-full')
    expect(Array.from(extractorCode)).toContain('rounded-md')
    expect(Array.from(extractorCode)).toContain('border')
    expect(Array.from(extractorCode)).toContain('border-input')
    expect(Array.from(extractorCode)).toContain('bg-transparent')
    expect(Array.from(extractorCode)).toContain('disabled:opacity-50')
  })

  it('should extract classes from conditional expressions', () => {
    const code = `className={condition ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`
    extractor(code)
    expect(Array.from(extractorCode)).toContain('bg-blue-500')
    expect(Array.from(extractorCode)).toContain('text-white')
    expect(Array.from(extractorCode)).toContain('bg-gray-200')
    expect(Array.from(extractorCode)).toContain('text-black')
  })

  it('should extract classes from template literals', () => {
    const code = `class=\`flex items-center \${isActive ? 'bg-blue-500' : 'bg-gray-200'}\``
    extractor(code)
    expect(Array.from(extractorCode)).toContain('flex')
    expect(Array.from(extractorCode)).toContain('items-center')
    expect(Array.from(extractorCode)).toContain('bg-blue-500')
    expect(Array.from(extractorCode)).toContain('bg-gray-200')
  })

  it('should extract classes from multi-line expressions', () => {
    const code = `
      className={clsx(
        "base-class",
        isActive && "active-class",
        isDisabled && "disabled-class"
      )}
    `
    extractor(code)
    expect(Array.from(extractorCode)).toContain('base-class')
    expect(Array.from(extractorCode)).toContain('active-class')
    expect(Array.from(extractorCode)).toContain('disabled-class')
  })

  it('should handle single quotes', () => {
    const code = `<div class='container mx-auto'>Test</div>`
    extractor(code)
    expect(Array.from(extractorCode)).toContain('container')
    expect(Array.from(extractorCode)).toContain('mx-auto')
  })

  it('should handle mixed quotes in same expression', () => {
    const code = `className={cn("flex items-center", 'bg-white shadow-lg')}`
    extractor(code)
    expect(Array.from(extractorCode)).toContain('flex')
    expect(Array.from(extractorCode)).toContain('items-center')
    expect(Array.from(extractorCode)).toContain('bg-white')
    expect(Array.from(extractorCode)).toContain('shadow-lg')
  })

  it('should extract from Vue.js style bindings', () => {
    const code = `:class="{ 'active': isActive, 'disabled': isDisabled }"`
    extractor(code)
    expect(Array.from(extractorCode)).toContain('active')
    expect(Array.from(extractorCode)).toContain('disabled')
  })

  it('should ignore empty strings and whitespace-only strings', () => {
    const code = `class="flex   items-center    justify-center"`
    extractor(code)
    const result = Array.from(extractorCode)
    expect(result).toContain('flex')
    expect(result).toContain('items-center')
    expect(result).toContain('justify-center')
    expect(result).not.toContain('')
    expect(result).not.toContain('   ')
  })

  it('should extract classes from complex Vue component with compiled output', () => {
    const code = `import { defineComponent as _defineComponent } from "vue";
import { unref as _unref, isRef as _isRef, vModelText as _vModelText, normalizeClass as _normalizeClass, withDirectives as _withDirectives, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "../../utils";
export default /* @__PURE__ */ _defineComponent({
  __name: "Input",
  props: {
    defaultValue: {},
    modelValue: {},
    class: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const modelValue = useVModel(props, "modelValue", emits, {
      passive: true,
      defaultValue: props.defaultValue
    });
    return (_ctx, _cache) => {
      return _withDirectives((_openBlock(), _createElementBlock("input", {
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _isRef(modelValue) ? modelValue.value = $event : null),
        class: _normalizeClass(
          _unref(cn)(
            "flex h-9 w-full rounded-md border border-input-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-ring disabled:cursor-not-allowed disabled:opacity-50",
            props.class
          )
        )
      }, null, 2)), [
        [_vModelText, _unref(modelValue)]
      ]);
    };
  }
});`
    extractor(code)

    // 验证能够正确提取长字符串中的各种 class
    expect(Array.from(extractorCode)).toContain('flex')
    expect(Array.from(extractorCode)).toContain('h-9')
    expect(Array.from(extractorCode)).toContain('w-full')
    expect(Array.from(extractorCode)).toContain('rounded-md')
    expect(Array.from(extractorCode)).toContain('border')
    expect(Array.from(extractorCode)).toContain('border-input-input')
    expect(Array.from(extractorCode)).toContain('bg-transparent')
    expect(Array.from(extractorCode)).toContain('px-3')
    expect(Array.from(extractorCode)).toContain('py-1')
    expect(Array.from(extractorCode)).toContain('text-sm')
    expect(Array.from(extractorCode)).toContain('shadow-sm')
    expect(Array.from(extractorCode)).toContain('transition-colors')
    expect(Array.from(extractorCode)).toContain('file:border-0')
    expect(Array.from(extractorCode)).toContain('file:bg-transparent')
    expect(Array.from(extractorCode)).toContain('file:text-sm')
    expect(Array.from(extractorCode)).toContain('file:font-medium')
    expect(Array.from(extractorCode)).toContain('placeholder:text-muted-foreground')
    expect(Array.from(extractorCode)).toContain('focus-visible:outline-none')
    expect(Array.from(extractorCode)).toContain('focus-visible:ring-1')
    expect(Array.from(extractorCode)).toContain('focus-visible:ring-input-ring')
    expect(Array.from(extractorCode)).toContain('disabled:cursor-not-allowed')
    expect(Array.from(extractorCode)).toContain('disabled:opacity-50')
  })
})

describe('extractorAll function', () => {
  beforeEach(() => {
    extractorCode.clear()
  })

  it('should extract all strings from any context', () => {
    const code = `
      const message = "Hello world flex items-center"
      const styles = 'bg-blue-500 text-white p-4'
      const config = { theme: "dark-mode rounded-lg" }
    `
    extractorAll(code)
    expect(Array.from(extractorCode)).toContain('Hello')
    expect(Array.from(extractorCode)).toContain('world')
    expect(Array.from(extractorCode)).toContain('flex')
    expect(Array.from(extractorCode)).toContain('items-center')
    expect(Array.from(extractorCode)).toContain('bg-blue-500')
    expect(Array.from(extractorCode)).toContain('text-white')
    expect(Array.from(extractorCode)).toContain('p-4')
    expect(Array.from(extractorCode)).toContain('dark-mode')
    expect(Array.from(extractorCode)).toContain('rounded-lg')
  })

  it('should filter out strings starting with special characters', () => {
    const code = `
      const data = "123invalid @mention .class /path 'quote <tag >end ]bracket ~tilde"
    `
    extractorAll(code)
    const result = Array.from(extractorCode)
    // These should be filtered out
    expect(result).not.toContain('123invalid')
    expect(result).not.toContain('@mention')
    expect(result).not.toContain('.class')
    expect(result).not.toContain('/path')
    expect(result).not.toContain('\'quote')
    expect(result).not.toContain('<tag')
    expect(result).not.toContain('>end')
    expect(result).not.toContain(']bracket')
    expect(result).not.toContain('~tilde')
  })

  it('should handle empty strings gracefully', () => {
    const code = `const empty = ""`
    extractorAll(code)
    expect(Array.from(extractorCode)).not.toContain('')
  })

  it('should extract from JavaScript template files', () => {
    const code = `
      const template = "container mx-auto px-4 py-8 bg-gray-100"
      const buttonStyles = 'btn btn-primary hover:bg-blue-600 focus:ring-2'
    `
    extractorAll(code)
    expect(Array.from(extractorCode)).toContain('container')
    expect(Array.from(extractorCode)).toContain('mx-auto')
    expect(Array.from(extractorCode)).toContain('px-4')
    expect(Array.from(extractorCode)).toContain('py-8')
    expect(Array.from(extractorCode)).toContain('bg-gray-100')
    expect(Array.from(extractorCode)).toContain('btn')
    expect(Array.from(extractorCode)).toContain('btn-primary')
    expect(Array.from(extractorCode)).toContain('hover:bg-blue-600')
    expect(Array.from(extractorCode)).toContain('focus:ring-2')
  })

  it('should extract Tailwind arbitrary value selectors and pseudo-classes', () => {
    const code = `
      const styles = "[&:hover]:bg-red-500 [&>*]:text-white [&_p]:mb-4 group-hover:opacity-50 peer-checked:text-green-500"
      const responsive = "sm:text-lg md:text-xl lg:text-2xl dark:bg-gray-900"
      const arbitrary = "[123px] [#ff0000] [calc(100%-2rem)] [url('/bg.jpg')] [--custom-property]"
    `
    extractorAll(code)
    expect(Array.from(extractorCode)).toContain('[&:hover]:bg-red-500')
    expect(Array.from(extractorCode)).toContain('[&>*]:text-white')
    expect(Array.from(extractorCode)).toContain('[&_p]:mb-4')
    expect(Array.from(extractorCode)).toContain('group-hover:opacity-50')
    expect(Array.from(extractorCode)).toContain('peer-checked:text-green-500')
    expect(Array.from(extractorCode)).toContain('sm:text-lg')
    expect(Array.from(extractorCode)).toContain('md:text-xl')
    expect(Array.from(extractorCode)).toContain('lg:text-2xl')
    expect(Array.from(extractorCode)).toContain('dark:bg-gray-900')
    expect(Array.from(extractorCode)).toContain('[123px]')
    expect(Array.from(extractorCode)).toContain('[#ff0000]')
    expect(Array.from(extractorCode)).toContain('[calc(100%-2rem)]')
    expect(Array.from(extractorCode)).toContain('[url(\'/bg.jpg\')]')
    expect(Array.from(extractorCode)).toContain('[--custom-property]')
  })

  it('should extract complex Tailwind class with arbitrary values and selectors', () => {
    const code = 'class="has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]"'
    extractorAll(code)
    expect(Array.from(extractorCode)).toContain('has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]')
  })
})

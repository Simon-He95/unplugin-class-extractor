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

  it('should filter out emoji like ℹ️ from extracted strings', () => {
    const code = `const info = "info ℹ️"`
    extractorAll(code)
    const result = Array.from(extractorCode)
    expect(result).toContain('info')
    // ℹ and its emoji presentation should be filtered out
    expect(result).not.toContain('ℹ')
    expect(result).not.toContain('ℹ️')
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

  it('special test1', () => {
    const code = `import { defineComponent as _defineComponent } from "vue";
import { unref as _unref, createElementVNode as _createElementVNode, resolveDynamicComponent as _resolveDynamicComponent, normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock, normalizeClass as _normalizeClass, mergeProps as _mergeProps, createCommentVNode as _createCommentVNode, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, normalizeStyle as _normalizeStyle, withModifiers as _withModifiers, Transition as _Transition, withCtx as _withCtx, createVNode as _createVNode, Teleport as _Teleport } from "vue";
const _hoisted_1 = { class: "my-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-900" };
const _hoisted_2 = { class: "mermaid-block-header flex justify-between items-center px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" };
const _hoisted_3 = { class: "flex items-center space-x-2" };
const _hoisted_4 = ["src"];
const _hoisted_5 = { class: "flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-0.5" };
const _hoisted_6 = { class: "flex items-center space-x-1" };
const _hoisted_7 = { class: "flex items-center space-x-1" };
const _hoisted_8 = { class: "flex items-center space-x-1" };
const _hoisted_9 = {
  key: 1,
  class: "w-3 h-3 inline-block"
};
const _hoisted_10 = ["disabled"];
const _hoisted_11 = ["disabled"];
const _hoisted_12 = {
  key: 0,
  class: "p-4 bg-gray-50 dark:bg-gray-900"
};
const _hoisted_13 = { class: "text-sm font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300" };
const _hoisted_14 = {
  key: 1,
  class: "relative"
};
const _hoisted_15 = { class: "absolute top-2 right-2 z-10 rounded-lg" };
const _hoisted_16 = { class: "flex items-center gap-2 backdrop-blur rounded-lg" };
const _hoisted_17 = {
  class: "px-2.5 py-1 text-[10px] rounded-full bg-gradient-to-r from-sky-500/90 to-indigo-500/90 text-white select-none inline-flex items-center gap-1.5 shadow-sm ring-1 ring-white/20 backdrop-blur-sm",
  title: "Rendering in progress"
};
const _hoisted_18 = { class: "dialog-panel relative w-full h-full max-w-full max-h-full bg-white dark:bg-gray-900 rounded shadow-lg overflow-hidden" };
const _hoisted_19 = { class: "absolute top-6 right-6 z-50 flex items-center gap-2" };
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { getIconify, getUseMonaco } from "../CodeBlockNode/utils";
import { getMermaid } from "./mermaid";
import mermaidIconUrl from "../../icon/mermaid.svg?url";
const RENDER_DEBOUNCE_DELAY = 300;
const CONTENT_STABLE_DELAY = 500;
const WORKER_TIMEOUT_MS = 1400;
const PARSE_TIMEOUT_MS = 1800;
const RENDER_TIMEOUT_MS = 2500;
const FULL_RENDER_TIMEOUT_MS = 4e3;
export default /* @__PURE__ */ _defineComponent({
  __name: "MermaidBlockNode",
  props: {
    node: {},
    maxHeight: { default: "500px" },
    loading: { type: Boolean, default: true }
  },
  emits: ["copy"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    let Icon = getIconify();
    let mermaid = null;
    let isDark = ref(false);
    let parserWorkerUrl = null;
    (async () => {
      mermaid = await getMermaid();
      mermaid.initialize?.({ startOnLoad: false, securityLevel: "loose" });
      const mon = await getUseMonaco();
      const monIsDark = mon.isDark ?? mon.default?.isDark;
      if (monIsDark && typeof monIsDark === "object" && "value" in monIsDark) {
        isDark.value = monIsDark.value;
        try {
          watch(
            () => monIsDark.value,
            (v) => {
              isDark.value = v;
            },
            { immediate: false }
          );
        } catch (e) {
          isDark.value = monIsDark.value;
        }
      } else {
        isDark.value = !!monIsDark;
      }
      try {
        const w = await import("../../workers/mermaidParser.worker?worker&url");
        parserWorkerUrl = w?.default ?? null;
      } catch {
        parserWorkerUrl = null;
      }
    })();
    const copyText = ref(false);
    const mermaidContainer = ref();
    const mermaidWrapper = ref();
    const mermaidContent = ref();
    const modalContent = ref();
    const modalCloneWrapper = ref(null);
    const modeContainerRef = ref();
    const baseFixedCode = computed(() => {
      return props.node.code.replace(/\\]::([^:])/g, "]:::$1").replace(/:::subgraphNode$/gm, "::subgraphNode");
    });
    function getCodeWithTheme(theme) {
      const baseCode = baseFixedCode.value;
      const themeValue = theme === "dark" ? "dark" : "default";
      const themeConfig = \`%% { init: { "theme": "\${themeValue}" } } %%
      \`;
      if (baseCode.trim().startsWith("%%{")) {
        return baseCode;
      }
      return themeConfig + baseCode;
    }
    const zoom = ref(1);
    const translateX = ref(0);
    const translateY = ref(0);
    const isDragging = ref(false);
    const dragStart = ref({ x: 0, y: 0 });
    const showSource = ref(false);
    const isRendering = ref(false);
    const renderQueue = ref(null);
    const lastContentLength = ref(0);
    const isContentGenerating = ref(false);
    let contentStableTimer = null;
    const containerHeight = ref("360px");
    let resizeObserver = null;
    const hasRenderedOnce = ref(false);
    const isThemeRendering = ref(false);
    const svgCache = ref({});
    const lastSvgSnapshot = ref(null);
    const lastRenderedCode = ref("");
    const renderToken = ref(0);
    let currentWorkController = null;
    const hasRenderError = ref(false);
    const savedTransformState = ref({
      zoom: 1,
      translateX: 0,
      translateY: 0,
      containerHeight: "360px"
    });
    const cancelIdle = globalThis.cancelIdleCallback ?? ((id) => clearTimeout(id));
    let previewPollTimeoutId = null;
    let previewPollIdleId = null;
    let isPreviewPolling = false;
    let previewPollDelay = 800;
    let previewPollController = null;
    let lastPreviewStopAt = 0;
    let allowPartialPreview = true;
    function withTimeoutSignal(run, opts) {
      const timeoutMs = opts?.timeoutMs;
      const signal = opts?.signal;
      if (signal?.aborted) {
        return Promise.reject(new DOMException("Aborted", "AbortError"));
      }
      let timer = null;
      let settled = false;
      let abortHandler = null;
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          if (timer != null)
            clearTimeout(timer);
          if (abortHandler && signal)
            signal.removeEventListener("abort", abortHandler);
        };
        if (timeoutMs && timeoutMs > 0) {
          timer = window.setTimeout(() => {
            if (settled)
              return;
            settled = true;
            cleanup();
            reject(new Error("Operation timed out"));
          }, timeoutMs);
        }
        if (signal) {
          abortHandler = () => {
            if (settled)
              return;
            settled = true;
            cleanup();
            reject(new DOMException("Aborted", "AbortError"));
          };
          signal.addEventListener("abort", abortHandler);
        }
        run().then((res) => {
          if (settled)
            return;
          settled = true;
          cleanup();
          resolve(res);
        }).catch((err) => {
          if (settled)
            return;
          settled = true;
          cleanup();
          reject(err);
        });
      });
    }
    function renderErrorToContainer(error) {
      if (!mermaidContent.value)
        return;
      const errorDiv = document.createElement("div");
      errorDiv.className = "text-red-500 p-4";
      errorDiv.textContent = "Failed to render diagram: ";
      const errorSpan = document.createElement("span");
      errorSpan.textContent = error instanceof Error ? error.message : "Unknown error";
      errorDiv.appendChild(errorSpan);
      mermaidContent.value.innerHTML = "";
      mermaidContent.value.appendChild(errorDiv);
      containerHeight.value = "360px";
      hasRenderError.value = true;
      stopPreviewPolling();
    }
    let parserWorker = null;
    const rpcMap = /* @__PURE__ */ new Map();
    function ensureParserWorker() {
      if (parserWorker)
        return;
      try {
        parserWorker = new Worker(parserWorkerUrl, { type: "module" });
        parserWorker.onmessage = (ev) => {
          const { id, ok, result, error } = ev.data || {};
          const entry = rpcMap.get(id);
          if (!entry)
            return;
          if (ok)
            entry.resolve(result);
          else entry.reject(new Error(error ?? "Worker error"));
          rpcMap.delete(id);
        };
      } catch (e) {
        console.warn("Parser worker unavailable, will fall back to main thread:", e);
        parserWorker = null;
      }
    }
    function callWorker(action, payload, options) {
      ensureParserWorker();
      return new Promise((resolve, reject) => {
        if (!parserWorker)
          return reject(new Error("worker not available"));
        const id = Math.random().toString(36).slice(2);
        rpcMap.set(id, { resolve, reject });
        parserWorker.postMessage({ id, action, payload });
        let timeoutId = null;
        const onAbort = () => {
          if (rpcMap.has(id))
            rpcMap.delete(id);
          reject(new DOMException("Aborted", "AbortError"));
        };
        if (options?.timeoutMs && options.timeoutMs > 0) {
          timeoutId = window.setTimeout(() => {
            if (rpcMap.has(id))
              rpcMap.delete(id);
            reject(new Error("Worker call timed out"));
          }, options.timeoutMs);
        }
        if (options?.signal) {
          if (options.signal.aborted) {
            if (timeoutId)
              clearTimeout(timeoutId);
            if (rpcMap.has(id))
              rpcMap.delete(id);
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          const handler = () => {
            if (timeoutId)
              clearTimeout(timeoutId);
            onAbort();
          };
          options.signal.addEventListener("abort", handler, { once: true });
        }
      });
    }
    function applyThemeTo(code, theme) {
      const themeValue = theme === "dark" ? "dark" : "default";
      const themeConfig = \`%% { init: { "theme": "\${themeValue}" } } %%
      \`;
      const trimmed = code.trimStart();
      if (trimmed.startsWith("%%{"))
        return code;
      return themeConfig + code;
    }
    function canApplyPartialPreview() {
      return allowPartialPreview && !showSource.value && !hasRenderedOnce.value && !hasRenderError.value;
    }
    function getSafePrefixCandidate(code) {
      const lines = code.split(/\\r?\\n/);
      while (lines.length > 0) {
        const lastRaw = lines[lines.length - 1];
        const last = lastRaw.trimEnd();
        if (last === "") {
          lines.pop();
          continue;
        }
        const looksDangling = /^[-=~>|<\\s]+$/.test(last.trim()) || /(?:--|==|~~|->|<-|-\\||-\\)|-x|o-|\\|-|\\.-)\\s*$/.test(last) || /[-|><]$/.test(last) || /(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt)\\s*$/i.test(last);
        if (looksDangling) {
          lines.pop();
          continue;
        }
        break;
      }
      return lines.join("\\n");
    }
    async function canParseOnMain(code, theme, opts) {
      const anyMermaid = mermaid;
      const themed = applyThemeTo(code, theme);
      if (typeof anyMermaid.parse === "function") {
        await withTimeoutSignal(() => anyMermaid.parse(themed), {
          timeoutMs: opts?.timeoutMs ?? PARSE_TIMEOUT_MS,
          signal: opts?.signal
        });
        return true;
      }
      const id = \`mermaid-parse - \${ Math.random().toString(36).slice(2, 9) } \`;
      await withTimeoutSignal(() => mermaid.render(id, themed), {
        timeoutMs: opts?.timeoutMs ?? RENDER_TIMEOUT_MS,
        signal: opts?.signal
      });
      return true;
    }
    async function canParseOffthread(code, theme, opts) {
      try {
        return await callWorker("canParse", { code, theme }, {
          signal: opts?.signal,
          timeoutMs: opts?.timeoutMs ?? WORKER_TIMEOUT_MS
        });
      } catch {
        return await canParseOnMain(code, theme, opts);
      }
    }
    async function canParseOrPrefix(code, theme, opts) {
      try {
        const fullOk = await canParseOffthread(code, theme, opts);
        if (fullOk)
          return { fullOk: true, prefixOk: false };
      } catch (e) {
        if (e?.name === "AbortError")
          throw e;
      }
      let prefix = getSafePrefixCandidate(code);
      if (prefix && prefix.trim() && prefix !== code) {
        try {
          try {
            const found = await callWorker("findPrefix", { code, theme }, {
              signal: opts?.signal,
              timeoutMs: opts?.timeoutMs ?? WORKER_TIMEOUT_MS
            });
            if (found && found.trim())
              prefix = found;
          } catch {
          }
          const ok = await canParseOffthread(prefix, theme, opts);
          if (ok)
            return { fullOk: false, prefixOk: true, prefix };
        } catch (e) {
          if (e?.name === "AbortError")
            throw e;
        }
      }
      return { fullOk: false, prefixOk: false };
    }
    const isFullscreenDisabled = computed(
      () => showSource.value || isRendering.value
    );
    function updateContainerHeight(newContainerWidth) {
      if (!mermaidContainer.value || !mermaidContent.value)
        return;
      const svgElement = mermaidContent.value.querySelector("svg");
      if (!svgElement)
        return;
      let intrinsicWidth = 0;
      let intrinsicHeight = 0;
      const viewBox = svgElement.getAttribute("viewBox");
      const attrWidth = svgElement.getAttribute("width");
      const attrHeight = svgElement.getAttribute("height");
      if (viewBox) {
        const parts = viewBox.split(" ");
        if (parts.length === 4) {
          intrinsicWidth = Number.parseFloat(parts[2]);
          intrinsicHeight = Number.parseFloat(parts[3]);
        }
      }
      if (!intrinsicWidth || !intrinsicHeight) {
        if (attrWidth && attrHeight) {
          intrinsicWidth = Number.parseFloat(attrWidth);
          intrinsicHeight = Number.parseFloat(attrHeight);
        }
      }
      if (Number.isNaN(intrinsicWidth) || Number.isNaN(intrinsicHeight) || intrinsicWidth <= 0 || intrinsicHeight <= 0) {
        try {
          const bbox = svgElement.getBBox();
          if (bbox && bbox.width > 0 && bbox.height > 0) {
            intrinsicWidth = bbox.width;
            intrinsicHeight = bbox.height;
          }
        } catch (e) {
          console.error("Failed to get SVG BBox:", e);
          return;
        }
      }
      if (intrinsicWidth > 0 && intrinsicHeight > 0) {
        const aspectRatio = intrinsicHeight / intrinsicWidth;
        const containerWidth = newContainerWidth ?? mermaidContainer.value.clientWidth;
        let newHeight = containerWidth * aspectRatio;
        if (newHeight > intrinsicHeight)
          newHeight = intrinsicHeight;
        containerHeight.value = \`\${ newHeight } px\`;
      }
    }
    const isModalOpen = ref(false);
    const transformStyle = computed(() => ({
      transform: \`translate(\${ translateX.value }px, \${ translateY.value }px) scale(\${ zoom.value })\`
    }));
    function handleKeydown(e) {
      if (e.key === "Escape" && isModalOpen.value) {
        closeModal();
      }
    }
    function openModal() {
      isModalOpen.value = true;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeydown);
      nextTick(() => {
        if (mermaidContainer.value && modalContent.value) {
          const clone = mermaidContainer.value.cloneNode(true);
          clone.classList.add("fullscreen");
          const wrapper = clone.querySelector(
            "[data-mermaid-wrapper]"
          );
          if (wrapper) {
            modalCloneWrapper.value = wrapper;
            wrapper.style.transform = transformStyle.value.transform;
          }
          modalContent.value.innerHTML = "";
          modalContent.value.appendChild(clone);
        }
      });
    }
    function closeModal() {
      isModalOpen.value = false;
      if (modalContent.value) {
        modalContent.value.innerHTML = "";
      }
      modalCloneWrapper.value = null;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
    }
    function debounce(func, wait) {
      let timeout = null;
      return (...args) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), wait);
      };
    }
    function checkContentStability() {
      if (!showSource.value) {
        return;
      }
      const currentLength = baseFixedCode.value.length;
      if (currentLength !== lastContentLength.value) {
        isContentGenerating.value = true;
        lastContentLength.value = currentLength;
        if (contentStableTimer) {
          clearTimeout(contentStableTimer);
        }
        contentStableTimer = setTimeout(() => {
          if (isContentGenerating.value && showSource.value && baseFixedCode.value.trim()) {
            isContentGenerating.value = false;
            switchMode("preview");
          }
        }, CONTENT_STABLE_DELAY);
      }
    }
    watch(
      transformStyle,
      (newStyle) => {
        if (isModalOpen.value && modalCloneWrapper.value) {
          modalCloneWrapper.value.style.transform = newStyle.transform;
        }
      },
      { immediate: true }
    );
    function zoomIn() {
      if (zoom.value < 3) {
        zoom.value += 0.1;
      }
    }
    function zoomOut() {
      if (zoom.value > 0.5) {
        zoom.value -= 0.1;
      }
    }
    function resetZoom() {
      zoom.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    }
    function startDrag(e) {
      isDragging.value = true;
      if (e instanceof MouseEvent) {
        dragStart.value = {
          x: e.clientX - translateX.value,
          y: e.clientY - translateY.value
        };
      } else {
        dragStart.value = {
          x: e.touches[0].clientX - translateX.value,
          y: e.touches[0].clientY - translateY.value
        };
      }
    }
    function onDrag(e) {
      if (!isDragging.value)
        return;
      let clientX;
      let clientY;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      translateX.value = clientX - dragStart.value.x;
      translateY.value = clientY - dragStart.value.y;
    }
    function stopDrag() {
      isDragging.value = false;
    }
    function handleWheel(event) {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        if (!mermaidContainer.value)
          return;
        const rect = mermaidContainer.value.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const containerCenterX = rect.width / 2;
        const containerCenterY = rect.height / 2;
        const offsetX = mouseX - containerCenterX;
        const offsetY = mouseY - containerCenterY;
        const contentMouseX = (offsetX - translateX.value) / zoom.value;
        const contentMouseY = (offsetY - translateY.value) / zoom.value;
        const sensitivity = 0.01;
        const delta = -event.deltaY * sensitivity;
        const newZoom = Math.min(Math.max(zoom.value + delta, 0.5), 3);
        if (newZoom !== zoom.value) {
          translateX.value = offsetX - contentMouseX * newZoom;
          translateY.value = offsetY - contentMouseY * newZoom;
          zoom.value = newZoom;
        }
      }
    }
    async function copy() {
      try {
        await navigator.clipboard.writeText(baseFixedCode.value);
        copyText.value = true;
        emits("copy", baseFixedCode.value);
        setTimeout(() => {
          copyText.value = false;
        }, 1e3);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
    async function exportSvg() {
      try {
        const svgElement = mermaidContent.value?.querySelector("svg");
        if (!svgElement) {
          console.error("SVG element not found");
          return;
        }
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = \`mermaid - diagram - \${ Date.now() }.svg\`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to export SVG:", error);
      }
    }
    async function switchMode(target) {
      const el = modeContainerRef.value;
      if (!el) {
        showSource.value = target === "source";
        return;
      }
      const from = el.getBoundingClientRect().height;
      el.style.height = \`\${ from } px\`;
      el.style.overflow = "hidden";
      showSource.value = target === "source";
      await nextTick();
      const to = el.scrollHeight;
      el.style.transition = "height 180ms ease";
      void el.offsetHeight;
      el.style.height = \`\${ to } px\`;
      const cleanup = () => {
        el.style.transition = "";
        el.style.height = "";
        el.style.overflow = "";
        el.removeEventListener("transitionend", onEnd);
      };
      function onEnd() {
        cleanup();
      }
      el.addEventListener("transitionend", onEnd);
      setTimeout(() => cleanup(), 220);
    }
    async function initMermaid() {
      if (isRendering.value) {
        return renderQueue.value;
      }
      if (!mermaidContent.value) {
        await nextTick();
        if (!mermaidContent.value) {
          console.warn("Mermaid container not ready");
          return;
        }
      }
      isRendering.value = true;
      renderQueue.value = (async () => {
        if (mermaidContent.value) {
          mermaidContent.value.style.opacity = "0";
        }
        try {
          const id = \`mermaid - \${ Date.now() } -\${ Math.random().toString(36).substring(2, 11) } \`;
          if (!hasRenderedOnce.value && !isThemeRendering.value) {
            mermaid.initialize({
              securityLevel: "loose",
              startOnLoad: false
            });
          }
          const currentTheme = isDark.value ? "dark" : "light";
          const codeWithTheme = getCodeWithTheme(currentTheme);
          const res = await withTimeoutSignal(
            () => mermaid.render(
              id,
              codeWithTheme,
              mermaidContent.value
            ),
            { timeoutMs: FULL_RENDER_TIMEOUT_MS }
          );
          const svg = res?.svg;
          const bindFunctions = res?.bindFunctions;
          if (mermaidContent.value) {
            mermaidContent.value.innerHTML = svg;
            bindFunctions?.(mermaidContent.value);
            if (!hasRenderedOnce.value && !isThemeRendering.value) {
              updateContainerHeight();
              hasRenderedOnce.value = true;
              savedTransformState.value = {
                zoom: zoom.value,
                translateX: translateX.value,
                translateY: translateY.value,
                containerHeight: containerHeight.value
              };
            }
            const currentTheme2 = isDark.value ? "dark" : "light";
            svgCache.value[currentTheme2] = svg;
            if (isThemeRendering.value) {
              isThemeRendering.value = false;
            }
            hasRenderError.value = false;
          }
        } catch (error) {
          console.error("Failed to render mermaid diagram:", error);
          if (props.loading === false)
            renderErrorToContainer(error);
        } finally {
          await nextTick();
          if (mermaidContent.value) {
            mermaidContent.value.style.opacity = "1";
          }
          isRendering.value = false;
          renderQueue.value = null;
        }
      })();
      return renderQueue.value;
    }
    async function renderPartial(code) {
      if (!canApplyPartialPreview())
        return;
      if (!mermaidContent.value) {
        await nextTick();
        if (!mermaidContent.value)
          return;
      }
      if (isRendering.value)
        return;
      isRendering.value = true;
      try {
        const id = \`mermaid - partial - \${ Date.now() } -\${ Math.random().toString(36).slice(2, 9) } \`;
        const theme = isDark.value ? "dark" : "light";
        const safePrefix = getSafePrefixCandidate(code);
        const codeForRender = safePrefix && safePrefix.trim() ? safePrefix : code;
        const codeWithTheme = applyThemeTo(codeForRender, theme);
        if (mermaidContent.value)
          mermaidContent.value.style.opacity = "0";
        const res = await withTimeoutSignal(
          () => mermaid.render(id, codeWithTheme, mermaidContent.value),
          { timeoutMs: RENDER_TIMEOUT_MS }
        );
        const svg = res?.svg;
        const bindFunctions = res?.bindFunctions;
        if (mermaidContent.value && svg) {
          mermaidContent.value.innerHTML = svg;
          bindFunctions?.(mermaidContent.value);
          updateContainerHeight();
        }
      } catch {
      } finally {
        await nextTick();
        if (mermaidContent.value)
          mermaidContent.value.style.opacity = "1";
        isRendering.value = false;
      }
    }
    const requestIdle = globalThis.requestIdleCallback ?? ((cb, _opts) => setTimeout(() => cb({ didTimeout: true }), 16));
    async function progressiveRender() {
      const scheduledAt = Date.now();
      const token = ++renderToken.value;
      if (currentWorkController) {
        currentWorkController.abort();
      }
      currentWorkController = new AbortController();
      const signal = currentWorkController.signal;
      const theme = isDark.value ? "dark" : "light";
      const base = baseFixedCode.value;
      const normalizedBase = base.replace(/\\s+/g, "");
      if (!base.trim()) {
        if (mermaidContent.value)
          mermaidContent.value.innerHTML = "";
        lastSvgSnapshot.value = null;
        lastRenderedCode.value = "";
        hasRenderError.value = false;
        return;
      }
      if (normalizedBase === lastRenderedCode.value) {
        return;
      }
      try {
        const res = await canParseOrPrefix(base, theme, { signal, timeoutMs: WORKER_TIMEOUT_MS });
        if (res.fullOk) {
          await initMermaid();
          if (renderToken.value === token) {
            lastSvgSnapshot.value = mermaidContent.value?.innerHTML ?? null;
            lastRenderedCode.value = normalizedBase;
            hasRenderError.value = false;
          }
          return;
        }
        const justStopped = lastPreviewStopAt && scheduledAt <= lastPreviewStopAt;
        if (res.prefixOk && res.prefix && canApplyPartialPreview() && !justStopped) {
          await renderPartial(res.prefix);
          return;
        }
      } catch (e) {
        if (e?.name === "AbortError")
          return;
      }
      if (renderToken.value !== token)
        return;
      if (hasRenderError.value)
        return;
      const cached = svgCache.value[theme];
      if (cached && mermaidContent.value) {
        mermaidContent.value.innerHTML = cached;
      }
    }
    const debouncedProgressiveRender = debounce(() => {
      requestIdle(() => {
        progressiveRender();
      }, { timeout: 500 });
    }, RENDER_DEBOUNCE_DELAY);
    function stopPreviewPolling() {
      if (!isPreviewPolling)
        return;
      isPreviewPolling = false;
      previewPollDelay = 800;
      allowPartialPreview = false;
      if (previewPollController) {
        previewPollController.abort();
        previewPollController = null;
      }
      if (previewPollTimeoutId) {
        clearTimeout(previewPollTimeoutId);
        previewPollTimeoutId = null;
      }
      if (previewPollIdleId) {
        cancelIdle(previewPollIdleId);
        previewPollIdleId = null;
      }
      lastPreviewStopAt = Date.now();
    }
    function cleanupAfterLoadingSettled() {
      stopPreviewPolling();
      if (currentWorkController) {
        try {
          currentWorkController.abort();
        } catch {
        }
        currentWorkController = null;
      }
      if (previewPollController) {
        try {
          previewPollController.abort();
        } catch {
        }
        previewPollController = null;
      }
      if (parserWorker) {
        try {
          parserWorker.terminate();
        } catch {
        }
        parserWorker = null;
      }
    }
    function scheduleNextPreviewPoll(delay = 800) {
      if (!isPreviewPolling)
        return;
      if (previewPollTimeoutId)
        clearTimeout(previewPollTimeoutId);
      previewPollTimeoutId = window.setTimeout(() => {
        previewPollIdleId = requestIdle(async () => {
          if (!isPreviewPolling)
            return;
          if (showSource.value || hasRenderedOnce.value) {
            stopPreviewPolling();
            return;
          }
          const theme = isDark.value ? "dark" : "light";
          const base = baseFixedCode.value;
          if (!base.trim()) {
            scheduleNextPreviewPoll(previewPollDelay);
            return;
          }
          if (previewPollController)
            previewPollController.abort();
          previewPollController = new AbortController();
          try {
            const ok = await canParseOffthread(base, theme, { signal: previewPollController.signal, timeoutMs: WORKER_TIMEOUT_MS });
            if (ok) {
              await initMermaid();
              if (hasRenderedOnce.value) {
                stopPreviewPolling();
                return;
              }
            }
          } catch {
          }
          previewPollDelay = Math.min(Math.floor(previewPollDelay * 1.5), 4e3);
          scheduleNextPreviewPoll(previewPollDelay);
        }, { timeout: 500 });
      }, delay);
    }
    function startPreviewPolling() {
      if (isPreviewPolling)
        return;
      if (showSource.value || hasRenderedOnce.value)
        return;
      isPreviewPolling = true;
      lastPreviewStopAt = 0;
      allowPartialPreview = true;
      scheduleNextPreviewPoll(500);
    }
    watch(
      () => baseFixedCode.value,
      () => {
        hasRenderedOnce.value = false;
        svgCache.value = {};
        debouncedProgressiveRender();
        if (!showSource.value)
          startPreviewPolling();
        checkContentStability();
      }
    );
    watch(isDark, async () => {
      if (!hasRenderedOnce.value) {
        return;
      }
      if (hasRenderError.value) {
        return;
      }
      const targetTheme = isDark.value ? "dark" : "light";
      if (svgCache.value[targetTheme]) {
        if (mermaidContent.value) {
          mermaidContent.value.innerHTML = svgCache.value[targetTheme];
        }
        return;
      }
      const currentTransformState = {
        zoom: zoom.value,
        translateX: translateX.value,
        translateY: translateY.value,
        containerHeight: containerHeight.value
      };
      const hasUserTransform = zoom.value !== 1 || translateX.value !== 0 || translateY.value !== 0;
      isThemeRendering.value = true;
      if (hasUserTransform) {
        zoom.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        await nextTick();
      }
      await initMermaid();
      if (hasUserTransform) {
        await nextTick();
        zoom.value = currentTransformState.zoom;
        translateX.value = currentTransformState.translateX;
        translateY.value = currentTransformState.translateY;
        containerHeight.value = currentTransformState.containerHeight;
        savedTransformState.value = currentTransformState;
      }
    });
    watch(
      () => showSource.value,
      async (newValue) => {
        if (!newValue) {
          if (hasRenderError.value) {
            return;
          }
          const currentTheme = isDark.value ? "dark" : "light";
          if (hasRenderedOnce.value && svgCache.value[currentTheme]) {
            await nextTick();
            if (mermaidContent.value) {
              mermaidContent.value.innerHTML = svgCache.value[currentTheme];
            }
            zoom.value = savedTransformState.value.zoom;
            translateX.value = savedTransformState.value.translateX;
            translateY.value = savedTransformState.value.translateY;
            containerHeight.value = savedTransformState.value.containerHeight;
            return;
          }
          await nextTick();
          await progressiveRender();
          startPreviewPolling();
        } else {
          stopPreviewPolling();
          if (hasRenderedOnce.value) {
            savedTransformState.value = {
              zoom: zoom.value,
              translateX: translateX.value,
              translateY: translateY.value,
              containerHeight: containerHeight.value
            };
          }
        }
      }
    );
    watch(
      () => props.loading,
      async (loaded, prev) => {
        if (prev === true && loaded === false) {
          const base = baseFixedCode.value.trim();
          if (!base)
            return cleanupAfterLoadingSettled();
          const theme = isDark.value ? "dark" : "light";
          const normalizedBase = base.replace(/\\s+/g, "");
          if (hasRenderedOnce.value && normalizedBase === lastRenderedCode.value) {
            await nextTick();
            if (mermaidContent.value && !mermaidContent.value.querySelector("svg") && svgCache.value[theme]) {
              mermaidContent.value.innerHTML = svgCache.value[theme];
            }
            cleanupAfterLoadingSettled();
            return;
          }
          try {
            await canParseOffthread(base, theme, { timeoutMs: WORKER_TIMEOUT_MS });
            await initMermaid();
            lastRenderedCode.value = normalizedBase;
            hasRenderError.value = false;
            cleanupAfterLoadingSettled();
          } catch (err) {
            cleanupAfterLoadingSettled();
            renderErrorToContainer(err);
          }
        }
      }
    );
    watch(
      mermaidContainer,
      (newEl) => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        if (newEl && !hasRenderedOnce.value && !isThemeRendering.value) {
          resizeObserver = new ResizeObserver((entries) => {
            if (entries && entries.length > 0 && !hasRenderedOnce.value && !isThemeRendering.value) {
              requestAnimationFrame(() => {
                const newWidth = entries[0].contentRect.width;
                updateContainerHeight(newWidth);
              });
            }
          });
          resizeObserver.observe(newEl);
        }
      },
      { immediate: true }
    );
    onMounted(async () => {
      await nextTick();
      debouncedProgressiveRender();
      lastContentLength.value = baseFixedCode.value.length;
    });
    onUnmounted(() => {
      if (contentStableTimer) {
        clearTimeout(contentStableTimer);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (currentWorkController) {
        currentWorkController.abort();
        currentWorkController = null;
      }
      if (parserWorker) {
        parserWorker.terminate();
        parserWorker = null;
      }
      stopPreviewPolling();
    });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("div", _hoisted_1, [
        _createElementVNode("div", _hoisted_2, [
          _createElementVNode("div", _hoisted_3, [
            _createElementVNode("img", {
              src: _unref(mermaidIconUrl),
              class: "w-4 h-4",
              alt: "Mermaid"
            }, null, 8, _hoisted_4),
            _cache[2] || (_cache[2] = _createElementVNode("span", { class: "text-sm font-medium text-gray-600 dark:text-gray-400 font-mono" }, "Mermaid", -1))
          ]),
          _createElementVNode("div", _hoisted_5, [
            _createElementVNode("button", {
              class: _normalizeClass(["px-2.5 py-1 text-xs rounded transition-colors", [
                !showSource.value ? "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              ]]),
              onClick: _cache[0] || (_cache[0] = ($event) => switchMode("preview"))
            }, [
              _createElementVNode("div", _hoisted_6, [
                (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:eye", class: "w-3 h-3" })), null, 16)),
                _cache[3] || (_cache[3] = _createElementVNode("span", null, "Preview", -1))
              ])
            ], 2),
            _createElementVNode("button", {
              class: _normalizeClass(["px-2.5 py-1 text-xs rounded transition-colors", [
                showSource.value ? "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              ]]),
              onClick: _cache[1] || (_cache[1] = ($event) => switchMode("source"))
            }, [
              _createElementVNode("div", _hoisted_7, [
                (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:code", class: "w-3 h-3" })), null, 16)),
                _cache[4] || (_cache[4] = _createElementVNode("span", null, "Source", -1))
              ])
            ], 2)
          ]),
          _createElementVNode("div", _hoisted_8, [
            _createElementVNode("button", {
              class: "mermaid-action-btn p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
              onClick: copy
            }, [
              _unref(Icon) ? (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon)), _normalizeProps(_mergeProps({ key: 0 }, { icon: !copyText.value ? "lucide:copy" : "lucide:check", class: "w-3 h-3" })), null, 16)) : (_openBlock(), _createElementBlock("span", _hoisted_9))
            ]),
            _createElementVNode("button", {
              class: _normalizeClass(["mermaid-action-btn p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors", isFullscreenDisabled.value ? "opacity-50 cursor-not-allowed" : ""]),
              disabled: isFullscreenDisabled.value,
              onClick: exportSvg
            }, [
              (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:download", class: "w-3 h-3" })), null, 16))
            ], 10, _hoisted_10),
            _createElementVNode("button", {
              class: _normalizeClass(["mermaid-action-btn p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors", isFullscreenDisabled.value ? "opacity-50 cursor-not-allowed" : ""]),
              disabled: isFullscreenDisabled.value,
              onClick: openModal
            }, [
              (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: isModalOpen.value ? "lucide:minimize-2" : "lucide:maximize-2", class: "w-3 h-3" })), null, 16))
            ], 10, _hoisted_11)
          ])
        ]),
        _createElementVNode("div", {
          ref_key: "modeContainerRef",
          ref: modeContainerRef
        }, [
          showSource.value ? (_openBlock(), _createElementBlock("div", _hoisted_12, [
            _createElementVNode("pre", _hoisted_13, _toDisplayString(baseFixedCode.value), 1)
          ])) : (_openBlock(), _createElementBlock("div", _hoisted_14, [
            _createElementVNode("div", _hoisted_15, [
              _createElementVNode("div", _hoisted_16, [
                _createElementVNode("span", _hoisted_17, [
                  (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:loader-2", class: "w-3 h-3 animate-spin" })), null, 16)),
                  _cache[5] || (_cache[5] = _createTextVNode(" Rendering ", -1))
                ]),
                _createElementVNode("button", {
                  class: "p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                  onClick: zoomIn
                }, [
                  (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:zoom-in", class: "w-3 h-3" })), null, 16))
                ]),
                _createElementVNode("button", {
                  class: "p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                  onClick: zoomOut
                }, [
                  (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:zoom-out", class: "w-3 h-3" })), null, 16))
                ]),
                _createElementVNode("button", {
                  class: "p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                  onClick: resetZoom
                }, _toDisplayString(Math.round(zoom.value * 100)) + "% ", 1)
              ])
            ]),
            _createElementVNode("div", {
              ref_key: "mermaidContainer",
              ref: mermaidContainer,
              class: "min-h-[360px] bg-gray-50 dark:bg-gray-900 relative transition-all duration-100 overflow-hidden block",
              style: _normalizeStyle({ height: containerHeight.value }),
              onWheel: handleWheel,
              onMousedown: startDrag,
              onMousemove: onDrag,
              onMouseup: stopDrag,
              onMouseleave: stopDrag,
              onTouchstartPassive: startDrag,
              onTouchmovePassive: onDrag,
              onTouchendPassive: stopDrag
            }, [
              _createElementVNode("div", {
                ref_key: "mermaidWrapper",
                ref: mermaidWrapper,
                "data-mermaid-wrapper": "",
                class: _normalizeClass(["absolute inset-0 cursor-grab", { "cursor-grabbing": isDragging.value }]),
                style: _normalizeStyle(transformStyle.value)
              }, [
                _createElementVNode("div", {
                  ref_key: "mermaidContent",
                  ref: mermaidContent,
                  class: "_mermaid w-full text-center flex items-center justify-center min-h-full"
                }, null, 512)
              ], 6)
            ], 36),
            (_openBlock(), _createBlock(_Teleport, { to: "body" }, [
              _createVNode(_Transition, {
                name: "mermaid-dialog",
                appear: ""
              }, {
                default: _withCtx(() => [
                  isModalOpen.value ? (_openBlock(), _createElementBlock("div", {
                    key: 0,
                    class: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",
                    onClick: _withModifiers(closeModal, ["self"])
                  }, [
                    _createElementVNode("div", _hoisted_18, [
                      _createElementVNode("div", _hoisted_19, [
                        _createElementVNode("button", {
                          class: "p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                          onClick: zoomIn
                        }, [
                          (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:zoom-in", class: "w-3 h-3" })), null, 16))
                        ]),
                        _createElementVNode("button", {
                          class: "p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                          onClick: zoomOut
                        }, [
                          (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:zoom-out", class: "w-3 h-3" })), null, 16))
                        ]),
                        _createElementVNode("button", {
                          class: "p-2 text-xs rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                          onClick: resetZoom
                        }, _toDisplayString(Math.round(zoom.value * 100)) + "% ", 1),
                        _createElementVNode("button", {
                          class: "inline-flex items-center justify-center p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                          onClick: closeModal
                        }, [
                          (_openBlock(), _createBlock(_resolveDynamicComponent(_unref(Icon) ? _unref(Icon) : "span"), _normalizeProps(_guardReactiveProps({ icon: "lucide:x", class: "w-3 h-3" })), null, 16))
                        ])
                      ]),
                      _createElementVNode("div", {
                        ref_key: "modalContent",
                        ref: modalContent,
                        class: "w-full h-full flex items-center justify-center p-4 overflow-hidden",
                        onWheel: handleWheel,
                        onMousedown: startDrag,
                        onMousemove: onDrag,
                        onMouseup: stopDrag,
                        onMouseleave: stopDrag,
                        onTouchstart: startDrag,
                        onTouchmove: onDrag,
                        onTouchend: stopDrag
                      }, null, 544)
                    ])
                  ])) : _createCommentVNode("", true)
                ]),
                _: 1
              })
            ]))
          ]))
        ], 512)
      ]);
    };
  }
});`
    extractorAll(code)
    expect(Array.from(extractorCode)).toMatchInlineSnapshot(`
      [
        "my-4",
        "rounded-lg",
        "border",
        "border-gray-200",
        "dark:border-gray-700",
        "overflow-hidden",
        "shadow-sm",
        "bg-white",
        "dark:bg-gray-900",
        "mermaid-block-header",
        "flex",
        "justify-between",
        "items-center",
        "px-4",
        "py-2.5",
        "bg-gray-50",
        "dark:bg-gray-800",
        "border-b",
        "space-x-2",
        "src",
        "space-x-1",
        "bg-gray-100",
        "dark:bg-gray-700",
        "rounded-md",
        "p-0.5",
        "w-3",
        "h-3",
        "inline-block",
        "disabled",
        "p-4",
        "text-sm",
        "font-mono",
        "whitespace-pre-wrap",
        "text-gray-700",
        "dark:text-gray-300",
        "relative",
        "absolute",
        "top-2",
        "right-2",
        "z-10",
        "gap-2",
        "backdrop-blur",
        "px-2.5",
        "py-1",
        "text-[10px]",
        "rounded-full",
        "bg-gradient-to-r",
        "from-sky-500/90",
        "to-indigo-500/90",
        "text-white",
        "select-none",
        "inline-flex",
        "gap-1.5",
        "ring-1",
        "ring-white/20",
        "backdrop-blur-sm",
        "in",
        "progress",
        "dialog-panel",
        "w-full",
        "h-full",
        "max-w-full",
        "max-h-full",
        "rounded",
        "shadow-lg",
        "top-6",
        "right-6",
        "z-50",
        "copy",
        "loose",
        "object",
        "value",
        "dark",
        "default",
        "abort",
        "timed",
        "out",
        "text-red-500",
        "to",
        "render",
        "error",
        "module",
        "worker",
        "unavailable",
        "will",
        "fall",
        "back",
        "main",
        "not",
        "available",
        "call",
        "canParse",
        "findPrefix",
        "viewBox",
        "width",
        "height",
        "get",
        "hidden",
        "keydown",
        "fullscreen",
        "[data-mermaid-wrapper]",
        "preview",
        "element",
        "found",
        "source",
        "ease",
        "transitionend",
        "container",
        "ready",
        "light",
        "mermaid",
        "w-4",
        "h-4",
        "font-medium",
        "text-gray-600",
        "dark:text-gray-400",
        "text-xs",
        "transition-colors",
        "dark:bg-gray-600",
        "dark:text-gray-200",
        "text-gray-500",
        "hover:text-gray-700",
        "dark:hover:text-gray-200",
        "lucide:eye",
        "lucide:code",
        "mermaid-action-btn",
        "p-2",
        "hover:bg-gray-200",
        "dark:hover:bg-gray-700",
        "lucide:copy",
        "lucide:check",
        "isFullscreenDisabled.value",
        "opacity-50",
        "cursor-not-allowed",
        "lucide:download",
        "isModalOpen.value",
        "lucide:minimize-2",
        "lucide:maximize-2",
        "modeContainerRef",
        "lucide:loader-2",
        "animate-spin",
        "lucide:zoom-in",
        "lucide:zoom-out",
        "mermaidContainer",
        "min-h-[360px]",
        "transition-all",
        "duration-100",
        "block",
        "mermaidWrapper",
        "inset-0",
        "cursor-grab",
        "cursor-grabbing",
        "mermaidContent",
        "text-center",
        "justify-center",
        "min-h-full",
        "mermaid-dialog",
        "fixed",
        "bg-black/70",
        "self",
        "lucide:x",
        "modalContent",
      ]
    `)
  })

  it('special test2', () => {
    const code = `import { defineComponent as _defineComponent } from "vue";
import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode, createElementVNode as _createElementVNode, unref as _unref, createVNode as _createVNode, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = { class: "admonition-header" };
const _hoisted_2 = {
  key: 0,
  class: "admonition-icon"
};
const _hoisted_3 = { class: "admonition-title" };
const _hoisted_4 = { class: "admonition-content" };
import NodeRenderer from "../NodeRenderer";
export default /* @__PURE__ */ _defineComponent({
  __name: "AdmonitionNode",
  props: {
    node: {}
  },
  emits: ["copy"],
  setup(__props) {
    const iconMap = {
      note: "ℹ️",
      info: "ℹ️",
      tip: "💡",
      warning: "⚠️",
      danger: "❗",
      caution: "⚠️"
    };
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("div", {
        class: _normalizeClass(["admonition", \`admonition-\${ _ctx.node.kind } \`])
      }, [
        _createElementVNode("div", _hoisted_1, [
          iconMap[_ctx.node.kind] ? (_openBlock(), _createElementBlock("span", _hoisted_2, _toDisplayString(iconMap[_ctx.node.kind]), 1)) : _createCommentVNode("", true),
          _createElementVNode("span", _hoisted_3, _toDisplayString(_ctx.node.title), 1)
        ]),
        _createElementVNode("div", _hoisted_4, [
          _createVNode(_unref(NodeRenderer), {
            nodes: _ctx.node.children,
            onCopy: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("copy", $event))
          }, null, 8, ["nodes"])
        ])
      ], 2);
    };
  }
});`
    extractorAll(code)
    expect(Array.from(extractorCode)).toMatchInlineSnapshot(`
      [
        "admonition-header",
        "admonition-icon",
        "admonition-title",
        "admonition-content",
        "copy",
        "admonition",
        "nodes",
      ]
    `)
  })

  it('special test3', () => {
    const code = `import { defineComponent as _defineComponent } from "vue";
import { renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, normalizeStyle as _normalizeStyle, createElementVNode as _createElementVNode, unref as _unref, createVNode as _createVNode, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = { class: "table-node table-auto text-left my-8 text-sm w-full" };
const _hoisted_2 = { class: "border-b" };
import { computed } from "vue";
import NodeRenderer from "../NodeRenderer";
export default /* @__PURE__ */ _defineComponent({
  __name: "TableNode",
  props: {
    node: {}
  },
  emits: ["copy"],
  setup(__props) {
    const colCount = computed(() => __props.node?.header?.cells?.length ?? 0);
    const colWidths = computed(() => {
      const n = colCount.value || 1;
      const base = Math.floor(100 / n);
      return Array.from({ length: n }).map(
        (_, i) => i === n - 1 ? \`\${100 - base * (n - 1)}%\` : \`\${base}%\`
      );
    });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("table", _hoisted_1, [
        _createElementVNode("colgroup", null, [
          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(colWidths.value, (w, i) => {
            return _openBlock(), _createElementBlock("col", {
              key: \`col-\${i}\`,
              style: _normalizeStyle({ width: w })
            }, null, 4);
          }), 128))
        ]),
        _createElementVNode("thead", null, [
          _createElementVNode("tr", _hoisted_2, [
            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(__props.node.header.cells, (cell, index) => {
              return _openBlock(), _createElementBlock("th", {
                key: \`header-\${index}\`,
                dir: "auto",
                class: _normalizeClass(["text-left font-semibold dark:border-zinc-800 dark:text-white truncate p-[calc(4/7*1em)]", [index === 0 ? "!pl-0" : ""]])
              }, [
                _createVNode(_unref(NodeRenderer), {
                  nodes: cell.children,
                  onCopy: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("copy", $event))
                }, null, 8, ["nodes"])
              ], 2);
            }), 128))
          ])
        ]),
        _createElementVNode("tbody", null, [
          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(__props.node.rows, (row, rowIndex) => {
            return _openBlock(), _createElementBlock("tr", {
              key: \`row-\${rowIndex}\`,
              class: _normalizeClass([
                rowIndex < __props.node.rows.length - 1 ? "border-b dark:border-zinc-800" : ""
              ])
            }, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(row.cells, (cell, cellIndex) => {
                return _openBlock(), _createElementBlock("td", {
                  key: \`cell-\${rowIndex}-\${cellIndex}\`,
                  class: _normalizeClass(["text-left truncate p-[calc(4/7*1em)]", [cellIndex === 0 ? "!pl-0" : ""]]),
                  dir: "auto"
                }, [
                  _createVNode(_unref(NodeRenderer), {
                    nodes: cell.children,
                    onCopy: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("copy", $event))
                  }, null, 8, ["nodes"])
                ], 2);
              }), 128))
            ], 2);
          }), 128))
        ])
      ]);
    };
  }
});`
    extractorAll(code)
    expect(Array.from(extractorCode)).toMatchInlineSnapshot(`
      [
        "table-node",
        "table-auto",
        "text-left",
        "my-8",
        "text-sm",
        "w-full",
        "border-b",
        "copy",
        "colgroup",
        "col",
        "auto",
        "font-semibold",
        "dark:border-zinc-800",
        "dark:text-white",
        "truncate",
        "p-[calc(4/7*1em)]",
        "!pl-0",
        "nodes",
      ]
    `)
  })
})

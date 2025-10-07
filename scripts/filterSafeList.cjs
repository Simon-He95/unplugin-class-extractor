#!/usr/bin/env node
// CommonJS version of the safelist filter for environments where package.json type=module
const fs = require('node:fs')

function defaultSplit(text) {
  return text.match(/[^\s,]+/g) || []
}

function cleanToken(t) {
  return t.replace(/\0/g, '')
    .replace(/^['"]+|['"]+$/g, '')
    .trim()
}

const singleWordWhitelist = new Set([
  'flex',
  'block',
  'inline',
  'hidden',
  'relative',
  'absolute',
  'grid',
  'inline-flex',
  'container',
  'truncate',
  'select-none',
  'italic',
  'underline',
  'uppercase',
  'visible',
  'sr-only',
  'table',
  'table-fixed',
  'cursor-pointer',
  'inline-block',
  'justify-center',
  'justify-between',
  'items-center',
  'center',
  'overflow-hidden',
  'shadow',
  'shadow-sm',
])

const blacklistSubstrings = ['http://', 'https://', 'www.', 'module', 'render', 'will', 'not', 'available', 'timed', 'out', 'abort', 'get', 'hidden', 'call', 'element', 'found', 'source', 'ready']

function looksLikeTailwind(token) {
  if (!token)
    return false
  if (/[^\x20-\x7E]/.test(token))
    return false
  for (const b of blacklistSubstrings) {
    if (token.includes(b))
      return false
  }
  if (token.startsWith('data-'))
    return false
  if (/\[.*\]/.test(token)) {
    if (/^[\w-:!@#%/[\]().,=+*'"\\]+$/.test(token))
      return true
    return false
  }
  if (!/^[\w:/\-#.()%!@]+$/.test(token))
    return false
  if (/[\-:/[\]#%\d.]/.test(token))
    return true
  if (singleWordWhitelist.has(token))
    return true
  return false
}

function filterText(text) {
  const tokens = defaultSplit(text).map(cleanToken).filter(Boolean)
  const seen = new Set()
  const out = []
  for (const t of tokens) {
    const tok = t.trim()
    if (seen.has(tok))
      continue
    if (looksLikeTailwind(tok)) {
      seen.add(tok)
      out.push(tok)
    }
  }
  return out
}

function main() {
  const inputFile = process.argv[2]
  if (inputFile) {
    const text = fs.readFileSync(inputFile, 'utf8')
    const list = filterText(text)
    console.log(list.join('\n'))
    process.exit(0)
  }
  let data = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', chunk => data += chunk)
  process.stdin.on('end', () => {
    const list = filterText(data)
    console.log(list.join('\n'))
  })
}

if (require.main === module)
  main()

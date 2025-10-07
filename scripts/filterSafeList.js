#!/usr/bin/env node
// Simple safelist filter for Tailwind-like class tokens
// Usage: node scripts/filterSafeList.js [inputFile]
// If inputFile omitted it reads stdin.

const fs = require('node:fs')

function defaultSplit(text) {
  // Split on whitespace, commas and control chars; keep bracketed chunks intact
  return text.match(/[^\s,]+/g) || []
}

function cleanToken(t) {
  return t.replace(/\0/g, '') // remove nulls
    .replace(/^['"]+|['"]+$/g, '') // trim quotes
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
  // reject tokens with non-printable/control characters
  if (/[^\x20-\x7E]/.test(token))
    return false
  // blacklist some obvious substrings
  for (const b of blacklistSubstrings) {
    if (token.includes(b))
      return false
  }
  // reject data-* (vue scoped ids etc)
  if (token.startsWith('data-'))
    return false
  // accept bracket arbitrary values e.g. [123px] or has-[>svg]:...
  if (/\[.*\]/.test(token)) {
    // ensure only allowed characters around
    if (/^[\w-:!@#%/[\]().,=+*'"\\]+$/.test(token))
      return true
    return false
  }
  // allowed characters for typical classes
  if (!/^[\w:/\-#.()%!@]+$/.test(token))
    return false

  // If token contains at least one of these characters it's likely a util
  if (/[\-:/[\]#%\d.]/.test(token))
    return true

  // fallback: allow a small whitelist of single-word utilities
  if (singleWordWhitelist.has(token))
    return true

  // otherwise likely a plain English word, reject
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
  // read stdin
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

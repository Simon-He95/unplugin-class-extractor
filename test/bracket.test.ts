import { beforeEach, describe, expect, it } from 'vitest'
import { extractorCode } from '../src/constant'
import { extractorAll } from '../src/utils'

describe('bracket helper edge cases', () => {
  beforeEach(() => extractorCode.clear())

  it('rejects unclosed open bracket', () => {
    extractorAll('class="bad-[no-close"')
    expect(Array.from(extractorCode)).toEqual([])
  })

  it('rejects reversed bracket order', () => {
    extractorAll('class=\']weird[\'')
    expect(Array.from(extractorCode)).toEqual([])
  })

  it('accepts simple bracketed arbitrary value', () => {
    extractorAll('class="[123px]"')
    expect(Array.from(extractorCode)).toContain('[123px]')
  })

  it('accepts calc(...) inside brackets', () => {
    extractorAll('class=\'[calc(100%-2rem)]\'')
    expect(Array.from(extractorCode)).toContain('[calc(100%-2rem)]')
  })
})

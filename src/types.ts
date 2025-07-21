import type { FilterPattern } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  output: string
  safeList?: string[]
  fullScanFiles?: string[]
}

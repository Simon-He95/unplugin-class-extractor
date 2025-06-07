import type { Options } from './types'

import unplugin from '.'
import { PLUGIN_NAME } from './constant'

export default (options: Options) => ({
  name: PLUGIN_NAME,
  hooks: {
    'astro:config:setup': async (astro: any) => {
      astro.config.vite.plugins ||= []
      astro.config.vite.plugins.push(unplugin.vite(options))
    },
  },
})

import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import { DOMParser } from 'xmldom'

import run from '../behavior.js'

export const tree = new DOMParser().parseFromString(
  fs.readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'test.xml'),
    'utf8'
  ),
  'text/xml'
)

export default {
  async reduce_mob(state, action, context) {
    const { state: next_state } = await run(tree.documentElement, state, {
      path: 'tree',
      action,
      ...context,
    })

    return next_state
  },
}

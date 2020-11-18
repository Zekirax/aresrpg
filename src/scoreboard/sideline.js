import {
  init_sidebar,
  send_sidebar,
  clear_sidebar,
  setline_sidebar,
  removeline_sidebar,
} from './sidebar.js'

//TODO: should be moved to redis. not stateless if we clusterize the server.
const clientOldMap = new Map()
const clientBufferMap = new Map()

function containsValue(map, value) {
  for (let [k, v] of map) {
    if (v === value) {
      return true
    }
  }
  return false
}

function makeUnique(client, str) {
  const old = clientOldMap.get(client.username)

  while (containsValue(old, str)) {
    str = str + '§r'
  }

  return str
}

/**
 * Init sideline of a client
 * @param {{client: any}} State
 */
export function init_sideline({ client }) {
  clientOldMap.set(client.username, new Map())
  clientBufferMap.set(client.username, [])
  init_sidebar({ client })
}

/**
 * Set line to text of the scoreboard
 * @param {{client: any}} State
 * @param {{line: number, text: string, animated: boolean}} Options
 */
export function set_sideline({ client }, { line, text, animated }) {
  const old = clientOldMap.get(client.username)

  if (old.has(line)) {
    removeline_sidebar({ client }, { text: old.get(line) })
  }

  if (text === '') {
    text = ' '
  }

  text = makeUnique(client, text)

  old.set(line, text)
  setline_sidebar({ client }, { text, line, animated })
}

/**
 * Get text at line of the scoreboard
 * @param {{client: any}} State
 * @param {{line: number}} Options
 */
export function get_sideline({ client }, { line }) {
  return clientOldMap.get(client.username).get(line)
}

/**
 * Clear sideline
 * @param {{client: any}} State
 */
export function clear_sideline({ client }) {
  clear_sidebar({ client })
  clientOldMap.get(client.username).clear()
}

/**
 * Add text to scoreboard.
 * You need to call @flush_sideline to send changes
 * @param {{client: any}} State
 * @param {{text: string}} Options
 */
export function add_sideline({ client }, { text }) {
  clientBufferMap.get(client.username).push(text)
}

/**
 * Flush all texts to the scoreboard
 * @param {{client: any}} State
 */
export function flush_sideline({ client }) {
  clear_sideline({ client })

  const buffer = clientBufferMap.get(client.username)

  let i = 1
  for (let j = buffer.length - 1; j >= 0; j--) {
    set_sideline({ client }, { line: i, text: buffer[j] })
    i++
  }

  clientBufferMap.set(client.username, [])

  send_sideline({ client })
}

/**
 * Send changes to scoreboard
 * @param {{client: any}} State
 */
export function send_sideline({ client }) {
  send_sidebar({ client })
}

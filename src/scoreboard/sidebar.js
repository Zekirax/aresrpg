import {
  Positions,
  ObjectiveActions,
  Types,
  ScoreActions,
  scoreboard_objective,
  scoreboard_score,
  scoreboard_display_objective,
} from './scoreboard.js'

import { update_basetext_animation } from './animations.js'

//TODO: should be moved to redis. not stateless if we clusterize the server.
const clientLinesMap = new Map()
const clientTitleMap = new Map()

/**
 * Init sidebar of a client
 * @param {{client: any}} State
 */
export function init_sidebar({ client }) {
  if (clientLinesMap.has(client.username)) {
    return
  }

  scoreboard_objective(
    { client },
    {
      name: client.username,
      action: ObjectiveActions.CREATE,
      displayText: '',
      type: Types.INTEGER,
    }
  )

  clientLinesMap.set(client.username, new Map())
}

/**
 * Send sidebar to client
 * @param {{client: any}} State
 */
export function send_sidebar({ client }) {
  scoreboard_display_objective(
    { client },
    {
      position: Positions.SIDEBAR,
      name: client.username,
    }
  )
}

/**
 * Remove sidebar of a client
 * @param {{client: any}} State
 */
export function remove_sidebar({ client }) {
  scoreboard_objective(
    { client },
    {
      name: client.username,
      action: ObjectiveActions.REMOVE,
    }
  )

  clientLinesMap.delete(client.username)
}

/**
 * Clear sidebar of a client
 * @param {{client: any}} State
 */
export function clear_sidebar({ client }) {
  clientLinesMap
    .get(client.username)
    .forEach((line, text) => removeline_sidebar({ client }, { text }))
}

/**
 * Assign text to line in the sidebar
 * @param {{client: any}} State
 * @param {{text: string, line: number, animated: boolean}} Options
 */
export function setline_sidebar({ client }, { text, line, animated }) {
  if (text.length > 40) {
    text = text.substring(0, 40)
  }

  const lines = clientLinesMap.get(client.username)

  if (lines.has(text)) {
    removeline_sidebar({ client }, { text })
  }

  scoreboard_score(
    { client },
    {
      scoreName: client.username,
      action: ScoreActions.UPDATE,
      itemName: text,
      value: line,
    }
  )

  if (!animated) {
    update_basetext_animation({ client }, { line, text })
  }

  clientLinesMap.get(client.username).set(text, line)
}

/**
 * Remove text of the sidebar
 * @param {{client: any}} State
 * @param {{text: string}} Options
 */
export function removeline_sidebar({ client }, { text }) {
  if (text.length > 40) {
    text = text.substring(0, 40)
  }

  const lines = clientLinesMap.get(client.username)

  if (!lines.has(text)) {
    return
  }

  const line = lines.get(text)

  scoreboard_score(
    { client },
    {
      scoreName: client.username,
      action: ScoreActions.REMOVE,
      itemName: text,
      value: line,
    }
  )

  lines.delete(text)
}

/**
 * Set name of the sidebar
 * @param {{client: any}} State
 * @param {{name: string, animated: boolean}} Options
 */
export function setname_sidebar({ client }, { name, animated }) {
  scoreboard_objective(
    { client },
    {
      name: client.username,
      action: ObjectiveActions.UPDATE,
      displayText: name,
      type: Types.INTEGER,
    }
  )

  if (!animated) {
    update_basetext_animation({ client }, { line: 'title', text: name })
  }

  clientTitleMap.set(client.username, name)
}

/**
 * Get name of the sidebar
 * @param {{client: any}} State
 */
export function getname_sidebar({ client }) {
  return clientTitleMap.get(client.username)
}

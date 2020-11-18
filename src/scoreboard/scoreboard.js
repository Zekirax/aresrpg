export const Positions = {
  LIST: 0,
  SIDEBAR: 1,
  BELOW_NAME: 2,
}

export const ObjectiveActions = {
  CREATE: 0,
  REMOVE: 1,
  UPDATE: 2,
}

export const Types = {
  INTEGER: 0,
  HEARTS: 1,
}

export const ScoreActions = {
  CREATE: 0,
  UPDATE: 0,
  REMOVE: 1,
}

/**
 * Send SCOREBOARD_OBJECTIVE packet to client
 * @param {{client: any}} State
 * @param {{name: string, action: number, displayText: string, type: number}} Options
 */
export function scoreboard_objective(
  { client },
  { name, action, displayText, type }
) {
  const obj = {
    name,
    action,
    displayText: JSON.stringify(displayText),
    type,
  }

  client.write('scoreboard_objective', obj)
}

/**
 * Send SCOREBOARD_SCORE packet to client
 * @param {{client: any}} State
 * @param {{scoreName: string, action: number, itemName: string, value: number}} Options
 */
export function scoreboard_score(
  { client },
  { scoreName, action, itemName, value }
) {
  const obj = {
    scoreName,
    action,
    itemName,
    value,
  }

  client.write('scoreboard_score', obj)
}

/**
 * Send SCOREBOARD_DISPLAY_OBJECTIVE packet to client
 * @param {{client: any}} State
 * @param {{position: number, name: string}} Options
 */
export function scoreboard_display_objective({ client }, { position, name }) {
  const obj = {
    position,
    name,
  }

  client.write('scoreboard_display_objective', obj)
}

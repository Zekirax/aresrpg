import {
  Positions,
  Types,
  ScoreActions,
  ChatColor,
  ObjectiveActions,
} from './enums.js'
import { chat_to_text } from './util.js'

function make_unique(currentLines) {
  const lines = []

  while (currentLines.length > 0) {
    const line = currentLines.pop()

    while (lines.find((item) => item.text === line.text)) {
      line.text = line.text + ChatColor.RESET
    }

    lines.push(line)
  }

  return lines
}

/**
 * Update sidebar of a client
 * @param {{client: any}} Client
 * @param {{last: {title: Chat, lines: Chat[]}, next: {title: Chat, lines: Chat[]}, animated: boolean}} Options
 */
export function update_sidebar({ client }, { last, next, animated = false }) {
  const lastLines = last.lines
    ? make_unique(
        last.lines.map((item, index) => ({
          text: chat_to_text(item).substring(0, 40),
          line: last.lines.length - index,
        }))
      )
    : []
  const nextLines = next.lines
    ? make_unique(
        next.lines.map((item, index) => ({
          text: chat_to_text(item).substring(0, 40),
          line: next.lines.length - index,
        }))
      )
    : []

  const action =
    !last.title && next.title
      ? ObjectiveActions.CREATE
      : last.title && next.title && last.title !== next.title
      ? ObjectiveActions.UPDATE
      : last.title && !next.title
      ? ObjectiveActions.REMOVE
      : -1

  if (action != -1) {
    const objective = {
      name: client.username,
      action,
    }

    if (action != ObjectiveActions.REMOVE) {
      objective.displayText = JSON.stringify(next.title)
      objective.type = Types.INTEGER
    }

    const displayObjective = {
      position: Positions.SIDEBAR,
      name: client.username,
    }

    client.write('scoreboard_objective', objective)
    client.write('scoreboard_display_objective', displayObjective)
  }

  const itemsToDelete = lastLines.filter((item) => {
    const sameLine = nextLines.find((item2) => item.line == item2.line)
    return !sameLine || sameLine.text != item.text
  })
  const itemsToUpdate = nextLines.filter(
    (item) =>
      !lastLines.find(
        (item2) => item.text == item2.text && item.line == item2.line
      )
  )

  for (const item of itemsToDelete) {
    const obj = {
      scoreName: client.username,
      action: ScoreActions.REMOVE,
      itemName: item.text,
      value: item.line,
    }

    console.log(`delete ${item.text} at ${item.line}`)

    client.write('scoreboard_score', obj)
  }

  for (const item of itemsToUpdate) {
    const obj = {
      scoreName: client.username,
      action: ScoreActions.UPDATE,
      itemName: item.text,
      value: item.line,
    }

    console.log(`update ${item.text} at ${item.line}`)

    client.write('scoreboard_score', obj)
  }
}

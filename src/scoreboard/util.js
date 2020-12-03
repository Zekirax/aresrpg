import { ChatColor } from './enums.js'

/**
 * Convert chat component to string
 * @param {chats: Chat[]} chats
 */
export function chat_to_text(chats) {
  chats = Array.isArray(chats) ? chats : [chats]

  let text = ''

  for (let chat of chats) {
    if (typeof chat !== 'object') {
      chat = { text: chat }
    }

    const color = chat.color ? ChatColor[chat.color.toUpperCase()] : null

    if (chat.color && !color) {
      throw new Error(`Color ${chat} isn't supported by the scoreboard`)
    } else if (color) {
      text += color
    }

    if (chat.obfuscated) text += ChatColor.OBFUSCATED
    if (chat.bold) text += ChatColor.BOLD
    if (chat.strikethrough) text += ChatColor.STRIKETHROUGH
    if (chat.underline) text += ChatColor.UNDERLINE
    if (chat.italic) text += ChatColor.ITALIC

    text += chat.text !== '' ? chat.text : ' '
  }

  return text
}

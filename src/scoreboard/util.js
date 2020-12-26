import { ChatColor } from './enums.js'

const to_array = (value) => (Array.isArray(value) ? value : [value])

/**
 * Convert chat component to string
 * @param {chats: Chat[]} chat
 */
export function chat_to_text(chat) {
  return to_array(chat)
    .map((part) => {
      const modifiers = [
        ChatColor[part.color?.toUpperCase()] ?? '',
        part.obfuscated ? ChatColor.OBFUSCATED : '',
        part.bold ? ChatColor.BOLD : '',
        part.strikethrough ? ChatColor.STRIKETHROUGH : '',
        part.underline ? ChatColor.UNDERLINE : '',
        part.italic ? ChatColor.ITALIC : '',
      ]

      const extra = part.extra ? chat_to_text(part.extra) : ''

      return `${modifiers.join('')}${part.text ?? ''}${extra}${ChatColor.RESET}`
    })
    .join('')
}

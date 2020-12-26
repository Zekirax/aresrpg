import { update_sidebar } from './sidebar.js'
import { create_animation, AnimationDirection } from './animations.js'
import { ChatColor } from './enums.js'

export function scoreboard({ client, events }) {
  events.once('state', () => {
    const scoreboard = {
      title: { color: 'gold', text: 'Statistiques' },
      lines: [
        { text: '' },
        [
          { color: 'white', text: 'Classe ' },
          { color: 'gray', text: ': ' },
          { color: 'dark_blue', text: 'Barbare' },
        ],
        [
          { color: 'white', text: 'Spé ' },
          { color: 'gray', text: ': ' },
          { color: 'yellow', text: 'Aucune' },
        ],
        [
          { color: 'white', text: 'Lvl.' },
          { color: 'dark_green', text: '1 ' },
          { color: 'gray', text: '(' },
          { color: 'dark_aqua', text: '4%' },
          { color: 'gray', text: ')' },
        ],
        [
          { color: 'white', text: 'Ame ' },
          { color: 'gray', text: ': ' },
          { color: 'green', text: '100' },
          { color: 'gray', text: '%' },
        ],
        { text: '' },
        [
          { color: 'white', text: 'Crit ' },
          { color: 'gray', text: ': ' },
          { color: 'dark_red', text: 'Bientôt', italic: true },
        ],
        [
          { color: 'white', text: 'Chance ' },
          { color: 'gray', text: ': ' },
          { color: 'dark_red', text: 'Bientôt', italic: true },
        ],
        { text: '' },
        [
          { color: 'white', text: 'Métiers ' },
          { color: 'dark_red', text: 'Bientôt', italic: true },
        ],
        [
          { color: 'gray', text: '- ' },
          { color: 'green', text: 'Aucun' },
        ],
        { text: '' },
        [
          { color: 'white', text: 'Or ' },
          { color: 'gray', text: ': ' },
          { color: 'dark_red', text: 'Bientôt', italic: true },
        ],
        { text: '' },
        { text: 'www.aresrpg.fr' },
      ],
    }

    update_sidebar({ client }, { last: {}, next: scoreboard })

    //TODO: BLINk AND LEFT not working. Text with base color doesn't work. Retest text without base color after that

    const animation = create_animation(
      { client },
      {
        boardState: scoreboard,
        line: 'title',
        animations: [
          {
            effects: [ChatColor.DARK_RED],
            delay: 1000,
            transitionDelay: 3000,
            direction: AnimationDirection.RIGHT,
            removeTextAfter: false,
            maxLoop: 3,
          },
        ],
      }
    )

    setTimeout(() => {
      animation.start()
    }, 3000)

    client.on('end', () => {
      animation.reset()
      update_sidebar({ client }, { last: scoreboard, next: {} })
    })
  })
}

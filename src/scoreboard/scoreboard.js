import { update_sidebar } from './sidebar.js'
import { create_animation, AnimationDirection } from './animations.js'

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

    //TODO:    Retest maxLoop
    //      test to implement the updateBoardState if we use manually sidebar to change something
    //      check all TODO in code
    //      test others directions, multiple animation, remove text after and then put the same base animation as the first PR

    const animation = create_animation(
      { client },
      {
        boardState: scoreboard,
        line: 1,
        animations: [
          {
            effects: ['§4', '§4'],
            delay: 2000,
            transitionDelay: 3000,
            direction: AnimationDirection.RIGHT,
            removeTextAfter: false,
            maxLoop: -1,
          },
        ],
      }
    )

    setTimeout(() => {
      animation.start()
    }, 3000)

    setTimeout(() => {
      const newScoreboard = {
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
          { text: 'www.test.fr' },
        ],
      }
      animation.updateBoardState(newScoreboard)
    }, 8000)

    client.on('end', () => {
      animation.reset()
      update_sidebar({ client }, { last: scoreboard, next: {} })
    })
  })
}

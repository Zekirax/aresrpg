import { init_sidebar, setname_sidebar, remove_sidebar } from './sidebar.js'
import { init_sideline, add_sideline, flush_sideline } from './sideline.js'
import {
  set_animation,
  start_animation,
  clear_animation,
  AnimationDirection,
} from './animations.js'

export function init_scoreboard({ client, events }) {
  events.once('state', () => {
    init_sidebar({ client })
    setname_sidebar(
      { client },
      {
        name: '§6Statistiques',
      }
    )

    init_sideline({ client })
    add_sideline({ client }, { text: '' })
    add_sideline({ client }, { text: 'Classe §7: §1Barbare' })
    add_sideline({ client }, { text: 'Spé §7: §eAucune' })
    add_sideline({ client }, { text: 'Lvl.§21 §7(§34%§7)' })
    add_sideline({ client }, { text: 'Ame §7: §a100§7%' })
    add_sideline({ client }, { text: '' })
    add_sideline({ client }, { text: 'Crit §7: §4§oBientôt' })
    add_sideline({ client }, { text: 'Chance §7: §4§oBientôt' })
    add_sideline({ client }, { text: '' })
    add_sideline({ client }, { text: 'Métiers §4§oBientôt' })
    add_sideline({ client }, { text: '§7- §aAucun' })
    add_sideline({ client }, { text: '' })
    add_sideline({ client }, { text: 'Or §7: §4§oBientôt' })
    add_sideline({ client }, { text: '' })
    add_sideline({ client }, { text: 'www.aresrpg.fr' })
    flush_sideline({ client })

    set_animation(
      { client },
      {
        line: 'title',
        animations: [
          {
            effect: ['§4', '§4'],
            delay: 75,
            transitionDelay: 0,
            direction: AnimationDirection.RIGHT,
            removeTextAfter: false,
            maxLoop: 2,
          },
          {
            effect: [
              '§4',
              '§4',
              '§4',
              '§4',
              '§4',
              '§4',
              '§4',
              '§4',
              '§4',
              '§4',
              '§4',
              '§4',
            ],
            delay: 75,
            transitionDelay: 15000,
            direction: AnimationDirection.BLINK,
            removeTextAfter: false,
            maxLoop: 6,
          },
        ],
      }
    )

    set_animation(
      { client },
      {
        line: 1,
        animations: [
          {
            effect: '',
            delay: 150,
            transitionDelay: 0,
            direction: AnimationDirection.LEFT,
            removeTextAfter: true,
            maxLoop: 1,
          },
          {
            effect: '',
            delay: 150,
            transitionDelay: 20000,
            direction: AnimationDirection.RIGHT,
            removeTextAfter: true,
            maxLoop: 1,
          },
        ],
      }
    )

    setTimeout(() => {
      start_animation({ client }, { line: 'title' })
      start_animation({ client }, { line: 1 })
    }, 3000)

    client.on('end', () => {
      remove_sidebar({ client })
      clear_animation({ client })
    })
  })
}

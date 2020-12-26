import { update_sidebar } from './sidebar.js'
import { ChatColor } from './enums.js'
import { chat_to_text } from './util.js'

export const AnimationDirection = {
  LEFT: 0,
  RIGHT: 1,
  BLINK: 2,
}

const is_format_code = (color) =>
  color === ChatColor.OBFUSCATED ||
  color === ChatColor.BOLD ||
  color === ChatColor.STRIKETHROUGH ||
  color === ChatColor.UNDERLINE ||
  color === ChatColor.ITALIC

function process_animation({ client }, { animation }) {
  console.log('-------------------')
  console.log(animation.baseText)
  const animationInfo = animation.getCurrentAnimationInfo()
  const baseTextNoColor = animation.baseText.replace(/§[0-9a-z]/g, '')
  console.log(baseTextNoColor)
  const isBlink = animationInfo.direction === AnimationDirection.BLINK
  const isLeft = animationInfo.direction === AnimationDirection.LEFT
  const effects = isLeft
    ? animationInfo.effects.reverse()
    : animationInfo.effects
  const increment = Math.floor(
    (new Date().getTime() - animation.startTime) / animationInfo.delay
  )
  const endIndex = increment % baseTextNoColor.length
  let animatedText = ''
  let previousColors = ''
  let offset = 0
  let updated = false

  if (isBlink) {
    animatedText = animation.baseText
    if (increment % 2 == 0) {
      animatedText = animationInfo.effets.join('') + animatedText
      updated = true
    }
  } else {
    const baseText = isLeft
      ? animation.baseText.split('').reverse().join('')
      : animation.baseText

    for (let i = 0; i < baseText.length; i++) {
      const cur = baseText[i]
      const indexEffect = endIndex - i - offset
      const shouldCut = indexEffect < 0 && animationInfo.removeTextAfter

      if (shouldCut) {
        break
      }

      if (cur === '§') {
        const color = cur + baseText[i + 1]

        if (!is_format_code(color)) {
          previousColors = ''
        }

        previousColors += color
        i++
        offset += 2

        //TODO: we forgot that
        animatedText += color

        continue
      }

      if (indexEffect >= effects.length) {
        animatedText += cur
        continue
      }

      if (indexEffect < 0) {
        animatedText += cur
        continue
      }

      animatedText +=
        effects[indexEffect] + cur + ChatColor.RESET + previousColors
      updated = true
    }

    if (isLeft) {
      animatedText = animatedText.split('').reverse().join('')
    }
  }

  console.log(animatedText)

  // Apply changes
  const curState = animation.updatedBoardState ?? animation.boardState
  const nextState = {
    title: curState.title,
    lines: [...curState.lines],
  }

  if (animation.line === 'title') {
    nextState.title = { text: animatedText }
  } else {
    const stateIndex = nextState.lines.length - animation.line
    nextState.lines[stateIndex] = { text: animatedText }
  }

  update_sidebar({ client }, { last: animation.boardState, next: nextState })

  animation.boardState = nextState

  if (animation.updatedBoardState) {
    animation.updatedBoardState = null
  }

  if (!updated) {
    animation.loop++
  }

  if (animationInfo.maxLoop != -1 && animation.loop >= animationInfo.maxLoop) {
    animation.stop()
    animation.transitionTimeout = setTimeout(() => {
      animation.next()
    }, animationInfo.transitionDelay)
  }
}

/**
 * Create the animations for a scoreboard line of that client.
 * @param {{client: any}} State
 * @param {{boardState: {title: Chat, lines: Chat[]}, line: number | 'title', animations: {effects, delay, transitionDelay, direction, removeTextAfter, maxLoop}[] }} Options
 * @returns {{start(), stop(), reset(), next(), updateBoardState(boardState: {title: CHat, lines: Chat[]})}} Animation State
 */
export function create_animation({ client }, { boardState, line, animations }) {
  const animation = {
    boardState,
    updatedBoardState: null,
    baseText: chat_to_text(
      line === 'title'
        ? boardState.title
        : boardState.lines[boardState.lines.length - line]
    ),
    line,
    current: 0,
    loop: 0,
    interval: null,
    transitionTimeout: null,
    startTime: null,
    animationsInfo: animations,
    getCurrentAnimationInfo() {
      return this.animationsInfo[this.current]
    },
    start() {
      this.startTime = new Date().getTime()
      this.interval = setInterval(
        () => process_animation({ client }, { animation: this }),
        this.getCurrentAnimationInfo().delay
      )
      process_animation({ client }, { animation: this })
    },
    stop() {
      clearInterval(this.interval)
      clearInterval(this.transitionTimeout)
    },
    reset() {
      this.stop()
      this.interval = null
      this.startTime = null
      this.loop = 0
      this.current = 0
    },
    next() {
      this.stop()
      this.interval = null
      this.startTime = null
      this.loop = 0
      this.current = (this.current + 1) % this.animationsInfo.length
      this.start()
    },
    updateBoardState(boardState) {
      this.updatedBoardState = boardState
      this.baseText = chat_to_text(
        this.line === 'title'
          ? this.updatedBoardState.title
          : this.updatedBoardState.lines[
              this.updatedBoardState.lines.length - this.line
            ]
      )
    },
  }

  return animation
}

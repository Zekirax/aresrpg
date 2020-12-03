import { update_sidebar } from './sidebar.js'
import { ChatColor } from './enums.js'
import { chat_to_text } from './util.js'

export const AnimationDirection = {
  LEFT: 0,
  RIGHT: 1,
  BLINK: 2,
}

function process_animation({ client }, { animation }) {
  const animationInfo = animation.getCurrentAnimationInfo()
  const baseTextNoColor = animation.baseText.replace(/§[0-9a-f]/g, '')
  const isBlink = animationInfo.direction === AnimationDirection.BLINK
  const isLeft = animationInfo.direction === AnimationDirection.LEFT
  const effects = isLeft
    ? animationInfo.effects.reverse()
    : animationInfo.effects
  const increment = Math.floor(
    (new Date().getTime() - animation.startTime) / animationInfo.delay
  )
  const endIndex = increment % (baseTextNoColor.length + effects.length)
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

        if (!ChatColor.isFormatCode(color)) {
          previousColors = ''
        }

        previousColors += color
        i++
        offset += 2
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

  // Apply changes
  const nextState = {
    title: animation.boardState.title,
    lines: [...animation.boardState.lines],
  }
  const stateIndex = nextState.lines.length - animation.line
  if (animation.line === 'title') {
    nextState.title = animatedText
  } else {
    nextState.lines = nextState.lines.map((item, index) => {
      if (stateIndex !== index) {
        return item
      }

      return animatedText
    })
  }

  console.log('---------')
  console.log(animation.boardState.lines[stateIndex])
  console.log(nextState.lines[stateIndex])

  update_sidebar(
    { client },
    { last: animation.boardState, next: nextState, animated: true }
  )

  animation.boardState.lines[stateIndex] = animatedText

  if (!updated) {
    animation.loop++
  }

  if (animationInfo.maxLoop != -1 && animation.loop >= animationInfo.maxLoop) {
    clearInterval(animation.interval)
    setTimeout(() => {
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
    baseText: chat_to_text(boardState.lines[boardState.lines.length - line]),
    line,
    current: 0,
    loop: 0,
    interval: null,
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
    },
    reset() {
      clearInterval(this.interval)
      this.interval = null
      this.startTime = null
      this.loop = 0
      this.current = 0
    },
    next() {
      clearInterval(this.interval)
      this.interval = null
      this.startTime = null
      this.loop = 0
      this.current = (this.current + 1) % this.animationsInfo.length
      this.start()
    },
    updateBoardState(boardState) {
      this.boardState = boardState
      this.baseText = chat_to_text(
        this.boardState.lines[this.boardState.lines.length - this.line]
      )
    },
  }

  return animation
}

import { update_sidebar } from './sidebar.js'
import { ChatColor } from './enums.js'
import { chat_to_text } from './util.js'

export const AnimationDirection = {
  LEFT: 0,
  RIGHT: 1,
  BLINK: 2,
  WRITE: 3,
}

const is_format_code = (color) =>
  color === ChatColor.OBFUSCATED ||
  color === ChatColor.BOLD ||
  color === ChatColor.STRIKETHROUGH ||
  color === ChatColor.UNDERLINE ||
  color === ChatColor.ITALIC

function process_animation({ client }, { animation }) {
  const animationInfo = animation.getCurrentAnimation()
  const increment = Math.floor(
    (new Date().getTime() - animation.startTime) / animationInfo.delay
  )
  const index = increment % animationInfo.frames.length
  const animatedText = animationInfo.frames[index]

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

  // if animation has been stopped
  if (!animation.interval) {
    return
  }

  update_sidebar({ client }, { last: animation.boardState, next: nextState })

  animation.boardState = nextState

  if (animation.updatedBoardState) {
    animation.updatedBoardState = null
  }

  if (index === animationInfo.frames.length - 1) {
    animation.loop++
  }

  if (animationInfo.maxLoop !== -1 && animation.loop >= animationInfo.maxLoop) {
    animation.stop()
    animation.transitionTimeout = setTimeout(() => {
      animation.next()
    }, animationInfo.transitionDelay)
  }
}

/**
 * Create the animations for a scoreboard line of that client.
 * @param {{client: any}} State
 * @param {{boardState: {title: Chat, lines: Chat[]}, line: number | 'title', animations: {effects, delay, transitionDelay, direction, maxLoop}[] }} Options
 * @returns {{start(), stop(), reset(), next(), updateBoardState(boardState: {title: CHat, lines: Chat[]})}} Animation State
 */
export function create_animation({ client }, { boardState, line, animations }) {
  const text = chat_to_text(
    line === 'title'
      ? boardState.title
      : boardState.lines[boardState.lines.length - line]
  )

  const animation = {
    boardState,
    updatedBoardState: null,
    line,
    current: 0,
    loop: 0,
    interval: null,
    transitionTimeout: null,
    startTime: null,
    animations: animations.map((animation) => ({
      ...animation,
      frames: calculate_animation_frames(text, animation),
    })),
    getCurrentAnimation() {
      return this.animations[this.current]
    },
    start() {
      this.startTime = new Date().getTime()
      this.interval = setInterval(
        () => process_animation({ client }, { animation: this }),
        this.getCurrentAnimation().delay
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
      this.current = (this.current + 1) % this.animations.length
      this.start()
    },
    updateBoardState(boardState) {
      this.updatedBoardState = boardState

      const text = chat_to_text(
        this.line === 'title'
          ? boardState.title
          : boardState.lines[boardState.lines.length - this.line]
      )
      this.animations = this.animations.map((animation) => ({
        ...animation,
        frames: calculate_animation_frames(text, animation),
      }))
    },
  }

  return animation
}

function calculate_animation_frames(text, animation) {
  const textNoColor = text.replace(/§[0-9a-z]/g, '')
  let frames = []

  if (animation.direction === AnimationDirection.BLINK) {
    frames = frames
      .concat(animation.effects.join('') + textNoColor)
      .concat(text)
  } else if (animation.direction === AnimationDirection.WRITE) {
    frames = Array.from({ length: textNoColor.length }).map((_, i) => {
      const sliced = text.slice(0, i + 1)
      const count = (sliced.match(/§/g) || []).length
      return text.slice(0, i + 1 + count * 2)
    })
  } else {
    frames = Array.from({
      length: textNoColor.length + animation.effects.length + 1,
    }).map((_, i) => {
      let skip = false
      let offset = 0
      let colors = []

      return text
        .split('')
        .flatMap((e, j) => {
          if (e === '§' || skip) {
            skip = !skip
            offset++
            if (!skip) {
              const color = `§${e}`
              if (!is_format_code(color)) {
                colors = []
              }
              colors.push(color)
            }
            return [].concat(e)
          }

          const effect =
            animation.effects[j - i - offset + animation.effects.length]
          return []
            .concat(effect || [])
            .concat(e)
            .concat(effect ? [ChatColor.RESET].concat(colors) : [])
        })
        .join('')
    })

    frames =
      animation.direction === AnimationDirection.LEFT
        ? frames.reverse()
        : frames
  }

  return frames
}

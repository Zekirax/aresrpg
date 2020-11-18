import { set_sideline, get_sideline } from './sideline.js'
import { setname_sidebar, getname_sidebar } from './sidebar.js'

//TODO: should be moved to redis. not stateless if we clusterize the server.
const clientAnimationMap = new Map()

export const AnimationDirection = {
  LEFT: 0,
  RIGHT: 1,
  BLINK: 2,
}

function isFormatCode(color) {
  return (
    color === '§k' ||
    color === '§l' ||
    color === '§m' ||
    color === '§n' ||
    color === '§o'
  )
}

function updatetext_animation({ client }, { animation, text }) {
  if (animation.line === 'title') {
    setname_sidebar({ client }, { name: text, animated: true })
  } else {
    set_sideline({ client }, { line: animation.line, text, animated: true })
  }
}

function process_animation({ client }, { animation }) {
  const effect = Array.isArray(animation.effect)
    ? animation.effect
    : [animation.effect]
  let animatedStr = ''

  const numberColor = (animation.baseText.match(/§/g) || []).length
  const baseTextLength = animation.baseText.length - numberColor * 2

  const effectToApply = {}
  for (let i = 0; i < effect.length; i++) {
    let indexEffect = -1

    if (animation.direction === AnimationDirection.RIGHT) {
      indexEffect = i - effect.length + 1 + animation.increment
    } else if (animation.direction === AnimationDirection.LEFT) {
      indexEffect = i + baseTextLength - 1 - animation.increment
    } else if (animation.direction === AnimationDirection.BLINK) {
      indexEffect = animation.increment % 2 == 0 ? i : -1
    }

    if (indexEffect >= 0 && indexEffect < baseTextLength) {
      effectToApply[indexEffect] = effect[i]
    }
  }

  const effectToApplyKeys = Object.keys(effectToApply)
  const lastEffectIndex =
    effectToApplyKeys[
      animation.direction === AnimationDirection.RIGHT
        ? effectToApplyKeys.length - 1
        : animation.direction === AnimationDirection.LEFT
        ? 0
        : undefined
    ]
  let previousColors = ''
  let offset = 0

  for (let i = 0; i < animation.baseText.length; i++) {
    const char = animation.baseText[i]
    const index = i - offset
    const effect = effectToApply[index]
    const shouldCut =
      animation.removeTextAfter &&
      ((typeof lastEffectIndex !== 'undefined' && index > lastEffectIndex) ||
        (effectToApplyKeys.length == 0 &&
          animation.direction === AnimationDirection.LEFT))

    if (char === '§') {
      const color = char + animation.baseText[i + 1]

      if (!isFormatCode(color)) {
        previousColors = ''
      }

      previousColors += color
      if (!shouldCut) {
        animatedStr += color
      }
      i++
      offset += 2
      continue
    }

    if (shouldCut) {
      continue
    }

    if (effect) {
      animatedStr += effect + char + '§r' + previousColors
    } else {
      animatedStr += char
    }
  }

  updatetext_animation({ client }, { animation, text: animatedStr })

  animation.increment++

  const indexEffects = Object.keys(effectToApply)
  const endLoop =
    (animation.direction === AnimationDirection.BLINK &&
      animation.increment > 0 &&
      animation.increment % 2 == 0) ||
    (animation.direction === AnimationDirection.RIGHT &&
      indexEffects.length <= 0) ||
    (animation.direction === AnimationDirection.LEFT &&
      indexEffects.length <= 0)

  if (endLoop) {
    animation.loop++
  }

  if (animation.maxLoop != -1 && animation.loop >= animation.maxLoop) {
    clearInterval(animation.interval)
    setTimeout(() => {
      next_animation({ client }, { line: animation.line })
    }, animation.transitionDelay)
  } else if (endLoop) {
    animation.increment = 0
  }
}

/**
 * Set the animations for a scoreboard line of that client.
 * You need to start the animation after that.
 * @param {{client: any}} State
 * @param {{line: number | 'title', animation: {effect, delay, transitionDelay, direction, removeTextAfter, maxLoop}}} Options
 */
export function set_animation({ client }, { line, animations }) {
  reset_animation({ client }, { line })

  if (!clientAnimationMap.has(client.username)) {
    clientAnimationMap.set(client.username, new Map())
  }

  const animationsMap = clientAnimationMap.get(client.username)

  if (!animationsMap.has(line)) {
    animationsMap.set(line, [])
  }

  const list = animationsMap.get(line)

  list.push(
    ...animations.map((animation) => {
      const baseText =
        line === 'title'
          ? getname_sidebar({ client })
          : get_sideline({ client }, { line: line })

      return {
        ...animation,
        line,
        loop: 0,
        increment: 0,
        interval: null,
        baseText,
      }
    })
  )
}

/**
 * Start animation of that line
 * @param {{client: any}} State
 * @param {{line: number}} Options
 */
export function start_animation({ client }, { line }) {
  const list = clientAnimationMap.get(client.username).get(line)

  // Find current
  let animation = list.find((animation) => animation.interval != null)

  if (!animation) {
    animation = list[0]
  }

  animation.interval = setInterval(
    () => process_animation({ client }, { animation }),
    animation.delay
  )
}

/**
 * Stop animation of that line
 * @param {{client: any}} State
 * @param {{line: number}} Options
 */
export function stop_animation({ client }, { line }) {
  const list = clientAnimationMap.get(client.username).get(line)

  // Find current
  const animation = list.find((animation) => animation.interval != null)

  if (!animation) {
    return
  }

  clearInterval(animation.interval)
}

/**
 * Reset animation of that line
 * @param {{client: any}} State
 * @param {{line: number, baseTextReset: boolean}} Options
 */
export function reset_animation({ client }, { line, baseTextReset = true }) {
  const animationsMap = clientAnimationMap.get(client.username)

  if (!animationsMap) {
    return
  }

  const list = animationsMap.get(line)

  if (!list) {
    return
  }

  // Find current
  const animation = list.find((animation) => animation.interval != null)

  if (!animation) {
    return null
  }

  clearInterval(animation.interval)
  animation.increment = 0
  animation.loop = 0
  animation.interval = null
  animation.colorToRestore = []

  if (baseTextReset) {
    updatetext_animation({ client }, { animation, text: animation.baseText })
  }

  return animation
}

/**
 * Go to the next animation of that line
 * @param {{client: any}} State
 * @param {{line: number}} Options
 */
export function next_animation({ client }, { line }) {
  const list = clientAnimationMap.get(client.username).get(line)
  const animation = reset_animation({ client }, { line, baseTextReset: false })

  if (!animation) {
    return
  }

  // Go to the next animation for that line
  let index = list.indexOf(animation)
  index = (index + 1) % list.length

  const nextAnim = list[index]
  nextAnim.interval = setInterval(
    () => process_animation({ client }, { animation: nextAnim }),
    animation.delay
  )
}

/**
 * Update the base text of the animations of that line
 * @param {{client: any}} State
 * @param {{line: number, text: string}} Options
 */
export function update_basetext_animation({ client }, { line, text }) {
  const animationMap = clientAnimationMap.get(client.username)

  if (!animationMap) {
    return
  }

  const list = animationMap.get(line)

  if (!list) {
    return
  }

  for (const animation of list) {
    animation.baseText = text
  }

  reset_animation({ client }, { line })
  start_animation({ client }, { line })
}

/**
 * Remove the animation at the index of that line
 * You need to start again if that animation was playing
 * @param {{client: client}} State
 * @param {{line: number, index: number}} Options
 */
export function remove_animation({ client }, { line, index }) {
  const list = clientAnimationMap.get(client.username).get(line)
  const animation = list[index]

  list.slice(index, 1)

  if (animation.interval) {
    clearInterval(animation.interval)
    updatetext_animation({ client }, { animation, text: animation.baseText })
  }
}

/**
 * Remove all the animation of that line
 * @param {{client: client}} State
 * @param {{line: number}} Options
 */
export function removeall_animation({ client }, { line }) {
  const list = clientAnimationMap.get(client.username).get(line)

  for (let i = 0; i < list.length; i++) {
    remove_animation({ client }, { line, index: 0 })
  }
}

/**
 * Remove all the animation of all the lines
 * @param {{client: client}} State
 */
export function clear_animation({ client }) {
  const animationsMap = clientAnimationMap.get(client.username)

  for (let [k, v] of animationsMap) {
    for (let i = 0; i < v.length; i++) {
      remove_animation({ client }, { line: k, index: 0 })
    }
  }

  animationsMap.clear()
}

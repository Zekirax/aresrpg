export function write_title_hide(client) {
  client.write('title', {
    action: 4,
  })
}

export function write_title_reset(client) {
  client.write('title', {
    action: 5,
  })
}

/**
 * Display title HUD
 *
 * example:
 * ```js
 * write_title(client, {
 *     title: { text: 'Bienvenu sur' },
 *     subtitle: { text: 'AresRPG ;)' },
 *     fadeIn: 5,
 *     fadeOut: 2,
 *     stay: 5
 *   })
 * ```
 * @param {Client} client
 * @param {Option} options
 */
export function write_title(
  client,
  { title, subtitle, action, fadeIn, fadeOut, stay }
) {
  if (title || subtitle) {
    // We need to set a title to have a subtitle
    // That way we can handle the case where we display only a subtitle by having an empty tilte
    client.write('title', {
      action: 0,
      text: JSON.stringify(title || { text: '' }),
    })
  }
  if (subtitle) {
    client.write('title', {
      action: 1,
      text: JSON.stringify(subtitle),
    })
  }

  if (action) {
    client.write('title', {
      action: 2,
      text: JSON.stringify(action),
    })
  }

  client.write('title', {
    action: 3,
    fadeIn: fadeIn * 20,
    fadeOut: fadeOut * 20,
    stay: stay * 20,
  })
}

export function show_player_status(client, hp) {
  const message = [
    { text: '>>', color: 'gray', bold: true },
    { text: ' Vie', color: 'green', bold: true },
    { text: ' : ', color: 'light_gray', bold: true },
    { text: hp, color: get_life_color(hp), bold: true },
    { text: '/', color: 'light_gray', bold: true },
    { text: '20', color: 'green', bold: true },
    { text: '  : ', color: 'gray', bold: true },
    { text: ' Zone', color: 'blue', bold: true },
    { text: ' :', color: 'light_gray', bold: true },
    { text: ' Non disponible', color: 'red', italic: true },
    { text: ' <<', color: 'gray', bold: true },
  ]
  write_title(client, {
    action: message,
    fadeIn: 0,
    fadeOut: 0,
    stay: 10,
  })
}

function get_life_color(hp) {
  const max_hp = 20 // TODO: replace with Player Life
  if (hp <= max_hp * 0.3) {
    return 'red'
  } else if (hp <= max_hp * 0.6) {
    return 'yellow'
  } else {
    return 'green'
  }
}

import { chunk_position } from './chunk.js'
import { empty_slot, item_to_slot } from './items.js'

export function register_bank(world) {
  return {
    ...world,
    next_window_id: world.next_window_id + 1,
  }
}

async function is_enderchest(world, { x, y, z }) {
  const enderchest_id = 270
  const chunk = await world.chunks.load(chunk_position(x), chunk_position(z))
  const { type } = chunk.getBlock({ x: x % 16, y, z: z % 16 })
  return type === enderchest_id
}

function add_bank_pages(items) {
  const selected = 0
  const last_line = 45
  for (let slot = 0; slot < items.length - last_line; slot++) {
    // TODO -> store the unlocked bank page in the player state and create them
    items[last_line + slot] = create_bank_slot(slot + 1, slot === selected)
  }
}

function create_bank_slot(bank_page, is_unlocked) {
  let lore = [
    JSON.stringify({
      text: `emplacement verrouillé`,
      color: 'red',
      italic: false,
    }),
  ]
  if (is_unlocked) {
    lore = [
      JSON.stringify({
        text: `emplacement ${bank_page}`,
        color: 'green',
        italic: false,
      }),
    ]
  }
  return {
    present: true,
    itemId: 702,
    itemCount: 1,
    nbtData: {
      type: 'compound',
      name: 'tag',
      value: {
        display: {
          type: 'compound',
          value: {
            Name: {
              type: 'string',
              value: JSON.stringify({
                text: `Emplacement de banque ${bank_page}`,
                italic: false,
                color: 'white',
              }),
            },
            Lore: {
              type: 'list',
              value: {
                type: 'string',
                value: lore,
              },
            },
          },
        },
      },
    },
  }
}

export function open_bank({ world, client }) {
  client.on('block_place', async ({ location, hand }) => {
    const main_hand = 0
    if (hand === main_hand && (await is_enderchest(world, location))) {
      const inventoryType = 5 // 9x6 chest
      const windowId = world.next_window_id

      const window = {
        windowId,
        inventoryType,
        windowTitle: JSON.stringify({ text: 'Bank Chest' }),
      }
      // TODO : navigation des pages du coffre de bank (slot 45 to 53)
      //     : enregistrer le coffre de bank du joueur (reduce state)

      const to_slot = (item) =>
        item ? item_to_slot(world.items[item.type], item.count) : empty_slot

      const items = Array.from({
        length: 54,
        36: { type: 'spellbook', count: 1 },
        37: { type: 'bronze_coin', count: 10 },
      }).map(to_slot)
      add_bank_pages(items)

      client.write('open_window', window)
      client.write('window_items', {
        windowId,
        items,
      })
    }
  })
}

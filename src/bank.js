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
      // TODO : navigation des pages du coffre de bank
      //     : enregistrer le coffre de bank du joueur (reduce state)
      const items = Array.from({
        length: 54,
        36: { type: 'spellbook', count: 1 },
        37: { type: 'bronze_coin', count: 10 },
      })

      const to_slot = (item) =>
        item ? item_to_slot(world.items[item.type], item.count) : empty_slot

      client.write('open_window', window)
      client.write('window_items', {
        windowId,
        items: items.map(to_slot),
      })
    }
  })
}

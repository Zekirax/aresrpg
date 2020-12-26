import { chunk_position } from './chunk.js'

export function open_bank({ world, client }) {
  client.on('block_place', async ({ location, hand }) => {
    const main_hand = 0
    if (hand === main_hand && (await is_enderchest(world, location))) {
      const inventoryType = 5 // 9x6 chest

      const window = {
        windowId: 254,
        inventoryType,
        windowTitle: JSON.stringify({ text: 'Bank Chest' }),
      }
      client.write('open_window', window)
    }
  })
}

async function is_enderchest(world, { x, y, z }) {
  const enderchest_id = 270
  const chunk = await world.chunks.load(chunk_position(x), chunk_position(z))
  const { type } = chunk.getBlock({ x: x % 16, y, z: z % 16 })
  return type === enderchest_id
}

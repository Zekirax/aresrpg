import { item_to_slot, empty_slot } from './items.js'

export function reduce_inventory(state, { type, payload }) {
  if (type === 'inventory/window_click') {
    const { slot, inv_index, out_inv, client } = payload
    if (!state.cursor_item_selected && out_inv) {
      restore_items(client, state.world, state.inventory)
      return state
    }
    const _state = {
      ...state,
      inventory: [
        ...state.inventory.slice(0, inv_index),
        state.cursor_item_selected
          ? state.cursor_item_selected.item
          : state.cursor_item_selected,
        ...state.inventory.slice(inv_index + 1),
      ],
      cursor_item_selected: state.inventory[slot]
        ? { prev_slot: slot, item: state.inventory[slot] }
        : state.inventory[slot],
    }
    return _state
  }
  return state
}

export function listen_inventory({ client, events, dispatch }) {
  client.on('window_click', ({ windowId, slot }) => {
    events.once('state', (state) => {
      if (windowId !== 0) return
      const payload = {
        slot,
        inv_index: slot === -999 ? state.cursor_item_selected.prev_slot : slot,
        out_inv: slot === -999,
        client,
      }
      dispatch('inventory/window_click', { ...state, ...payload })
    })
  })
}

function restore_items(client, world, inventory) {
  const to_slot = (item) =>
    item ? item_to_slot(world.items[item.type], item.count) : empty_slot

  client.write('window_items', {
    windowId: 0,
    items: inventory.map(to_slot),
  })
}

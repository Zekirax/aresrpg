import { item_to_slot, empty_slot } from './items.js'

export function reduce_inventory(state, { type, payload }) {
  if (type === 'inventory/window_click') {
    const { inv_index, item, item_save, transaction } = payload
    console.log(state.inventory, state.cursor_item_selected)
    const newState = {
      ...state,
      inventory: [
        ...state.inventory.slice(0, inv_index),
        item,
        ...state.inventory.slice(inv_index + 1),
      ],
      cursor_item_selected: item_save,
    }
    transaction(newState)
    console.log(newState.inventory, newState.cursor_item_selected)
    return newState
  }
  return state
}

export function listen_inventory({ client, events, dispatch }) {
  client.on('window_click', ({ windowId, slot, action, item }) => {
    events.once('state', (state) => {
      if (windowId || slot === -1) return
      const payload = {
        inv_index: slot === -999 ? state.cursor_item_selected.prev_slot : slot,
        out_inv: slot === -999,
        item: state.cursor_item_selected
          ? state.cursor_item_selected.item
          : undefined,
        item_save: state.inventory[slot]
          ? { prev_slot: slot, item: state.inventory[slot] }
          : undefined,
      }

      dispatch('inventory/window_click', {
        ...state,
        ...payload,
        transaction: (updatedState) => {
          if (slot === -999) {
            console.log('tesst')
            restore_items(client, updatedState.world, updatedState.inventory)
          }
        },
      })
      client.write('transaction', {
        windowId,
        action,
        accepted: true,
      })
    })
  })
}

function restore_items(client, world, inventory) {
  const to_slot = (item) => {
    if (!item) return empty_slot
    const { type, count } = item
    return item_to_slot(world.items[type], count)
  }

  client.write('window_items', {
    windowId: 0,
    items: inventory.map(to_slot),
  })
}

import { item_to_slot, empty_slot } from './items.js'

export function reduce_inventory(state, { type, payload }) {
  if (type === 'inventory/window_click') {
    const { inv_index, item, item_save, transaction } = payload
    const newState = {
      ...state,
      inventory: [
        ...state.inventory.slice(0, inv_index),
        item,
        ...state.inventory.slice(inv_index + 1),
      ],
      cursor_item_history: [
        state.cursor_item_history[state.cursor_item_history.length - 1],
        item_save,
      ],
    }
    // console.log("inventory: ", newState.inventory)
    transaction(newState)
    return newState
  }
  return state
}
/**
 *
 *
 * @export
 * @param {*} { client, events, dispatch }
 */
export function listen_inventory({ client, events, dispatch }) {
  client.on(
    'window_click',
    ({ windowId, slot, action, item, mouseButton, mode }) => {
      events.once('state', (state) => {
        if (windowId || slot === -1) return
        console.log(mouseButton, mode)
        const payload = {
          inv_index:
            slot === -999
              ? state.cursor_item_history[state.cursor_item_history.length - 1]
                  .prev_slot
              : slot,
          out_inv: slot === -999,
          item:
            state.cursor_item_history[state.cursor_item_history.length - 1]
              .item,
          item_save: state.inventory[slot]
            ? { prev_slot: slot, item: state.inventory[slot] }
            : { prev_slot: undefined, item: undefined },
          isSwap: state.cursor_item_history.every((i) => i.item !== undefined),
        }

        if (payload.isSwap) {
          return restore_items(client, state.world, state.inventory)
        }

        console.log(payload)

        dispatch('inventory/window_click', {
          ...state,
          ...payload,
          transaction: (updatedState) => {
            console.log(updatedState.cursor_item_history, payload.isSwap)
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
    }
  )

  // For the restore item with action Drop Key
  client.on('block_dig', ({ status }) => {
    events.once('state', (state) => {
      if (status !== 3 && status !== 4) return
      restore_items(client, state.world, state.inventory)
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

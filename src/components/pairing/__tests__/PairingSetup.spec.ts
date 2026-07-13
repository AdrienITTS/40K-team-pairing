import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PairingSetup from '../PairingSetup.vue'

// Mount straight into the army picker (step 2 = team A) with the default size 4.
function mountPicker() {
  return mount(PairingSetup, { props: { step: 2 } })
}

function chip(wrapper: ReturnType<typeof mountPicker>, name: string) {
  return wrapper.findAll('.faction-chip.side-a').find((c) => c.find('.chip-name').text() === name)!
}

describe('PairingSetup — one Space Marine Chapter per team', () => {
  it('locks out the other Chapters once one Space Marine army is picked', async () => {
    const wrapper = mountPicker()

    // Before any pick, both Chapters are selectable.
    expect(chip(wrapper, 'Blood Angels').attributes('disabled')).toBeUndefined()
    expect(chip(wrapper, 'Dark Angels').attributes('disabled')).toBeUndefined()

    await chip(wrapper, 'Blood Angels').trigger('click')
    expect(wrapper.find('.picker-count').text()).toContain('1 / 4')

    // A second Chapter is now disabled and cannot be added...
    expect(chip(wrapper, 'Dark Angels').attributes('disabled')).toBeDefined()
    await chip(wrapper, 'Dark Angels').trigger('click')
    expect(wrapper.find('.picker-count').text()).toContain('1 / 4')

    // ...but Grey Knights (separate army) and non-marines stay selectable.
    expect(chip(wrapper, 'Grey Knights').attributes('disabled')).toBeUndefined()
    expect(chip(wrapper, 'Necrons').attributes('disabled')).toBeUndefined()
  })

  it('frees the Chapters again when the chosen Space Marine army is removed', async () => {
    const wrapper = mountPicker()
    await chip(wrapper, 'Space Marines').trigger('click')
    expect(chip(wrapper, 'Space Wolves').attributes('disabled')).toBeDefined()

    // Deselect Space Marines → the group is open again.
    await chip(wrapper, 'Space Marines').trigger('click')
    expect(wrapper.find('.picker-count').text()).toContain('0 / 4')
    expect(chip(wrapper, 'Space Wolves').attributes('disabled')).toBeUndefined()
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FactionModal from '../FactionModal.vue'
import { allegiances, type FactionInfo } from '../../data/factions'

const sample: FactionInfo = allegiances
  .flatMap((a) => a.factions)
  .find((f) => f.key === 'world_eaters')!

// Teleport renders to <body>; stubbing it keeps the content inside the wrapper.
function mountModal(faction: FactionInfo | null) {
  return mount(FactionModal, {
    props: { faction },
    global: { stubs: { teleport: true } },
  })
}

describe('FactionModal', () => {
  it('renders nothing until a faction is passed', () => {
    const wrapper = mountModal(null)
    expect(wrapper.find('.modal-panel').exists()).toBe(false)
  })

  it('surfaces the competitive profile for the selected faction', () => {
    const wrapper = mountModal(sample)
    const chips = wrapper.findAll('.chip').map((c) => c.text())
    expect(chips).toEqual([sample.archetype, sample.range, sample.consistency])

    // Polarising armies get the amber counter-pick styling.
    expect(wrapper.find('.chip.consistency-polarising').exists()).toBe(true)

    expect(wrapper.findAll('.trait-list.strengths li')).toHaveLength(sample.strengths.length)
    expect(wrapper.findAll('.trait-list.weaknesses li')).toHaveLength(sample.weaknesses.length)
    expect(wrapper.find('.pairing-tip').text()).toContain(sample.pairingTip)
  })

  it('emits close when the backdrop is clicked', async () => {
    const wrapper = mountModal(sample)
    await wrapper.find('.modal-backdrop').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})

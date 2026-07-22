import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SecondariesView from '../SecondariesView.vue'
import { secondaryMissions } from '../../data/secondaries'

const first = secondaryMissions[0]!
const second = secondaryMissions[1]!
const last = secondaryMissions[secondaryMissions.length - 1]!

describe('SecondariesView', () => {
  it('shows the lede and a chip for every mission, and no detail, before selection', () => {
    const wrapper = mount(SecondariesView)
    expect(wrapper.findAll('.mosaic-chip')).toHaveLength(secondaryMissions.length)
    expect(wrapper.find('.lede').exists()).toBe(true)
    expect(wrapper.find('.stage').exists()).toBe(false)
    expect(wrapper.find('.see-all').exists()).toBe(false)
  })

  it('hides the mosaic/lede and shows the full card image once a chip is selected', async () => {
    const wrapper = mount(SecondariesView)
    await wrapper.findAll('.mosaic-chip')[0]!.trigger('click')
    expect(wrapper.find('.mosaic').exists()).toBe(false)
    expect(wrapper.find('.lede').exists()).toBe(false)
    expect(wrapper.find('.see-all').exists()).toBe(true)
    expect(wrapper.find('.counter-name').text()).toBe(first.name)
    // Image is the default view; the text pane is not rendered yet.
    expect(wrapper.find('.card-image img').attributes('src')).toBe(
      `/images/secondaries/${first.key}.webp`,
    )
    expect(wrapper.find('.rules').exists()).toBe(false)
  })

  it('toggles between the card image and the text with the toggle button', async () => {
    const wrapper = mount(SecondariesView)
    await wrapper.findAll('.mosaic-chip')[0]!.trigger('click')
    const toggle = wrapper.find('.toggle')

    // image -> text
    await toggle.trigger('click')
    expect(wrapper.find('.card-image').exists()).toBe(false)
    expect(wrapper.find('.rules').exists()).toBe(true)
    expect(wrapper.find('.mission-name').text()).toBe(first.name)
    // rich source HTML (bold terms) renders in the text pane
    expect(wrapper.find('.row-text b').exists()).toBe(true)

    // text -> image
    await toggle.trigger('click')
    expect(wrapper.find('.card-image').exists()).toBe(true)
    expect(wrapper.find('.rules').exists()).toBe(false)
  })

  it('returns to the mosaic when "See all secondaries" is clicked', async () => {
    const wrapper = mount(SecondariesView)
    await wrapper.findAll('.mosaic-chip')[0]!.trigger('click')
    await wrapper.find('.see-all').trigger('click')
    expect(wrapper.find('.mosaic').exists()).toBe(true)
    expect(wrapper.find('.stage').exists()).toBe(false)
    expect(wrapper.find('.lede').exists()).toBe(true)
  })

  it('advances and wraps around with the Next / Previous controls', async () => {
    const wrapper = mount(SecondariesView)
    await wrapper.findAll('.mosaic-chip')[0]!.trigger('click')
    await wrapper.find('button[aria-label="Next mission"]').trigger('click')
    expect(wrapper.find('.counter-name').text()).toBe(second.name)

    await wrapper.find('button[aria-label="Previous mission"]').trigger('click')
    await wrapper.find('button[aria-label="Previous mission"]').trigger('click')
    expect(wrapper.find('.counter-name').text()).toBe(last.name)
    expect(wrapper.find('.counter-index').text()).toBe(
      `${secondaryMissions.length} / ${secondaryMissions.length}`,
    )
  })
})

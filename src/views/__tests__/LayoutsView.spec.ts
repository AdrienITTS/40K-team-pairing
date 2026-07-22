import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LayoutsView from '../LayoutsView.vue'

describe('LayoutsView', () => {
  it('walks the three steps and shows the three maps for the pairing', async () => {
    const wrapper = mount(LayoutsView)

    // Step 1: five dispositions to pick from, no maps yet.
    expect(wrapper.findAll('.disp-chip')).toHaveLength(5)
    expect(wrapper.find('.map-grid').exists()).toBe(false)

    // Pick "Take and Hold" (first) as your disposition → step 2.
    await wrapper.findAll('.disp-chip')[0]!.trigger('click')
    expect(wrapper.find('.pick-hint').exists()).toBe(true)

    // Pick "Purge the Foe" (second) as the opponent → step 3.
    await wrapper.findAll('.disp-chip')[1]!.trigger('click')

    const maps = wrapper.findAll('.map-card img')
    expect(maps).toHaveLength(3)
    expect(maps[0]!.attributes('src')).toBe('/images/layouts/take-and-hold-vs-purge-the-foe-1.webp')
  })

  it('opens the lightbox when a map is clicked', async () => {
    const wrapper = mount(LayoutsView)
    await wrapper.findAll('.disp-chip')[0]!.trigger('click')
    await wrapper.findAll('.disp-chip')[1]!.trigger('click')

    expect(wrapper.find('.lightbox').exists()).toBe(false)
    await wrapper.findAll('.map-btn')[1]!.trigger('click')
    const lb = wrapper.find('.lightbox')
    expect(lb.exists()).toBe(true)
    expect(lb.find('figcaption').text()).toContain('Layout B')
    // The lightbox shows the map that was clicked, not the first of the three.
    expect(lb.find('img').attributes('src')).toBe(
      '/images/layouts/take-and-hold-vs-purge-the-foe-2.webp',
    )
  })
})

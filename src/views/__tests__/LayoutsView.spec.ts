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
    expect(maps[0]!.attributes('src')).toBe(
      '/images/layouts/no-measurements/take-and-hold-vs-purge-the-foe-1.png',
    )
  })

  it('toggles the measurement variant of the map images', async () => {
    const wrapper = mount(LayoutsView)
    await wrapper.findAll('.disp-chip')[0]!.trigger('click')
    await wrapper.findAll('.disp-chip')[1]!.trigger('click')

    await wrapper.find('.measure-toggle input').setValue(true)
    expect(wrapper.find('.map-card img').attributes('src')).toBe(
      '/images/layouts/with-measurements/take-and-hold-vs-purge-the-foe-1.png',
    )
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
  })

  it('switches the measurement variant from inside the lightbox', async () => {
    const wrapper = mount(LayoutsView)
    await wrapper.findAll('.disp-chip')[0]!.trigger('click')
    await wrapper.findAll('.disp-chip')[1]!.trigger('click')
    await wrapper.findAll('.map-btn')[0]!.trigger('click')

    const img = () => wrapper.find('.lb-figure img').attributes('src')
    expect(img()).toBe('/images/layouts/no-measurements/take-and-hold-vs-purge-the-foe-1.png')

    await wrapper.find('.lb-measure').trigger('click')
    expect(img()).toBe('/images/layouts/with-measurements/take-and-hold-vs-purge-the-foe-1.png')
    // The grid behind it reflects the same switch.
    expect(wrapper.find('.map-card img').attributes('src')).toContain('with-measurements')
  })
})

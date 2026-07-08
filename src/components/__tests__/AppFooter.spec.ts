import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import AppFooter from '../AppFooter.vue'

describe('AppFooter', () => {
  it('renders the fan-content disclaimer', () => {
    const wrapper = mount(AppFooter, {
      global: { stubs: ['RouterLink'] },
    })
    expect(wrapper.text()).toContain('Not affiliated with or endorsed by Games Workshop')
  })
})

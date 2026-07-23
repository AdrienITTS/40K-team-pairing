import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PairingSetup from '../PairingSetup.vue'
import { EXAMPLE_SETUP } from '../../../data/pairingText'

type Wrapper = ReturnType<typeof mount<typeof PairingSetup>>

// Mount straight into Team A's army picker with the default size 4. A step with
// no mode behind it reads as the full flow, which is the one that fixes the size.
function mountPicker() {
  return mount(PairingSetup, { props: { step: 'armies-a' } })
}

function chip(wrapper: Wrapper, name: string) {
  return wrapper.findAll('.faction-chip.side-a').find((c) => c.find('.chip-name').text() === name)!
}

function modeCard(wrapper: Wrapper, title: string) {
  return wrapper.findAll('.mode-card').find((c) => c.find('.mode-name').text() === title)!
}

/** The step the component last asked the page to move to. */
function lastStep(wrapper: Wrapper) {
  const emitted = wrapper.emitted('update:step') ?? []
  return emitted[emitted.length - 1]
}

function stepLabels(wrapper: Wrapper) {
  return wrapper.findAll('.stepper li').map((li) => li.text())
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

describe('PairingSetup — choosing a mode', () => {
  it('opens on the mode chooser and offers the three modes', () => {
    const wrapper = mount(PairingSetup)
    expect(wrapper.findAll('.mode-card')).toHaveLength(3)
    expect(stepLabels(wrapper)).toEqual(['1 · Setup'])
  })

  it('lays out the full flow when Full configuration is chosen', async () => {
    const wrapper = mount(PairingSetup)
    await modeCard(wrapper, 'Full configuration').trigger('click')

    expect(lastStep(wrapper)).toEqual(['round'])
    expect(stepLabels(wrapper)).toEqual([
      '1 · Setup',
      '2 · Round',
      '3 · Team A armies',
      '4 · Team A dispositions',
      '5 · Team B armies',
      '6 · Team B dispositions',
      '7 · Estimates',
    ])
  })

  it('lays out only the two roster steps when Minimal configuration is chosen', async () => {
    const wrapper = mount(PairingSetup)
    await modeCard(wrapper, 'Minimal configuration').trigger('click')

    expect(lastStep(wrapper)).toEqual(['armies-a'])
    expect(stepLabels(wrapper)).toEqual(['1 · Setup', '2 · Team A armies', '3 · Team B armies'])
  })

  it('lays out the single paste step when Quick pairing is chosen', async () => {
    const wrapper = mount(PairingSetup)
    await modeCard(wrapper, 'Quick pairing').trigger('click')

    expect(lastStep(wrapper)).toEqual(['paste'])
    expect(stepLabels(wrapper)).toEqual(['1 · Setup', '2 · Paste setup'])
  })
})

describe('PairingSetup — minimal configuration', () => {
  async function pickMinimal(wrapper: Wrapper, names: string[]) {
    await modeCard(wrapper, 'Minimal configuration').trigger('click')
    await wrapper.setProps({ step: 'armies-a' })
    for (const name of names) await chip(wrapper, name).trigger('click')
    return wrapper
  }

  it('lets Team A choose its own size rather than fixing one up front', async () => {
    const wrapper = await pickMinimal(mount(PairingSetup), ['Orks', 'Necrons'])
    expect(wrapper.find('.picker-count').text()).toContain('2 / 3–8')

    // Two armies isn't a legal team yet, so the step won't advance.
    expect(wrapper.find('.nav-next').attributes('disabled')).toBeDefined()
    await chip(wrapper, 'Aeldari').trigger('click')
    expect(wrapper.find('.nav-next').attributes('disabled')).toBeUndefined()
  })

  it('holds Team B to the size Team A settled on', async () => {
    const wrapper = await pickMinimal(mount(PairingSetup), ['Orks', 'Necrons', 'Aeldari'])
    await wrapper.setProps({ step: 'armies-b' })
    expect(wrapper.find('.picker-count').text()).toContain('0 / 3')
  })

  it('starts a round with default names and no dispositions or estimates', async () => {
    const wrapper = await pickMinimal(mount(PairingSetup), ['Orks', 'Necrons', 'Aeldari'])
    await wrapper.setProps({ step: 'armies-b' })
    for (const name of ['Tyranids', 'Drukhari', 'Death Guard']) {
      await wrapper
        .findAll('.faction-chip.side-b')
        .find((c) => c.find('.chip-name').text() === name)!
        .trigger('click')
    }
    await wrapper.find('form').trigger('submit')

    const config = wrapper.emitted('start')![0]![0] as never as {
      round: number
      teamA: { name: string; players: Array<{ faction: string; disposition: null }> }
      teamB: { name: string }
      estimates: Record<string, unknown>
    }
    expect(config.teamA.name).toBe('Team A')
    expect(config.teamB.name).toBe('Team B')
    expect(config.round).toBe(1)
    expect(config.teamA.players.map((p) => p.faction)).toEqual(['orks', 'necrons', 'aeldari'])
    expect(config.teamA.players.every((p) => p.disposition === null)).toBe(true)
    expect(config.estimates).toEqual({})
  })

  it('trims Team B when Team A shrinks below it', async () => {
    const wrapper = await pickMinimal(mount(PairingSetup), [
      'Orks',
      'Necrons',
      'Aeldari',
      'Drukhari',
    ])
    await wrapper.setProps({ step: 'armies-b' })
    for (const name of ['Tyranids', 'Death Guard', 'World Eaters', 'Thousand Sons']) {
      await wrapper
        .findAll('.faction-chip.side-b')
        .find((c) => c.find('.chip-name').text() === name)!
        .trigger('click')
    }
    expect(wrapper.find('.picker-count').text()).toContain('4 / 4')

    await wrapper.setProps({ step: 'armies-a' })
    await chip(wrapper, 'Drukhari').trigger('click') // deselect
    await wrapper.setProps({ step: 'armies-b' })
    expect(wrapper.find('.picker-count').text()).toContain('3 / 3')
  })

  it('still asks for the round, which fixes the Refused/Champion layout', async () => {
    const wrapper = await pickMinimal(mount(PairingSetup), [])
    expect(wrapper.find('.minimal-round').exists()).toBe(true)
    expect(wrapper.find('.minimal-round input').attributes('type')).toBe('number')
  })
})

describe('PairingSetup — quick pairing', () => {
  async function mountPaste() {
    const wrapper = mount(PairingSetup)
    await modeCard(wrapper, 'Quick pairing').trigger('click')
    await wrapper.setProps({ step: 'paste' })
    return wrapper
  }

  it('will not start on an empty box', async () => {
    const wrapper = await mountPaste()
    expect(wrapper.find('.nav-next').attributes('disabled')).toBeDefined()
  })

  it('reports what it could not read', async () => {
    const wrapper = await mountPaste()
    await wrapper.find('.paste-input').setValue('a: Squats\nb: Ewoks')
    expect(wrapper.find('.paste-errors').text()).toContain("isn't an army")
    expect(wrapper.find('.nav-next').attributes('disabled')).toBeDefined()
  })

  it('summarises a setup it understood and enables the start button', async () => {
    const wrapper = await mountPaste()
    await wrapper.find('.paste-input').setValue(EXAMPLE_SETUP)

    expect(wrapper.find('.paste-errors').exists()).toBe(false)
    const summary = wrapper.find('.paste-summary').text()
    expect(summary).toContain('4 tables')
    expect(summary).toContain('Les Bastonneurs vs Ordo Malleus')
    expect(summary).toContain('round 2')
    expect(wrapper.find('.nav-next').attributes('disabled')).toBeUndefined()
  })

  it('emits the parsed config so the round starts already configured', async () => {
    const wrapper = await mountPaste()
    await wrapper.find('.paste-input').setValue(EXAMPLE_SETUP)
    await wrapper.find('form').trigger('submit')

    const config = wrapper.emitted('start')![0]![0] as never as {
      round: number
      teamA: { name: string; players: Array<{ id: string; disposition: string | null }> }
      estimates: Record<string, unknown>
    }
    expect(config.round).toBe(2)
    expect(config.teamA.name).toBe('Les Bastonneurs')
    expect(config.teamA.players[0]!.id).toBe('a-aeldari')
    expect(config.teamA.players[0]!.disposition).toBe('take-and-hold')
    expect(Object.keys(config.estimates)).toHaveLength(4)
  })

  it('fills the box from the worked example', async () => {
    const wrapper = await mountPaste()
    await wrapper.find('.picker-count button').trigger('click')
    expect((wrapper.find('.paste-input').element as HTMLTextAreaElement).value).toBe(EXAMPLE_SETUP)
  })
})

import { describe, it, expect, beforeEach } from 'vitest'

import { useTheme } from '../useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults to light and applies it to the document root', () => {
    const { theme } = useTheme()
    expect(theme.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('toggleTheme flips between light and dark and persists the choice', () => {
    const { theme, toggleTheme } = useTheme()

    toggleTheme()
    expect(theme.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('les-bastonneurs-theme')).toBe('dark')

    toggleTheme()
    expect(theme.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('les-bastonneurs-theme')).toBe('light')
  })

  it('setTheme sets an explicit value', () => {
    const { theme, setTheme } = useTheme()

    setTheme('dark')
    expect(theme.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})

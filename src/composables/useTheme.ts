import { ref, watchEffect } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'les-bastonneurs-theme'

function readStoredTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

// Module-scoped so every component sharing this composable reads/writes the same theme.
const theme = ref<Theme>(readStoredTheme())

watchEffect(
  () => {
    document.documentElement.dataset.theme = theme.value
    window.localStorage.setItem(STORAGE_KEY, theme.value)
  },
  { flush: 'sync' },
)

/**
 * Shared light/dark theme state. Defaults to light; a returning visitor's
 * choice is restored from localStorage regardless of OS color-scheme preference.
 */
export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(next: Theme) {
    theme.value = next
  }

  return { theme, toggleTheme, setTheme }
}

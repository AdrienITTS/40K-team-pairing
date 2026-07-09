<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import { useTheme } from './composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <header class="site-header">
    <div class="site-header-inner container">
      <RouterLink to="/" class="brand">
        <img
          alt="Les Bastonneurs"
          class="brand-logo"
          src="/images/logo.png"
          width="36"
          height="36"
        />
      </RouterLink>

      <nav>
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/pairing" class="nav-link">Pairing</RouterLink>
        <RouterLink to="/factions" class="nav-link">Factions</RouterLink>
        <RouterLink to="/secondaries" class="nav-link">Secondaries</RouterLink>
        <RouterLink to="/how-it-works" class="nav-link">How It Works</RouterLink>
      </nav>

      <div class="header-actions">
        <button
          type="button"
          class="theme-toggle"
          :aria-label="theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'"
          :aria-pressed="theme === 'dark'"
          @click="toggleTheme"
        >
          <svg
            v-if="theme === 'light'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <RouterLink to="/pairing" class="btn-primary">Start Pairing</RouterLink>
      </div>
    </div>
  </header>

  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <AppFooter />
</template>

<style scoped>
.site-header {
  background: var(--color-canvas);
  border-bottom: 1px solid var(--color-hairline);
}

.site-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand {
  display: flex;
  align-items: center;
}

.brand-logo {
  display: block;
  border-radius: var(--radius-sm);
}

nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 var(--spacing-sm);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-muted);
}

.nav-link:hover {
  color: var(--color-ink);
  text-decoration: none;
}

.nav-link.router-link-exact-active {
  background: var(--color-surface-card);
  color: var(--color-ink);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-hairline);
  background: var(--color-surface-card);
  color: var(--color-ink);
  cursor: pointer;
}

.theme-toggle:hover,
.theme-toggle:focus-visible {
  background: var(--color-surface-strong);
}

.theme-toggle svg {
  width: 18px;
  height: 18px;
}
</style>

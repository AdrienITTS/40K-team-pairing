<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner container">
      <div class="footer-top">
        <RouterLink to="/" class="brand">
          <img
            alt="Les Bastonneurs"
            class="brand-logo"
            src="/images/logo.png"
            width="28"
            height="28"
          />
          <span>Les Bastonneurs</span>
        </RouterLink>

        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/how-it-works">How It Works</RouterLink>
        </nav>
      </div>

      <p class="disclaimer">
        Fan-made Warhammer 40,000 Teams Event companion. Not affiliated with or endorsed by Games
        Workshop.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-surface-dark);
  color: var(--color-on-dark-soft);
  margin-top: var(--spacing-section);
  font-size: 14px;
}

.footer-inner {
  padding: var(--spacing-xxl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-on-dark);
  font-size: 14px;
  font-weight: 500;
}

.brand:hover {
  text-decoration: none;
}

.brand-logo {
  display: block;
  border-radius: var(--radius-xs);
}

nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

nav a {
  color: var(--color-on-dark-soft);
  font-size: 14px;
  font-weight: 400;
}

nav a:hover {
  color: var(--color-on-dark);
  text-decoration: none;
}

.disclaimer {
  color: var(--color-on-dark-soft);
  font-size: 13px;
}
</style>

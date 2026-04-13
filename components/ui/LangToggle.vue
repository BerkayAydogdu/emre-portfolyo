<template>
  <button
    class="lang-toggle"
    :aria-label="`Switch to ${locale === 'tr' ? 'English' : 'Türkçe'}`"
    @click="toggle"
  >
    <span :class="{ active: locale === 'tr' }">TR</span>
    <span class="divider">/</span>
    <span :class="{ active: locale === 'en' }">EN</span>
  </button>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()

function toggle() {
  setLocale(locale.value === 'tr' ? 'en' : 'tr')
}
</script>

<style scoped>
.lang-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  transition: color 0.2s;
}

.lang-toggle:hover {
  color: var(--text-base);
}

.lang-toggle span {
  transition: color 0.2s;
}

.lang-toggle span.active {
  color: var(--primary-glow);
}

.divider {
  opacity: 0.4;
}
</style>

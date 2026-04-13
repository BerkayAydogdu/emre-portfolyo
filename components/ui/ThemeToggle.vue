<template>
  <button
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <Transition name="icon-swap" mode="out-in">
      <UIcon v-if="isDark" key="sun" name="i-lucide-sun" />
      <UIcon v-else key="moon" name="i-lucide-moon" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.theme-toggle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: none;
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.4);
  color: var(--text-base);
}

/* Icon swap animation */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}

.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
</style>

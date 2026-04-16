<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-inner">
      <!-- Logo -->
      <a href="#hero" class="logo" @click.prevent="scrollTo('#hero')">
        <span class="logo-text">Emre</span>
        <span class="logo-dot" />
      </a>

      <!-- Right side -->
      <div class="navbar-right">
        <ThemeToggle />
        <LangToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isScrolled = ref(false)

function scrollTo(href: string) {
  if (route.path !== '/') {
    router.push('/' + href)
    return
  }
  const el = document.querySelector(href)
  el?.scrollIntoView({ behavior: 'smooth' })
}

function onScroll() {
  isScrolled.value = window.scrollY > 60
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
  border-bottom: 1px solid transparent;
}

.navbar.scrolled {
  background: var(--nav-scrolled-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: var(--border-subtle);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none;
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-base);
  text-shadow: 0 0 20px rgba(167, 139, 250, 0.4);
  transition: text-shadow 0.3s;
}

.logo:hover .logo-text {
  text-shadow: 0 0 30px rgba(167, 139, 250, 0.7);
}

.logo-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-glow);
  box-shadow: 0 0 8px var(--primary-glow);
}

/* Right */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>

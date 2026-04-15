<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-inner">
      <!-- Logo -->
      <a href="#hero" class="logo" @click.prevent="scrollTo('#hero')">
        <span class="logo-text">Emre</span>
        <span class="logo-dot" />
      </a>

      <!-- Desktop nav -->
      <nav v-if="isHomePage" class="desktop-nav" aria-label="Main navigation">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="nav-link"
          :class="{ active: activeSection === link.href.slice(1) }"
          @click.prevent="scrollTo(link.href)"
        >
          {{ $t(link.labelKey) }}
        </a>
      </nav>

      <!-- Right side -->
      <div class="navbar-right">
        <ThemeToggle />
        <LangToggle />
        <!-- Mobile menu button -->
        <button
          v-if="isHomePage"
          class="mobile-menu-btn"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <span class="bar" :class="{ open: menuOpen }" />
          <span class="bar mid" :class="{ open: menuOpen }" />
          <span class="bar" :class="{ open: menuOpen }" />
        </button>
      </div>
    </div>

    <!-- Mobile drawer -->
    <Transition name="slide-up">
      <div v-if="menuOpen" class="mobile-drawer">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="mobile-link"
          @click.prevent="mobileNav(link.href)"
        >
          {{ $t(link.labelKey) }}
        </a>
        <div class="mobile-lang">
          <LangToggle />
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isScrolled = ref(false)
const menuOpen = ref(false)
const activeSection = ref('hero')

const isHomePage = computed(() => route.path === '/')

const links = [
  { href: '#about',       labelKey: 'nav.about' },
  { href: '#projects',    labelKey: 'nav.projects' },
  { href: '#references',  labelKey: 'nav.references' },
  { href: '#articles',    labelKey: 'nav.articles' },
  { href: '#contact',     labelKey: 'nav.contact' },
]

function scrollTo(href: string) {
  if (route.path !== '/') {
    router.push('/' + href)
    menuOpen.value = false
    return
  }
  const el = document.querySelector(href)
  el?.scrollIntoView({ behavior: 'smooth' })
  menuOpen.value = false
}

function mobileNav(href: string) {
  if (route.path !== '/') {
    router.push('/' + href)
    menuOpen.value = false
    return
  }
  menuOpen.value = false
  setTimeout(() => scrollTo(href), 50)
}

function onScroll() {
  isScrolled.value = window.scrollY > 60

  // Highlight active section via IntersectionObserver substitute
  const sectionIds = ['hero', 'about', 'projects', 'references', 'articles', 'voice', 'contact']
  let current = 'hero'
  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (el && window.scrollY >= el.offsetTop - 120) {
      current = id
    }
  }
  activeSection.value = current
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

/* Desktop nav */
.desktop-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
  position: relative;
  padding-bottom: 2px;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--primary-glow);
  transition: width 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-base);
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

/* Right */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.bar {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-muted);
  border-radius: 2px;
  transition: all 0.3s;
}

.bar.open:first-child {
  transform: translateY(7px) rotate(45deg);
  background: var(--primary-glow);
}

.bar.mid.open {
  opacity: 0;
}

.bar.open:last-child {
  transform: translateY(-7px) rotate(-45deg);
  background: var(--primary-glow);
}

/* Mobile drawer */
.mobile-drawer {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--nav-scrolled-bg);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-subtle);
  padding: 1rem 0 1.5rem;
}

.mobile-link {
  display: block;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}

.mobile-link:hover {
  color: var(--text-base);
  background: rgba(124, 58, 237, 0.06);
}

.mobile-lang {
  padding: 0.75rem 1.5rem 0;
  border-top: 1px solid var(--border-subtle);
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }
}
</style>

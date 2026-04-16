<template>
  <div class="admin-root">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">⚙</span>
        <span class="brand-text">Admin Panel</span>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink to="/" target="_blank" class="nav-item nav-item--muted">
          <UIcon name="i-lucide-external-link" class="nav-icon" />
          <span>Siteyi Gör</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main -->
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
]

// Force light mode while in admin so teleported modals/dropdowns also render light
const colorMode = useColorMode()
const previousPreference = ref<string>('dark')

onMounted(() => {
  previousPreference.value = colorMode.preference
  colorMode.preference = 'light'
})

onUnmounted(() => {
  colorMode.preference = previousPreference.value
})
</script>

<style>
/* Force light mode for the entire admin — override global dark CSS vars */
.admin-root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text-base: #0f172a;
  --text-muted: #64748b;
  --border-subtle: #e2e8f0;
  --primary: #7c3aed;
  --primary-glow: #7c3aed;
}
</style>

<style scoped>
.admin-root {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
}

/* ── Sidebar ── */
.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #7c3aed;
}

.brand-icon {
  font-size: 1.25rem;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.nav-item--active {
  background: #ede9fe;
  color: #7c3aed;
}

.nav-item--muted {
  color: #94a3b8;
  font-size: 0.8rem;
}

.nav-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* ── Main ── */
.admin-main {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  min-width: 0;
}
</style>

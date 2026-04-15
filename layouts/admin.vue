<template>
  <div class="admin-shell">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">⚡</div>
        <div>
          <div class="brand-name">Admin Panel</div>
          <div class="brand-sub">emreportfoy.com</div>
        </div>
      </div>

      <div class="sidebar-section-label">İçerik</div>
      <nav class="sidebar-nav">
        <NuxtLink to="/admin/content/tr" class="nav-item" :class="{ active: route.path === '/admin/content/tr' }">
          <span class="nav-flag">🇹🇷</span>
          <span>Türkçe İçerik</span>
        </NuxtLink>
        <NuxtLink to="/admin/content/en" class="nav-item" :class="{ active: route.path === '/admin/content/en' }">
          <span class="nav-flag">🇬🇧</span>
          <span>English Content</span>
        </NuxtLink>
        <NuxtLink to="/admin/portfolio-data" class="nav-item" :class="{ active: route.path === '/admin/portfolio-data' }">
          <UIcon name="i-lucide-layers" class="nav-icon" />
          <span>Projeler & Veriler</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-section-label">Genel</div>
      <nav class="sidebar-nav">
        <NuxtLink to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
          <UIcon name="i-lucide-layout-dashboard" class="nav-icon" />
          <span>Dashboard</span>
        </NuxtLink>
        <a href="/" target="_blank" class="nav-item nav-external">
          <UIcon name="i-lucide-external-link" class="nav-icon" />
          <span>Siteyi Görüntüle</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <UIcon name="i-lucide-log-out" />
          Çıkış Yap
        </button>
      </div>
    </aside>

    <!-- Content -->
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AdminLayout' })
const route = useRoute()

async function logout() {
  await $fetch('/api/admin/auth/logout', { method: 'POST' })
  navigateTo('/admin/login')
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text-base);
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #0a0a14;
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.brand-icon {
  font-size: 22px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(124, 58, 237, 0.15);
  border-radius: 8px;
}

.brand-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-base);
}

.brand-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}

.sidebar-section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding: 16px 16px 6px;
}

.sidebar-nav {
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 13.5px;
  color: var(--text-muted);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: rgba(124, 58, 237, 0.08);
  color: var(--text-base);
}

.nav-item.active {
  background: rgba(124, 58, 237, 0.18);
  color: var(--accent);
  font-weight: 600;
}

.nav-flag {
  font-size: 15px;
  line-height: 1;
}

.nav-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.nav-external {
  opacity: 0.7;
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px 8px 16px;
  border-top: 1px solid var(--border-subtle);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 13.5px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* ── Main ────────────────────────────────────────────────────────── */
.admin-main {
  flex: 1;
  overflow-y: auto;
  padding: 36px 40px;
  min-width: 0;
}
</style>

<!-- Global dark overrides for all inputs inside the admin panel -->
<style>
.admin-main input,
.admin-main textarea {
  background-color: #0d0d1a !important;
  color: #f8fafc !important;
  border-color: #1e1b3a !important;
}

.admin-main input:focus,
.admin-main textarea:focus {
  border-color: #7c3aed !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.25) !important;
}

.admin-main input::placeholder,
.admin-main textarea::placeholder {
  color: #475569 !important;
}

.admin-main input:disabled,
.admin-main textarea:disabled {
  background-color: #080810 !important;
  color: #334155 !important;
  cursor: not-allowed;
}
</style>

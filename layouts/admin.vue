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

      <div class="sidebar-section-label">Editör</div>
      <nav class="sidebar-nav">
        <NuxtLink to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
          <UIcon name="i-lucide-layout-dashboard" class="nav-icon" />
          <span>Tüm İçerikler</span>
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
  background: #f1f5f9;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
.admin-sidebar {
  width: 230px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
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
  border-bottom: 1px solid #e2e8f0;
}

.brand-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ede9fe;
  border-radius: 8px;
}

.brand-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.brand-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}

.sidebar-section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
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
  color: #64748b;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-item.active {
  background: #ede9fe;
  color: #6d28d9;
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
  border-top: 1px solid #e2e8f0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 13.5px;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.logout-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* ── Main ────────────────────────────────────────────────────────── */
.admin-main {
  flex: 1;
  overflow-y: auto;
  padding: 36px 40px;
  min-width: 0;
}
</style>



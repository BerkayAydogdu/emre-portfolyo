<template>
  <div>
    <!-- Welcome -->
    <div class="welcome">
      <div>
        <h1 class="welcome-title">Hoş geldin 👋</h1>
        <p class="welcome-sub">Neyi düzenlemek istiyorsun?</p>
      </div>
      <a href="/" target="_blank" class="preview-link">
        <UIcon name="i-lucide-external-link" />
        Siteyi Görüntüle
      </a>
    </div>

    <!-- Main actions -->
    <div class="action-grid">
      <NuxtLink to="/admin/content/tr" class="action-card action-tr">
        <div class="action-emoji">🇹🇷</div>
        <div class="action-body">
          <div class="action-title">Türkçe İçeriği Düzenle</div>
          <div class="action-desc">Hero yazısı, hakkımda, projeler, referanslar, yazılar, iletişim bölümleri</div>
        </div>
        <div class="action-arrow">
          <UIcon name="i-lucide-arrow-right" />
        </div>
      </NuxtLink>

      <NuxtLink to="/admin/content/en" class="action-card action-en">
        <div class="action-emoji">🇬🇧</div>
        <div class="action-body">
          <div class="action-title">Edit English Content</div>
          <div class="action-desc">Hero text, about, projects, references, articles, contact sections</div>
        </div>
        <div class="action-arrow">
          <UIcon name="i-lucide-arrow-right" />
        </div>
      </NuxtLink>

      <NuxtLink to="/admin/portfolio-data" class="action-card action-data">
        <div class="action-emoji">🗂️</div>
        <div class="action-body">
          <div class="action-title">Projeler & Veriler</div>
          <div class="action-desc">Proje listesi, referans kişileri, makale meta verileri, uzmanlık alanları</div>
        </div>
        <div class="action-arrow">
          <UIcon name="i-lucide-arrow-right" />
        </div>
      </NuxtLink>
    </div>

    <!-- Status -->
    <h2 class="status-title">Son Kayıt Zamanları</h2>
    <div class="status-grid">
      <div class="status-item">
        <div class="status-dot" :class="meta?.trUpdatedAt ? 'dot-green' : 'dot-gray'" />
        <div>
          <div class="status-label">🇹🇷 Türkçe İçerik</div>
          <div class="status-val">{{ meta?.trUpdatedAt ? formatDate(meta.trUpdatedAt) : 'Henüz düzenlenmedi' }}</div>
        </div>
      </div>
      <div class="status-item">
        <div class="status-dot" :class="meta?.enUpdatedAt ? 'dot-green' : 'dot-gray'" />
        <div>
          <div class="status-label">🇬🇧 English Content</div>
          <div class="status-val">{{ meta?.enUpdatedAt ? formatDate(meta.enUpdatedAt) : 'Not edited yet' }}</div>
        </div>
      </div>
      <div class="status-item">
        <div class="status-dot" :class="meta?.portfolioUpdatedAt ? 'dot-green' : 'dot-gray'" />
        <div>
          <div class="status-label">🗂️ Portfolio Data</div>
          <div class="status-val">{{ meta?.portfolioUpdatedAt ? formatDate(meta.portfolioUpdatedAt) : 'Henüz düzenlenmedi' }}</div>
        </div>
      </div>
    </div>

    <!-- Info box -->
    <div class="info-box">
      <UIcon name="i-lucide-info" class="info-icon" />
      <div>
        <strong>Nasıl çalışır?</strong> Bir bölümü düzenleyip Kaydet'e basınca değişiklikler otomatik olarak
        siteye yansır. Redeploy gerekmiyor.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { data: meta, refresh } = await useFetch('/api/admin/meta', { lazy: true })

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const interval = setInterval(refresh, 30_000)
onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.welcome {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.welcome-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 4px;
}

.welcome-sub {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
}

.preview-link {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  padding: 8px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  transition: color 0.15s, border-color 0.15s;
}

.preview-link:hover {
  color: var(--accent);
  border-color: var(--primary);
}

/* ── Action cards ────────────────────────────────────────────────── */
.action-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 36px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: #12121f;
  text-decoration: none;
  color: var(--text-base);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
}

.action-card:hover {
  border-color: var(--primary);
  background: rgba(124, 58, 237, 0.06);
  transform: translateX(3px);
}

.action-emoji {
  font-size: 28px;
  flex-shrink: 0;
}

.action-body {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

.action-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}

/* ── Status ──────────────────────────────────────────────────────── */
.status-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 14px;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #0d0d1a;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-green { background: #4ade80; box-shadow: 0 0 6px rgba(74, 222, 128, 0.5); }
.dot-gray  { background: #475569; }

.status-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.status-val {
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Info box ────────────────────────────────────────────────────── */
.info-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  background: rgba(124, 58, 237, 0.06);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}

.info-icon {
  color: var(--accent);
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 16px;
}
</style>

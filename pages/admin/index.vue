<template>
  <div class="admin-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">CMS Paneli</h1>
        <p class="page-desc">Site içeriğini buradan düzenleyin. Her bölümün kendi "Kaydet" butonu vardır.</p>
      </div>
      <div class="header-status">
        <span v-if="loading" class="status-loading">
          <UIcon name="i-lucide-loader-circle" class="spin" /> Yükleniyor…
        </span>
        <span v-else class="status-ok">
          <UIcon name="i-lucide-check-circle" /> Veriler yüklendi
        </span>
      </div>
    </div>

    <!-- Global save toast -->
    <UAlert
      v-if="globalSaved"
      icon="i-lucide-check-circle"
      color="success"
      title="Değişiklikler kaydedildi ve siteye yansıtıldı!"
      class="mb-4"
    />
    <UAlert
      v-if="globalError"
      icon="i-lucide-alert-circle"
      color="error"
      :title="globalError"
      class="mb-4"
    />

    <!-- Tabs -->
    <UTabs :items="tabs" class="admin-tabs">
      <template #hero>
        <HeroTab
          :tr-content="trContent"
          :en-content="enContent"
          @save="(tr, en) => saveLocales(tr, en)"
        />
      </template>

      <template #about>
        <AboutTab
          :tr-content="trContent"
          :en-content="enContent"
          :portfolio-data="portfolioData"
          @save="(tr, en, portfolio) => saveAll(tr, en, portfolio)"
        />
      </template>

      <template #digitalMind>
        <DigitalMindTab
          :tr-content="trContent"
          :en-content="enContent"
          :portfolio-data="portfolioData"
          @save="(tr, en, portfolio) => saveAll(tr, en, portfolio)"
        />
      </template>

      <template #testimonials>
        <TestimonialsTab
          :tr-content="trContent"
          :en-content="enContent"
          :portfolio-data="portfolioData"
          @save="(tr, en, portfolio) => saveAll(tr, en, portfolio)"
        />
      </template>

      <template #socials>
        <SocialsTab
          :portfolio-data="portfolioData"
          @save="(portfolio) => savePortfolio(portfolio)"
        />
      </template>

      <template #contact>
        <ContactTab
          :tr-content="trContent"
          :en-content="enContent"
          @save="(tr, en) => saveLocales(tr, en)"
        />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

useHead({ title: 'Admin Paneli' })

// ── Data state ─────────────────────────────────────────────────────────────────
const portfolioData = ref<Record<string, any>>({})
const trContent = ref<Record<string, any>>({})
const enContent = ref<Record<string, any>>({})
const loading = ref(true)
const globalSaved = ref(false)
const globalError = ref('')

// ── Tabs definition ────────────────────────────────────────────────────────────
const tabs = [
  { label: 'Hero', slot: 'hero', icon: 'i-lucide-home' },
  { label: 'Hakkımda', slot: 'about', icon: 'i-lucide-user' },
  { label: 'Digital Mind', slot: 'digitalMind', icon: 'i-lucide-monitor' },
  { label: 'Referanslar', slot: 'testimonials', icon: 'i-lucide-quote' },
  { label: 'Sosyal Medya', slot: 'socials', icon: 'i-lucide-share-2' },
  { label: 'İletişim', slot: 'contact', icon: 'i-lucide-mail' },
]

// ── Load data on mount ─────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    const [pd, tr, en] = await Promise.all([
      $fetch<Record<string, any>>('/api/portfolio-data'),
      $fetch<Record<string, any>>('/api/_content/tr'),
      $fetch<Record<string, any>>('/api/_content/en'),
    ])
    portfolioData.value = pd ?? {}
    trContent.value = tr ?? {}
    enContent.value = en ?? {}
  }
  catch (e: any) {
    globalError.value = 'Veriler yüklenirken hata oluştu: ' + (e?.message ?? e)
  }
  finally {
    loading.value = false
  }
}

onMounted(loadData)

// ── Save helpers ───────────────────────────────────────────────────────────────
function flashSaved() {
  globalSaved.value = true
  setTimeout(() => { globalSaved.value = false }, 4000)
}

async function saveLocales(trPatch: Record<string, any>, enPatch: Record<string, any>) {
  globalError.value = ''
  try {
    const newTr = deepMerge(trContent.value, trPatch)
    const newEn = deepMerge(enContent.value, enPatch)
    const newPortfolio = { ...portfolioData.value, _locales: { tr: newTr, en: newEn } }
    await Promise.all([
      $fetch('/api/admin/content/tr', { method: 'PUT', body: newTr }),
      $fetch('/api/admin/content/en', { method: 'PUT', body: newEn }),
      $fetch('/api/admin/portfolio-data', { method: 'PUT', body: newPortfolio }),
    ])
    trContent.value = newTr
    enContent.value = newEn
    portfolioData.value = newPortfolio
    flashSaved()
  }
  catch (e: any) {
    globalError.value = 'Kaydetme hatası: ' + (e?.data?.message ?? e?.message ?? 'Bilinmeyen hata')
  }
}

async function savePortfolio(portfolioPatch: Record<string, any>) {
  globalError.value = ''
  try {
    await $fetch('/api/admin/portfolio-data', { method: 'PUT', body: portfolioPatch })
    portfolioData.value = portfolioPatch
    flashSaved()
  }
  catch (e: any) {
    globalError.value = 'Kaydetme hatası: ' + (e?.data?.message ?? e?.message ?? 'Bilinmeyen hata')
  }
}

async function saveAll(trPatch: Record<string, any>, enPatch: Record<string, any>, portfolioPatch: Record<string, any>) {
  globalError.value = ''
  try {
    const newTr = deepMerge(trContent.value, trPatch)
    const newEn = deepMerge(enContent.value, enPatch)
    const newPortfolio = { ...portfolioPatch, _locales: { tr: newTr, en: newEn } }
    await Promise.all([
      $fetch('/api/admin/content/tr', { method: 'PUT', body: newTr }),
      $fetch('/api/admin/content/en', { method: 'PUT', body: newEn }),
      $fetch('/api/admin/portfolio-data', { method: 'PUT', body: newPortfolio }),
    ])
    trContent.value = newTr
    enContent.value = newEn
    portfolioData.value = newPortfolio
    flashSaved()
  }
  catch (e: any) {
    globalError.value = 'Kaydetme hatası: ' + (e?.data?.message ?? e?.message ?? 'Bilinmeyen hata')
  }
}

// ── Utility: deep merge objects ────────────────────────────────────────────────
function deepMerge(base: Record<string, any>, patch: Record<string, any>): Record<string, any> {
  const result = { ...base }
  for (const key of Object.keys(patch)) {
    if (
      patch[key] !== null &&
      typeof patch[key] === 'object' &&
      !Array.isArray(patch[key]) &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key] ?? {}, patch[key])
    }
    else {
      result[key] = patch[key]
    }
  }
  return result
}
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.page-desc {
  font-size: 0.875rem;
  color: #64748b;
}

.header-status {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.status-loading { color: #64748b; display: flex; align-items: center; gap: 0.375rem; }
.status-ok { color: #16a34a; display: flex; align-items: center; gap: 0.375rem; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.admin-tabs :deep([role="tabpanel"]) {
  padding-top: 1.25rem;
}
</style>

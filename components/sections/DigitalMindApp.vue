<template>
  <section id="digital-mind" class="section digital-mind-section">
    <div class="section-inner">
      <div class="app-container">
        <!-- APP HEADER -->
        <div class="app-header">
          <div class="app-title-area">
            <h2 class="app-brand">{{ appTitle }}</h2>
            <p class="app-subtitle">{{ appSubtitle }}</p>
          </div>
          <div class="app-window-controls">
            <span class="control-btn min"></span>
            <span class="control-btn max"></span>
            <span class="control-btn close"></span>
          </div>
        </div>

        <!-- APP BODY -->
        <div class="app-body">
          <!-- SIDEBAR -->
          <div class="app-sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
            
            <div class="sidebar-header">
              <span class="sidebar-title" v-if="!isSidebarCollapsed">DİZİN</span>
              <button class="sidebar-toggle" @click="isSidebarCollapsed = !isSidebarCollapsed" :title="isSidebarCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'">
                <UIcon :name="isSidebarCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'" />
              </button>
            </div>

            <button
              v-for="tab in osTabs"
              :key="tab.id"
              class="os-tab-btn"
              :class="{ active: activeOsTab === tab.id }"
              @click="onSelectTab(tab.id)"
              :title="tab.label"
            >
              <UIcon :name="tab.icon" class="tab-icon" />
              <span class="tab-label" v-if="!isSidebarCollapsed">{{ tab.label }}</span>
            </button>
            <div class="sidebar-system-info mt-auto" v-if="!isSidebarCollapsed">
              System: Online<br>
              Uptime: {{ uptime }}
            </div>
          </div>

          <!-- CONTENT AREA -->
          <div class="app-content-area">
            <TransitionGroup name="fade-stack" tag="div" class="content-grid">
              <div
                v-for="item in currentItems"
                :key="item.id"
                class="os-card"
                @click="openPreviewModal(item)"
              >
                <div class="card-img-wrap">
                  <img v-if="item.image" :src="item.image" :alt="getI18nObjTitle(item)" class="card-img" />
                  <div v-else class="card-placeholder">
                    <UIcon name="i-lucide-file-code" class="text-4xl text-gray-500" />
                  </div>
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ getI18nObjTitle(item) }}</h3>
                </div>
              </div>
            </TransitionGroup>

            <div v-if="!activeOsTab" class="empty-state">
              <UIcon name="i-lucide-cpu" class="empty-icon" />
              <div class="empty-terminal-text">
                System terminal ready.<br>Görüntülemek için soldan bir modül seçiniz.
              </div>
            </div>
            <div v-else-if="currentItems.length === 0" class="empty-state">
              <UIcon name="i-lucide-folder-open" class="empty-icon" />
              Klasör Boş...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PREVIEW MODAL — Teleported to body so it escapes overflow:hidden + backdrop-filter -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="isPreviewOpen"
          class="dm-modal-overlay"
          @click.self="isPreviewOpen = false"
        >
          <div v-if="selectedObj" class="dm-modal-box">

            <!-- Header -->
            <div class="dm-modal-head">
              <div class="dm-modal-head-left">
                <span class="dm-modal-badge">
                  {{ activeTabConfig?.label.split('.')[0] }}
                </span>
                <h3 class="dm-modal-title">{{ getI18nObjTitle(selectedObj) }}</h3>
              </div>
              <button class="dm-modal-close" @click="isPreviewOpen = false">✕</button>
            </div>

            <!-- Image -->
            <div class="dm-modal-img-wrap">
              <img v-if="selectedObj.image" :src="selectedObj.image" class="dm-modal-img" />
              <div v-else class="dm-modal-img-placeholder">
                <UIcon name="i-lucide-monitor" />
              </div>
            </div>

            <!-- Description -->
            <p class="dm-modal-desc">{{ getI18nObjDesc(selectedObj) }}</p>

            <!-- Footer -->
            <div class="dm-modal-footer">
              <button class="dm-modal-cta" @click="goToDetail(selectedObj)">
                Detayları ve Dosyayı Aç →
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { projects, articles, digitalMind } = usePortfolioDataRuntime()

const isSidebarCollapsed = ref(false)

// ── TABS — driven by portfolio data ──────────────────────────────────────────
const osTabs = computed(() => digitalMind.value?.tabs ?? [
  { id: 'arastirmalar', label: 'ARAŞTIRMALAR.exe', icon: 'i-lucide-folder-git-2',  source: 'projects' as const,  filterType: 'arastirma' },
  { id: 'projeler',     label: 'PROJELER.app',     icon: 'i-lucide-monitor-play',   source: 'projects' as const,  filterType: 'yazi'      },
  { id: 'dusunceler',   label: 'DÜŞÜNCELER.txt',   icon: 'i-lucide-file-text',      source: 'articles' as const,  filterType: 'dusunce'   },
  { id: 'analizler',    label: 'ANALİZLER.db',     icon: 'i-lucide-database',       source: 'articles' as const,  filterType: 'analiz'    },
])

const appTitle = computed(() => digitalMind.value?.title ?? 'The Digital Mind')
const appSubtitle = computed(() => digitalMind.value?.subtitle ?? 'Burada araştırma, proje ve teknik yolculuğumu paylaşıyorum — kalıcı, kişisel ve her an çalışan kütüphanem.')

const activeOsTab = ref<string | null>(null)
const activeTabConfig = computed(() => osTabs.value.find(t => t.id === activeOsTab.value))

const dmChatCtx = useDigitalMindUiContext()

/** Keeps #digital-mind in the URL when a folder tab is chosen so chat + context stay aligned */
function onSelectTab(id: string) {
  activeOsTab.value = id
  if (route.path !== '/' && route.path !== '') return
  if (route.hash === '#digital-mind') return
  router.replace({ path: route.path, query: route.query, hash: '#digital-mind' })
}

watch(
  osTabs,
  (tabs) => {
    if (tabs.length && activeOsTab.value == null) {
      activeOsTab.value = tabs[0].id
    }
  },
  { immediate: true },
)

watch(
  [activeOsTab, osTabs],
  () => {
    const tab = osTabs.value.find(t => t.id === activeOsTab.value)
    if (tab) {
      dmChatCtx.value = {
        label: tab.label,
        filterType: tab.filterType,
        source: tab.source,
      }
    }
    else {
      dmChatCtx.value = { label: '', filterType: '', source: '' }
    }
  },
  { immediate: true },
)

// ── DATA ──────────────────────────────────────────────────────────────────────
const currentItems = computed(() => {
  const cfg = activeTabConfig.value
  if (!cfg) return []
  if (cfg.source === 'projects') {
    return projects.value.filter(p => p.type === cfg.filterType).map(p => ({ ...p, _kind: 'project' }))
  } else if (cfg.source === 'articles') {
    return articles.value.filter(a => a.type === cfg.filterType).map(a => ({ ...a, _kind: 'article' }))
  }
  return []
})

function getI18nObjTitle(item: any) {
  return t(item.titleKey || 'Missing Title')
}

function getI18nObjDesc(item: any) {
  const key = item.descriptionKey || item.excerptKey || ''
  return t(key)
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
const isPreviewOpen = ref(false)
const selectedObj = ref<any>(null)

function openPreviewModal(item: any) {
  selectedObj.value = item
  isPreviewOpen.value = true
}

function goToDetail(item: any) {
  isPreviewOpen.value = false
  if (item._kind === 'article') {
    router.push(`/yazi/${item.slug}`)
  } else if (item._kind === 'project') {
    router.push(`/proje/${item.id}`)
  }
}

// ── UPTIME ────────────────────────────────────────────────────────────────────
const uptime = ref('00:00:00')
let uptimeInt: ReturnType<typeof setInterval> | null = null
const startTime = Date.now()

onMounted(() => {
  uptimeInt = setInterval(() => {
    const diff = Math.floor((Date.now() - startTime) / 1000)
    const h = String(Math.floor(diff / 3600)).padStart(2, '0')
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
    const s = String(diff % 60).padStart(2, '0')
    uptime.value = `${h}:${m}:${s}`
  }, 1000)
})

onUnmounted(() => {
  if (uptimeInt) clearInterval(uptimeInt)
})
</script>

<!-- ─────────────────────────────────────────────────────────────────────────
     SCOPED — component styles only (everything inside .app-container)
──────────────────────────────────────────────────────────────────────────── -->
<style scoped>
.digital-mind-section {
  padding: 4rem 0;
  width: 100%;
}

.app-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  border: var(--glow-border);
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

/* HEADER */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border-subtle);
}

.app-brand {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-base);
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  max-width: 500px;
}

.app-window-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #334155;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.control-btn.min   { background: #eab308; }
.control-btn.max   { background: #22c55e; }
.control-btn.close { background: #ef4444; }

/* BODY */
.app-body {
  display: flex;
  flex: 1;
}

/* SIDEBAR */
.app-sidebar {
  width: 260px;
  background: var(--surface);
  border-right: 1px solid var(--border-subtle);
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-sidebar.is-collapsed {
  width: 80px;
  padding: 1.5rem 0.5rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
  min-height: 24px;
}
.app-sidebar.is-collapsed .sidebar-header {
  justify-content: center;
}

.sidebar-title {
  font-size: 0.70rem;
  color: var(--text-muted);
  font-family: monospace;
  letter-spacing: 0.1em;
}

.sidebar-toggle {
  color: var(--text-muted);
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}
.sidebar-toggle:hover {
  color: var(--primary);
}

.os-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-family: 'Space Grotesk', monospace;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
}
.os-tab-btn:hover {
  background: rgba(124, 58, 237, 0.05);
  color: var(--text-base);
}
.os-tab-btn.active {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.2);
  color: var(--primary);
  box-shadow: var(--glow-shadow);
}

.app-sidebar.is-collapsed .os-tab-btn {
  justify-content: center;
  padding: 0.85rem 0;
}

.tab-icon { font-size: 1.25rem; flex-shrink: 0; }
.tab-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-system-info {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.5;
  padding: 0 1.25rem;
}

/* CONTENT */
.app-content-area {
  flex: 1;
  padding: 2.5rem;
  position: relative;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.os-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}
.os-card:hover {
  transform: translateY(-4px);
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: var(--glow-shadow);
  background: var(--bg);
}

.card-img-wrap {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: var(--bg);
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.os-card:hover .card-img { transform: scale(1.05); }

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.card-body { padding: 0 0.5rem; }

.card-title {
  color: var(--text-base);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 1.05rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-muted);
  font-family: monospace;
  font-size: 0.9rem;
  text-align: center;
  opacity: 0.7;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-muted);
  opacity: 0.5;
}

.empty-terminal-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-muted);
}

/* CARD TRANSITIONS */
.fade-stack-move,
.fade-stack-enter-active,
.fade-stack-leave-active { transition: all 0.4s ease; }
.fade-stack-enter-from,
.fade-stack-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
.fade-stack-leave-active { position: absolute; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .app-container { min-height: 500px; }
  .app-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .app-window-controls { position: absolute; top: 1.5rem; right: 1.5rem; }
  .app-body { flex-direction: column; }
  .app-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
    flex-direction: row;
    flex-wrap: wrap;
    padding: 1rem;
  }
  .app-sidebar.is-collapsed {
    width: 100%; /* Collapse state doesn't really apply horizontally on mobile layout, keep it fluid */
  }
  .sidebar-header {
    display: none;
  }
  .sidebar-system-info { display: none; }
  .os-tab-btn { width: auto; padding: 0.5rem 1rem; font-size: 0.85rem; }
}
</style>

<!-- ─────────────────────────────────────────────────────────────────────────
     UNSCOPED — modal styles only.
     Must be unscoped because <Teleport to="body"> renders outside this
     component's DOM subtree, so Vue's scoped data-v-* selectors never
     get attached to the teleported elements.
──────────────────────────────────────────────────────────────────────────── -->
<style>
/* Overlay */
.dm-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Box */
.dm-modal-box {
  background: var(--surface);
  border: var(--glow-border);
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.4);
  scrollbar-width: thin;
  scrollbar-color: rgba(124,58,237,0.3) transparent;
}

/* Header */
.dm-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}
.dm-modal-head-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.dm-modal-badge {
  flex-shrink: 0;
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  background: rgba(124, 58, 237, 0.1);
  color: var(--primary);
  border: 1px solid rgba(124, 58, 237, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.dm-modal-title {
  color: var(--text-base);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dm-modal-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}
.dm-modal-close:hover {
  color: var(--text-base);
  background: rgba(124, 58, 237, 0.1);
}

/* Image */
.dm-modal-img-wrap {
  width: 100%;
  height: 220px;
  background: var(--bg);
  overflow: hidden;
}
.dm-modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dm-modal-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 3rem;
  opacity: 0.5;
}

/* Description */
.dm-modal-desc {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
  padding: 1.5rem;
  margin: 0;
}

/* Footer */
.dm-modal-footer {
  padding: 0 1.5rem 1.5rem;
}
.dm-modal-cta {
  width: 100%;
  padding: 0.85rem 1.5rem;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.dm-modal-cta:hover {
  background: #6d28d9;
  transform: scale(1.01);
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .dm-modal-box,
.modal-fade-leave-active .dm-modal-box {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .dm-modal-box,
.modal-fade-leave-to .dm-modal-box {
  transform: translateY(16px) scale(0.97);
  opacity: 0;
}
</style>
<template>
  <div class="editor-page">

    <div class="topbar">
      <div>
        <h1 class="page-title">Projeler & Veriler</h1>
        <p class="page-hint">Proje listesi, referanslar, makaleler ve uzmanlık alanlarını düzenle.</p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-save"
        :loading="saving"
        :disabled="!isDirty"
        size="lg"
        @click="save"
      >
        {{ isDirty ? 'Kaydet' : 'Kaydedildi ✓' }}
      </UButton>
    </div>

    <transition name="fade">
      <div v-if="isDirty" class="banner banner-warning">
        <UIcon name="i-lucide-pencil" />
        Kaydedilmemiş değişiklikler var — <strong>Kaydet</strong> butonuna basmayı unutma.
      </div>
    </transition>
    <transition name="fade">
      <div v-if="saveSuccess" class="banner banner-success">
        <UIcon name="i-lucide-check-circle" />
        Kaydedildi! Değişiklikler 60 saniye içinde sitede görünür.
      </div>
    </transition>
    <transition name="fade">
      <div v-if="saveError" class="banner banner-error">
        <UIcon name="i-lucide-x-circle" />
        {{ saveError }}
      </div>
    </transition>

    <div v-if="pending" class="loading-state">
      <UIcon name="i-lucide-loader-circle" class="spin" />
      <span>Yükleniyor...</span>
    </div>

    <div v-else class="tab-layout">
      <!-- Tab nav -->
      <div class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span>{{ tab.emoji }}</span>
          {{ tab.label }}
          <span v-if="tab.key !== 'about'" class="tab-count">{{ (data as Record<string, unknown[]>)[tab.key]?.length ?? 0 }}</span>
        </button>
      </div>

      <!-- About -->
      <div v-if="activeTab === 'about'" class="tab-content">

        <!-- Photo -->
        <div class="item-card">
          <div class="item-head">
            <div class="item-num">📸 Profil Fotoğrafı</div>
          </div>
          <div class="about-photo-editor">
            <!-- Preview -->
            <div class="photo-preview">
              <img v-if="data.photo" :src="data.photo" alt="Profil" class="photo-preview-img" />
              <div v-else class="photo-preview-empty">
                <UIcon name="i-lucide-user-round" class="photo-empty-icon" />
                <span>Henüz fotoğraf yok</span>
              </div>
            </div>
            <!-- URL input -->
            <div class="photo-url-side">
              <div class="field-block">
                <label class="field-label">Fotoğraf URL'si</label>
                <p class="field-hint">Fotoğrafı bir yere yükle (Google Drive, Imgur, kendi sunucun) ve linkini buraya yapıştır. Ya da /public/images/ klasörüne koyup <code>/images/foto.jpg</code> yazabilirsin.</p>
                <UInput
                  v-model="data.photo"
                  placeholder="https://... veya /images/profil.jpg"
                />
              </div>
              <div v-if="data.photo" class="photo-clear">
                <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-x" @click="data.photo = ''">
                  Fotoğrafı Kaldır
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="item-card">
          <div class="item-head">
            <div class="item-num">📊 İstatistik Sayıları</div>
            <span class="item-hint-inline">Etiket metinleri Türkçe/İngilizce İçerik sayfasından düzenlenir</span>
          </div>
          <div class="stats-editor">
            <div v-for="(stat, idx) in data.stats" :key="stat.labelKey" class="stat-row">
              <div class="stat-preview-box">
                <span class="stat-big">{{ stat.value || '—' }}</span>
                <span class="stat-key">{{ stat.labelKey.replace('about.stats.', '') }}</span>
              </div>
              <div class="field-block stat-input-block">
                <label class="field-label">İstatistik {{ idx + 1 }} — Değer</label>
                <p class="field-hint">Gösterilecek sayı/metin (örn: 10+, 100+, 3)</p>
                <UInput v-model="stat.value" placeholder="10+" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Projects -->
      <div v-if="activeTab === 'projects'" class="tab-content">
        <!-- Sub-filter for project types -->
        <div class="project-type-filter">
          <button
            class="type-filter-btn"
            :class="{ active: projectFilter === 'all' }"
            @click="projectFilter = 'all'"
          >
            Tümü
            <span class="type-filter-count">{{ data.projects.length }}</span>
          </button>
          <button
            class="type-filter-btn"
            :class="{ active: projectFilter === 'arastirma' }"
            @click="projectFilter = 'arastirma'"
          >
            🔬 Araştırmalar
            <span class="type-filter-count">{{ data.projects.filter(p => p.type === 'arastirma').length }}</span>
          </button>
          <button
            class="type-filter-btn"
            :class="{ active: projectFilter === 'yazi' }"
            @click="projectFilter = 'yazi'"
          >
            ✏️ Yazılar
            <span class="type-filter-count">{{ data.projects.filter(p => p.type === 'yazi').length }}</span>
          </button>
        </div>

        <div v-for="(project, idx) in filteredProjects" :key="project.id" class="item-card">
          <div class="item-head">
            <div class="item-num">
              <span class="type-indicator" :class="project.type">{{ project.type === 'arastirma' ? '🔬' : '✏️' }}</span>
              {{ project.type === 'arastirma' ? 'Araştırma' : 'Yazı' }} — {{ getProjectRealIndex(project) + 1 }}
            </div>
            <div class="item-controls">
              <button class="ctrl-btn" :disabled="getProjectRealIndex(project) === 0" @click="moveUp(data.projects, getProjectRealIndex(project))">↑</button>
              <button class="ctrl-btn" :disabled="getProjectRealIndex(project) === data.projects.length - 1" @click="moveDown(data.projects, getProjectRealIndex(project))">↓</button>
              <button class="ctrl-btn ctrl-del" @click="data.projects.splice(getProjectRealIndex(project), 1)">✕</button>
            </div>
          </div>
          <div class="item-fields">
            <div class="field-block">
              <label class="field-label">Proje ID</label>
              <p class="field-hint">URL'de kullanılan tekil kimlik</p>
              <UInput v-model="project.id" />
            </div>
            <div class="field-block">
              <label class="field-label">Tür</label>
              <p class="field-hint">Araştırma mı, Yazı mı?</p>
              <div class="type-selector">
                <button
                  class="type-option"
                  :class="{ active: project.type === 'arastirma' }"
                  @click="project.type = 'arastirma'"
                >
                  🔬 Araştırma
                </button>
                <button
                  class="type-option"
                  :class="{ active: project.type === 'yazi' }"
                  @click="project.type = 'yazi'"
                >
                  ✏️ Yazı
                </button>
              </div>
            </div>
            <div class="field-block">
              <label class="field-label">Kategori</label>
              <UInput v-model="project.category" placeholder="Araştırma" />
            </div>
            <div class="field-block">
              <label class="field-label">Etiketler</label>
              <p class="field-hint">Virgülle ayır: Antropoloji, Dil, Kültür</p>
              <UInput
                :model-value="project.tags.join(', ')"
                @update:model-value="project.tags = $event.split(',').map((t: string) => t.trim()).filter(Boolean)"
              />
            </div>
            <div class="field-block">
              <label class="field-label">Görsel Yolu (opsiyonel)</label>
              <UInput v-model="project.image" placeholder="/images/projects/ornek.jpg" />
            </div>
            <div class="field-block field-readonly">
              <label class="field-label">Başlık Anahtarı <span class="readonly-badge">salt okunur</span></label>
              <p class="field-hint">Metni düzenlemek için Türkçe/İngilizce İçerik sayfasına git</p>
              <UInput :model-value="project.titleKey" disabled />
            </div>
          </div>
        </div>
        <div class="add-btn-group">
          <button class="add-btn" @click="addProject('arastirma')">
            <UIcon name="i-lucide-plus" /> Yeni Araştırma Ekle
          </button>
          <button class="add-btn add-btn-alt" @click="addProject('yazi')">
            <UIcon name="i-lucide-plus" /> Yeni Yazı Ekle
          </button>
        </div>
      </div>

      <!-- Testimonials -->
      <div v-if="activeTab === 'testimonials'" class="tab-content">
        <div v-for="(t, idx) in data.testimonials" :key="t.id" class="item-card">
          <div class="item-head">
            <div class="item-num">Referans {{ idx + 1 }} — {{ t.name || 'İsimsiz' }}</div>
            <div class="item-controls">
              <button class="ctrl-btn" :disabled="idx === 0" @click="moveUp(data.testimonials, idx)">↑</button>
              <button class="ctrl-btn" :disabled="idx === data.testimonials.length - 1" @click="moveDown(data.testimonials, idx)">↓</button>
              <button class="ctrl-btn ctrl-del" @click="data.testimonials.splice(idx, 1)">✕</button>
            </div>
          </div>
          <div class="item-fields">
            <div class="field-block">
              <label class="field-label">İsim Soyisim</label>
              <UInput v-model="t.name" placeholder="Dr. Ayşe Yılmaz" />
            </div>
            <div class="field-block">
              <label class="field-label">Organizasyon / Şirket</label>
              <UInput v-model="t.organization" placeholder="İstanbul Üniversitesi" />
            </div>
            <div class="field-block field-readonly">
              <label class="field-label">Alıntı Metni <span class="readonly-badge">salt okunur</span></label>
              <p class="field-hint">Metni düzenlemek için İçerik sayfasından "Referanslar Bölümü"ne git</p>
              <UInput :model-value="t.quoteKey" disabled />
            </div>
          </div>
        </div>
        <button class="add-btn" @click="addTestimonial">
          <UIcon name="i-lucide-plus" /> Yeni Referans Ekle
        </button>
      </div>

      <!-- Articles -->
      <div v-if="activeTab === 'articles'" class="tab-content">
        <div v-for="(article, idx) in data.articles" :key="article.id" class="item-card">
          <div class="item-head">
            <div class="item-num">Makale {{ idx + 1 }}</div>
            <div class="item-controls">
              <button class="ctrl-btn" :disabled="idx === 0" @click="moveUp(data.articles, idx)">↑</button>
              <button class="ctrl-btn" :disabled="idx === data.articles.length - 1" @click="moveDown(data.articles, idx)">↓</button>
              <button class="ctrl-btn ctrl-del" @click="data.articles.splice(idx, 1)">✕</button>
            </div>
          </div>
          <div class="item-fields">
            <div class="field-block">
              <label class="field-label">Makale ID</label>
              <UInput v-model="article.id" />
            </div>
            <div class="field-block">
              <label class="field-label">Slug</label>
              <p class="field-hint">URL'de görünen kısım</p>
              <UInput v-model="article.slug" placeholder="dijital-golge-bizi-takip-eden-veriler" />
            </div>
            <div class="field-block">
              <label class="field-label">Kategori</label>
              <UInput v-model="article.category" placeholder="Teknoloji" />
            </div>
            <div class="field-block">
              <label class="field-label">Yayın Tarihi</label>
              <UInput v-model="article.date" placeholder="2024-03-15" />
            </div>
            <div class="field-block">
              <label class="field-label">Okuma Süresi (dakika)</label>
              <UInput
                :model-value="String(article.readMinutes)"
                type="number"
                @update:model-value="article.readMinutes = Number($event)"
              />
            </div>
          </div>
        </div>
        <button class="add-btn" @click="addArticle">
          <UIcon name="i-lucide-plus" /> Yeni Makale Ekle
        </button>
      </div>

      <!-- Expertise -->
      <div v-if="activeTab === 'expertise'" class="tab-content">
        <div v-for="(exp, idx) in data.expertise" :key="idx" class="item-card">
          <div class="item-head">
            <div class="item-num">Alan {{ idx + 1 }}</div>
            <div class="item-controls">
              <button class="ctrl-btn" :disabled="idx === 0" @click="moveUp(data.expertise, idx)">↑</button>
              <button class="ctrl-btn" :disabled="idx === data.expertise.length - 1" @click="moveDown(data.expertise, idx)">↓</button>
              <button class="ctrl-btn ctrl-del" @click="data.expertise.splice(idx, 1)">✕</button>
            </div>
          </div>
          <div class="item-fields">
            <div class="field-block">
              <label class="field-label">i18n Anahtarı</label>
              <p class="field-hint">Çevirideki alan adı yolu</p>
              <UInput v-model="exp.key" placeholder="about.expertise.digitalAnthropology" />
            </div>
            <div class="field-block">
              <label class="field-label">İkon</label>
              <p class="field-hint">Lucide ikon adı, örn: i-lucide-globe</p>
              <UInput v-model="exp.icon" placeholder="i-lucide-globe" />
            </div>
          </div>
        </div>
        <button class="add-btn" @click="data.expertise.push({ key: '', icon: 'i-lucide-star' })">
          <UIcon name="i-lucide-plus" /> Yeni Alan Ekle
        </button>
      </div>
    </div>

    <!-- Sticky save bar -->
    <Teleport to="body">
      <transition name="slide-up">
        <div v-if="isDirty" class="save-bar">
          <span class="save-bar-text"><UIcon name="i-lucide-alert-circle" /> Kaydedilmemiş değişiklikler var</span>
          <UButton color="primary" icon="i-lucide-save" :loading="saving" @click="save">Kaydet</UButton>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { PortfolioData } from '~/server/schemas/contentSchema'

type PortfolioDataWithPhoto = PortfolioData & { photo?: string }

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const tabs = [
  { key: 'about', label: 'Hakkımda', emoji: '🧑' },
  { key: 'projects', label: 'Projeler', emoji: '📁' },
  { key: 'testimonials', label: 'Referanslar', emoji: '💬' },
  { key: 'articles', label: 'Makaleler', emoji: '📰' },
  { key: 'expertise', label: 'Uzmanlık', emoji: '🎯' },
]
const activeTab = ref('about')

const { data: rawData, pending } = await useFetch<PortfolioDataWithPhoto>('/api/admin/portfolio-data')

const data = reactive<PortfolioDataWithPhoto>({
  photo: '',
  projects: [], testimonials: [], articles: [], expertise: [], interests: [], stats: [],
})
const lastSaved = ref('')

watch(rawData, (val) => {
  if (val) {
    Object.assign(data, JSON.parse(JSON.stringify(val)))
    lastSaved.value = JSON.stringify(val)
  }
}, { immediate: true })

const isDirty = computed(() => JSON.stringify(data) !== lastSaved.value)

function moveUp<T>(arr: T[], idx: number) {
  if (idx === 0) return
  const c = [...arr]; [c[idx - 1], c[idx]] = [c[idx]!, c[idx - 1]!]; arr.splice(0, arr.length, ...c)
}
function moveDown<T>(arr: T[], idx: number) {
  if (idx === arr.length - 1) return
  const c = [...arr]; [c[idx + 1], c[idx]] = [c[idx]!, c[idx + 1]!]; arr.splice(0, arr.length, ...c)
}

const projectFilter = ref<'all' | 'arastirma' | 'yazi'>('all')

const filteredProjects = computed(() => {
  if (projectFilter.value === 'all') return data.projects
  return data.projects.filter(p => p.type === projectFilter.value)
})

function getProjectRealIndex(project: any): number {
  return data.projects.indexOf(project)
}

function addProject(type: 'arastirma' | 'yazi' = 'arastirma') {
  const id = `project-${Date.now()}`
  data.projects.push({ id, titleKey: `projects.${id}.title`, descriptionKey: `projects.${id}.description`, category: '', tags: [], type })
}
function addTestimonial() {
  const id = `person-${Date.now()}`
  data.testimonials.push({ id, quoteKey: `testimonials.${id}.quote`, name: '', titleKey: `testimonials.${id}.title`, organization: '' })
}
function addArticle() {
  const id = `article-${Date.now()}`
  data.articles.push({ id, titleKey: `articles.${id}.title`, excerptKey: `articles.${id}.excerpt`, category: '', date: new Date().toISOString().slice(0, 10), readMinutes: 5, slug: id })
}

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

async function save() {
  saving.value = true; saveSuccess.value = false; saveError.value = ''
  try {
    await $fetch('/api/admin/portfolio-data', { method: 'PUT', body: JSON.parse(JSON.stringify(data)) })
    lastSaved.value = JSON.stringify(data)
    saveSuccess.value = true
    setTimeout(() => (saveSuccess.value = false), 4000)
  }
  catch (err: unknown) {
    saveError.value = (err as { data?: { message?: string } })?.data?.message ?? 'Kaydetme başarısız.'
  }
  finally { saving.value = false }
}

onBeforeRouteLeave(() => {
  if (isDirty.value) return confirm('Kaydedilmemiş değişiklikler var. Ayrılmak istediğinden emin misin?')
})
</script>

<style scoped>
.editor-page { padding-bottom: 80px; }

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title { font-size: 22px; font-weight: 700; margin: 0 0 2px; }
.page-hint { font-size: 13px; color: var(--text-muted); margin: 0; }

.banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 14px;
}
.banner-warning { background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); color: #fbbf24; }
.banner-success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; }
.banner-error   { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; }

.loading-state { display: flex; align-items: center; gap: 12px; padding: 60px 0; color: var(--text-muted); font-size: 15px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tab layout ──────────────────────────────────────────────────── */
.tab-layout { display: flex; flex-direction: column; gap: 0; }

.tab-nav {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover { color: var(--text-base); background: rgba(124,58,237,0.06); }
.tab-btn.active { background: rgba(124,58,237,0.15); color: var(--accent); border-color: rgba(167,139,250,0.3); }

.tab-count {
  background: rgba(124,58,237,0.2);
  color: var(--accent);
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 600;
}

.tab-content { display: flex; flex-direction: column; gap: 14px; }

/* ── Item cards ──────────────────────────────────────────────────── */
.item-card {
  background: #12121f;
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--primary);
  border-radius: 10px;
  overflow: hidden;
}

.item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: rgba(124,58,237,0.05);
  border-bottom: 1px solid var(--border-subtle);
}

.item-num { font-size: 13px; font-weight: 600; color: var(--text-muted); }

.item-controls { display: flex; gap: 4px; }

.ctrl-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctrl-btn:hover:not(:disabled) { background: rgba(124,58,237,0.1); color: var(--accent); }
.ctrl-btn:disabled { opacity: 0.3; cursor: default; }
.ctrl-del:hover:not(:disabled) { background: rgba(239,68,68,0.1) !important; color: #f87171 !important; }

.item-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
  padding: 18px;
}

.field-block { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 14px; font-weight: 500; color: var(--text-base); }
.field-hint { font-size: 12px; color: var(--text-muted); margin: 0; }

.field-readonly { opacity: 0.6; }
.readonly-badge {
  font-size: 10px;
  background: rgba(71,85,105,0.3);
  color: var(--text-muted);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 400;
  margin-left: 6px;
  vertical-align: middle;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: 1px dashed rgba(124,58,237,0.4);
  border-radius: 10px;
  background: transparent;
  color: var(--accent);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 4px;
}

.add-btn:hover { background: rgba(124,58,237,0.06); border-color: var(--primary); }

/* ── Sticky save bar ─────────────────────────────────────────────── */
.save-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: #1a1a2e;
  border: 1px solid rgba(167,139,250,0.4);
  border-radius: 14px;
  padding: 12px 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 100;
}

.save-bar-text { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); white-space: nowrap; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

/* ── About tab ───────────────────────────────────────────────────── */
.about-photo-editor {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  padding: 20px 18px;
  align-items: start;
}

.photo-preview {
  width: 200px;
  aspect-ratio: 4/5;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  background: #0a0a14;
  flex-shrink: 0;
}

.photo-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-preview-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.photo-empty-icon {
  font-size: 40px;
  opacity: 0.3;
}

.photo-url-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.photo-clear {
  margin-top: -4px;
}

.item-hint-inline {
  font-size: 12px;
  color: var(--text-muted);
}

/* Stats editor */
.stats-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
}

.stat-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 18px;
  align-items: center;
}

.stat-preview-box {
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
}

.stat-big {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
}

.stat-key {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
}

.stat-input-block {
  flex: 1;
}

code {
  background: rgba(124,58,237,0.12);
  color: var(--accent);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
}

/* ── Project type filter ─────────────────────────────────────────── */
.project-type-filter {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.type-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.type-filter-btn:hover {
  color: var(--text-base);
  background: rgba(124,58,237,0.06);
}

.type-filter-btn.active {
  background: rgba(124,58,237,0.15);
  color: var(--accent);
  border-color: rgba(167,139,250,0.3);
}

.type-filter-count {
  background: rgba(124,58,237,0.2);
  color: var(--accent);
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 600;
}

/* ── Type selector ──────────────────────────────────────────────── */
.type-selector {
  display: flex;
  gap: 6px;
}

.type-option {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.type-option:hover {
  border-color: rgba(167,139,250,0.3);
  color: var(--text-base);
}

.type-option.active {
  background: rgba(124,58,237,0.15);
  border-color: rgba(167,139,250,0.4);
  color: var(--accent);
}

/* ── Type indicator in item head ────────────────────────────────── */
.type-indicator {
  margin-right: 4px;
}

/* ── Add button group ───────────────────────────────────────────── */
.add-btn-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.add-btn-alt {
  border-color: rgba(6,182,212,0.4);
  color: #06b6d4;
}

.add-btn-alt:hover {
  background: rgba(6,182,212,0.06);
  border-color: rgba(6,182,212,0.6);
}

@media (max-width: 600px) {
  .item-fields { grid-template-columns: 1fr; }
  .about-photo-editor { grid-template-columns: 1fr; }
  .stat-row { grid-template-columns: 1fr; }
  .add-btn-group { flex-direction: column; }
  .type-selector { flex-direction: column; }
}
</style>

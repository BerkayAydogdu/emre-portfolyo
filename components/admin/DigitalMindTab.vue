<template>
  <div class="dm-tab">

    <!-- ══ HEADER ════════════════════════════════════════════════════════════ -->
    <div class="tab-header">
      <div>
        <h2 class="tab-title">Digital Mind</h2>
        <p class="tab-subtitle">Uygulama başlığı, sidebar dizinleri ve içeriklerini yönetin.</p>
      </div>
      <UButton color="primary" icon="i-lucide-save" :loading="saving" @click="handleSave">
        Kaydet
      </UButton>
    </div>

    <UAlert
      v-if="itemSaveFlash"
      icon="i-lucide-check-circle"
      color="success"
      variant="subtle"
      title="İçerik listeye uygulandı"
      description="Kalıcı yayın için sayfanın üstündeki veya bu sekmenin Kaydet düğmesini kullanın."
      class="dm-flash"
    />

    <!-- ═══ 1. APP CONFIG ═══════════════════════════════════════════════════ -->
    <div class="card-box">
      <h3 class="card-title">
        <UIcon name="i-lucide-monitor" class="card-title-icon" />
        Uygulama Başlığı
      </h3>
      <div class="config-row">
        <UFormField label="Başlık">
          <UInput v-model="localConfig.title" placeholder="The Digital Mind" />
        </UFormField>
        <UFormField label="Alt Başlık (kütüphane açıklaması)">
          <UInput v-model="localConfig.subtitle" placeholder="Burada araştırma, proje..." />
        </UFormField>
      </div>
    </div>

    <!-- ═══ 2. DİZİN MANAGER ════════════════════════════════════════════════ -->
    <div class="card-box">
      <div class="card-header">
        <h3 class="card-title">
          <UIcon name="i-lucide-folder-open" class="card-title-icon" />
          Dizinler (Sidebar)
        </h3>
        <UButton size="sm" variant="soft" color="primary" icon="i-lucide-plus" @click="openDizinModal()">
          Yeni Dizin
        </UButton>
      </div>

      <div class="dizin-list">
        <div v-for="(tab, idx) in localConfig.tabs" :key="tab.id" class="dizin-row">
          <div class="dizin-row-left">
            <UIcon :name="tab.icon || 'i-lucide-folder'" class="dizin-icon" />
            <span class="dizin-label">{{ tab.label }}</span>
            <UBadge variant="subtle" :color="tab.source === 'projects' ? 'info' : 'secondary'" size="sm">
              {{ tab.source }} · {{ tab.filterType }}
            </UBadge>
          </div>
          <div class="dizin-row-actions">
            <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openDizinModal(tab)" />
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="deleteDizin(idx)" />
          </div>
        </div>
        <div v-if="!localConfig.tabs.length" class="empty-note">
          Henüz dizin yok. "Yeni Dizin" ile ekleyin.
        </div>
      </div>
    </div>

    <!-- ═══ 3. İÇERİK ═══════════════════════════════════════════════════════ -->
    <div class="card-box">
      <div class="card-header">
        <h3 class="card-title">
          <UIcon name="i-lucide-layers" class="card-title-icon" />
          İçerikler
        </h3>
        <UButton size="sm" variant="soft" color="success" icon="i-lucide-plus" @click="openItemModal(null, activeDizin)">
          Yeni İçerik Ekle
        </UButton>
      </div>

      <div v-if="localConfig.tabs.length">
        <!-- dizin filter tabs -->
        <div class="dizin-filter-tabs">
          <button
            v-for="tab in localConfig.tabs"
            :key="tab.id"
            class="dizin-filter-btn"
            :class="{ active: activeDizin === tab.id }"
            @click="activeDizin = tab.id"
          >
            <UIcon :name="tab.icon || 'i-lucide-folder'" class="btn-icon" />
            {{ tab.label }}
            <span class="item-count">{{ getItemCount(tab) }}</span>
          </button>
        </div>

        <!-- item list for active dizin -->
        <div class="content-list">
          <div v-for="item in currentItems" :key="item.id" class="content-item-row">
            <img v-if="item.image" :src="item.image" class="item-thumb" />
            <div v-else class="item-thumb-placeholder">
              <UIcon name="i-lucide-image" />
            </div>
            <div class="item-info">
              <span class="item-title">{{ getTitle(item) || item.id }}</span>
              <span class="item-meta">
                {{ item.category }}
                <span v-if="(item as any).date"> · {{ (item as any).date }}</span>
                <span v-else-if="(item as any).tags?.length"> · {{ (item as any).tags.join(', ') }}</span>
              </span>
            </div>
            <div class="item-actions">
              <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openItemModal(item, activeDizin)" />
              <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="deleteItem(item)" />
            </div>
          </div>
          <div v-if="!currentItems.length" class="empty-note">
            Bu dizinde içerik yok. "Yeni İçerik Ekle" ile başlayın.
          </div>
        </div>
      </div>
      <div v-else class="empty-note">Önce bir dizin ekleyin.</div>
    </div>

    <!-- ══ DİZİN MODAL (CMS düzeni + sidebar önizleme) ════════════════════════ -->
    <UModal
      v-model:open="dizinModalOpen"
      :title="editingDizin ? 'Dizin düzenle' : 'Yeni dizin'"
      description="Sol tarafta alanları düzenleyin; sağda sidebar’daki sekmenin nasıl görüneceğini kontrol edin."
      :ui="dizinModalUi"
    >
      <template #body>
        <div class="dizin-cms-scroll">
          <div class="dizin-cms-grid">
            <div class="dizin-cms-form">
              <UCard class="cms-card cms-card-pad">
                <template #header>
                  <div class="cms-card-head">
                    <UIcon name="i-lucide-palette" class="cms-card-icon" />
                    <span>Görünüm</span>
                  </div>
                </template>
                <p class="cms-card-lead">
                  Bu metin ve ikon, Digital Mind sol şeridindeki sekmede görünür.
                </p>
                <div class="dizin-field-stack">
                  <UFormField
                    label="Görünen ad"
                    required
                    description="Kısa, akılda kalır bir etiket (ör. dosya adı estetiği serbest)."
                  >
                    <UInput
                      v-model="dizinForm.label"
                      placeholder="Örn. DÜŞÜNCELER.txt veya ARAŞTIRMALAR"
                      size="md"
                    />
                  </UFormField>
                  <UFormField
                    label="İkon"
                    description="Lucide adı; i-lucide- ön ekiyle. Geçersiz ikon boş görünebilir."
                  >
                    <UInput
                      v-model="dizinForm.icon"
                      placeholder="i-lucide-file-text"
                      size="md"
                    />
                    <template #hint>
                      <a href="https://lucide.dev/icons/" target="_blank" rel="noopener" class="hint-link">Lucide kataloğu →</a>
                    </template>
                  </UFormField>
                </div>
              </UCard>

              <UCard class="cms-card cms-card-pad">
                <template #header>
                  <div class="cms-card-head">
                    <UIcon name="i-lucide-filter" class="cms-card-icon" />
                    <span>Hangi içerikler?</span>
                  </div>
                </template>
                <p class="cms-card-lead">
                  Önce koleksiyonu seçin; sonra o koleksiyondaki öğelerden <code class="inline-code">type</code> alanı eşleşenler bu dizinde listelenir.
                </p>
                <div class="dizin-field-stack">
                  <UFormField
                    label="Kaynak koleksiyonu"
                    description="Projeler veya yazılar — içerik havuzu buradan gelir."
                  >
                    <USelect v-model="dizinForm.source" :items="sourceOptions" size="md" />
                  </UFormField>
                  <UFormField
                    label="Filtre: type değeri"
                    required
                    description="Öğe kaydındaki type alanı (ör. dusunce, arastirma) tam olarak bu metinle aynı olmalı."
                  >
                    <UInput
                      v-model="dizinForm.filterType"
                      placeholder="dusunce · arastirma · analiz …"
                      size="md"
                    />
                  </UFormField>
                </div>
              </UCard>
            </div>

            <aside class="dizin-cms-preview" aria-label="Sidebar önizlemesi">
              <div class="dizin-preview-card">
                <div class="dizin-preview-head">
                  <UIcon name="i-lucide-panel-left" class="dizin-preview-head-ic" />
                  <span>Sidebar önizlemesi</span>
                </div>
                <p class="dizin-preview-sub">
                  Üstteki filtre şeridine benzer tek sekme — aktifmiş gibi vurgulandı.
                </p>
                <div class="dizin-preview-strip">
                  <div class="dizin-preview-tab dizin-preview-tab--active">
                    <UIcon
                      :name="(dizinForm.icon || '').trim() || 'i-lucide-folder'"
                      class="dizin-preview-tab-icon"
                    />
                    <span class="dizin-preview-tab-label">{{ dizinForm.label.trim() || 'Görünen ad' }}</span>
                    <span class="item-count">{{ dizinPreviewCount }}</span>
                  </div>
                </div>
                <dl class="dizin-preview-dl">
                  <div class="dizin-preview-row">
                    <dt>Kaynak</dt>
                    <dd><code class="inline-code">{{ dizinForm.source }}</code></dd>
                  </div>
                  <div class="dizin-preview-row">
                    <dt>type</dt>
                    <dd>
                      <code class="inline-code">{{ dizinForm.filterType.trim() || '—' }}</code>
                    </dd>
                  </div>
                  <div class="dizin-preview-row">
                    <dt>Eşleşen öğe</dt>
                    <dd>{{ dizinPreviewCount }} adet</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer-bar">
          <span class="footer-hint">
            <UIcon name="i-lucide-info" class="footer-hint-icon" />
            Kaydet bu listeyi günceller; siteye yazmak için üstteki Ana Kaydet gerekir.
          </span>
          <div class="footer-actions">
            <UButton variant="ghost" size="md" @click="dizinModalOpen = false">İptal</UButton>
            <UButton color="primary" size="md" @click="saveDizin">Kaydet</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- ══ İÇERİK MODAL (CMS düzeni) ═══════════════════════════════════════════ -->
    <UModal
      v-model:open="itemModalOpen"
      :title="editingItem ? 'İçerik düzenle' : 'Yeni içerik'"
      description="Sol panelde düzenleyin; sağda seçili dil için canlı önizleme görünür."
      :ui="itemModalUi"
    >
      <template #body>
        <div class="item-cms-scroll">
          <div class="item-cms-grid">
            <div class="item-cms-form">
              <UCard class="cms-card cms-card-pad">
                <template #header>
                  <div class="cms-card-head">
                    <UIcon name="i-lucide-folder-tree" class="cms-card-icon" />
                    <span>Bağlam</span>
                  </div>
                </template>
                <UFormField label="Hedef dizin" required description="Öğe bu klasörde listelenir.">
                  <USelect v-model="itemForm.dizinId" :items="dizinSelectItems" size="md" />
                </UFormField>
              </UCard>

              <UCard class="cms-card cms-card-pad">
                <template #header>
                  <div class="cms-card-head">
                    <UIcon name="i-lucide-languages" class="cms-card-icon" />
                    <span>Temel bilgi (dil)</span>
                  </div>
                </template>
                <p class="cms-card-lead">
                  Başlık ve kısa metni her dil için ayrı girin; sekme ile geçiş yapın.
                </p>
                <div class="lang-switch" role="tablist">
                  <UButton
                    role="tab"
                    :aria-selected="contentLang === 'tr'"
                    :color="contentLang === 'tr' ? 'primary' : 'neutral'"
                    :variant="contentLang === 'tr' ? 'solid' : 'outline'"
                    size="sm"
                    class="lang-switch-btn"
                    @click="contentLang = 'tr'"
                  >
                    TR 🇹🇷
                  </UButton>
                  <UButton
                    role="tab"
                    :aria-selected="contentLang === 'en'"
                    :color="contentLang === 'en' ? 'primary' : 'neutral'"
                    :variant="contentLang === 'en' ? 'solid' : 'outline'"
                    size="sm"
                    class="lang-switch-btn"
                    @click="contentLang = 'en'"
                  >
                    EN 🇬🇧
                  </UButton>
                </div>

                <div v-show="contentLang === 'tr'" class="lang-fields">
                  <UFormField label="Başlık" required :description="`Türkçe liste ve detay başlığı · ${itemForm.titleTr.length} / ${TITLE_MAX}`">
                    <UInput
                      v-model="itemForm.titleTr"
                      :maxlength="TITLE_MAX"
                      size="md"
                      placeholder="Örn. Medeniyet sözcüğünün kültürel yolculuğu"
                    />
                  </UFormField>
                  <UFormField
                    :label="isArticleSource ? 'Özet' : 'Kısa açıklama'"
                    :description="`${itemForm.descTr.length} / ${SHORT_DESC_MAX}`"
                  >
                    <UTextarea
                      v-model="itemForm.descTr"
                      :maxlength="SHORT_DESC_MAX"
                      :rows="5"
                      class="textarea-breathe"
                      :placeholder="isArticleSource ? 'Kartta görünen 2–3 cümlelik özet (Türkçe).' : 'Kart ve listede görünen kısa tanıtım (Türkçe).'"
                    />
                  </UFormField>
                </div>

                <div v-show="contentLang === 'en'" class="lang-fields">
                  <UFormField label="Title" required :description="`English title · ${itemForm.titleEn.length} / ${TITLE_MAX}`">
                    <UInput
                      v-model="itemForm.titleEn"
                      :maxlength="TITLE_MAX"
                      size="md"
                      placeholder="E.g. The cultural journey of the word civilization"
                    />
                  </UFormField>
                  <UFormField
                    :label="isArticleSource ? 'Excerpt' : 'Short description'"
                    :description="`${itemForm.descEn.length} / ${SHORT_DESC_MAX}`"
                  >
                    <UTextarea
                      v-model="itemForm.descEn"
                      :maxlength="SHORT_DESC_MAX"
                      :rows="5"
                      class="textarea-breathe"
                      :placeholder="isArticleSource ? '2–3 sentence excerpt for cards (English).' : 'Short blurb for listings (English).'"
                    />
                  </UFormField>
                </div>
              </UCard>

              <UCard class="cms-card cms-card-pad">
                <template #header>
                  <div class="cms-card-head">
                    <UIcon name="i-lucide-tags" class="cms-card-icon" />
                    <span>Metadata</span>
                  </div>
                </template>
                <div class="meta-grid">
                  <UFormField label="Kategori" description="Örn. Araştırma, Teknoloji, Felsefe">
                    <UInput v-model="itemForm.category" placeholder="Örn. Dijital kültür" size="md" />
                  </UFormField>
                  <UFormField label="Etiketler" description="Enter ile ekleyin; chip üzerinden kaldırın.">
                    <AdminTagInput v-model="itemForm.tags" placeholder="Etiket yazıp Enter" />
                  </UFormField>
                </div>

                <div v-if="isArticleSource" class="article-meta-grid">
                  <UFormField label="URL slug" description="Adres çubuğunda görünen kısım; küçük harf ve tire önerilir.">
                    <UInput v-model="itemForm.slug" placeholder="ornek-makale-basligi" size="md" />
                  </UFormField>
                  <UFormField label="Yayın tarihi">
                    <UInput v-model="itemForm.date" type="date" size="md" />
                  </UFormField>
                  <UFormField label="Okuma süresi (dk)">
                    <UInput v-model.number="itemForm.readMinutes" type="number" min="1" class="w-28" size="md" />
                  </UFormField>
                </div>

                <UFormField label="Dış bağlantı" description="İsteğe bağlı; kartta veya detayda kullanılabilir.">
                  <UInput v-model="itemForm.link" type="url" placeholder="https://medium.com/…" size="md" />
                </UFormField>
              </UCard>

              <UCard class="cms-card cms-card-pad">
                <template #header>
                  <div class="cms-card-head">
                    <UIcon name="i-lucide-image" class="cms-card-icon" />
                    <span>Medya</span>
                  </div>
                </template>
                <UFormField label="Kapak görseli" description="Sürükleyip bırakın veya URL girin.">
                  <ImageUpload v-model="itemForm.image" hint="Önerilen oran 16:9 · en az 1200px genişlik." />
                </UFormField>
              </UCard>

              <UCard class="cms-card cms-card--editor cms-card-pad">
                <template #header>
                  <div class="cms-card-head">
                    <UIcon name="i-lucide-file-text" class="cms-card-icon" />
                    <span>Detay içeriği</span>
                  </div>
                </template>
                <p class="cms-card-lead">
                  Proje / yazı detay sayfasında gösterilen tam metin. Araç çubuğunda tam ekran (⤢) kullanabilirsiniz.
                </p>
                <ClientOnly>
                  <RichTextEditor
                    v-model="itemForm.body"
                    placeholder="Paragraflar, alıntılar ve başlıklar ekleyin. Önizleme sağda güncellenir."
                  />
                </ClientOnly>
              </UCard>
            </div>

            <aside class="item-cms-preview" aria-label="Önizleme">
              <AdminLivePreview
                :title="previewTitle"
                :excerpt="previewExcerpt"
                :image="itemForm.image"
                :category="itemForm.category"
                :body-html="itemForm.body"
                :lang-label="previewLangLabel"
              />
            </aside>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer-bar">
          <span class="footer-hint">
            <UIcon name="i-lucide-info" class="footer-hint-icon" />
            Liste anında güncellenir. Siteye yazmak için üstteki Kaydet gerekir.
          </span>
          <div class="footer-actions">
            <UButton variant="ghost" size="md" @click="itemModalOpen = false">İptal</UButton>
            <UButton
              color="primary"
              size="md"
              :disabled="!itemForm.dizinId || !itemForm.titleTr"
              @click="saveItem"
            >
              {{ editingItem ? 'Güncelle' : 'Ekle' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onUnmounted } from 'vue'
import { usePortfolioData } from '~/composables/usePortfolioData'
import type { DigitalMindDizin, DigitalMindConfig, Project, Article } from '~/composables/usePortfolioData'
import { TITLE_MAX, SHORT_DESC_MAX } from '~/composables/useContentFieldLimits'

/* ── props ─────────────────────────────────────────────────────────────────── */
interface Props {
  portfolioData: Record<string, any>
  trContent: Record<string, any>
  enContent: Record<string, any>
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'save', tr: Record<string, any>, en: Record<string, any>, portfolio: Record<string, any>): void
}>()

const saving = ref(false)
const itemSaveFlash = ref(false)

/* Nuxt UI modal body defaults to overflow-y-auto — never override with overflow-hidden */
const itemModalUi = {
  content: 'max-w-[min(98vw,82rem)] w-full min-h-0',
  header: 'shrink-0',
  body: 'p-0 sm:p-0 flex-1 min-h-0 overflow-y-auto overscroll-contain',
  footer: 'border-t border-neutral-100 shrink-0',
}

const dizinModalUi = {
  content: 'max-w-[min(96vw,56rem)] w-full min-h-0',
  header: 'shrink-0',
  body: 'p-0 sm:p-0 flex-1 min-h-0 overflow-y-auto overscroll-contain',
  footer: 'border-t border-neutral-100 shrink-0',
}

const contentLang = ref<'tr' | 'en'>('tr')

const previewTitle = computed(() =>
  contentLang.value === 'tr' ? itemForm.titleTr : itemForm.titleEn,
)
const previewExcerpt = computed(() =>
  contentLang.value === 'tr' ? itemForm.descTr : itemForm.descEn,
)
const previewLangLabel = computed(() =>
  contentLang.value === 'tr' ? 'Türkçe önizleme' : 'English preview',
)

/* ── static defaults (fallback when KV doesn't have digitalMind yet) ───────── */
const { digitalMind: defaultDm, projects: defaultProjects, articles: defaultArticles } = usePortfolioData()

/* ── active dizin (declared early so the portfolioData watcher can reference it) */
const activeDizin = ref<string | null>(null)

/* ── local copies ──────────────────────────────────────────────────────────── */
const localProjects = ref<Project[]>([])
const localArticles = ref<Article[]>([])
const localTrContent = ref<Record<string, any>>({})
const localEnContent = ref<Record<string, any>>({})

const localConfig = reactive<DigitalMindConfig>({
  title: defaultDm.title,
  subtitle: defaultDm.subtitle,
  tabs: JSON.parse(JSON.stringify(defaultDm.tabs)),
})

watch(
  () => props.portfolioData,
  (pd) => {
    // Use KV data if available, otherwise fall through to static defaults
    localProjects.value = JSON.parse(JSON.stringify(pd?.projects?.length ? pd.projects : defaultProjects))
    localArticles.value = JSON.parse(JSON.stringify(pd?.articles?.length ? pd.articles : defaultArticles))
    const dm = pd?.digitalMind ?? defaultDm
    localConfig.title = dm.title ?? defaultDm.title
    localConfig.subtitle = dm.subtitle ?? defaultDm.subtitle
    localConfig.tabs = JSON.parse(JSON.stringify(dm.tabs?.length ? dm.tabs : defaultDm.tabs))
    // set the first dizin active if none selected
    if (!activeDizin.value && localConfig.tabs.length) {
      activeDizin.value = localConfig.tabs[0].id
    }
  },
  { immediate: true, deep: true }
)

watch(() => props.trContent, (v) => { localTrContent.value = JSON.parse(JSON.stringify(v)) }, { immediate: true })
watch(() => props.enContent,  (v) => { localEnContent.value = JSON.parse(JSON.stringify(v)) }, { immediate: true })

function handleSave() {
  emit('save', localTrContent.value, localEnContent.value, {
    ...props.portfolioData,
    projects: localProjects.value,
    articles: localArticles.value,
    digitalMind: { title: localConfig.title, subtitle: localConfig.subtitle, tabs: localConfig.tabs },
  })
}

/* ── dizin modal ───────────────────────────────────────────────────────────── */
const dizinModalOpen = ref(false)
const editingDizin = ref<DigitalMindDizin | null>(null)
const editingDizinIdx = ref(-1)

const dizinForm = reactive({
  label: '',
  icon: 'i-lucide-folder',
  source: 'projects',
  filterType: '',
})

const sourceOptions = [
  { label: 'projects  (araştırma, yazı, video…)', value: 'projects' },
  { label: 'articles  (düşünce, analiz…)', value: 'articles' },
]

/** Kaç öğe bu dizin kuralına uyar (önizleme sayacı) */
const dizinPreviewCount = computed(() => {
  const pool = dizinForm.source === 'projects' ? localProjects.value : localArticles.value
  const ft = dizinForm.filterType.trim()
  if (!ft) return 0
  return pool.filter((x: any) => x.type === ft).length
})

function openDizinModal(tab?: DigitalMindDizin) {
  editingDizin.value = tab ?? null
  editingDizinIdx.value = tab ? localConfig.tabs.findIndex(t => t.id === tab.id) : -1
  if (tab) {
    dizinForm.label = tab.label
    dizinForm.icon = tab.icon
    dizinForm.source = tab.source
    dizinForm.filterType = tab.filterType
  } else {
    dizinForm.label = ''
    dizinForm.icon = 'i-lucide-folder'
    dizinForm.source = 'projects'
    dizinForm.filterType = ''
  }
  dizinModalOpen.value = true
}

function saveDizin() {
  if (!dizinForm.label.trim() || !dizinForm.filterType.trim()) return
  const entry: DigitalMindDizin = {
    id: editingDizin.value?.id ?? `dizin-${Date.now()}`,
    label: dizinForm.label.trim(),
    icon: dizinForm.icon.trim() || 'i-lucide-folder',
    source: dizinForm.source as 'projects' | 'articles',
    filterType: dizinForm.filterType.trim(),
  }
  if (editingDizinIdx.value >= 0) {
    localConfig.tabs[editingDizinIdx.value] = entry
  } else {
    localConfig.tabs.push(entry)
    if (!activeDizin.value) activeDizin.value = entry.id
  }
  dizinModalOpen.value = false
}

function deleteDizin(idx: number) {
  const removed = localConfig.tabs[idx]
  localConfig.tabs.splice(idx, 1)
  if (activeDizin.value === removed.id) activeDizin.value = localConfig.tabs[0]?.id ?? null
}

/* ── content filter ────────────────────────────────────────────────────────── */
watch(() => localConfig.tabs, (tabs) => {
  if (tabs.length && !activeDizin.value) activeDizin.value = tabs[0].id
}, { immediate: true })

const activeDizinTab = computed(() => localConfig.tabs.find(t => t.id === activeDizin.value))

const currentItems = computed<(Project | Article)[]>(() => {
  const cfg = activeDizinTab.value
  if (!cfg) return []
  const pool = cfg.source === 'projects' ? localProjects.value : localArticles.value
  return pool.filter((x: any) => x.type === cfg.filterType)
})

function getItemCount(tab: DigitalMindDizin) {
  const pool = tab.source === 'projects' ? localProjects.value : localArticles.value
  return pool.filter((x: any) => x.type === tab.filterType).length
}

/* ── item modal ────────────────────────────────────────────────────────────── */
const itemModalOpen = ref(false)
const editingItem = ref<any>(null)

/* ── body scroll lock: prevent page scroll while any modal is open ─────────── */
function setBodyScroll(locked: boolean) {
  if (typeof document === 'undefined') return
  const scrollY = locked ? window.scrollY : 0
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  document.body.style.overflow = locked ? 'hidden' : ''
  if (locked) {
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
  } else {
    const top = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, parseInt(top || '0') * -1)
  }
}
watch([dizinModalOpen, itemModalOpen], ([d, i]) => setBodyScroll(d || i))
onUnmounted(() => setBodyScroll(false))

const itemForm = reactive({
  dizinId: '',
  titleTr: '',
  titleEn: '',
  descTr: '',
  descEn: '',
  category: '',
  tags: [] as string[],
  slug: '',
  date: '',
  readMinutes: 5,
  link: '',
  image: '',
  body: '',
})

const dizinSelectItems = computed(() =>
  localConfig.tabs.map(t => ({ label: t.label, value: t.id }))
)

const isArticleSource = computed(() => {
  const dizin = localConfig.tabs.find(t => t.id === itemForm.dizinId)
  return dizin?.source === 'articles'
})

function getTitle(item: any): string {
  if (!item?.titleKey) return ''
  const parts = item.titleKey.split('.')
  let node: any = localTrContent.value
  for (const p of parts) { node = node?.[p] }
  return typeof node === 'string' ? node : item.titleKey
}

function resolveContent(obj: Record<string, any>, dotKey: string): string {
  if (!dotKey) return ''
  const parts = dotKey.split('.')
  let node: any = obj
  for (const p of parts) { node = node?.[p] }
  return typeof node === 'string' ? node : ''
}

function openItemModal(item: any, dizinId?: string | null) {
  editingItem.value = item ?? null
  contentLang.value = 'tr'
  if (item) {
    const dizin = localConfig.tabs.find(t => {
      const pool = t.source === 'projects' ? localProjects.value : localArticles.value
      return pool.some((x: any) => x.id === item.id)
    })
    itemForm.dizinId = dizin?.id ?? localConfig.tabs[0]?.id ?? ''
    itemForm.titleTr = resolveContent(localTrContent.value, item.titleKey)
    itemForm.titleEn = resolveContent(localEnContent.value, item.titleKey)
    const descKey = item.descriptionKey || item.excerptKey || ''
    itemForm.descTr = resolveContent(localTrContent.value, descKey)
    itemForm.descEn = resolveContent(localEnContent.value, descKey)
    itemForm.category = item.category ?? ''
    itemForm.tags = Array.isArray(item.tags) ? [...item.tags] : []
    itemForm.slug = item.slug ?? ''
    itemForm.date = item.date ?? ''
    itemForm.readMinutes = item.readMinutes ?? 5
    itemForm.link = item.link ?? ''
    itemForm.image = item.image ?? ''
    itemForm.body = item.body ?? ''
  } else {
    itemForm.dizinId = dizinId ?? localConfig.tabs[0]?.id ?? ''
    itemForm.titleTr = ''
    itemForm.titleEn = ''
    itemForm.descTr = ''
    itemForm.descEn = ''
    itemForm.category = ''
    itemForm.tags = []
    itemForm.slug = ''
    itemForm.date = new Date().toISOString().slice(0, 10)
    itemForm.readMinutes = 5
    itemForm.link = ''
    itemForm.image = ''
    itemForm.body = ''
  }
  itemModalOpen.value = true
}

function deepSet(obj: Record<string, any>, dotKey: string, value: string) {
  const parts = dotKey.split('.')
  let cur: any = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

function saveItem() {
  if (!itemForm.dizinId || !itemForm.titleTr) return
  const dizin = localConfig.tabs.find(t => t.id === itemForm.dizinId)
  if (!dizin) return

  const isArticle = dizin.source === 'articles'
  const baseId = editingItem.value?.id ?? `item-${Date.now()}`
  const titleKey = isArticle ? `articles.${baseId}.title` : `projects.${baseId}.title`
  const descKey = isArticle ? `articles.${baseId}.excerpt` : `projects.${baseId}.description`

  // update local content maps
  deepSet(localTrContent.value, titleKey, itemForm.titleTr)
  deepSet(localTrContent.value, descKey, itemForm.descTr)
  deepSet(localEnContent.value, titleKey, itemForm.titleEn)
  deepSet(localEnContent.value, descKey, itemForm.descEn)

  if (isArticle) {
    const entry: any = {
      id: baseId,
      titleKey,
      excerptKey: descKey,
      category: itemForm.category,
      tags: [...itemForm.tags],
      type: dizin.filterType,
      date: itemForm.date || new Date().toISOString().slice(0, 10),
      readMinutes: Number(itemForm.readMinutes) || 5,
      slug: itemForm.slug || baseId,
      ...(itemForm.image ? { image: itemForm.image } : {}),
      ...(itemForm.link ? { link: itemForm.link } : {}),
      ...(itemForm.body ? { body: itemForm.body } : {}),
    }
    const idx = localArticles.value.findIndex((a: any) => a.id === baseId)
    if (idx >= 0) localArticles.value[idx] = entry
    else localArticles.value.push(entry)
  } else {
    const entry: any = {
      id: baseId,
      titleKey,
      descriptionKey: descKey,
      category: itemForm.category,
      tags: [...itemForm.tags],
      type: dizin.filterType,
      ...(itemForm.image ? { image: itemForm.image } : {}),
      ...(itemForm.link ? { link: itemForm.link } : {}),
      ...(itemForm.body ? { body: itemForm.body } : {}),
    }
    const idx = localProjects.value.findIndex((p: any) => p.id === baseId)
    if (idx >= 0) localProjects.value[idx] = entry
    else localProjects.value.push(entry)
  }

  itemModalOpen.value = false
  itemSaveFlash.value = true
  setTimeout(() => {
    itemSaveFlash.value = false
  }, 5200)
}

function deleteItem(item: any) {
  localProjects.value = localProjects.value.filter((p: any) => p.id !== item.id)
  localArticles.value = localArticles.value.filter((a: any) => a.id !== item.id)
}
</script>

<style scoped>
.dm-tab {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── header ── */
.tab-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.tab-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}
.tab-subtitle {
  font-size: 0.825rem;
  color: #6b7280;
  margin-top: 0.15rem;
}

/* ── card box ── */
.card-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.card-title-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

/* ── app config ── */
.config-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

/* ── dizin list ── */
.dizin-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dizin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.875rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: background 0.15s;
}
.dizin-row:hover { background: #f0f9ff; }

.dizin-row-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.dizin-icon { width: 1rem; height: 1rem; color: #4b5563; }
.dizin-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  font-family: 'Courier New', monospace;
}
.dizin-row-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s;
}
.dizin-row:hover .dizin-row-actions { opacity: 1; }

/* ── content section ── */
.dizin-filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.875rem;
}
.dizin-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 0.78rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}
.dizin-filter-btn:hover { background: #e5e7eb; }
.dizin-filter-btn.active { background: #111827; color: #fff; border-color: #111827; }
.btn-icon { width: 0.85rem; height: 0.85rem; }
.item-count {
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  padding: 0 0.4rem;
  font-size: 0.7rem;
}
.dizin-filter-btn.active .item-count { background: rgba(255,255,255,0.15); }
.dizin-filter-btn:not(.active) .item-count { background: #e5e7eb; color: #374151; }

.content-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.content-item-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.875rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: background 0.15s;
}
.content-item-row:hover { background: #f0fdf4; }
.item-thumb {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.item-thumb-placeholder {
  width: 3rem;
  height: 3rem;
  background: #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #9ca3af;
}
.item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
.item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-meta {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s;
}
.content-item-row:hover .item-actions { opacity: 1; }

.empty-note {
  padding: 1.5rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
}

/* ── modals & CMS shell ── */
.dm-flash {
  animation: dmFlashIn 0.35s ease;
}

@keyframes dmFlashIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dizin-cms-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 300px);
  gap: 1.25rem;
  align-items: start;
  padding: 1rem 1rem 1.25rem;
}

@media (max-width: 900px) {
  .dizin-cms-grid {
    grid-template-columns: 1fr;
  }

  .dizin-cms-preview {
    order: -1;
    position: relative;
    top: auto;
  }
}

.dizin-cms-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.dizin-field-stack {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.inline-code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.8em;
  background: #f1f5f9;
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
  color: #0f172a;
}

.dizin-cms-preview {
  position: sticky;
  top: 0;
}

.dizin-preview-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(165deg, #fafafa 0%, #fff 45%);
  padding: 1rem 1.1rem 1.2rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.dizin-preview-head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.35rem;
}

.dizin-preview-head-ic {
  width: 1rem;
  height: 1rem;
  color: #7c3aed;
}

.dizin-preview-sub {
  font-size: 0.72rem;
  color: #64748b;
  line-height: 1.45;
  margin: 0 0 0.85rem;
}

.dizin-preview-strip {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

.dizin-preview-tab {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.45rem 0.65rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f9fafb;
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  font-family: inherit;
  text-align: left;
}

.dizin-preview-tab--active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.dizin-preview-tab--active :deep(.item-count) {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.dizin-preview-tab-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}

.dizin-preview-tab-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dizin-preview-dl {
  margin: 0;
  font-size: 0.75rem;
}

.dizin-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.4rem 0;
  border-top: 1px dashed #e2e8f0;
}

.dizin-preview-row:first-of-type {
  border-top: none;
  padding-top: 0;
}

.dizin-preview-dl dt {
  color: #64748b;
  font-weight: 500;
}

.dizin-preview-dl dd {
  margin: 0;
  color: #0f172a;
  text-align: right;
}

.modal-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #64748b;
  max-width: 26rem;
  line-height: 1.35;
}

.footer-hint-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
  color: #94a3b8;
}

.footer-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.item-cms-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 1.25rem;
  align-items: start;
  padding: 1rem 1rem 1.25rem;
}

@media (max-width: 1024px) {
  .item-cms-grid {
    grid-template-columns: 1fr;
  }
  .item-cms-preview {
    position: relative;
    top: auto;
    order: -1;
  }
}

.item-cms-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.item-cms-preview {
  position: sticky;
  top: 0;
}

.cms-card-pad :deep(> div:last-of-type) {
  padding: 1rem 1.25rem;
}

@media (min-width: 640px) {
  .cms-card-pad :deep(> div:last-of-type) {
    padding: 1.25rem 1.35rem;
  }
}

.cms-card {
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.cms-card:hover {
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
}

.cms-card--editor {
  border-color: #e9d5ff;
}

.cms-card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.cms-card-icon {
  width: 1rem;
  height: 1rem;
  color: #7c3aed;
}

.cms-card-lead {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 0.75rem;
  line-height: 1.45;
}

.lang-switch {
  display: inline-flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.25rem;
  background: #f1f5f9;
  border-radius: 10px;
}

.lang-switch-btn {
  border-radius: 8px !important;
  transition: transform 0.15s ease;
}

.lang-switch-btn:hover {
  transform: translateY(-1px);
}

.lang-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .meta-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.article-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e2e8f0;
}

.textarea-breathe {
  font-size: 0.9rem !important;
  line-height: 1.6 !important;
  min-height: 7rem;
}

.hint-link {
  color: #6366f1;
  font-size: 0.75rem;
  text-decoration: underline;
}
</style>

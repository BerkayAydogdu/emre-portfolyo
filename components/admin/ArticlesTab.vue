<template>
  <div class="tab-section">
    <div class="section-header">
      <div>
        <h2 class="section-title">Yazılar</h2>
        <p class="section-lead">Blog / düşünce yazıları; slug ve tarih dahil.</p>
      </div>
      <div class="header-actions">
        <UButton variant="soft" @click="addArticle">+ Yeni yazı</UButton>
        <UButton color="primary" :loading="saving" @click="save">Kaydet</UButton>
      </div>
    </div>

    <div v-if="localArticles.length === 0" class="empty-state">
      <UIcon name="i-lucide-newspaper" class="empty-icon" />
      <p>Henüz yazı yok. <strong>Yeni yazı</strong> ile ekleyin.</p>
    </div>

    <div v-for="(art, i) in localArticles" :key="art.id" class="article-shell">
      <div class="article-toolbar">
        <div class="toolbar-left">
          <UBadge :color="art.type === 'analiz' ? 'info' : 'secondary'" size="sm">
            {{ art.type === 'analiz' ? 'Analiz' : 'Düşünce' }}
          </UBadge>
          <code class="art-id">id: {{ art.id }}</code>
        </div>
        <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="removeArticle(i)">
          Sil
        </UButton>
      </div>

      <div class="article-cms-grid">
        <div class="article-main">
          <UCard class="cms-block cms-block-pad">
            <template #header>
              <div class="block-head">
                <UIcon name="i-lucide-link" class="block-icon" />
                <span>Kimlik & URL</span>
              </div>
            </template>
            <div class="meta-grid">
              <UFormField label="İç ID" description="Veri anahtarı; değiştirmek dikkat ister.">
                <UInput v-model="art.id" placeholder="yazi-ornek" size="md" />
              </UFormField>
              <UFormField label="Slug (adres)" description="yazi/{slug} yolunda görünür.">
                <UInput v-model="art.slug" placeholder="dijital-golge-bizi-takip-eden-veriler" size="md" />
              </UFormField>
              <UFormField label="Kategori">
                <UInput v-model="art.category" placeholder="Örn. Teknoloji" size="md" />
              </UFormField>
              <UFormField label="Tür">
                <USelect v-model="art.type" :items="typeItems" size="md" />
              </UFormField>
              <UFormField label="Yayın tarihi">
                <UInput v-model="art.date" type="date" size="md" />
              </UFormField>
              <UFormField label="Okuma (dk)">
                <UInput v-model.number="art.readMinutes" type="number" min="1" class="w-24" size="md" />
              </UFormField>
            </div>
          </UCard>

          <UCard class="cms-block cms-block-pad">
            <template #header>
              <div class="block-head">
                <UIcon name="i-lucide-image" class="block-icon" />
                <span>Medya</span>
              </div>
            </template>
            <UFormField label="Kapak görseli">
              <ImageUpload v-model="art.image" hint="Kart ve detay sayfası için." />
            </UFormField>
          </UCard>

          <UCard class="cms-block cms-block-pad">
            <template #header>
              <div class="block-head">
                <UIcon name="i-lucide-languages" class="block-icon" />
                <span>Başlık & özet</span>
              </div>
            </template>
            <p class="block-lead">Liste ve kart görünümü için başlık ile kısa özet.</p>
            <div class="lang-switch" role="tablist">
              <UButton
                size="sm"
                :color="langFor(art.id) === 'tr' ? 'primary' : 'neutral'"
                :variant="langFor(art.id) === 'tr' ? 'solid' : 'outline'"
                class="lang-btn"
                @click="setLang(art.id, 'tr')"
              >
                TR 🇹🇷
              </UButton>
              <UButton
                size="sm"
                :color="langFor(art.id) === 'en' ? 'primary' : 'neutral'"
                :variant="langFor(art.id) === 'en' ? 'solid' : 'outline'"
                class="lang-btn"
                @click="setLang(art.id, 'en')"
              >
                EN 🇬🇧
              </UButton>
            </div>

            <div v-show="langFor(art.id) === 'tr'" class="lang-fields">
              <UFormField label="Başlık" :description="`${art.trTitle.length} / ${TITLE_MAX}`">
                <UInput
                  v-model="art.trTitle"
                  :maxlength="TITLE_MAX"
                  placeholder="Örn. Dijital gölge: bizi takip eden veriler"
                  size="md"
                />
              </UFormField>
              <UFormField label="Özet" :description="`${art.trExcerpt.length} / ${EXCERPT_MAX}`">
                <UTextarea
                  v-model="art.trExcerpt"
                  :maxlength="EXCERPT_MAX"
                  :rows="5"
                  class="textarea-breathe"
                  placeholder="Kartta görünen kısa özet; 2–4 cümle."
                />
              </UFormField>
            </div>

            <div v-show="langFor(art.id) === 'en'" class="lang-fields">
              <UFormField label="Title" :description="`${art.enTitle.length} / ${TITLE_MAX}`">
                <UInput
                  v-model="art.enTitle"
                  :maxlength="TITLE_MAX"
                  placeholder="E.g. Digital shadow: the data that follows us"
                  size="md"
                />
              </UFormField>
              <UFormField label="Excerpt" :description="`${art.enExcerpt.length} / ${EXCERPT_MAX}`">
                <UTextarea
                  v-model="art.enExcerpt"
                  :maxlength="EXCERPT_MAX"
                  :rows="5"
                  class="textarea-breathe"
                  placeholder="Short excerpt for cards (English)."
                />
              </UFormField>
            </div>
          </UCard>
        </div>

        <aside class="article-preview" aria-label="Önizleme">
          <AdminLivePreview
            :title="langFor(art.id) === 'tr' ? art.trTitle : art.enTitle"
            :excerpt="langFor(art.id) === 'tr' ? art.trExcerpt : art.enExcerpt"
            :image="art.image"
            :category="art.category"
            :lang-label="langFor(art.id) === 'tr' ? 'TR önizleme' : 'EN preview'"
          />
        </aside>
      </div>
    </div>

    <Transition name="fade">
      <UAlert
        v-if="saved"
        icon="i-lucide-check-circle"
        color="success"
        variant="subtle"
        title="Kaydedildi"
        class="save-toast"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Article } from '~/composables/usePortfolioData'
import { TITLE_MAX, EXCERPT_MAX } from '~/composables/useContentFieldLimits'

const props = defineProps<{
  trContent: Record<string, any>
  enContent: Record<string, any>
  portfolioData: Record<string, any>
}>()
const emit = defineEmits<{
  (e: 'save', tr: Record<string, any>, en: Record<string, any>, portfolio: Record<string, any>): void
}>()

const saving = ref(false)
const saved = ref(false)

const typeItems = [
  { label: 'Düşünce', value: 'dusunce' },
  { label: 'Analiz', value: 'analiz' },
]

interface LocalArticle extends Article {
  trTitle: string
  enTitle: string
  trExcerpt: string
  enExcerpt: string
}

const localArticles = ref<LocalArticle[]>([])
const articleLang = reactive<Record<string, 'tr' | 'en'>>({})

function langFor(id: string): 'tr' | 'en' {
  return articleLang[id] ?? 'tr'
}

function setLang(id: string, lang: 'tr' | 'en') {
  articleLang[id] = lang
}

function buildLocalArticle(a: Article): LocalArticle {
  const idKey = a.id
  const trTitle = props.trContent?.articles?.[idKey]?.title ?? ''
  const enTitle = props.enContent?.articles?.[idKey]?.title ?? ''
  const trExcerpt = props.trContent?.articles?.[idKey]?.excerpt ?? ''
  const enExcerpt = props.enContent?.articles?.[idKey]?.excerpt ?? ''
  return { ...a, trTitle, enTitle, trExcerpt, enExcerpt }
}

function initFromProps() {
  const articles: Article[] = props.portfolioData?.articles ?? []
  localArticles.value = articles.map(buildLocalArticle)
  for (const a of localArticles.value) {
    if (articleLang[a.id] === undefined) articleLang[a.id] = 'tr'
  }
}

watch([() => props.trContent, () => props.enContent, () => props.portfolioData], initFromProps, { immediate: true })

function addArticle() {
  const id = `yazi-${Date.now()}`
  articleLang[id] = 'tr'
  localArticles.value.push({
    id,
    titleKey: `articles.${id}.title`,
    excerptKey: `articles.${id}.excerpt`,
    category: '',
    date: new Date().toISOString().split('T')[0]!,
    readMinutes: 5,
    slug: id,
    type: 'dusunce',
    image: '',
    trTitle: '',
    enTitle: '',
    trExcerpt: '',
    enExcerpt: '',
  })
}

function removeArticle(i: number) {
  localArticles.value.splice(i, 1)
}

async function save() {
  saving.value = true
  saved.value = false

  const portfolioArticles: Article[] = localArticles.value.map(a => ({
    id: a.id,
    titleKey: `articles.${a.id}.title`,
    excerptKey: `articles.${a.id}.excerpt`,
    category: a.category,
    date: a.date,
    readMinutes: a.readMinutes,
    slug: a.slug,
    type: a.type,
    image: a.image ?? '',
  }))

  const trArticlesPatch: Record<string, any> = {}
  const enArticlesPatch: Record<string, any> = {}
  localArticles.value.forEach(a => {
    trArticlesPatch[a.id] = { title: a.trTitle, excerpt: a.trExcerpt }
    enArticlesPatch[a.id] = { title: a.enTitle, excerpt: a.enExcerpt }
  })

  const trPatch = { articles: { ...props.trContent?.articles, ...trArticlesPatch } }
  const enPatch = { articles: { ...props.enContent?.articles, ...enArticlesPatch } }
  const portfolioPatch = { ...props.portfolioData, articles: portfolioArticles }

  emit('save', trPatch, enPatch, portfolioPatch)
  await nextTick()
  saving.value = false
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 3500)
}
</script>

<style scoped>
.tab-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.section-lead {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #64748b;
  background: linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  border: 2px dashed #cbd5e1;
  font-size: 0.9rem;
}

.empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto 0.75rem;
  color: #94a3b8;
}

.article-shell {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.article-shell:hover {
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
}

.article-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.art-id {
  font-size: 0.7rem;
  color: #64748b;
  background: #e2e8f0;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.article-cms-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  gap: 1.25rem;
  padding: 1.25rem;
  align-items: start;
}

@media (max-width: 1100px) {
  .article-cms-grid {
    grid-template-columns: 1fr;
  }
  .article-preview {
    order: -1;
    position: relative;
    top: auto;
  }
}

.article-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.article-preview {
  position: sticky;
  top: 0.5rem;
}

.cms-block {
  border-color: #e2e8f0;
}

.cms-block-pad :deep(> div:last-of-type) {
  padding: 1rem 1.25rem;
}

@media (min-width: 640px) {
  .cms-block-pad :deep(> div:last-of-type) {
    padding: 1.25rem 1.35rem;
  }
}

.block-head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
}

.block-icon {
  width: 0.95rem;
  height: 0.95rem;
  color: #7c3aed;
}

.block-lead {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 0.75rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.lang-switch {
  display: inline-flex;
  gap: 0.45rem;
  margin-bottom: 1rem;
  padding: 0.25rem;
  background: #f1f5f9;
  border-radius: 10px;
}

.lang-btn {
  border-radius: 8px !important;
}

.lang-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.textarea-breathe {
  font-size: 0.9rem !important;
  line-height: 1.6 !important;
}

.w-24 {
  width: 6rem;
}

.save-toast {
  position: sticky;
  bottom: 0;
  z-index: 5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

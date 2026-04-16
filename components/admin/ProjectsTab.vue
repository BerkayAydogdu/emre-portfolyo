<template>
  <div class="tab-section">
    <div class="section-header">
      <div>
        <h2 class="section-title">Projeler</h2>
        <p class="section-lead">Her kart bir projedir. Düzenleyip sekmeyi kaydedin.</p>
      </div>
      <div class="header-actions">
        <UButton variant="soft" @click="addProject">+ Yeni proje</UButton>
        <UButton color="primary" :loading="saving" @click="save">Kaydet</UButton>
      </div>
    </div>

    <div v-if="localProjects.length === 0" class="empty-state">
      <UIcon name="i-lucide-folder-open" class="empty-icon" />
      <p>Henüz proje yok. <strong>Yeni proje</strong> ile ekleyin.</p>
    </div>

    <div v-for="(proj, i) in localProjects" :key="proj.id" class="project-shell">
      <div class="project-toolbar">
        <div class="toolbar-left">
          <UBadge :color="proj.type === 'arastirma' ? 'info' : 'secondary'" size="sm">
            {{ proj.type === 'arastirma' ? 'Araştırma' : 'Yazı' }}
          </UBadge>
          <code class="proj-id">id: {{ proj.id }}</code>
        </div>
        <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="removeProject(i)">
          Sil
        </UButton>
      </div>

      <div class="project-cms-grid">
        <div class="project-main">
          <UCard class="cms-block cms-block-pad">
            <template #header>
              <div class="block-head">
                <UIcon name="i-lucide-sliders-horizontal" class="block-icon" />
                <span>Kimlik & sınıflandırma</span>
              </div>
            </template>
            <div class="meta-grid">
              <UFormField
                label="ID (slug)"
                description="URL ve çeviri anahtarları için; küçük harf, tire. projects.{id} anahtarlarıyla eşleşir."
              >
                <UInput v-model="proj.id" placeholder="medeniyet" size="md" @change="syncKeys(proj)" />
              </UFormField>
              <UFormField label="Kategori" description="Kart üzerinde rozet olarak görünür.">
                <UInput v-model="proj.category" placeholder="Örn. Araştırma" size="md" />
              </UFormField>
              <UFormField label="Tür" description="Dijital Mind dizin filtresiyle eşleşir.">
                <USelect v-model="proj.type" :items="typeItems" size="md" />
              </UFormField>
            </div>
          </UCard>

          <UCard class="cms-block cms-block-pad">
            <template #header>
              <div class="block-head">
                <UIcon name="i-lucide-tags" class="block-icon" />
                <span>Etiketler</span>
              </div>
            </template>
            <UFormField label="Konu etiketleri" description="Enter ile ekleyin; virgül gerekmez.">
              <AdminTagInput v-model="proj.tags" placeholder="Örn. Antropoloji — Enter" />
            </UFormField>
          </UCard>

          <UCard class="cms-block cms-block-pad">
            <template #header>
              <div class="block-head">
                <UIcon name="i-lucide-image" class="block-icon" />
                <span>Medya</span>
              </div>
            </template>
            <UFormField label="Kapak görseli" description="Liste ve detay kartlarında kullanılır.">
              <ImageUpload v-model="proj.image" hint="Sürükleyip bırakın veya URL yapıştırın." />
            </UFormField>
          </UCard>

          <UCard class="cms-block cms-block-pad">
            <template #header>
              <div class="block-head">
                <UIcon name="i-lucide-languages" class="block-icon" />
                <span>Metinler</span>
              </div>
            </template>
            <p class="block-lead">Başlık ve açıklamayı her dil için ayrı girin.</p>
            <div class="lang-switch" role="tablist">
              <UButton
                size="sm"
                :color="langFor(proj.id) === 'tr' ? 'primary' : 'neutral'"
                :variant="langFor(proj.id) === 'tr' ? 'solid' : 'outline'"
                class="lang-btn"
                @click="setLang(proj.id, 'tr')"
              >
                TR 🇹🇷
              </UButton>
              <UButton
                size="sm"
                :color="langFor(proj.id) === 'en' ? 'primary' : 'neutral'"
                :variant="langFor(proj.id) === 'en' ? 'solid' : 'outline'"
                class="lang-btn"
                @click="setLang(proj.id, 'en')"
              >
                EN 🇬🇧
              </UButton>
            </div>

            <div v-show="langFor(proj.id) === 'tr'" class="lang-fields">
              <UFormField
                label="Başlık"
                :description="`${proj.trTitle.length} / ${TITLE_MAX}`"
              >
                <UInput
                  v-model="proj.trTitle"
                  :maxlength="TITLE_MAX"
                  placeholder="Örn. Medeniyet kelimesinin kültürel yolculuğu"
                  size="md"
                />
              </UFormField>
              <UFormField
                label="Açıklama"
                :description="`${proj.trDesc.length} / ${SHORT_DESC_MAX}`"
              >
                <UTextarea
                  v-model="proj.trDesc"
                  :maxlength="SHORT_DESC_MAX"
                  :rows="5"
                  class="textarea-breathe"
                  placeholder="Projeyi tek paragrafta özetleyin; liste ve önizlemede görünür."
                />
              </UFormField>
            </div>

            <div v-show="langFor(proj.id) === 'en'" class="lang-fields">
              <UFormField
                label="Title"
                :description="`${proj.enTitle.length} / ${TITLE_MAX}`"
              >
                <UInput
                  v-model="proj.enTitle"
                  :maxlength="TITLE_MAX"
                  placeholder="E.g. The cultural journey of the word civilization"
                  size="md"
                />
              </UFormField>
              <UFormField
                label="Description"
                :description="`${proj.enDesc.length} / ${SHORT_DESC_MAX}`"
              >
                <UTextarea
                  v-model="proj.enDesc"
                  :maxlength="SHORT_DESC_MAX"
                  :rows="5"
                  class="textarea-breathe"
                  placeholder="One short paragraph for listings and previews (English)."
                />
              </UFormField>
            </div>
          </UCard>
        </div>

        <aside class="project-preview" aria-label="Önizleme">
          <AdminLivePreview
            :title="langFor(proj.id) === 'tr' ? proj.trTitle : proj.enTitle"
            :excerpt="langFor(proj.id) === 'tr' ? proj.trDesc : proj.enDesc"
            :image="proj.image"
            :category="proj.category"
            :lang-label="langFor(proj.id) === 'tr' ? 'TR önizleme' : 'EN preview'"
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
        description="Değişiklikler bu sekme için saklandı."
        class="save-toast"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/composables/usePortfolioData'
import { TITLE_MAX, SHORT_DESC_MAX } from '~/composables/useContentFieldLimits'

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
  { label: 'Araştırma', value: 'arastirma' },
  { label: 'Yazı', value: 'yazi' },
]

interface LocalProject extends Project {
  trTitle: string
  enTitle: string
  trDesc: string
  enDesc: string
}

const localProjects = ref<LocalProject[]>([])
const projectLang = reactive<Record<string, 'tr' | 'en'>>({})

function langFor(id: string): 'tr' | 'en' {
  return projectLang[id] ?? 'tr'
}

function setLang(id: string, lang: 'tr' | 'en') {
  projectLang[id] = lang
}

function syncKeys(proj: LocalProject) {
  proj.titleKey = `projects.${proj.id}.title`
  proj.descriptionKey = `projects.${proj.id}.description`
}

function buildLocalProject(p: Project): LocalProject {
  const idKey = p.id
  const trTitle = props.trContent?.projects?.[idKey]?.title ?? ''
  const enTitle = props.enContent?.projects?.[idKey]?.title ?? ''
  const trDesc = props.trContent?.projects?.[idKey]?.description ?? ''
  const enDesc = props.enContent?.projects?.[idKey]?.description ?? ''
  return { ...p, trTitle, enTitle, trDesc, enDesc }
}

function initFromProps() {
  const projects: Project[] = props.portfolioData?.projects ?? []
  localProjects.value = projects.map(buildLocalProject)
  for (const p of localProjects.value) {
    if (projectLang[p.id] === undefined) projectLang[p.id] = 'tr'
  }
}

watch([() => props.trContent, () => props.enContent, () => props.portfolioData], initFromProps, { immediate: true })

function addProject() {
  const id = `proje-${Date.now()}`
  projectLang[id] = 'tr'
  localProjects.value.push({
    id,
    titleKey: `projects.${id}.title`,
    descriptionKey: `projects.${id}.description`,
    category: '',
    tags: [],
    type: 'arastirma',
    image: '',
    trTitle: '',
    enTitle: '',
    trDesc: '',
    enDesc: '',
  })
}

function removeProject(i: number) {
  localProjects.value.splice(i, 1)
}

async function save() {
  saving.value = true
  saved.value = false

  const portfolioProjects: Project[] = localProjects.value.map(p => ({
    id: p.id,
    titleKey: `projects.${p.id}.title`,
    descriptionKey: `projects.${p.id}.description`,
    category: p.category,
    tags: p.tags,
    type: p.type,
    image: p.image ?? '',
  }))

  const trProjectsPatch: Record<string, any> = { ...props.trContent?.projects }
  const enProjectsPatch: Record<string, any> = { ...props.enContent?.projects }
  localProjects.value.forEach(p => {
    trProjectsPatch[p.id] = { title: p.trTitle, description: p.trDesc }
    enProjectsPatch[p.id] = { title: p.enTitle, description: p.enDesc }
  })

  const trPatch = { projects: { ...props.trContent?.projects, ...trProjectsPatch } }
  const enPatch = { projects: { ...props.enContent?.projects, ...enProjectsPatch } }
  const portfolioPatch = { ...props.portfolioData, projects: portfolioProjects }

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

.project-shell {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  transition: box-shadow 0.2s ease;
}

.project-shell:hover {
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
}

.project-toolbar {
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

.proj-id {
  font-size: 0.7rem;
  color: #64748b;
  background: #e2e8f0;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.project-cms-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  gap: 1.25rem;
  padding: 1.25rem;
  align-items: start;
}

@media (max-width: 1100px) {
  .project-cms-grid {
    grid-template-columns: 1fr;
  }
  .project-preview {
    position: relative;
    top: auto;
    order: -1;
  }
}

.project-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.project-preview {
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

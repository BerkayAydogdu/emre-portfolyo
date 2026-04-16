<template>
  <div class="cms-tab">

    <!-- ── Tab header ── -->
    <div class="tab-head">
      <div class="tab-head-icon">
        <UIcon name="i-lucide-user-round" />
      </div>
      <div>
        <h2 class="tab-head-title">Hakkımda Bölümü</h2>
        <p class="tab-head-desc">Profil fotoğrafı, biyografi ve uzmanlık alanlarını yönetin.</p>
      </div>
    </div>

    <!-- ── Top bar ── -->
    <div class="top-bar">
      <div class="lang-switch">
        <button :class="['lang-btn', lang === 'tr' && 'lang-btn--on']" @click="lang = 'tr'">🇹🇷 Türkçe</button>
        <button :class="['lang-btn', lang === 'en' && 'lang-btn--on']" @click="lang = 'en'">🇬🇧 English</button>
      </div>
      <Transition name="fade">
        <div v-if="isDirty" class="unsaved-badge">
          <span class="unsaved-dot" />
          Kaydedilmemiş değişiklikler
        </div>
      </Transition>
    </div>

    <!-- ── CARD: Profil Fotoğrafı ── -->
    <div class="cms-card">
      <button class="cms-card-hd" @click="sections.photo = !sections.photo">
        <div class="cms-card-hd-l">
          <div class="card-ic green"><UIcon name="i-lucide-image" /></div>
          <div>
            <span class="card-ttl">Profil Fotoğrafı</span>
            <span class="card-sub">Hakkımda bölümünde görünen fotoğraf</span>
          </div>
        </div>
        <UIcon :name="sections.photo ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="collapse-ic" />
      </button>
      <Transition name="accordion">
        <div v-show="sections.photo" class="cms-card-bd">
          <div class="cms-field">
            <ImageUpload v-model="localPhoto" @update:model-value="isDirty = true" />
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── CARD: Biyografi ── -->
    <div class="cms-card">
      <button class="cms-card-hd" @click="sections.bio = !sections.bio">
        <div class="cms-card-hd-l">
          <div class="card-ic blue"><UIcon name="i-lucide-file-text" /></div>
          <div>
            <span class="card-ttl">Biyografi</span>
            <span class="card-sub">Başlık ve üç biyografi paragrafı</span>
          </div>
        </div>
        <UIcon :name="sections.bio ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="collapse-ic" />
      </button>
      <Transition name="accordion">
        <div v-show="sections.bio" class="cms-card-bd">

          <div class="cms-field">
            <div class="field-lbl-row">
              <label class="field-lbl"><UIcon name="i-lucide-heading-2" class="field-ic" />{{ lang === 'tr' ? 'Bölüm Başlığı' : 'Section Title' }}</label>
              <span :class="['cc', charCls(bioTitle, 60)]">{{ bioTitle.length }}/60</span>
            </div>
            <p class="field-hint">{{ lang === 'tr' ? '"Hakkımda" bölümünün sol üst köşesindeki başlık.' : 'Heading shown in the top-left of the About section.' }}</p>
            <UInput :model-value="bioTitle" :placeholder="lang === 'tr' ? 'Dijitalin içinden' : 'From within the digital'" @update:model-value="setBioTitle($event)" />
          </div>

          <div v-for="n in ([1, 2, 3] as const)" :key="n" class="cms-field">
            <div class="field-lbl-row">
              <label class="field-lbl"><UIcon name="i-lucide-align-left" class="field-ic" />{{ lang === 'tr' ? `Biyografi Paragraf ${n}` : `Bio Paragraph ${n}` }}</label>
              <span :class="['cc', charCls(getBio(n), 280)]">{{ getBio(n).length }}/280</span>
            </div>
            <p class="field-hint">{{ lang === 'tr' ? `${n}. paragraf. Kendinizi anlatın.` : `Paragraph ${n}. Tell your story.` }}</p>
            <UTextarea :model-value="getBio(n)" :rows="3" :placeholder="lang === 'tr' ? 'Bu paragrafı kendinizi anlatmak için kullanın…' : 'Use this paragraph to describe yourself…'" @update:model-value="setBio(n, $event as string)" />
          </div>

        </div>
      </Transition>
    </div>

    <!-- ── CARD: İstatistikler ── -->
    <div class="cms-card">
      <button class="cms-card-hd" @click="sections.stats = !sections.stats">
        <div class="cms-card-hd-l">
          <div class="card-ic amber"><UIcon name="i-lucide-bar-chart-2" /></div>
          <div>
            <span class="card-ttl">İstatistikler</span>
            <span class="card-sub">{{ localStats.length }} istatistik — sayısal öne çıkarma kartları</span>
          </div>
        </div>
        <div class="cms-card-hd-r">
          <UButton size="xs" variant="soft" color="primary" icon="i-lucide-plus" @click.stop="addStat">Ekle</UButton>
          <UIcon :name="sections.stats ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="collapse-ic" />
        </div>
      </button>
      <Transition name="accordion">
        <div v-show="sections.stats" class="cms-card-bd">
          <div class="list-head-row">
            <span class="list-col-lbl" style="width:5rem">Değer</span>
            <span class="list-col-lbl" style="flex:1">{{ lang === 'tr' ? 'Etiket (TR)' : 'Label (EN)' }}</span>
            <span style="width:2rem" />
          </div>
          <div v-for="(stat, i) in localStats" :key="i" class="list-row">
            <UInput v-model="stat.value" placeholder="10+" class="stat-val" @input="isDirty = true" />
            <UInput
              :model-value="lang === 'tr' ? stat.trLabel : stat.enLabel"
              :placeholder="lang === 'tr' ? 'Yıl Deneyim' : 'Years of Experience'"
              class="stat-label"
              @update:model-value="lang === 'tr' ? stat.trLabel = $event : stat.enLabel = $event; isDirty = true"
            />
            <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="localStats.splice(i,1); isDirty=true" />
          </div>
          <div v-if="!localStats.length" class="empty-list">
            <UIcon name="i-lucide-plus-circle" /> İstatistik yok. "Ekle" ile başlayın.
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── CARD: Uzmanlık Alanları ── -->
    <div class="cms-card">
      <button class="cms-card-hd" @click="sections.expertise = !sections.expertise">
        <div class="cms-card-hd-l">
          <div class="card-ic violet"><UIcon name="i-lucide-zap" /></div>
          <div>
            <span class="card-ttl">Uzmanlık Alanları</span>
            <span class="card-sub">{{ localExpertise.length }} alan — ikon ile etiketlenen uzmanık kartları</span>
          </div>
        </div>
        <div class="cms-card-hd-r">
          <UButton size="xs" variant="soft" color="primary" icon="i-lucide-plus" @click.stop="addExpertise">Ekle</UButton>
          <UIcon :name="sections.expertise ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="collapse-ic" />
        </div>
      </button>
      <Transition name="accordion">
        <div v-show="sections.expertise" class="cms-card-bd">
          <div class="list-head-row">
            <span class="list-col-lbl" style="width:10rem">İkon</span>
            <span class="list-col-lbl" style="flex:1">{{ lang === 'tr' ? 'Metin (TR)' : 'Text (EN)' }}</span>
            <span style="width:2rem" />
          </div>
          <div v-for="(item, i) in localExpertise" :key="i" class="list-row">
            <div class="icon-preview-wrap">
              <UIcon :name="item.icon || 'i-lucide-star'" class="icon-preview" />
              <UInput v-model="item.icon" placeholder="i-lucide-globe" class="icon-input" @input="isDirty = true" />
            </div>
            <UInput
              :model-value="lang === 'tr' ? item.trText : item.enText"
              :placeholder="lang === 'tr' ? 'Dijital Antropoloji' : 'Digital Anthropology'"
              class="stat-label"
              @update:model-value="lang === 'tr' ? item.trText = $event : item.enText = $event; isDirty = true"
            />
            <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="localExpertise.splice(i,1); isDirty=true" />
          </div>
          <div v-if="!localExpertise.length" class="empty-list">
            <UIcon name="i-lucide-plus-circle" /> Uzmanlık yok. "Ekle" ile başlayın.
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── CARD: İlgi Alanları ── -->
    <div class="cms-card">
      <button class="cms-card-hd" @click="sections.interests = !sections.interests">
        <div class="cms-card-hd-l">
          <div class="card-ic green"><UIcon name="i-lucide-heart" /></div>
          <div>
            <span class="card-ttl">İlgi Alanları</span>
            <span class="card-sub">{{ localInterests.length }} etiket — tag cloud olarak gösterilen ilgiler</span>
          </div>
        </div>
        <div class="cms-card-hd-r">
          <UButton size="xs" variant="soft" color="primary" icon="i-lucide-plus" @click.stop="addInterest">Ekle</UButton>
          <UIcon :name="sections.interests ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="collapse-ic" />
        </div>
      </button>
      <Transition name="accordion">
        <div v-show="sections.interests" class="cms-card-bd">
          <div class="tags-grid">
            <div v-for="(item, i) in localInterests" :key="i" class="tag-row">
              <UInput
                :model-value="lang === 'tr' ? item.trText : item.enText"
                :placeholder="lang === 'tr' ? 'Yapay Zeka' : 'Artificial Intelligence'"
                @update:model-value="lang === 'tr' ? item.trText = $event : item.enText = $event; isDirty = true"
              />
              <UButton size="xs" color="error" variant="ghost" icon="i-lucide-x" @click="localInterests.splice(i,1); isDirty=true" />
            </div>
          </div>
          <div v-if="!localInterests.length" class="empty-list">
            <UIcon name="i-lucide-plus-circle" /> İlgi alanı yok. "Ekle" ile başlayın.
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Sticky save bar ── -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isDirty" class="sticky-bar">
          <div class="sticky-bar-l">
            <span class="sb-dot" />
            <span class="sb-msg">Hakkımda bölümünde kaydedilmemiş değişiklikler var</span>
          </div>
          <div class="sticky-bar-r">
            <button class="sb-discard" @click="discard">Geri Al</button>
            <button class="sb-save" :disabled="saving" @click="save">
              <UIcon v-if="saving" name="i-lucide-loader-circle" class="spin" />
              <UIcon v-else name="i-lucide-save" />
              {{ saving ? 'Kaydediliyor…' : 'Kaydet' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import type { Expertise } from '~/composables/usePortfolioData'

const props = defineProps<{
  trContent: Record<string, any>
  enContent: Record<string, any>
  portfolioData: Record<string, any>
}>()
const emit = defineEmits<{
  (e: 'save', tr: Record<string, any>, en: Record<string, any>, portfolio: Record<string, any>): void
}>()

const lang = ref<'tr' | 'en'>('tr')
const saving = ref(false)
const isDirty = ref(false)
const sections = reactive({ photo: true, bio: true, stats: true, expertise: true, interests: true })

const localPhoto = ref('')
const local = reactive({
  tr: { about: { title: '', bio1: '', bio2: '', bio3: '' } },
  en: { about: { title: '', bio1: '', bio2: '', bio3: '' } },
})

interface StatRow      { value: string; trLabel: string; enLabel: string; labelKey: string }
interface ExpertiseRow { icon: string; trText: string; enText: string; key: string }
interface InterestRow  { trText: string; enText: string; key: string }

const localStats     = ref<StatRow[]>([])
const localExpertise = ref<ExpertiseRow[]>([])
const localInterests = ref<InterestRow[]>([])

/* ── init / discard ── */
function applyProps() {
  localPhoto.value = props.portfolioData?.photo ?? ''
  const tr = props.trContent?.about ?? {}
  const en = props.enContent?.about ?? {}
  Object.assign(local.tr.about, { title: tr.title ?? '', bio1: tr.bio1 ?? '', bio2: tr.bio2 ?? '', bio3: tr.bio3 ?? '' })
  Object.assign(local.en.about, { title: en.title ?? '', bio1: en.bio1 ?? '', bio2: en.bio2 ?? '', bio3: en.bio3 ?? '' })

  localStats.value = (props.portfolioData?.stats ?? []).map((s: any) => {
    const sub = (s.labelKey ?? '').split('.').pop() ?? s.labelKey
    return { value: s.value ?? '', trLabel: tr.stats?.[sub] ?? '', enLabel: en.stats?.[sub] ?? '', labelKey: s.labelKey ?? '' }
  })
  localExpertise.value = (props.portfolioData?.expertise ?? []).map((ex: Expertise) => {
    const sub = ex.key.split('.').pop() ?? ex.key
    return { icon: ex.icon, trText: tr.expertise?.[sub] ?? '', enText: en.expertise?.[sub] ?? '', key: ex.key }
  })
  localInterests.value = (props.portfolioData?.interests ?? []).map((k: string) => {
    const sub = k.split('.').pop() ?? k
    return { trText: tr.interests?.[sub] ?? '', enText: en.interests?.[sub] ?? '', key: k }
  })
}

watch([() => props.trContent, () => props.enContent, () => props.portfolioData], applyProps, { immediate: true })

function discard() { applyProps(); isDirty.value = false }

/* ── helpers ── */
const bioTitle = computed(() => lang.value === 'tr' ? local.tr.about.title : local.en.about.title)
function setBioTitle(v: string) { if (lang.value === 'tr') local.tr.about.title = v; else local.en.about.title = v; isDirty.value = true }

function getBio(n: 1|2|3): string {
  const key = `bio${n}` as 'bio1'|'bio2'|'bio3'
  return lang.value === 'tr' ? local.tr.about[key] : local.en.about[key]
}
function setBio(n: number, v: string) {
  const key = `bio${n}` as 'bio1'|'bio2'|'bio3'
  if (lang.value === 'tr') local.tr.about[key] = v; else local.en.about[key] = v
  isDirty.value = true
}

function addStat()      { localStats.value.push({ value: '', trLabel: '', enLabel: '', labelKey: `about.stats.stat${Date.now()}` }); isDirty.value = true }
function addExpertise() { localExpertise.value.push({ icon: 'i-lucide-star', trText: '', enText: '', key: `about.expertise.item${Date.now()}` }); isDirty.value = true }
function addInterest()  { localInterests.value.push({ trText: '', enText: '', key: `about.interests.item${Date.now()}` }); isDirty.value = true }

function charCls(val: string, max: number) {
  const r = val.length / max
  if (r >= 1) return 'cc--over'
  if (r >= 0.85) return 'cc--warn'
  return 'cc--ok'
}

/* ── save ── */
async function save() {
  saving.value = true
  const trStats: Record<string,string> = {}; const enStats: Record<string,string> = {}
  const portfolioStats = localStats.value.map(s => { const sub = s.labelKey.split('.').pop()??s.labelKey; trStats[sub]=s.trLabel; enStats[sub]=s.enLabel; return { value: s.value, labelKey: s.labelKey } })
  const trExp: Record<string,string> = {}; const enExp: Record<string,string> = {}
  const portfolioExpertise = localExpertise.value.map(ex => { const sub = ex.key.split('.').pop()??ex.key; trExp[sub]=ex.trText; enExp[sub]=ex.enText; return { key: ex.key, icon: ex.icon } })
  const trInt: Record<string,string> = {}; const enInt: Record<string,string> = {}
  const portfolioInterests = localInterests.value.map(item => { const sub = item.key.split('.').pop()??item.key; trInt[sub]=item.trText; enInt[sub]=item.enText; return item.key })

  emit(
    'save',
    { about: { ...props.trContent?.about, ...local.tr.about, stats: trStats, expertise: trExp, interests: trInt } },
    { about: { ...props.enContent?.about, ...local.en.about, stats: enStats, expertise: enExp, interests: enInt } },
    { ...props.portfolioData, photo: localPhoto.value, stats: portfolioStats, expertise: portfolioExpertise, interests: portfolioInterests },
  )
  await nextTick()
  saving.value = false
  isDirty.value = false
}
</script>

<style scoped>
.cms-tab { display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 6rem; }

.tab-head { display: flex; align-items: flex-start; gap: 0.875rem; padding-bottom: 0.25rem; }
.tab-head-icon { width: 2.25rem; height: 2.25rem; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; display: flex; align-items: center; justify-content: center; color: #2563eb; font-size: 1rem; flex-shrink: 0; }
.tab-head-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.tab-head-desc  { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }

.top-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.lang-switch { display: flex; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 3px; gap: 2px; }
.lang-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 6px; border: none; background: transparent; font-size: 0.8rem; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.15s; }
.lang-btn:hover { background: #e2e8f0; color: #334155; }
.lang-btn--on { background: #fff; color: #0f172a; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.unsaved-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 999px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 0.75rem; font-weight: 500; }
.unsaved-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; animation: pulse 1.5s ease infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

.cms-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: box-shadow 0.2s; }
.cms-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }

.cms-card-hd { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 1rem 1.25rem; background: #f8fafc; border: none; border-bottom: 1px solid transparent; cursor: pointer; text-align: left; transition: background 0.15s; }
.cms-card-hd:hover { background: #f1f5f9; }
.cms-card-hd-l { display: flex; align-items: center; gap: 0.75rem; }
.cms-card-hd-r { display: flex; align-items: center; gap: 0.5rem; }

.card-ic { width: 2rem; height: 2rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
.card-ic.blue   { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.card-ic.violet { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.card-ic.green  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.card-ic.amber  { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }

.card-ttl { display: block; font-size: 0.875rem; font-weight: 600; color: #1e293b; }
.card-sub { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }
.collapse-ic { color: #94a3b8; font-size: 1rem; flex-shrink: 0; }

.cms-card-bd { display: flex; flex-direction: column; gap: 0; padding: 0.25rem 0; }

.cms-field { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
.cms-field:last-child { border-bottom: none; }
.cms-field:hover { background: #fafafa; }
.cms-field:focus-within { background: #fafffe; }

.field-lbl-row { display: flex; align-items: center; justify-content: space-between; }
.field-lbl { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; font-weight: 600; color: #374151; }
.field-ic { font-size: 0.9rem; color: #94a3b8; }
.field-hint { font-size: 0.72rem; color: #9ca3af; line-height: 1.4; margin: 0; }

.cc { font-size: 0.7rem; font-family: 'Courier New', monospace; font-weight: 600; }
.cc--ok { color: #d1d5db; }
.cc--warn { color: #f59e0b; }
.cc--over { color: #ef4444; }

/* ── list rows ── */
.list-head-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 1.25rem 0.25rem;
}
.list-col-lbl { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }

.list-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
}
.list-row:last-of-type { border-bottom: none; }
.list-row:hover { background: #fafafa; }

.stat-val   { width: 5rem; flex-shrink: 0; }
.stat-label { flex: 1; }

.icon-preview-wrap { width: 10rem; display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
.icon-preview { font-size: 1.1rem; color: #7c3aed; flex-shrink: 0; }
.icon-input { flex: 1; min-width: 0; }

/* ── interests grid ── */
.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
}
.tag-row { display: flex; align-items: center; gap: 0.35rem; }

.empty-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

/* ── sticky bar ── */
.sticky-bar { position: fixed; bottom: 1.5rem; right: 2rem; z-index: 9999; display: flex; align-items: center; gap: 1.25rem; background: #0f172a; color: #f1f5f9; border-radius: 12px; padding: 0.75rem 1rem 0.75rem 1.25rem; box-shadow: 0 8px 32px rgba(0,0,0,0.25); font-size: 0.8rem; min-width: 320px; }
.sticky-bar-l { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
.sb-dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; animation: pulse 1.5s ease infinite; }
.sb-msg { color: #e2e8f0; font-size: 0.78rem; }
.sticky-bar-r { display: flex; align-items: center; gap: 0.5rem; }
.sb-discard { padding: 0.35rem 0.75rem; border-radius: 6px; border: 1px solid #334155; background: transparent; color: #94a3b8; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
.sb-discard:hover { background: #1e293b; color: #e2e8f0; }
.sb-save { display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.875rem; border-radius: 6px; border: none; background: #7c3aed; color: #fff; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.sb-save:hover:not(:disabled) { background: #6d28d9; }
.sb-save:disabled { opacity: 0.7; cursor: not-allowed; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.accordion-enter-active, .accordion-leave-active { transition: opacity 0.2s ease, transform 0.18s ease; }
.accordion-enter-from, .accordion-leave-to { opacity: 0; transform: translateY(-6px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
</style>

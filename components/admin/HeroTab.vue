<template>
  <div class="cms-tab">

    <!-- ── Tab header ─────────────────────────────────────────────────────── -->
    <div class="tab-head">
      <div class="tab-head-icon">
        <UIcon name="i-lucide-layout-template" />
      </div>
      <div>
        <h2 class="tab-head-title">Hero Bölümü</h2>
        <p class="tab-head-desc">Ziyaretçilerin ilk gördüğü tam ekran bölüm. Kısa, net ve dikkat çekici tutun.</p>
      </div>
    </div>

    <!-- ── Top bar: language switcher + unsaved badge ─────────────────────── -->
    <div class="top-bar">
      <div class="lang-switch">
        <button :class="['lang-btn', lang === 'tr' && 'lang-btn--on']" @click="lang = 'tr'">
          🇹🇷 Türkçe
        </button>
        <button :class="['lang-btn', lang === 'en' && 'lang-btn--on']" @click="lang = 'en'">
          🇬🇧 English
        </button>
      </div>
      <Transition name="fade">
        <div v-if="isDirty" class="unsaved-badge">
          <span class="unsaved-dot" />
          Kaydedilmemiş değişiklikler
        </div>
      </Transition>
    </div>

    <!-- ── CARD: Başlık Grubu ─────────────────────────────────────────────── -->
    <div class="cms-card">
      <button class="cms-card-hd" @click="sections.titles = !sections.titles">
        <div class="cms-card-hd-l">
          <div class="card-ic blue"><UIcon name="i-lucide-type" /></div>
          <div>
            <span class="card-ttl">Başlık Grubu</span>
            <span class="card-sub">Eyebrow, ana başlık ve alt başlık</span>
          </div>
        </div>
        <UIcon :name="sections.titles ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="collapse-ic" />
      </button>

      <Transition name="accordion">
        <div v-show="sections.titles" class="cms-card-bd">

          <div class="cms-field">
            <div class="field-lbl-row">
              <label class="field-lbl"><UIcon name="i-lucide-badge" class="field-ic" />{{ lang === 'tr' ? 'Eyebrow Metin' : 'Eyebrow Text' }}</label>
              <span :class="['cc', charCls(eyebrowVal, 60)]">{{ eyebrowVal.length }}/60</span>
            </div>
            <p class="field-hint">{{ lang === 'tr' ? 'Başlığın üzerinde görünen küçük tanımlayıcı metin.' : 'Small descriptor shown above the main heading.' }}</p>
            <UInput :model-value="eyebrowVal" :placeholder="lang === 'tr' ? 'Kim bu dijital gölge?' : 'Who is this digital shadow?'" @update:model-value="setField('eyebrow', $event)" />
          </div>

          <div class="cms-field">
            <div class="field-lbl-row">
              <label class="field-lbl"><UIcon name="i-lucide-heading-1" class="field-ic" />{{ lang === 'tr' ? 'Ana Başlık' : 'Main Title' }}</label>
              <span :class="['cc', charCls(nameVal, 80)]">{{ nameVal.length }}/80</span>
            </div>
            <p class="field-hint">{{ lang === 'tr' ? 'Sayfanın ana H1 başlığı.' : 'The primary H1 heading of the page.' }}</p>
            <UInput :model-value="nameVal" :placeholder="lang === 'tr' ? 'Kişisel Portfolyom' : 'My Portfolio'" @update:model-value="setField('name', $event)" />
          </div>

          <div class="cms-field">
            <div class="field-lbl-row">
              <label class="field-lbl"><UIcon name="i-lucide-text" class="field-ic" />{{ lang === 'tr' ? 'Alt Başlık' : 'Subtitle' }}</label>
              <span :class="['cc', charCls(subtitleVal, 80)]">{{ subtitleVal.length }}/80</span>
            </div>
            <p class="field-hint">{{ lang === 'tr' ? 'Ana başlığın hemen altında görünen kısa metin.' : 'Short text shown right below the main title.' }}</p>
            <UInput :model-value="subtitleVal" :placeholder="lang === 'tr' ? 'Ben Emre' : `I'm Emre`" @update:model-value="setField('subtitle', $event)" />
          </div>

        </div>
      </Transition>
    </div>

    <!-- ── CARD: CTA & Dönen Roller ───────────────────────────────────────── -->
    <div class="cms-card">
      <button class="cms-card-hd" @click="sections.cta = !sections.cta">
        <div class="cms-card-hd-l">
          <div class="card-ic violet"><UIcon name="i-lucide-mouse-pointer-click" /></div>
          <div>
            <span class="card-ttl">CTA & Dönen Roller</span>
            <span class="card-sub">Buton metni ve animasyonlu rol listesi</span>
          </div>
        </div>
        <UIcon :name="sections.cta ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="collapse-ic" />
      </button>

      <Transition name="accordion">
        <div v-show="sections.cta" class="cms-card-bd">

          <div class="cms-field">
            <div class="field-lbl-row">
              <label class="field-lbl"><UIcon name="i-lucide-arrow-right-circle" class="field-ic" />{{ lang === 'tr' ? 'CTA Butonu' : 'CTA Button' }}</label>
              <span :class="['cc', charCls(ctaVal, 40)]">{{ ctaVal.length }}/40</span>
            </div>
            <p class="field-hint">{{ lang === 'tr' ? 'Ziyaretçiyi harekete geçiren buton metni. Kısa ve etkili yazın.' : 'Call-to-action button label. Keep it short and compelling.' }}</p>
            <UInput :model-value="ctaVal" :placeholder="lang === 'tr' ? 'Hakkımda Keşfet' : 'Explore My Work'" @update:model-value="setField('cta', $event)" />
          </div>

          <div class="cms-field">
            <div class="field-lbl-row">
              <label class="field-lbl"><UIcon name="i-lucide-refresh-cw" class="field-ic" />{{ lang === 'tr' ? 'Dönen Roller' : 'Rotating Roles' }}</label>
              <span class="cc cc--ok">{{ rolesVal.split('\n').filter(Boolean).length }} rol</span>
            </div>
            <p class="field-hint">{{ lang === 'tr' ? 'Her satıra bir rol. Hero bölümünde otomatik dönerek gösterilir.' : 'One role per line. They rotate automatically in the hero animation.' }}</p>
            <UTextarea
              :model-value="rolesVal"
              :rows="5"
              :placeholder="lang === 'tr' ? 'Dijital Antropolog\nAraştırmacı & Yazar\nDüşünce Üreticisi\nAI & Kültür Analisti' : 'Digital Anthropologist\nResearcher & Writer\nThought Leader\nAI & Culture Analyst'"
              class="roles-ta"
              @update:model-value="setRoles($event as string)"
            />
          </div>

        </div>
      </Transition>
    </div>

    <!-- ── Sticky save bar ────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isDirty" class="sticky-bar">
          <div class="sticky-bar-l">
            <span class="sb-dot" />
            <span class="sb-msg">Hero bölümünde kaydedilmemiş değişiklikler var</span>
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
const props = defineProps<{
  trContent: Record<string, any>
  enContent: Record<string, any>
}>()
const emit = defineEmits<{
  (e: 'save', tr: Record<string, any>, en: Record<string, any>): void
}>()

/* ── state ── */
const lang = ref<'tr' | 'en'>('tr')
const saving = ref(false)
const isDirty = ref(false)
const sections = reactive({ titles: true, cta: true })

const local = reactive({
  tr: { hero: { eyebrow: '', name: '', subtitle: '', cta: '', roles: [] as string[] } },
  en: { hero: { eyebrow: '', name: '', subtitle: '', cta: '', roles: [] as string[] } },
})

/* ── init / discard ── */
function applyProps() {
  if (props.trContent?.hero) Object.assign(local.tr.hero, {
    eyebrow: props.trContent.hero.eyebrow ?? '',
    name: props.trContent.hero.name ?? '',
    subtitle: props.trContent.hero.subtitle ?? '',
    cta: props.trContent.hero.cta ?? '',
    roles: Array.isArray(props.trContent.hero.roles) ? [...props.trContent.hero.roles] : [],
  })
  if (props.enContent?.hero) Object.assign(local.en.hero, {
    eyebrow: props.enContent.hero.eyebrow ?? '',
    name: props.enContent.hero.name ?? '',
    subtitle: props.enContent.hero.subtitle ?? '',
    cta: props.enContent.hero.cta ?? '',
    roles: Array.isArray(props.enContent.hero.roles) ? [...props.enContent.hero.roles] : [],
  })
}

watch([() => props.trContent, () => props.enContent], applyProps, { immediate: true })

function discard() {
  applyProps()
  isDirty.value = false
}

/* ── language-aware field helpers ── */
const eyebrowVal = computed(() => lang.value === 'tr' ? local.tr.hero.eyebrow : local.en.hero.eyebrow)
const nameVal = computed(() => lang.value === 'tr' ? local.tr.hero.name : local.en.hero.name)
const subtitleVal = computed(() => lang.value === 'tr' ? local.tr.hero.subtitle : local.en.hero.subtitle)
const ctaVal = computed(() => lang.value === 'tr' ? local.tr.hero.cta : local.en.hero.cta)
const rolesVal = computed(() =>
  lang.value === 'tr' ? local.tr.hero.roles.join('\n') : local.en.hero.roles.join('\n')
)

function setField(field: 'eyebrow' | 'name' | 'subtitle' | 'cta', v: string) {
  if (lang.value === 'tr') (local.tr.hero as any)[field] = v
  else (local.en.hero as any)[field] = v
  isDirty.value = true
}

function setRoles(v: string) {
  const arr = v.split('\n').map(s => s.trimEnd()).filter(s => s.length > 0)
  if (lang.value === 'tr') local.tr.hero.roles = arr
  else local.en.hero.roles = arr
  isDirty.value = true
}

/* ── char counter ── */
function charCls(val: string, max: number) {
  const r = val.length / max
  if (r >= 1) return 'cc--over'
  if (r >= 0.85) return 'cc--warn'
  return 'cc--ok'
}

/* ── save ── */
async function save() {
  saving.value = true
  const trPatch = { hero: { ...props.trContent?.hero, ...local.tr.hero } }
  const enPatch = { hero: { ...props.enContent?.hero, ...local.en.hero } }
  emit('save', trPatch, enPatch)
  await nextTick()
  saving.value = false
  isDirty.value = false
}
</script>

<style scoped>
/* ── base ── */
.cms-tab { display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 6rem; }

/* ── tab header ── */
.tab-head {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding-bottom: 0.25rem;
}
.tab-head-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  font-size: 1rem;
  flex-shrink: 0;
}
.tab-head-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; line-height: 1.3; }
.tab-head-desc  { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }

/* ── top bar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.lang-switch {
  display: flex;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.lang-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.lang-btn:hover { background: #e2e8f0; color: #334155; }
.lang-btn--on {
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.unsaved-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 500;
}
.unsaved-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  animation: pulse 1.5s ease infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* ── cards ── */
.cms-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.cms-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }

.cms-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border: none;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.cms-card-hd:hover { background: #f1f5f9; }

.cms-card-hd-l {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.card-ic {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}
.card-ic.blue   { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.card-ic.violet { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.card-ic.green  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.card-ic.amber  { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }

.card-ttl {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}
.card-sub {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.1rem;
}
.collapse-ic { color: #94a3b8; font-size: 1rem; flex-shrink: 0; }

.cms-card-bd {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.25rem 0;
}

/* ── individual field ── */
.cms-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}
.cms-field:last-child { border-bottom: none; }
.cms-field:hover { background: #fafafa; }
.cms-field:focus-within { background: #fafffe; }

.field-lbl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.field-lbl {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}
.field-ic { font-size: 0.9rem; color: #94a3b8; }
.field-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  line-height: 1.4;
  margin: 0;
}

/* ── char counter ── */
.cc { font-size: 0.7rem; font-family: 'Courier New', monospace; font-weight: 600; }
.cc--ok   { color: #d1d5db; }
.cc--warn { color: #f59e0b; }
.cc--over { color: #ef4444; }

/* ── roles textarea ── */
.roles-ta :deep(textarea) {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.8;
}

/* ── sticky bar ── */
.sticky-bar {
  position: fixed;
  bottom: 1.5rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: #0f172a;
  color: #f1f5f9;
  border-radius: 12px;
  padding: 0.75rem 1rem 0.75rem 1.25rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  font-size: 0.8rem;
  min-width: 320px;
}
.sticky-bar-l { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
.sb-dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; animation: pulse 1.5s ease infinite; }
.sb-msg { color: #e2e8f0; font-size: 0.78rem; }
.sticky-bar-r { display: flex; align-items: center; gap: 0.5rem; }
.sb-discard {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: transparent;
  color: #94a3b8;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}
.sb-discard:hover { background: #1e293b; color: #e2e8f0; }
.sb-save {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.875rem;
  border-radius: 6px;
  border: none;
  background: #7c3aed;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.sb-save:hover:not(:disabled) { background: #6d28d9; }
.sb-save:disabled { opacity: 0.7; cursor: not-allowed; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── transitions ── */
.accordion-enter-active, .accordion-leave-active {
  transition: opacity 0.2s ease, transform 0.18s ease;
}
.accordion-enter-from, .accordion-leave-to { opacity: 0; transform: translateY(-6px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
</style>

<template>
  <div class="cms-tab">

    <div class="tab-head">
      <div class="tab-head-icon"><UIcon name="i-lucide-mail" /></div>
      <div>
        <h2 class="tab-head-title">İletişim Bölümü</h2>
        <p class="tab-head-desc">Başlık, alt başlık ve istediğiniz kadar iletişim bilgisi ekleyin.</p>
      </div>
    </div>

    <div class="top-bar">
      <div class="lang-switch">
        <button :class="['lang-btn', lang === 'tr' && 'lang-btn--on']" @click="lang = 'tr'">🇹🇷 Türkçe</button>
        <button :class="['lang-btn', lang === 'en' && 'lang-btn--on']" @click="lang = 'en'">🇬🇧 English</button>
      </div>
      <Transition name="fade">
        <div v-if="isDirty" class="unsaved-badge"><span class="unsaved-dot" />Kaydedilmemiş değişiklikler</div>
      </Transition>
    </div>

    <!-- CARD: Başlıklar -->
    <div class="cms-card">
      <div class="cms-card-hd">
        <div class="cms-card-hd-l">
          <div class="card-ic blue"><UIcon name="i-lucide-type" /></div>
          <div>
            <span class="card-ttl">Başlık & Alt Başlık</span>
            <span class="card-sub">İletişim bölümünün üst metinleri</span>
          </div>
        </div>
      </div>
      <div class="cms-card-bd">
        <div class="cms-field">
          <div class="field-lbl-row">
            <label class="field-lbl"><UIcon name="i-lucide-heading-1" class="field-ic" />{{ lang === 'tr' ? 'Başlık' : 'Title' }}</label>
            <span :class="['cc', charCls(titleVal, 60)]">{{ titleVal.length }}/60</span>
          </div>
          <UInput :model-value="titleVal" :placeholder="lang === 'tr' ? 'Birlikte çalışalım' : 'Let\'s work together'" @update:model-value="setField('title', $event)" />
        </div>
        <div class="cms-field">
          <div class="field-lbl-row">
            <label class="field-lbl"><UIcon name="i-lucide-text" class="field-ic" />{{ lang === 'tr' ? 'Alt Başlık' : 'Subtitle' }}</label>
            <span :class="['cc', charCls(subtitleVal, 160)]">{{ subtitleVal.length }}/160</span>
          </div>
          <p class="field-hint">{{ lang === 'tr' ? 'Başlığın altında görünen kısa açıklama.' : 'Short description shown below the title.' }}</p>
          <UTextarea :model-value="subtitleVal" :rows="2" @update:model-value="setField('subtitle', $event)" />
        </div>
      </div>
    </div>

    <!-- CARD: İletişim Bilgileri (dynamic) -->
    <div class="cms-card">
      <div class="cms-card-hd">
        <div class="cms-card-hd-l">
          <div class="card-ic violet"><UIcon name="i-lucide-contact" /></div>
          <div>
            <span class="card-ttl">İletişim Bilgileri</span>
            <span class="card-sub">Tüm dillerde aynı — istediğiniz kadar alan ekleyin</span>
          </div>
        </div>
        <div class="cms-card-hd-r">
          <!-- Quick-add preset buttons -->
          <div class="preset-btns">
            <button
              v-for="p in presets"
              :key="p.key"
              :disabled="infoItems.some(f => f.key === p.key)"
              class="preset-btn"
              :title="p.label"
              @click="addPreset(p)"
            >
              <UIcon :name="p.icon" />
              {{ p.label }}
            </button>
            <button class="preset-btn preset-btn--custom" @click="addCustom">
              <UIcon name="i-lucide-plus" />
              Özel
            </button>
          </div>
        </div>
      </div>

      <div class="cms-card-bd">
        <div v-if="infoItems.length === 0" class="info-empty">
          <UIcon name="i-lucide-contact-round" />
          Henüz bilgi yok. Yukarıdan hızlı ekle veya "Özel" butonunu kullanın.
        </div>

        <TransitionGroup name="list" tag="div">
          <div v-for="(field, i) in infoItems" :key="field.id" class="info-row">
            <!-- icon picker -->
            <div class="info-icon-wrap">
              <UIcon :name="field.icon || 'i-lucide-circle'" class="info-icon" />
              <input
                v-model="field.icon"
                class="icon-input"
                placeholder="i-lucide-phone"
                title="İkon adı (Lucide)"
                @input="isDirty = true"
              />
            </div>
            <!-- label -->
            <div class="info-label-wrap">
              <input
                v-model="field.label"
                class="label-input"
                placeholder="Alan adı (örn. Telefon)"
                @input="isDirty = true"
              />
            </div>
            <!-- value -->
            <div class="info-value-wrap">
              <input
                v-model="field.value"
                class="value-input"
                :placeholder="field.placeholder || 'Değer girin'"
                :type="field.inputType || 'text'"
                @input="isDirty = true"
              />
            </div>
            <!-- delete -->
            <button class="info-del" title="Sil" @click="infoItems.splice(i, 1); isDirty = true">
              <UIcon name="i-lucide-x" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isDirty" class="sticky-bar">
          <div class="sticky-bar-l"><span class="sb-dot" /><span class="sb-msg">İletişim bölümünde kaydedilmemiş değişiklikler var</span></div>
          <div class="sticky-bar-r">
            <button class="sb-discard" @click="discard">Geri Al</button>
            <button class="sb-save" :disabled="saving" @click="save">
              <UIcon v-if="saving" name="i-lucide-loader-circle" class="spin" /><UIcon v-else name="i-lucide-save" />
              {{ saving ? 'Kaydediliyor…' : 'Kaydet' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ trContent: Record<string, any>; enContent: Record<string, any> }>()
const emit = defineEmits<{ (e: 'save', tr: Record<string, any>, en: Record<string, any>): void }>()

const lang = ref<'tr'|'en'>('tr')
const saving = ref(false)
const isDirty = ref(false)
const local = reactive({ tr: { title: '', subtitle: '' }, en: { title: '', subtitle: '' } })

interface InfoField {
  id: string
  key: string
  icon: string
  label: string
  value: string
  placeholder?: string
  inputType?: string
}

const infoItems = ref<InfoField[]>([])

const presets = [
  { key: 'email',    icon: 'i-lucide-mail',     label: 'E-posta',  placeholder: 'iletisim@emre.com',          inputType: 'email' },
  { key: 'phone',    icon: 'i-lucide-phone',    label: 'Telefon',  placeholder: '+90 555 000 00 00',           inputType: 'tel' },
  { key: 'location', icon: 'i-lucide-map-pin',  label: 'Konum',    placeholder: 'İstanbul, Türkiye',           inputType: 'text' },
  { key: 'website',  icon: 'i-lucide-globe',    label: 'Website',  placeholder: 'https://emre.com',            inputType: 'url' },
  { key: 'linkedin', icon: 'i-simple-icons-linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/emre', inputType: 'url' },
  { key: 'twitter',  icon: 'i-simple-icons-x',  label: 'X / Twitter', placeholder: '@emredijital',            inputType: 'text' },
]

function makeId() { return `inf-${Date.now()}-${Math.random().toString(36).slice(2,6)}` }

function addPreset(p: typeof presets[0]) {
  infoItems.value.push({ id: makeId(), key: p.key, icon: p.icon, label: p.label, value: '', placeholder: p.placeholder, inputType: p.inputType })
  isDirty.value = true
}

function addCustom() {
  infoItems.value.push({ id: makeId(), key: `custom-${Date.now()}`, icon: 'i-lucide-info', label: '', value: '', placeholder: 'Değer girin' })
  isDirty.value = true
}

function applyProps() {
  local.tr.title    = props.trContent?.contact?.title    ?? ''
  local.tr.subtitle = props.trContent?.contact?.subtitle ?? ''
  local.en.title    = props.enContent?.contact?.title    ?? ''
  local.en.subtitle = props.enContent?.contact?.subtitle ?? ''

  // Load dynamic info fields. Support both new array format and old {email, location} object.
  const savedFields = props.trContent?.contact?.infoFields
  if (Array.isArray(savedFields) && savedFields.length > 0) {
    infoItems.value = savedFields.map((f: any) => ({ ...f, id: makeId() }))
  } else {
    // Bootstrap from legacy flat fields
    const info = props.trContent?.contact?.info ?? {}
    const legacy: InfoField[] = []
    if (info.email)    legacy.push({ id: makeId(), key: 'email',    icon: 'i-lucide-mail',    label: 'E-posta', value: info.email,    placeholder: 'iletisim@emre.com', inputType: 'email' })
    if (info.location) legacy.push({ id: makeId(), key: 'location', icon: 'i-lucide-map-pin', label: 'Konum',   value: info.location, placeholder: 'İstanbul, Türkiye', inputType: 'text' })
    infoItems.value = legacy
  }
}

watch([() => props.trContent, () => props.enContent], applyProps, { immediate: true })
function discard() { applyProps(); isDirty.value = false }

const titleVal    = computed(() => lang.value === 'tr' ? local.tr.title    : local.en.title)
const subtitleVal = computed(() => lang.value === 'tr' ? local.tr.subtitle : local.en.subtitle)
function setField(f: 'title'|'subtitle', v: string) { if (lang.value === 'tr') local.tr[f] = v; else local.en[f] = v; isDirty.value = true }
function charCls(v: string, max: number) { const r = v.length / max; return r >= 1 ? 'cc--over' : r >= 0.85 ? 'cc--warn' : 'cc--ok' }

async function save() {
  saving.value = true
  // Serialise infoFields (strip id, keep the rest) and also build legacy info object for compat
  const fields = infoItems.value.map(({ id: _id, ...rest }) => rest)
  const infoObj = Object.fromEntries(fields.map(f => [f.key, f.value]))

  const trPatch = {
    contact: {
      ...props.trContent?.contact,
      title: local.tr.title,
      subtitle: local.tr.subtitle,
      info: infoObj,
      infoFields: fields,
    },
  }
  const enPatch = {
    contact: {
      ...props.enContent?.contact,
      title: local.en.title,
      subtitle: local.en.subtitle,
      info: infoObj,
      infoFields: fields,
    },
  }
  emit('save', trPatch, enPatch)
  await nextTick()
  saving.value = false
  isDirty.value = false
}
</script>

<style scoped>
.cms-tab { display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 6rem; }
.tab-head { display: flex; align-items: flex-start; gap: 0.875rem; }
.tab-head-icon { width: 2.25rem; height: 2.25rem; border-radius: 8px; background: #fdf4ff; border: 1px solid #e9d5ff; display: flex; align-items: center; justify-content: center; color: #9333ea; font-size: 1rem; flex-shrink: 0; }
.tab-head-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.tab-head-desc  { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }
.top-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.lang-switch { display: flex; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 3px; gap: 2px; }
.lang-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 6px; border: none; background: transparent; font-size: 0.8rem; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.15s; }
.lang-btn:hover { background: #e2e8f0; }
.lang-btn--on { background: #fff; color: #0f172a; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.unsaved-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 999px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 0.75rem; font-weight: 500; }
.unsaved-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; animation: pulse 1.5s ease infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

.cms-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.cms-card-hd { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 0.75rem; }
.cms-card-hd-l { display: flex; align-items: center; gap: 0.75rem; }
.cms-card-hd-r { display: flex; align-items: center; }
.card-ic { width: 2rem; height: 2rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
.card-ic.blue   { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.card-ic.violet { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.card-ttl { display: block; font-size: 0.875rem; font-weight: 600; color: #1e293b; }
.card-sub { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }
.cms-card-bd { display: flex; flex-direction: column; }
.cms-field { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
.cms-field:last-child { border-bottom: none; }
.cms-field:hover { background: #fafafa; }
.field-lbl-row { display: flex; align-items: center; justify-content: space-between; }
.field-lbl { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; font-weight: 600; color: #374151; }
.field-ic { font-size: 0.9rem; color: #94a3b8; }
.field-hint { font-size: 0.72rem; color: #9ca3af; line-height: 1.4; margin: 0; }
.cc { font-size: 0.7rem; font-family: monospace; font-weight: 600; }
.cc--ok { color: #d1d5db; } .cc--warn { color: #f59e0b; } .cc--over { color: #ef4444; }

/* preset quick-add buttons */
.preset-btns { display: flex; align-items: center; gap: 0.375rem; flex-wrap: wrap; }
.preset-btn {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.25rem 0.625rem; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #fff;
  font-size: 0.72rem; font-weight: 500; color: #475569;
  cursor: pointer; transition: all 0.15s;
}
.preset-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #7c3aed; color: #7c3aed; }
.preset-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.preset-btn--custom { border-style: dashed; background: transparent; color: #7c3aed; border-color: #c4b5fd; }
.preset-btn--custom:hover { background: #f5f3ff; }

/* dynamic info rows */
.info-empty { display: flex; align-items: center; gap: 0.6rem; padding: 1.25rem 1.5rem; color: #94a3b8; font-size: 0.8rem; }
.info-row {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem; border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}
.info-row:last-child { border-bottom: none; }
.info-row:hover { background: #fafafa; }

.info-icon-wrap {
  display: flex; align-items: center; gap: 0.4rem;
  flex-shrink: 0; min-width: 160px;
}
.info-icon { font-size: 1rem; color: #7c3aed; flex-shrink: 0; }
.icon-input {
  border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 0.25rem 0.5rem; font-size: 0.7rem; font-family: monospace;
  color: #475569; background: #f8fafc; width: 100%;
  outline: none; transition: border 0.15s;
}
.icon-input:focus { border-color: #7c3aed; background: #fff; }

.info-label-wrap { flex: 0 0 130px; }
.label-input {
  width: 100%; border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 0.3rem 0.6rem; font-size: 0.8rem; font-weight: 600; color: #374151;
  background: #f8fafc; outline: none; transition: border 0.15s;
}
.label-input:focus { border-color: #7c3aed; background: #fff; }

.info-value-wrap { flex: 1; }
.value-input {
  width: 100%; border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 0.3rem 0.6rem; font-size: 0.85rem; color: #0f172a;
  background: #fff; outline: none; transition: border 0.15s;
}
.value-input:focus { border-color: #7c3aed; }

.info-del {
  flex-shrink: 0; width: 1.75rem; height: 1.75rem;
  border-radius: 6px; border: 1px solid transparent;
  background: transparent; color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; font-size: 0.85rem;
}
.info-del:hover { background: #fef2f2; border-color: #fecaca; color: #ef4444; }

.list-enter-active, .list-leave-active { transition: all 0.2s ease; }
.list-enter-from { opacity: 0; transform: translateY(-6px); }
.list-leave-to   { opacity: 0; transform: translateX(8px); }

.sticky-bar { position: fixed; bottom: 1.5rem; right: 2rem; z-index: 9999; display: flex; align-items: center; gap: 1.25rem; background: #0f172a; color: #f1f5f9; border-radius: 12px; padding: 0.75rem 1rem 0.75rem 1.25rem; box-shadow: 0 8px 32px rgba(0,0,0,0.25); min-width: 320px; }
.sticky-bar-l { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
.sb-dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; animation: pulse 1.5s ease infinite; }
.sb-msg { color: #e2e8f0; font-size: 0.78rem; }
.sticky-bar-r { display: flex; align-items: center; gap: 0.5rem; }
.sb-discard { padding: 0.35rem 0.75rem; border-radius: 6px; border: 1px solid #334155; background: transparent; color: #94a3b8; font-size: 0.78rem; cursor: pointer; }
.sb-discard:hover { background: #1e293b; color: #e2e8f0; }
.sb-save { display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.875rem; border-radius: 6px; border: none; background: #7c3aed; color: #fff; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
.sb-save:hover:not(:disabled) { background: #6d28d9; }
.sb-save:disabled { opacity: 0.7; cursor: not-allowed; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
</style>

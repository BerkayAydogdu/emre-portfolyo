<template>
  <div class="cms-tab">

    <!-- ── Tab header ── -->
    <div class="tab-head">
      <div class="tab-head-icon">
        <UIcon name="i-lucide-share-2" />
      </div>
      <div>
        <h2 class="tab-head-title">Sosyal Medya Kartları</h2>
        <p class="tab-head-desc">Ana sayfadaki kayan (marquee) sosyal medya kartlarını yönetin.</p>
      </div>
    </div>

    <!-- ── Top bar ── -->
    <div class="top-bar">
      <div class="platform-pills">
        <span v-for="item in local" :key="item.id" class="platform-pill">
          <UIcon :name="item.icon || 'i-lucide-globe'" />
          {{ item.platform }}
        </span>
        <span v-if="!local.length" class="platform-pill muted">Henüz kart yok</span>
      </div>
      <div class="top-bar-right">
        <Transition name="fade">
          <div v-if="isDirty" class="unsaved-badge"><span class="unsaved-dot" />Kaydedilmemiş</div>
        </Transition>
        <UButton size="sm" variant="soft" color="primary" icon="i-lucide-plus" @click="addItem">
          Yeni Kart
        </UButton>
      </div>
    </div>

    <!-- ── Empty state ── -->
    <div v-if="local.length === 0" class="empty-state">
      <UIcon name="i-lucide-layout-grid" class="empty-icon" />
      <p>Henüz sosyal medya kartı yok.</p>
      <UButton size="sm" variant="soft" color="primary" icon="i-lucide-plus" @click="addItem">İlk Kartı Ekle</UButton>
    </div>

    <!-- ── Social cards ── -->
    <div v-for="(item, i) in local" :key="item.id" class="cms-card">

      <!-- card header -->
      <div class="cms-card-hd">
        <div class="cms-card-hd-l">
          <div class="platform-icon-wrap">
            <UIcon :name="item.icon || 'i-lucide-globe'" class="platform-icon" />
          </div>
          <div>
            <span class="card-ttl">{{ item.platform || '(Platform girilmedi)' }}</span>
            <span class="card-sub">{{ item.handle || '(Handle girilmedi)' }} · <span class="type-tag">{{ item.type }}</span></span>
          </div>
        </div>
        <div class="cms-card-hd-r">
          <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="local.splice(i,1); isDirty=true" />
        </div>
      </div>

      <!-- core fields -->
      <div class="cms-card-bd">

        <!-- Row 1: platform, type, handle, icon -->
        <div class="field-grid-4">
          <div class="cms-field no-border">
            <label class="field-lbl"><UIcon name="i-lucide-globe" class="field-ic" />Platform</label>
            <UInput v-model="item.platform" placeholder="Instagram" size="sm" @input="isDirty=true" />
          </div>
          <div class="cms-field no-border">
            <label class="field-lbl"><UIcon name="i-lucide-tag" class="field-ic" />Tür</label>
            <USelect :model-value="item.type" :items="typeItems" size="sm" @update:model-value="onTypeChange(item, $event)" />
          </div>
          <div class="cms-field no-border">
            <label class="field-lbl"><UIcon name="i-lucide-at-sign" class="field-ic" />Handle</label>
            <UInput v-model="item.handle" placeholder="@emre.dijital" size="sm" @input="isDirty=true" />
          </div>
          <div class="cms-field no-border">
            <label class="field-lbl"><UIcon name="i-lucide-sparkles" class="field-ic" />İkon</label>
            <UInput v-model="item.icon" placeholder="i-simple-icons-instagram" size="sm" @input="isDirty=true" />
          </div>
        </div>

        <div class="divider" />

        <!-- Row 2: URL -->
        <div class="cms-field">
          <div class="field-lbl-row">
            <label class="field-lbl"><UIcon name="i-lucide-link" class="field-ic" />URL</label>
          </div>
          <p class="field-hint">Karta tıklandığında açılacak tam URL.</p>
          <UInput v-model="item.url" :placeholder="urlPlaceholderFor(item.type)" type="url" @input="isDirty=true" />
        </div>

        <!-- Conditional: X tweet text -->
        <div v-if="item.type === 'x'" class="cms-field">
          <div class="field-lbl-row">
            <label class="field-lbl"><UIcon name="i-lucide-message-circle" class="field-ic" />Tweet Metni</label>
            <span :class="['cc', charCls(item.text ?? '', 280)]">{{ (item.text ?? '').length }}/280</span>
          </div>
          <p class="field-hint">Kartta gösterilecek tweet içeriği.</p>
          <UTextarea v-model="item.text" :rows="2" placeholder="Yeni makale... 👇" @input="isDirty=true" />
        </div>

        <!-- Conditional: Medium/LinkedIn title -->
        <div v-if="item.type === 'medium' || item.type === 'linkedin'" class="cms-field">
          <div class="field-lbl-row">
            <label class="field-lbl"><UIcon name="i-lucide-heading-2" class="field-ic" />{{ item.type === 'medium' ? 'Makale Başlığı' : 'Profil Unvanı' }}</label>
            <span :class="['cc', charCls(item.title ?? '', 100)]">{{ (item.title ?? '').length }}/100</span>
          </div>
          <UInput v-model="item.title" :placeholder="item.type === 'medium' ? 'Yapay Zeka Çağında Antropoloji' : 'Dijital Antropolog | Araştırmacı'" @input="isDirty=true" />
        </div>

        <!-- Conditional: image -->
        <div v-if="item.type !== 'x'" class="cms-field">
          <div class="field-lbl-row">
            <label class="field-lbl"><UIcon name="i-lucide-image" class="field-ic" />{{ item.type === 'linkedin' ? 'Profil Fotoğrafı' : 'Görsel' }}</label>
          </div>
          <p class="field-hint">{{ item.type === 'linkedin' ? 'LinkedIn kartında gösterilecek profil fotoğrafı.' : 'Kartta kullanılacak görsel URL veya yükle.' }}</p>
          <ImageUpload v-model="item.image" @update:model-value="isDirty=true" />
        </div>

      </div>
    </div>

    <!-- ── Sticky save bar ── -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isDirty" class="sticky-bar">
          <div class="sticky-bar-l"><span class="sb-dot" /><span class="sb-msg">Sosyal medya kartlarında kaydedilmemiş değişiklikler var</span></div>
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
import type { SocialCard } from '~/composables/usePortfolioData'

const props = defineProps<{ portfolioData: Record<string, any> }>()
const emit = defineEmits<{ (e: 'save', portfolio: Record<string, any>): void }>()

const saving = ref(false)
const isDirty = ref(false)

const typeItems = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'X (Twitter)', value: 'x' },
  { label: 'Medium', value: 'medium' },
  { label: 'LinkedIn', value: 'linkedin' },
]

const typeDefaults: Record<string, { platform: string; icon: string; urlPlaceholder: string }> = {
  instagram: { platform: 'Instagram', icon: 'i-simple-icons-instagram', urlPlaceholder: 'https://instagram.com/emre.dijital' },
  x:         { platform: 'X (Twitter)', icon: 'i-simple-icons-x',         urlPlaceholder: 'https://x.com/emredijital' },
  medium:    { platform: 'Medium',      icon: 'i-simple-icons-medium',    urlPlaceholder: 'https://medium.com/@emredijital' },
  linkedin:  { platform: 'LinkedIn',    icon: 'i-simple-icons-linkedin',  urlPlaceholder: 'https://linkedin.com/in/emredijital' },
}

function onTypeChange(item: SocialCard, newType: string) {
  item.type = newType as SocialCard['type']
  const d = typeDefaults[newType]
  if (d) {
    item.platform = d.platform
    item.icon = d.icon
  }
  isDirty.value = true
}

function urlPlaceholderFor(type: string) {
  return typeDefaults[type]?.urlPlaceholder ?? 'https://...'
}

const local = ref<SocialCard[]>([])

function applyProps() { local.value = props.portfolioData?.socials ? JSON.parse(JSON.stringify(props.portfolioData.socials)) : [] }
watch(() => props.portfolioData?.socials, applyProps, { immediate: true })
function discard() { applyProps(); isDirty.value = false }

function addItem() {
  local.value.push({ id: `soc-${Date.now()}`, platform: '', type: 'instagram', handle: '', text: '', title: '', image: '', icon: 'i-simple-icons-instagram', url: '' })
  isDirty.value = true
}

function charCls(v: string, max: number) { const r=v.length/max; return r>=1?'cc--over':r>=0.85?'cc--warn':'cc--ok' }

async function save() {
  saving.value = true
  emit('save', { ...props.portfolioData, socials: local.value })
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
.top-bar-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }

.platform-pills { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.platform-pill {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.2rem 0.6rem; border-radius: 999px;
  background: #f1f5f9; border: 1px solid #e2e8f0;
  font-size: 0.75rem; color: #475569; font-weight: 500;
}
.platform-pill.muted { color: #94a3b8; }

.unsaved-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 999px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 0.75rem; font-weight: 500; }
.unsaved-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; animation: pulse 1.5s ease infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; background: #f8fafc; border-radius: 12px; border: 2px dashed #cbd5e1; color: #94a3b8; font-size: 0.875rem; }
.empty-icon { font-size: 2.5rem; opacity: 0.4; }

.cms-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: box-shadow 0.2s; }
.cms-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.07); }

.cms-card-hd { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1.25rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.cms-card-hd-l { display: flex; align-items: center; gap: 0.75rem; }
.cms-card-hd-r { display: flex; align-items: center; gap: 0.5rem; }

.platform-icon-wrap { width: 2rem; height: 2rem; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.platform-icon { font-size: 1rem; color: #16a34a; }
.card-ttl { display: block; font-size: 0.875rem; font-weight: 600; color: #1e293b; }
.card-sub { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }
.type-tag { background: #e0e7ff; color: #4338ca; border-radius: 4px; padding: 0 0.35rem; font-size: 0.68rem; font-weight: 700; font-family: monospace; }

.cms-card-bd { display: flex; flex-direction: column; }
.field-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-bottom: 1px solid #f1f5f9; }
.divider { height: 1px; background: #f1f5f9; }

.cms-field { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
.cms-field.no-border { border-bottom: none; border-right: 1px solid #f1f5f9; padding: 0.75rem 1rem; }
.cms-field.no-border:last-child { border-right: none; }
.cms-field:last-child { border-bottom: none; }
.cms-field:hover { background: #fafafa; }
.field-lbl-row { display: flex; align-items: center; justify-content: space-between; }
.field-lbl { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 600; color: #374151; }
.field-ic { font-size: 0.85rem; color: #94a3b8; }
.field-hint { font-size: 0.72rem; color: #9ca3af; line-height: 1.4; margin: 0; }
.cc { font-size: 0.7rem; font-family: monospace; font-weight: 600; }
.cc--ok { color: #d1d5db; } .cc--warn { color: #f59e0b; } .cc--over { color: #ef4444; }

.sticky-bar { position: fixed; bottom: 1.5rem; right: 2rem; z-index: 9999; display: flex; align-items: center; gap: 1.25rem; background: #0f172a; color: #f1f5f9; border-radius: 12px; padding: 0.75rem 1rem 0.75rem 1.25rem; box-shadow: 0 8px 32px rgba(0,0,0,0.25); min-width: 320px; }
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }
</style>

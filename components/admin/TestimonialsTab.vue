<template>
  <div class="cms-tab">

    <!-- ── Tab header ── -->
    <div class="tab-head">
      <div class="tab-head-icon">
        <UIcon name="i-lucide-quote" />
      </div>
      <div>
        <h2 class="tab-head-title">Referanslar</h2>
        <p class="tab-head-desc">Sizi önerenler ve alıntılarını yönetin. Her referansın TR/EN versiyonu vardır.</p>
      </div>
    </div>

    <!-- ── Top bar ── -->
    <div class="top-bar">
      <div class="lang-switch">
        <button :class="['lang-btn', lang === 'tr' && 'lang-btn--on']" @click="lang = 'tr'">🇹🇷 Türkçe</button>
        <button :class="['lang-btn', lang === 'en' && 'lang-btn--on']" @click="lang = 'en'">🇬🇧 English</button>
      </div>
      <div class="top-bar-right">
        <Transition name="fade">
          <div v-if="isDirty" class="unsaved-badge"><span class="unsaved-dot" />Kaydedilmemiş değişiklikler</div>
        </Transition>
        <UButton size="sm" variant="soft" color="primary" icon="i-lucide-plus" @click="addItem">
          Yeni Referans
        </UButton>
      </div>
    </div>

    <!-- ── Empty state ── -->
    <div v-if="local.length === 0" class="empty-state">
      <UIcon name="i-lucide-message-square-dashed" class="empty-icon" />
      <p>Henüz referans yok.</p>
      <UButton size="sm" variant="soft" color="primary" icon="i-lucide-plus" @click="addItem">İlk Referansı Ekle</UButton>
    </div>

    <!-- ── Testimonial cards ── -->
    <div v-for="(item, i) in local" :key="item.id" class="cms-card">

      <!-- card header: identity info -->
      <div class="cms-card-hd">
        <div class="cms-card-hd-l">
          <div class="avatar-circle">
            {{ item.name ? item.name.charAt(0).toUpperCase() : '?' }}
          </div>
          <div>
            <span class="card-ttl">{{ item.name || '(İsim girilmedi)' }}</span>
            <span class="card-sub">{{ item.organization || '(Kurum girilmedi)' }}</span>
          </div>
        </div>
        <div class="cms-card-hd-r">
          <span class="item-id">{{ item.id }}</span>
          <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="local.splice(i,1); isDirty=true" />
        </div>
      </div>

      <!-- identity fields -->
      <div class="identity-strip">
        <div class="id-field">
          <label class="field-lbl"><UIcon name="i-lucide-hash" class="field-ic" />ID</label>
          <UInput v-model="item.id" placeholder="ayse" size="sm" @input="isDirty=true" />
        </div>
        <div class="id-field flex-grow">
          <label class="field-lbl"><UIcon name="i-lucide-user" class="field-ic" />İsim</label>
          <UInput v-model="item.name" placeholder="Dr. Ayşe Yılmaz" size="sm" @input="isDirty=true" />
        </div>
        <div class="id-field flex-grow">
          <label class="field-lbl"><UIcon name="i-lucide-building-2" class="field-ic" />Kurum</label>
          <UInput v-model="item.organization" placeholder="İstanbul Üniversitesi" size="sm" @input="isDirty=true" />
        </div>
      </div>

      <!-- language-switched quote + title -->
      <div class="cms-card-bd">
        <div class="cms-field">
          <div class="field-lbl-row">
            <label class="field-lbl">
              <UIcon name="i-lucide-message-square-quote" class="field-ic" />
              {{ lang === 'tr' ? 'Alıntı' : 'Quote' }}
            </label>
            <span :class="['cc', charCls(lang === 'tr' ? item.trQuote : item.enQuote, 320)]">
              {{ (lang === 'tr' ? item.trQuote : item.enQuote).length }}/320
            </span>
          </div>
          <p class="field-hint">{{ lang === 'tr' ? 'Referansın sizden aktardığı alıntı.' : 'The quote attributed to this person.' }}</p>
          <UTextarea
            :model-value="lang === 'tr' ? item.trQuote : item.enQuote"
            :rows="3"
            :placeholder="lang === 'tr' ? 'Çalışmaları hem akademik titizliği hem de yaratıcı bakış açısını bir araya getiriyor…' : 'Their work combines academic rigor with a creative perspective…'"
            class="quote-ta"
            @update:model-value="lang === 'tr' ? item.trQuote = $event : item.enQuote = $event; isDirty=true"
          />
        </div>

        <div class="cms-field">
          <div class="field-lbl-row">
            <label class="field-lbl">
              <UIcon name="i-lucide-briefcase" class="field-ic" />
              {{ lang === 'tr' ? 'Unvan' : 'Title' }}
            </label>
            <span :class="['cc', charCls(lang === 'tr' ? item.trTitle : item.enTitle, 80)]">
              {{ (lang === 'tr' ? item.trTitle : item.enTitle).length }}/80
            </span>
          </div>
          <p class="field-hint">{{ lang === 'tr' ? 'Kişinin unvanı veya rolü.' : 'This person\'s title or role.' }}</p>
          <UInput
            :model-value="lang === 'tr' ? item.trTitle : item.enTitle"
            :placeholder="lang === 'tr' ? 'Dijital Antropoloji Profesörü' : 'Professor of Digital Anthropology'"
            @update:model-value="lang === 'tr' ? item.trTitle = $event : item.enTitle = $event; isDirty=true"
          />
        </div>
      </div>
    </div>

    <!-- ── Sticky save bar ── -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="isDirty" class="sticky-bar">
          <div class="sticky-bar-l"><span class="sb-dot" /><span class="sb-msg">Referanslarda kaydedilmemiş değişiklikler var</span></div>
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
import type { Testimonial } from '~/composables/usePortfolioData'

const props = defineProps<{
  trContent: Record<string, any>
  enContent: Record<string, any>
  portfolioData: Record<string, any>
}>()
const emit = defineEmits<{
  (e: 'save', tr: Record<string, any>, en: Record<string, any>, portfolio: Record<string, any>): void
}>()

const lang = ref<'tr'|'en'>('tr')
const saving = ref(false)
const isDirty = ref(false)

interface LocalTestimonial {
  id: string; name: string; organization: string
  trQuote: string; trTitle: string; enQuote: string; enTitle: string
}
const local = ref<LocalTestimonial[]>([])

function applyProps() {
  const testimonials: Testimonial[] = props.portfolioData?.testimonials ?? []
  local.value = testimonials.map(t => ({
    id: t.id, name: t.name, organization: t.organization,
    trQuote: props.trContent?.testimonials?.[t.id]?.quote ?? '',
    trTitle: props.trContent?.testimonials?.[t.id]?.title ?? '',
    enQuote: props.enContent?.testimonials?.[t.id]?.quote ?? '',
    enTitle: props.enContent?.testimonials?.[t.id]?.title ?? '',
  }))
}
watch([() => props.trContent, () => props.enContent, () => props.portfolioData], applyProps, { immediate: true })

function discard() { applyProps(); isDirty.value = false }

function addItem() {
  local.value.push({ id: `ref-${Date.now()}`, name: '', organization: '', trQuote: '', trTitle: '', enQuote: '', enTitle: '' })
  isDirty.value = true
}

function charCls(v: string, max: number) { const r=v.length/max; return r>=1?'cc--over':r>=0.85?'cc--warn':'cc--ok' }

async function save() {
  saving.value = true
  const portfolioTestimonials: Testimonial[] = local.value.map(t => ({
    id: t.id, name: t.name, organization: t.organization,
    quoteKey: `testimonials.${t.id}.quote`, titleKey: `testimonials.${t.id}.title`,
  }))
  const trPatch: Record<string,any> = { testimonials: { ...props.trContent?.testimonials } }
  const enPatch: Record<string,any> = { testimonials: { ...props.enContent?.testimonials } }
  local.value.forEach(t => {
    trPatch.testimonials[t.id] = { quote: t.trQuote, title: t.trTitle }
    enPatch.testimonials[t.id] = { quote: t.enQuote, title: t.enTitle }
  })
  emit('save', trPatch, enPatch, { ...props.portfolioData, testimonials: portfolioTestimonials })
  await nextTick()
  saving.value = false
  isDirty.value = false
}
</script>

<style scoped>
.cms-tab { display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 6rem; }

.tab-head { display: flex; align-items: flex-start; gap: 0.875rem; }
.tab-head-icon { width: 2.25rem; height: 2.25rem; border-radius: 8px; background: #fff7ed; border: 1px solid #fed7aa; display: flex; align-items: center; justify-content: center; color: #ea580c; font-size: 1rem; flex-shrink: 0; }
.tab-head-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.tab-head-desc  { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }

.top-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.top-bar-right { display: flex; align-items: center; gap: 0.75rem; }
.lang-switch { display: flex; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 3px; gap: 2px; }
.lang-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 6px; border: none; background: transparent; font-size: 0.8rem; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.15s; }
.lang-btn:hover { background: #e2e8f0; }
.lang-btn--on { background: #fff; color: #0f172a; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
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

.avatar-circle {
  width: 2rem; height: 2rem; border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff; font-size: 0.875rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.card-ttl { display: block; font-size: 0.875rem; font-weight: 600; color: #1e293b; }
.card-sub { display: block; font-size: 0.75rem; color: #94a3b8; }
.item-id { font-size: 0.68rem; color: #94a3b8; font-family: monospace; background: #f1f5f9; padding: 0.15rem 0.5rem; border-radius: 4px; }

/* identity strip */
.identity-strip {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  padding: 0.75rem 1.25rem;
  background: #fafafa;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.id-field { display: flex; flex-direction: column; gap: 0.3rem; min-width: 100px; }
.flex-grow { flex: 1; }
.field-lbl { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 600; color: #374151; }
.field-ic { font-size: 0.85rem; color: #94a3b8; }

.cms-card-bd { display: flex; flex-direction: column; }
.cms-field { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
.cms-field:last-child { border-bottom: none; }
.cms-field:hover { background: #fafafa; }
.field-lbl-row { display: flex; align-items: center; justify-content: space-between; }
.field-hint { font-size: 0.72rem; color: #9ca3af; line-height: 1.4; margin: 0; }
.cc { font-size: 0.7rem; font-family: monospace; font-weight: 600; }
.cc--ok { color: #d1d5db; } .cc--warn { color: #f59e0b; } .cc--over { color: #ef4444; }
.quote-ta :deep(textarea) { font-style: italic; }

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

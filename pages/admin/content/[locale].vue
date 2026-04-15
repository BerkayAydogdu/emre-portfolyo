<template>
  <div class="editor-page">

    <!-- Top bar -->
    <div class="topbar">
      <div class="topbar-left">
        <div class="lang-badge" :class="locale">
          {{ locale === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English' }}
        </div>
        <div>
          <h1 class="page-title">İçerik Düzenleyici</h1>
          <p class="page-hint">Aşağıdaki alanları düzenle, sonra sağ üstteki <strong>Kaydet</strong> butonuna bas.</p>
        </div>
      </div>
      <div class="topbar-right">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-rotate-ccw"
          :loading="resetting"
          @click="resetToDefault"
        >
          Sıfırla
        </UButton>
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
    </div>

    <!-- Status banners -->
    <transition name="fade">
      <div v-if="isDirty" class="banner banner-warning">
        <UIcon name="i-lucide-pencil" />
        Kaydedilmemiş değişiklikler var — yukarıdaki <strong>Kaydet</strong> butonuna basmayı unutma.
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

    <!-- Loading -->
    <div v-if="pending" class="loading-state">
      <UIcon name="i-lucide-loader-circle" class="spin" />
      <span>Yükleniyor...</span>
    </div>

    <!-- Sections -->
    <div v-else class="sections">
      <div
        v-for="section in CONTENT_SCHEMA"
        :key="section.key"
        class="section"
      >
        <!-- Section header -->
        <div class="section-header">
          <div class="section-icon-wrap">
            <UIcon :name="section.icon" class="section-icon" />
          </div>
          <div>
            <div class="section-name">{{ section.label }}</div>
            <div class="section-desc">{{ section.description }}</div>
          </div>
        </div>

        <!-- Fields grid -->
        <div class="fields-grid">
          <div
            v-for="field in section.fields"
            :key="field.path"
            :class="['field-block', field.type === 'textarea' ? 'field-wide' : '', field.type === 'list' ? 'field-wide' : '']"
          >
            <label class="field-label">{{ field.label }}</label>
            <p v-if="field.hint" class="field-hint">{{ field.hint }}</p>

            <!-- List field -->
            <div v-if="field.type === 'list'" class="list-field">
              <div
                v-for="(item, idx) in getList(field.path)"
                :key="idx"
                class="list-row"
              >
                <span class="list-num">{{ idx + 1 }}</span>
                <UInput
                  :model-value="item"
                  class="list-input"
                  @update:model-value="setListItem(field.path, idx, $event)"
                />
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  size="sm"
                  @click="removeListItem(field.path, idx)"
                />
              </div>
              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-plus"
                size="sm"
                class="list-add"
                @click="addListItem(field.path)"
              >
                Yeni satır ekle
              </UButton>
            </div>

            <!-- Textarea -->
            <UTextarea
              v-else-if="field.type === 'textarea'"
              :model-value="getString(field.path)"
              :rows="4"
              resize
              @update:model-value="setString(field.path, $event)"
            />

            <!-- Input -->
            <UInput
              v-else
              :model-value="getString(field.path)"
              @update:model-value="setString(field.path, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky bottom save bar -->
    <Teleport to="body">
      <transition name="slide-up">
        <div v-if="isDirty" class="save-bar">
          <span class="save-bar-text">
            <UIcon name="i-lucide-alert-circle" />
            Kaydedilmemiş değişiklikler var
          </span>
          <UButton color="primary" icon="i-lucide-save" :loading="saving" @click="save">
            Kaydet
          </UButton>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { CONTENT_SCHEMA } from '~/utils/contentSchema'
import { deepGet, deepSet } from '~/utils/deepSet'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const locale = computed(() => route.params.locale as 'tr' | 'en')

const { data: rawData, pending, refresh } = await useFetch<Record<string, unknown>>(
  () => `/api/admin/content/${locale.value}`,
  { watch: [locale] }
)

const content = ref<Record<string, unknown>>({})
const lastSaved = ref('')

watch(rawData, (val) => {
  if (val) {
    content.value = JSON.parse(JSON.stringify(val))
    lastSaved.value = JSON.stringify(val)
  }
}, { immediate: true })

const isDirty = computed(() => JSON.stringify(content.value) !== lastSaved.value)

function getString(path: string): string {
  return (deepGet(content.value, path) as string) ?? ''
}
function setString(path: string, value: string) {
  deepSet(content.value, path, value)
}
function getList(path: string): string[] {
  return (deepGet(content.value, path) as string[]) ?? []
}
function setListItem(path: string, idx: number, value: string) {
  const list = [...getList(path)]
  list[idx] = value
  deepSet(content.value, path, list)
}
function addListItem(path: string) {
  deepSet(content.value, path, [...getList(path), ''])
}
function removeListItem(path: string, idx: number) {
  deepSet(content.value, path, getList(path).filter((_, i) => i !== idx))
}

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

async function save() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  try {
    await $fetch(`/api/admin/content/${locale.value}`, {
      method: 'PUT',
      body: content.value,
    })
    lastSaved.value = JSON.stringify(content.value)
    saveSuccess.value = true
    setTimeout(() => (saveSuccess.value = false), 4000)
  }
  catch (err: unknown) {
    saveError.value = (err as { data?: { message?: string } })?.data?.message ?? 'Kaydetme başarısız oldu.'
  }
  finally {
    saving.value = false
  }
}

const resetting = ref(false)
async function resetToDefault() {
  if (!confirm('Tüm değişiklikler silinip varsayılan içeriğe dönülecek. Emin misin?')) return
  resetting.value = true
  try {
    await $fetch(`/api/admin/content/${locale.value}`, { method: 'DELETE' })
    await refresh()
  }
  catch {
    saveError.value = 'Sıfırlama başarısız.'
  }
  finally {
    resetting.value = false
  }
}

onBeforeRouteLeave(() => {
  if (isDirty.value) return confirm('Kaydedilmemiş değişiklikler var. Ayrılmak istediğinden emin misin?')
})
</script>

<style scoped>
.editor-page {
  padding-bottom: 80px; /* room for sticky bar */
}

/* ── Top bar ─────────────────────────────────────────────────────── */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.lang-badge {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  white-space: nowrap;
  background: rgba(124, 58, 237, 0.15);
  color: var(--accent);
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 2px;
  color: var(--text-base);
}

.page-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.topbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* ── Banners ─────────────────────────────────────────────────────── */
.banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 14px;
}

.banner-warning {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  color: #fbbf24;
}

.banner-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.banner-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

/* ── Loading ─────────────────────────────────────────────────────── */
.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 15px;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Sections ────────────────────────────────────────────────────── */
.sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: #12121f;
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--primary);
  border-radius: 12px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  background: rgba(124, 58, 237, 0.06);
  border-bottom: 1px solid var(--border-subtle);
}

.section-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-icon {
  font-size: 18px;
  color: var(--accent);
}

.section-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-base);
  margin-bottom: 2px;
}

.section-desc {
  font-size: 13px;
  color: var(--text-muted);
}

/* ── Fields grid ─────────────────────────────────────────────────── */
.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
  padding: 24px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-wide {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-base);
}

.field-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  margin-top: -2px;
}

/* ── List field ──────────────────────────────────────────────────── */
.list-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-num {
  width: 22px;
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.list-input {
  flex: 1;
}

.list-add {
  align-self: flex-start;
  margin-top: 4px;
}

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
  border: 1px solid rgba(167, 139, 250, 0.4);
  border-radius: 14px;
  padding: 12px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.save-bar-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* ── Transitions ─────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

@media (max-width: 700px) {
  .fields-grid { grid-template-columns: 1fr; }
  .field-wide { grid-column: 1; }
  .topbar { flex-direction: column; align-items: flex-start; }
}
</style>

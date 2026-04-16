<template>
  <div class="img-upload">
    <div
      class="drop-zone"
      :class="{ 'drop-zone--active': dragOver, 'drop-zone--has-preview': !!modelValue }"
      @dragenter.prevent="dragOver = true"
      @dragleave.prevent="onDragLeave"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div v-if="modelValue" class="img-preview-wrap">
        <img :src="modelValue" class="img-preview" alt="Önizleme" />
        <button type="button" class="img-remove" @click="emit('update:modelValue', '')">
          <UIcon name="i-lucide-x" />
        </button>
      </div>
      <div v-else class="drop-placeholder">
        <UIcon name="i-lucide-image-plus" class="drop-icon" />
        <p class="drop-title">Görseli sürükleyip bırakın</p>
        <p class="drop-sub">veya alttan URL girin / dosya yükleyin</p>
      </div>
    </div>

    <div class="img-controls">
      <UInput
        :model-value="modelValue"
        placeholder="https://ornek.com/gorsel.jpg"
        size="md"
        class="url-input"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <label class="upload-btn" :class="{ 'upload-btn--busy': uploading }">
        <UIcon name="i-lucide-upload" />
        <span>{{ uploading ? 'Yükleniyor…' : 'Dosya seç' }}</span>
        <input type="file" accept="image/*" class="hidden-input" @change="handleFile" />
      </label>
    </div>
    <p v-if="hint" class="field-hint">{{ hint }}</p>
    <p v-if="error" class="upload-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    hint?: string
  }>(),
  { modelValue: '', hint: '' },
)

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const uploading = ref(false)
const error = ref('')
const dragOver = ref(false)

function onDragLeave(ev: DragEvent) {
  const related = ev.relatedTarget as Node | null
  if (ev.currentTarget && related && (ev.currentTarget as Node).contains(related)) return
  dragOver.value = false
}

async function uploadFile(file: File) {
  if (!file.type.startsWith('image/')) {
    error.value = 'Yalnızca görsel dosyaları yükleyebilirsiniz.'
    return
  }
  uploading.value = true
  error.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ url: string }>('/api/admin/upload', { method: 'POST', body: fd })
    emit('update:modelValue', res.url)
  }
  catch (e: any) {
    error.value = e?.data?.message ?? 'Yükleme başarısız.'
  }
  finally {
    uploading.value = false
  }
}

async function handleFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await uploadFile(file)
  input.value = ''
}

async function onDrop(ev: DragEvent) {
  dragOver.value = false
  const file = ev.dataTransfer?.files?.[0]
  if (file) await uploadFile(file)
}
</script>

<style scoped>
.img-upload {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  min-height: 140px;
  transition: border-color 0.2s, background 0.2s;
}

.drop-zone--active {
  border-color: #7c3aed;
  background: #f5f3ff;
}

.drop-zone--has-preview {
  min-height: auto;
  padding: 0;
  border-style: solid;
  border-color: #e2e8f0;
}

.img-preview-wrap {
  position: relative;
  width: 100%;
  max-height: 200px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.img-preview {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  display: block;
}

.img-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  border: none;
  border-radius: 999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.img-remove:hover {
  background: rgba(0, 0, 0, 0.85);
}

.drop-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.75rem 1rem;
  text-align: center;
  color: #64748b;
}

.drop-icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.5rem;
  color: #94a3b8;
}

.drop-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: #475569;
}

.drop-sub {
  font-size: 0.75rem;
  margin: 0;
  color: #94a3b8;
}

.img-controls {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
  flex-wrap: wrap;
}

.url-input {
  flex: 1;
  min-width: 180px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: #7c3aed;
  color: #fff;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, opacity 0.15s;
}

.upload-btn:hover:not(.upload-btn--busy) {
  background: #6d28d9;
}

.upload-btn--busy {
  opacity: 0.75;
  pointer-events: none;
}

.hidden-input {
  display: none;
}

.field-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.upload-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin: 0;
}
</style>

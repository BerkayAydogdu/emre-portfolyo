<template>
  <div class="upload-wrapper">

    <!-- Preview mode -->
    <div v-if="localUrl" class="preview-box">
      <img :src="localUrl" class="preview-img" alt="Önizleme" />
      <UButton
        color="error"
        variant="solid"
        icon="i-lucide-x"
        size="xs"
        class="remove-btn"
        @click.prevent="removeImage"
      />
    </div>

    <!-- Edit mode -->
    <div v-else class="edit-mode">
      <!-- URL paste input -->
      <div class="url-input-row">
        <UInput
          v-model="urlInput"
          placeholder="https://... adresini yapıştır"
          icon="i-lucide-link"
          class="url-input"
          @keydown.enter.prevent="applyUrl"
        />
        <UButton
          color="primary"
          variant="soft"
          :disabled="!urlInput.trim()"
          @click="applyUrl"
        >
          Uygula
        </UButton>
      </div>

      <div class="divider"><span>veya dosya yükle</span></div>

      <!-- Dropzone -->
      <div
        class="dropzone"
        :class="{ 'is-dragover': isDragging, 'is-uploading': isUploading }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <input
          type="file"
          accept="image/*"
          class="file-input"
          :disabled="isUploading"
          @change="handleFileChange"
        />
        <UIcon v-if="!isUploading" name="i-lucide-image-plus" class="drop-icon" />
        <UIcon v-else name="i-lucide-loader-2" class="drop-icon spin" />
        <p class="drop-text">
          {{ isUploading ? 'Yükleniyor...' : 'Sürükleyip bırak veya tıkla' }}
        </p>
      </div>

      <!-- Error -->
      <UAlert
        v-if="errorMsg"
        color="error"
        variant="soft"
        :title="errorMsg"
        icon="i-lucide-alert-circle"
        class="upload-error"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const localUrl = ref(props.modelValue || '')
const urlInput = ref('')
const isUploading = ref(false)
const isDragging = ref(false)
const errorMsg = ref('')

watch(() => props.modelValue, (val) => { localUrl.value = val || '' })

function applyUrl() {
  const url = urlInput.value.trim()
  if (!url) return
  localUrl.value = url
  emit('update:modelValue', url)
  urlInput.value = ''
  errorMsg.value = ''
}

function removeImage() {
  localUrl.value = ''
  emit('update:modelValue', '')
}

async function uploadFile(file: File) {
  if (!file.type.startsWith('image/')) {
    errorMsg.value = 'Sadece resim dosyaları yüklenebilir.'
    return
  }
  isUploading.value = true
  errorMsg.value = ''
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await $fetch<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    if (res?.url) {
      localUrl.value = res.url
      emit('update:modelValue', res.url)
    }
  }
  catch (err: unknown) {
    const msg = (err as { data?: { message?: string } })?.data?.message
    errorMsg.value = msg || 'Yükleme başarısız. URL yapıştırmayı deneyin.'
  }
  finally {
    isUploading.value = false
    isDragging.value = false
  }
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadFile(file)
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadFile(file)
}
</script>

<style scoped>
.upload-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Preview */
.preview-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute !important;
  top: 8px;
  right: 8px;
}

/* Edit mode */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.url-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.url-input {
  flex: 1;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

/* Dropzone */
.dropzone {
  position: relative;
  border: 2px dashed #c4b5fd;
  border-radius: 10px;
  background: #faf5ff;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  cursor: pointer;
}

.dropzone:hover,
.dropzone.is-dragover {
  border-color: #7c3aed;
  background: #ede9fe;
}

.dropzone.is-uploading {
  opacity: 0.7;
  cursor: wait;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.drop-icon {
  font-size: 24px;
  color: #a78bfa;
}

.drop-text {
  font-size: 13px;
  color: #7c3aed;
  margin: 0;
  font-weight: 500;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-error {
  margin-top: 4px;
}
</style>

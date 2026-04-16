<template>
  <div class="live-preview">
    <div class="preview-header">
      <UIcon name="i-lucide-eye" class="preview-header-icon" />
      <span class="preview-title">Canlı önizleme</span>
      <UBadge v-if="langLabel" color="neutral" variant="subtle" size="xs">{{ langLabel }}</UBadge>
    </div>
    <div class="preview-card">
      <div v-if="image" class="preview-cover">
        <img :src="image" alt="" class="preview-img" />
      </div>
      <div v-else class="preview-cover preview-cover--empty">
        <UIcon name="i-lucide-image-off" class="preview-ph-icon" />
        <span>Görsel yok</span>
      </div>
      <div class="preview-body">
        <p v-if="category" class="preview-cat">{{ category }}</p>
        <h3 class="preview-h">{{ title || placeholderTitle }}</h3>
        <p class="preview-ex">{{ excerpt || placeholderExcerpt }}</p>
        <div v-if="sanitizedBody" class="preview-html" v-html="sanitizedBody" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    excerpt: string
    image?: string
    category?: string
    bodyHtml?: string
    langLabel?: string
    placeholderTitle?: string
    placeholderExcerpt?: string
  }>(),
  {
    image: '',
    category: '',
    bodyHtml: '',
    langLabel: '',
    placeholderTitle: 'Başlık burada görünür',
    placeholderExcerpt: 'Kısa açıklama veya özet burada görünür.',
  },
)

const sanitizedBody = computed(() => {
  const raw = props.bodyHtml?.trim() ?? ''
  if (!raw || raw === '<p></p>') return ''
  return raw
})
</script>

<style scoped>
.live-preview {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.preview-header-icon {
  width: 1rem;
  height: 1rem;
  color: #7c3aed;
}

.preview-title {
  flex: 1;
}

.preview-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.preview-cover {
  aspect-ratio: 16 / 9;
  background: #f1f5f9;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-cover--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: #94a3b8;
  font-size: 0.75rem;
}

.preview-ph-icon {
  width: 1.5rem;
  height: 1.5rem;
  opacity: 0.6;
}

.preview-body {
  padding: 1rem 1.1rem 1.15rem;
}

.preview-cat {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7c3aed;
  margin: 0 0 0.35rem;
}

.preview-h {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem;
  line-height: 1.25;
}

.preview-ex {
  font-size: 0.85rem;
  line-height: 1.55;
  color: #64748b;
  margin: 0 0 0.75rem;
}

.preview-html {
  font-size: 0.8rem;
  line-height: 1.55;
  color: #334155;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.75rem;
  max-height: 220px;
  overflow-y: auto;
}

.preview-html :deep(p) {
  margin: 0 0 0.5rem;
}
.preview-html :deep(h2) {
  font-size: 0.95rem;
  margin: 0.5rem 0 0.25rem;
}
</style>

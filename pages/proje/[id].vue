<template>
  <div class="project-reader-page">
    <NavBar />

    <main class="reader-mode" v-if="project">
      
      <!-- HERO HEADER -->
      <header class="project-header" :class="{ 'has-cover': project.image }">
        <div class="cover-bg" v-if="project.image">
          <img :src="project.image" alt="" />
          <div class="cover-scrim" aria-hidden="true" />
          <div class="cover-overlay" aria-hidden="true" />
        </div>
        
        <div class="header-content">
          <div class="meta-row whitespace-nowrap overflow-x-auto no-scrollbar">
            <span class="category-badge">
              <UIcon name="i-lucide-folder-open" class="mr-2" />
              {{ project.category || 'Araştırma' }}
            </span>
            <div class="tag-list">
              <span v-for="tag in project.tags" :key="tag" class="tech-tag">#{{ tag }}</span>
            </div>
          </div>
          
          <h1 class="project-title">{{ $t(project.titleKey) }}</h1>
          
          <p class="lead-description">
            {{ $t(project.descriptionKey) }}
          </p>
        </div>
      </header>

      <!-- PROJECT BODY -->
      <article class="reader-body">
        
        <div v-if="project.body" class="generated-content" v-html="project.body"></div>
        <div v-else class="empty-body-state">
          <UIcon name="i-lucide-file-plus" class="empty-icon" />
          <p>Bu proje için henüz içerik eklenmemiş.</p>
        </div>
        
      </article>
      
      <div class="back-action">
        <UButton to="/#digital-mind" icon="i-lucide-arrow-left" color="neutral" variant="solid" size="lg">
            Ana Ekrana Dön
        </UButton>
      </div>
    </main>
    
    <!-- NOT FOUND -->
    <div v-else class="not-found-state">
      <UIcon name="i-lucide-package-x" class="not-found-icon" />
      <h2 class="not-found-title">Proje Bulunamadı</h2>
      <UButton to="/#digital-mind" color="primary" size="lg">Sisteme Geri Dön</UButton>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const id = route.params.id as string
const { t } = useI18n()
const { projects } = usePortfolioDataRuntime()

const project = computed(() => {
  return projects.value.find(p => p.id === id)
})
</script>

<style scoped>
.project-reader-page {
  min-height: 100vh;
  background: var(--bg-body);
  padding-bottom: 5rem;
}

.reader-mode {
  width: 100%;
}

/* HEADER */
.project-header {
  position: relative;
  width: 100%;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 8rem 5% 4rem;
  overflow: hidden;
  border-bottom: 1px solid var(--border-subtle);
}

.project-header.has-cover {
  min-height: 65vh;
}

.cover-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.cover-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(1.2);
}

/* Darken photo so title/tags stay readable in light & dark site theme */
.cover-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.35) 45%,
    rgba(0, 0, 0, 0.82) 100%
  );
}

.cover-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 52%,
    var(--bg) 100%
  );
}

.header-content {
  position: relative;
  z-index: 10;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

/* Image heroes: always light copy + shadow (fixes dark text on dark rocks in light mode) */
.project-header.has-cover .project-title,
.project-header.has-cover .lead-description {
  color: #f8fafc;
  text-shadow:
    0 2px 28px rgba(0, 0, 0, 0.9),
    0 1px 3px rgba(0, 0, 0, 0.95);
}

.project-header.has-cover .category-badge {
  background: rgba(124, 58, 237, 0.35);
  border-color: rgba(196, 181, 253, 0.45);
  color: #ede9fe;
}

.project-header.has-cover .tech-tag {
  color: rgba(248, 250, 252, 0.95);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.28);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.2);
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
  font-family: 'Space Grotesk', sans-serif;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: rgba(15, 15, 26, 0.4);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
}

.project-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: var(--text-base);
}

.lead-description {
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 800px;
  font-weight: 500;
  color: var(--text-base);
}

/* BODY */
.reader-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-base);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.info-card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  padding: 1.5rem;
  border-radius: 12px;
}

.info-icon {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.info-title {
  font-weight: 700;
  color: var(--text-base);
  margin-bottom: 0.25rem;
}

.info-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Generated Content */
.generated-content :deep(h1),
.generated-content :deep(h2),
.generated-content :deep(h3) {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--text-base);
  margin: 2.5rem 0 1.5rem;
}

.generated-content :deep(h2) { font-size: 2rem; }
.generated-content :deep(h3) { font-size: 1.5rem; }

.generated-content :deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.generated-content :deep(blockquote) {
  font-size: 1.4rem;
  font-style: italic;
  border-left: 2px solid rgba(124, 58, 237, 0.4);
  padding: 1.5rem 2rem;
  margin: 3rem 0;
  border-radius: 0 16px 16px 0;
  background: rgba(124, 58, 237, 0.05);
  color: var(--primary);
}

.generated-content :deep(ul), .generated-content :deep(ol) {
  margin: 1.5rem 0;
  padding-left: 2rem;
}

.generated-content :deep(li) {
  margin-bottom: 0.5rem;
}

.generated-content :deep(a) {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.generated-content :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 2rem 0;
}

.empty-body-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.empty-icon { font-size: 2.5rem; opacity: 0.4; }

.back-action {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
  display: flex;
  justify-content: center;
}

.not-found-state {
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.not-found-icon {
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--text-base);
  margin-bottom: 1.5rem;
}
</style>

<template>
  <div class="article-reader-page">
    <NavBar />

    <main class="reader-mode" v-if="article">
      <!-- HERO HEADER -->
      <header class="reader-header" :class="{ 'has-cover': article.image }">
        <div class="cover-bg" v-if="article.image">
          <img :src="article.image" alt="" />
          <div class="cover-scrim" aria-hidden="true" />
          <div class="cover-overlay" aria-hidden="true" />
        </div>
        
        <div class="header-content">
          <div class="meta-tags">
            <span class="category-tag">{{ article.category }}</span>
            <span class="read-time"><UIcon name="i-lucide-clock" class="mr-1" inline />{{ article.readMinutes }} dk okuma</span>
          </div>
          
          <h1 class="article-title">{{ $t(article.titleKey) }}</h1>
          
          <div class="author-block">
            <UAvatar src="/images/emre-avatar.jpg" alt="Emre" size="lg" />
            <div class="author-info">
              <span class="author-name">Emre</span>
              <span class="article-date">{{ formatDate(article.date) }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ARTICLE BODY -->
      <article class="reader-body">
        <p class="lead-excerpt">
          {{ $t(article.excerptKey) }}
        </p>

        <div v-if="article.body" class="generated-content" v-html="article.body"></div>
        <div v-else class="empty-body-state">
          <UIcon name="i-lucide-file-plus" class="empty-icon" />
          <p>Bu yazı için henüz içerik eklenmemiş.</p>
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
      <UIcon name="i-lucide-search-x" class="not-found-icon" />
      <h2 class="not-found-title">Makale Bulunamadı</h2>
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
const slug = route.params.slug as string
const { t } = useI18n()
const { articles } = usePortfolioDataRuntime()

const article = computed(() => {
  return articles.value.find(a => a.slug === slug)
})



function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.article-reader-page {
  min-height: 100vh;
  background: var(--bg-body);
  padding-bottom: 5rem;
}

.reader-mode {
  width: 100%;
}

/* HEADER */
.reader-header {
  position: relative;
  width: 100%;
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 8rem 5% 4rem;
  overflow: hidden;
  border-bottom: 1px solid rgba(167, 139, 250, 0.1);
}

.reader-header.has-cover {
  min-height: 60vh;
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
}

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
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.reader-header.has-cover .article-title {
  color: #f8fafc;
  text-shadow:
    0 2px 28px rgba(0, 0, 0, 0.9),
    0 1px 3px rgba(0, 0, 0, 0.95);
}

.reader-header.has-cover .category-tag {
  color: #e9d5ff;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8);
}

.reader-header.has-cover .read-time {
  color: rgba(248, 250, 252, 0.88);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.75);
}

.reader-header.has-cover .author-name {
  color: #f8fafc;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.85);
}

.reader-header.has-cover .article-date {
  color: rgba(226, 232, 240, 0.9);
}

.reader-header.has-cover :deep(img) {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
}

.meta-tags {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.category-tag {
  color: #c084fc;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.read-time {
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.article-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.1;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
  color: var(--text-base);
}

.author-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--text-base);
}

.article-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* BODY */
.reader-body {
  max-width: 740px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  font-family: 'Merriweather', 'Georgia', serif;
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-base);
}

.lead-excerpt {
  font-size: 1.5rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  border-left: 4px solid var(--primary);
  padding-left: 1.5rem;
  color: var(--text-base);
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
  max-width: 740px;
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

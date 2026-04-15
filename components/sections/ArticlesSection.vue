<template>
  <section id="articles" class="section grid-bg">
    <div class="section-inner">
      <div ref="headerEl" class="section-header">
        <span class="section-label">{{ $t('articles.label') }}</span>
        <h2 class="section-title">{{ $t('articles.title') }}</h2>
        <p class="section-subtitle">{{ $t('articles.subtitle') }}</p>
      </div>

      <!-- Tab Navigation -->
      <div class="articles-tabs">
        <button
          class="articles-tab"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          {{ locale === 'tr' ? 'Tümü' : 'All' }}
          <span class="tab-count">{{ articles.length }}</span>
        </button>
        <button
          class="articles-tab"
          :class="{ active: activeTab === 'dusunce' }"
          @click="activeTab = 'dusunce'"
        >
          {{ locale === 'tr' ? 'Düşünceler' : 'Thoughts' }}
          <span class="tab-count">{{ dusunceArticles.length }}</span>
        </button>
        <button
          class="articles-tab"
          :class="{ active: activeTab === 'analiz' }"
          @click="activeTab = 'analiz'"
        >
          {{ locale === 'tr' ? 'Analizler' : 'Analysis' }}
          <span class="tab-count">{{ analizArticles.length }}</span>
        </button>
      </div>

      <div ref="listEl" class="articles-list">
        <TransitionGroup name="article-fade">
          <article
            v-for="article in filteredArticles"
            :key="article.id"
            class="article-card"
          >
            <!-- Image area (Optional) -->
            <div v-if="article.image" class="article-img-wrap">
              <img :src="article.image" :alt="$t(article.titleKey)" class="article-img" loading="lazy" />
            </div>

            <!-- Content Container -->
            <div class="article-content-wrapper">
              <!-- Meta row -->
              <div class="article-meta">
                <span class="article-category">{{ article.category }}</span>
                <span class="article-type-badge" :class="article.type">
                  {{ article.type === 'dusunce' ? (locale === 'tr' ? 'Düşünce' : 'Thought') : (locale === 'tr' ? 'Analiz' : 'Analysis') }}
                </span>
                <span class="article-date">{{ formatDate(article.date) }}</span>
                <span class="article-read">{{ article.readMinutes }} {{ $t('articles.readMin') }}</span>
              </div>

              <!-- Content -->
              <div class="article-body">
                <h3 class="article-title">{{ $t(article.titleKey) }}</h3>
                <p class="article-excerpt">{{ $t(article.excerptKey) }}</p>
              </div>

              <!-- Footer -->
              <div class="article-footer">
                <a href="#" class="article-link" @click.prevent>
                  {{ $t('articles.readMore') }}
                </a>
              </div>
            </div>

            <div class="card-glow" />
          </article>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import type { Article } from '~/composables/usePortfolioData'

const { articles } = usePortfolioDataRuntime()
const { locale } = useI18n()

const headerEl = ref<HTMLElement>()
const listEl = ref<HTMLElement>()

// Tab state
const activeTab = ref<'all' | 'dusunce' | 'analiz'>('all')

const dusunceArticles = computed(() =>
  articles.value.filter((a: Article) => a.type === 'dusunce')
)
const analizArticles = computed(() =>
  articles.value.filter((a: Article) => a.type === 'analiz')
)
const filteredArticles = computed(() => {
  if (activeTab.value === 'all') return articles.value
  return articles.value.filter((a: Article) => a.type === activeTab.value)
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(() => {
  if (headerEl.value) {
    gsap.from(headerEl.value.children, {
      scrollTrigger: { trigger: headerEl.value, start: 'top 85%' },
      opacity: 0,
      y: 24,
      stagger: 0.1,
      duration: 0.7,
    })
  }
  if (listEl.value) {
    gsap.from('.article-card', {
      scrollTrigger: { trigger: listEl.value, start: 'top 85%' },
      opacity: 0,
      x: -30,
      stagger: 0.15,
      duration: 0.8,
    })
  }
})
</script>

<style scoped>
.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-subtitle {
  margin-top: 0.875rem;
  color: var(--text-muted);
  font-size: 0.975rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* ─── Tabs ─────────────────────────────────────────────────── */
.articles-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.articles-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid var(--border-subtle);
  border-radius: 9999px;
  background: transparent;
  color: var(--text-muted);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.articles-tab::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.1));
  opacity: 0;
  transition: opacity 0.3s;
}

.articles-tab:hover {
  color: var(--text-base);
  border-color: rgba(167, 139, 250, 0.3);
}

.articles-tab:hover::before {
  opacity: 1;
}

.articles-tab.active {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.12));
  color: var(--primary-glow);
  border-color: rgba(167, 139, 250, 0.5);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.15);
}

.articles-tab.active::before {
  opacity: 1;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(124, 58, 237, 0.2);
  color: var(--primary-glow);
  transition: all 0.3s;
}

.articles-tab.active .tab-count {
  background: rgba(167, 139, 250, 0.25);
  color: #fff;
}

/* ─── Card transition ──────────────────────────────────────── */
.article-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.article-fade-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}
.article-fade-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.article-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.article-fade-move {
  transition: transform 0.4s ease;
}

/* ─── List ─────────────────────────────────────────────────── */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.article-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 1.125rem;
  padding: 1.75rem 2rem;
  overflow: hidden;
  transition: border-color 0.3s, transform 0.3s;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.article-content-wrapper {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0 2rem;
  align-items: center;
  flex: 1;
}

/* ─── Image ────────────────────────────────────────────────── */
.article-img-wrap {
  width: 160px;
  aspect-ratio: 16 / 10;
  border-radius: 0.75rem;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border-subtle);
}

.article-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-card:hover .article-img {
  transform: scale(1.08);
}

.article-card:hover {
  border-color: rgba(167, 139, 250, 0.3);
  transform: translateX(4px);
}

.article-card:hover .card-glow {
  opacity: 1;
}

/* Meta */
.article-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 130px;
}

.article-category {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--primary-glow);
}

.article-type-badge {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 6px;
  padding: 0.2rem 0.55rem;
  width: fit-content;
}

.article-type-badge.dusunce {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.25);
}

.article-type-badge.analiz {
  background: rgba(6, 182, 212, 0.12);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.25);
}

.article-date {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.article-read {
  font-size: 0.73rem;
  color: rgba(148, 163, 184, 0.6);
}

/* Body */
.article-body {}

.article-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-base);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.article-excerpt {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.7;
}

/* Footer */
.article-footer {}

.article-link {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--primary-glow);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}

.article-link:hover {
  color: var(--accent);
}

/* Glow */
.card-glow {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40%;
  background: radial-gradient(
    ellipse at 100% 50%,
    rgba(124, 58, 237, 0.06) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}

@media (max-width: 800px) {
  .article-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .article-img-wrap {
    width: 100%;
    aspect-ratio: 21 / 9;
  }

  .article-content-wrapper {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .article-meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-width: unset;
  }

  .articles-tabs {
    gap: 0.375rem;
  }

  .articles-tab {
    padding: 0.5rem 1rem;
    font-size: 0.78rem;
  }
}
</style>

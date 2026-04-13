<template>
  <section id="articles" class="section grid-bg">
    <div class="section-inner">
      <div ref="headerEl" class="section-header">
        <span class="section-label">{{ $t('articles.label') }}</span>
        <h2 class="section-title">{{ $t('articles.title') }}</h2>
        <p class="section-subtitle">{{ $t('articles.subtitle') }}</p>
      </div>

      <div ref="listEl" class="articles-list">
        <article
          v-for="article in articles"
          :key="article.id"
          class="article-card"
        >
          <!-- Meta row -->
          <div class="article-meta">
            <span class="article-category">{{ article.category }}</span>
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

          <div class="card-glow" />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { usePortfolioData } from '~/composables/usePortfolioData'

const { articles } = usePortfolioData()
const { locale } = useI18n()

const headerEl = ref<HTMLElement>()
const listEl = ref<HTMLElement>()

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
  margin-bottom: 3rem;
}

.section-subtitle {
  margin-top: 0.875rem;
  color: var(--text-muted);
  font-size: 0.975rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 1.125rem;
  padding: 1.75rem 2rem;
  overflow: hidden;
  transition: border-color 0.3s, transform 0.3s;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0 2rem;
  align-items: center;
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

@media (max-width: 640px) {
  .article-card {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .article-meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-width: unset;
  }
}
</style>

<template>
  <section id="about" class="section grid-bg">
    <div class="section-inner about-grid">
      <!-- Left: Photo placeholder -->
      <div ref="photoEl" class="about-photo-wrap">
        <div class="photo-frame">
          <div class="photo-placeholder">
            <UIcon name="i-lucide-user-round" class="photo-icon" />
          </div>
        </div>
        <!-- Stats -->
        <div class="stats-row">
          <div v-for="stat in stats" :key="stat.labelKey" class="stat-item">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ $t(stat.labelKey) }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Content -->
      <div ref="contentEl" class="about-content">
        <span class="section-label">{{ $t('about.label') }}</span>
        <h2 class="section-title">{{ $t('about.title') }}</h2>

        <div class="bio">
          <p>{{ $t('about.bio1') }}</p>
          <p>{{ $t('about.bio2') }}</p>
          <p>{{ $t('about.bio3') }}</p>
        </div>

        <!-- Expertise -->
        <div class="expertise-block">
          <h3 class="block-title">{{ $t('about.expertiseTitle') }}</h3>
          <div class="expertise-list">
            <div
              v-for="item in expertise"
              :key="item.key"
              class="expertise-item"
            >
              <UIcon :name="item.icon" class="expertise-icon" />
              <span>{{ $t(item.key) }}</span>
            </div>
          </div>
        </div>

        <!-- Interests -->
        <div class="interests-block">
          <h3 class="block-title">{{ $t('about.interestsTitle') }}</h3>
          <div class="tags-row">
            <span v-for="key in interests" :key="key" class="tag">
              {{ $t(key) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePortfolioData } from '~/composables/usePortfolioData'

const { expertise, interests, stats } = usePortfolioData()

const photoEl = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()

onMounted(() => {
  if (photoEl.value) {
    gsap.from(photoEl.value, {
      scrollTrigger: { trigger: photoEl.value, start: 'top 85%' },
      opacity: 0,
      x: -50,
      duration: 1,
    })
  }
  if (contentEl.value) {
    gsap.from(contentEl.value.children, {
      scrollTrigger: { trigger: contentEl.value, start: 'top 85%' },
      opacity: 0,
      y: 30,
      stagger: 0.12,
      duration: 0.8,
    })
  }
})
</script>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 4rem;
  align-items: start;
}

/* Photo */
.about-photo-wrap {
  position: sticky;
  top: 7rem;
}

.photo-frame {
  border-radius: 1.25rem;
  overflow: hidden;
  border: var(--glow-border);
  box-shadow: var(--glow-shadow);
  aspect-ratio: 4/5;
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(5, 5, 8, 0.6));
}

.photo-icon {
  font-size: 5rem;
  color: rgba(167, 139, 250, 0.3);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.stat-item {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 0.875rem;
  padding: 0.875rem 0.5rem;
  text-align: center;
  transition: border-color 0.3s;
}

.stat-item:hover {
  border-color: rgba(167, 139, 250, 0.3);
}

.stat-value {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-glow);
}

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

/* Content */
.about-content {
  padding-top: 0.5rem;
}

.bio {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0 2rem;
  color: var(--text-muted);
  line-height: 1.8;
  font-size: 0.975rem;
}

.block-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.875rem;
}

/* Expertise */
.expertise-block {
  margin-bottom: 2rem;
}

.expertise-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.expertise-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(15, 15, 26, 0.6);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  transition: all 0.25s;
}

.expertise-item:hover {
  border-color: rgba(167, 139, 250, 0.3);
  color: var(--text-base);
  background: rgba(124, 58, 237, 0.07);
}

.expertise-icon {
  color: var(--primary-glow);
  flex-shrink: 0;
}

/* Interests */
.interests-block {}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .about-photo-wrap {
    position: static;
    max-width: 340px;
    margin: 0 auto;
  }
}
</style>

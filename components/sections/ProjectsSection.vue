<template>
  <section id="projects" class="section">
    <div class="section-inner">
      <!-- Header -->
      <div ref="headerEl" class="section-header">
        <span class="section-label">{{ $t('projects.label') }}</span>
        <h2 class="section-title">{{ $t('projects.title') }}</h2>
        <p class="section-subtitle">{{ $t('projects.subtitle') }}</p>
      </div>

      <!-- Grid -->
      <div ref="gridEl" class="projects-grid">
        <article
          v-for="project in projects"
          :key="project.id"
          class="project-card"
        >
          <!-- Image area -->
          <div class="card-img-wrap">
            <img
              v-if="project.image"
              :src="project.image"
              :alt="$t(project.titleKey)"
              class="card-img"
              loading="lazy"
            />
            <div v-else class="card-img-placeholder">
              <div class="placeholder-pattern" />
              <UIcon name="i-lucide-file-text" class="placeholder-icon" />
            </div>
            <!-- Category badge over image -->
            <span class="img-badge">{{ project.category }}</span>
          </div>

          <!-- Content -->
          <div class="card-content">
            <h3 class="project-title">{{ $t(project.titleKey) }}</h3>
            <p class="project-desc">{{ $t(project.descriptionKey) }}</p>
            <div class="card-tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <!-- Hover glow -->
          <div class="card-glow" />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { usePortfolioData } from '~/composables/usePortfolioData'

const { projects } = usePortfolioData()
const headerEl = ref<HTMLElement>()
const gridEl = ref<HTMLElement>()

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
  if (gridEl.value) {
    gsap.from('.project-card', {
      scrollTrigger: { trigger: gridEl.value, start: 'top 85%' },
      opacity: 0,
      y: 50,
      stagger: 0.12,
      duration: 0.85,
      ease: 'power3.out',
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

/* ─── Grid ─────────────────────────────────────────────────── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* ─── Card ─────────────────────────────────────────────────── */
.project-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 1.125rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.35s, box-shadow 0.35s, border-color 0.3s;
}

.project-card:hover {
  transform: translateY(-6px);
  border-color: rgba(167, 139, 250, 0.3);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.35),
    0 0 30px rgba(124, 58, 237, 0.1);
}

.project-card:hover .card-img {
  transform: scale(1.06);
}

.project-card:hover .card-glow {
  opacity: 1;
}

/* ─── Image ────────────────────────────────────────────────── */
.card-img-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  flex-shrink: 0;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

/* Placeholder when no image */
.card-img-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-pattern {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(79, 70, 229, 0.15) 100%);
}

/* Subtle grid lines in placeholder */
.placeholder-pattern::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(167, 139, 250, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167, 139, 250, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}

.placeholder-icon {
  font-size: 3rem;
  color: rgba(167, 139, 250, 0.25);
  z-index: 1;
}

/* Badge over image */
.img-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 2;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--primary-glow);
  background: rgba(5, 5, 8, 0.75);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 9999px;
  padding: 0.25rem 0.7rem;
}

/* ─── Content ──────────────────────────────────────────────── */
.card-content {
  padding: 1.25rem 1.375rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
}

.project-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-base);
  line-height: 1.4;
}

.project-desc {
  font-size: 0.825rem;
  color: var(--text-muted);
  line-height: 1.7;
  flex: 1;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

/* ─── Hover glow overlay ───────────────────────────────────── */
.card-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(124, 58, 237, 0.07) 0%,
    transparent 65%
  );
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}

/* ─── Responsive ───────────────────────────────────────────── */
@media (max-width: 900px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>

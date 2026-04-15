<template>
  <section id="projects" class="section">
    <div class="section-inner">
      <!-- Header -->
      <div ref="headerEl" class="section-header">
        <span class="section-label">{{ $t('projects.label') }}</span>
        <h2 class="section-title">{{ $t('projects.title') }}</h2>
        <p class="section-subtitle">{{ $t('projects.subtitle') }}</p>
      </div>

      <!-- Tab Navigation -->
      <div class="projects-tabs">
        <button
          class="projects-tab"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          {{ locale === 'tr' ? 'Tümü' : 'All' }}
          <span class="tab-count">{{ projects.length }}</span>
        </button>
        <button
          class="projects-tab"
          :class="{ active: activeTab === 'arastirma' }"
          @click="activeTab = 'arastirma'"
        >
          {{ locale === 'tr' ? 'Araştırmalar' : 'Research' }}
          <span class="tab-count">{{ arastirmaProjects.length }}</span>
        </button>
        <button
          class="projects-tab"
          :class="{ active: activeTab === 'yazi' }"
          @click="activeTab = 'yazi'"
        >
          {{ locale === 'tr' ? 'Yazılar' : 'Writings' }}
          <span class="tab-count">{{ yaziProjects.length }}</span>
        </button>
      </div>

      <!-- Grid -->
      <div ref="gridEl" class="projects-grid">
        <TransitionGroup name="card-fade">
          <article
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            @click="openModal(project)"
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
              <!-- Type badge -->
              <span class="type-badge" :class="project.type">
                {{ project.type === 'arastirma' ? (locale === 'tr' ? 'Araştırma' : 'Research') : (locale === 'tr' ? 'Yazı' : 'Writing') }}
              </span>
            </div>

            <!-- Content -->
            <div class="card-content">
              <h3 class="project-title">{{ $t(project.titleKey) }}</h3>
              <p class="project-desc line-clamp-2">{{ $t(project.descriptionKey) }}</p>
              <div class="card-tags">
                <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>

            <!-- Hover glow -->
            <div class="card-glow" />
          </article>
        </TransitionGroup>
      </div>
    </div>

    <!-- Stunning Custom Modal teleported to body -->
    <Teleport to="body">
      <Transition name="modal-bounce">
        <div v-if="selectedProject" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card">
            <!-- Glow background behind modal -->
            <div class="modal-glow-bg" />
            
            <!-- Animated Bubbles Background -->
            <div class="modal-bubbles" aria-hidden="true">
              <div v-for="n in 6" :key="n" class="bubble" :class="`bubble-${n}`" />
            </div>

            <button class="close-btn" @click="closeModal" aria-label="Kapat">
              <UIcon name="i-lucide-x" />
            </button>

            <!-- Modal Header Image -->
            <div class="modal-hero">
              <img
                v-if="selectedProject.image"
                :src="selectedProject.image"
                :alt="$t(selectedProject.titleKey)"
                class="modal-img"
              />
              <div v-else class="modal-hero-placeholder">
                <div class="hero-pattern" />
                <UIcon name="i-lucide-sparkles" class="hero-icon" />
              </div>
              <div class="hero-overlay" />
              <span class="modal-badge">{{ selectedProject.category }}</span>
            </div>

            <!-- Modal Content -->
            <div class="modal-body">
              <h3 class="modal-title">{{ $t(selectedProject.titleKey) }}</h3>
              
              <div class="modal-tags">
                <span v-for="tag in selectedProject.tags" :key="tag" class="tag glow-tag">
                  {{ tag }}
                </span>
              </div>

              <div class="modal-divider" />

              <p class="modal-desc">{{ $t(selectedProject.descriptionKey) }}</p>

              <div class="modal-footer">
                <button class="modal-action-btn" @click="closeModal">
                  {{ $t('projects.readMore') }}
                  <UIcon name="i-lucide-arrow-right" class="btn-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import type { Project } from '~/composables/usePortfolioData'

const { projects } = usePortfolioDataRuntime()
const { locale } = useI18n()
const headerEl = ref<HTMLElement>()
const gridEl = ref<HTMLElement>()

// Tab state
const activeTab = ref<'all' | 'arastirma' | 'yazi'>('all')

const arastirmaProjects = computed(() =>
  projects.value.filter((p: Project) => p.type === 'arastirma')
)
const yaziProjects = computed(() =>
  projects.value.filter((p: Project) => p.type === 'yazi')
)
const filteredProjects = computed(() => {
  if (activeTab.value === 'all') return projects.value
  return projects.value.filter((p: Project) => p.type === activeTab.value)
})

// Modal State
const selectedProject = ref<Project | null>(null)

function openModal(project: Project) {
  selectedProject.value = project
  document.body.style.overflow = 'hidden' // Prevent background scrolling
}

function closeModal() {
  selectedProject.value = null
  document.body.style.overflow = ''
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

// Cleanup scroll lock on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── Tabs ─────────────────────────────────────────────────── */
.projects-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.projects-tab {
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

.projects-tab::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.1));
  opacity: 0;
  transition: opacity 0.3s;
}

.projects-tab:hover {
  color: var(--text-base);
  border-color: rgba(167, 139, 250, 0.3);
}

.projects-tab:hover::before {
  opacity: 1;
}

.projects-tab.active {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.12));
  color: var(--primary-glow);
  border-color: rgba(167, 139, 250, 0.5);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.15);
}

.projects-tab.active::before {
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

.projects-tab.active .tab-count {
  background: rgba(167, 139, 250, 0.25);
  color: #fff;
}

/* ─── Card transition ──────────────────────────────────────── */
.card-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.card-fade-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}
.card-fade-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(20px);
}
.card-fade-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(-10px);
}
.card-fade-move {
  transition: transform 0.4s ease;
}

/* ─── Grid ─────────────────────────────────────────────────── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  position: relative;
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
  border-color: rgba(167, 139, 250, 0.4);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(124, 58, 237, 0.15);
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
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(79, 70, 229, 0.15) 100%);
}

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

/* Type badge */
.type-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 6px;
  padding: 0.2rem 0.6rem;
  backdrop-filter: blur(6px);
}

.type-badge.arastirma {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.type-badge.yazi {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
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
  line-height: 1.6;
  flex: 1;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.card-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.1) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}

/* ─── Modal Architecture (Tasarım Harikası) ────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(3, 3, 5, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  perspective: 1000px;
}

/* Transitions */
.modal-bounce-enter-active {
  transition: opacity 0.4s ease, backdrop-filter 0.4s ease;
}
.modal-bounce-leave-active {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}
.modal-bounce-enter-from,
.modal-bounce-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-bounce-enter-active .modal-card {
  animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.modal-bounce-leave-active .modal-card {
  animation: modalOut 0.3s cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.9) translateY(30px) rotateX(10deg); }
  to   { opacity: 1; transform: scale(1) translateY(0) rotateX(0deg); }
}
@keyframes modalOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.95) translateY(20px); }
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 640px;
  background: rgba(10, 10, 14, 0.85); /* Glass effect */
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
}

/* Glow behind modal for 3D pop effect */
.modal-glow-bg {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* ─── Bubbles Effect ───────────────────────────────────────── */
.modal-bubbles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.bubble {
  position: absolute;
  bottom: -100px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), rgba(124, 58, 237, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: floatUp linear infinite;
  opacity: 0;
}

@keyframes floatUp {
  0% { transform: translateY(0) scale(0.6) rotate(0deg); opacity: 0; }
  10% { opacity: 0.8; }
  80% { opacity: 0.5; }
  100% { transform: translateY(-600px) scale(1.2) rotate(360deg); opacity: 0; }
}

.bubble-1 { width: 50px; height: 50px; left: 10%; animation-duration: 10s; animation-delay: 0s; }
.bubble-2 { width: 80px; height: 80px; left: 35%; animation-duration: 15s; animation-delay: 2s; }
.bubble-3 { width: 30px; height: 30px; left: 55%; animation-duration: 8s; animation-delay: 4s; }
.bubble-4 { width: 100px; height: 100px; left: 75%; animation-duration: 18s; animation-delay: 1s; }
.bubble-5 { width: 45px; height: 45px; left: 85%; animation-duration: 12s; animation-delay: 5s; }
.bubble-6 { width: 25px; height: 25px; left: 20%; animation-duration: 7s; animation-delay: 3s; }

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.4);
  transform: rotate(90deg);
}

.modal-hero {
  position: relative;
  height: 200px;
  width: 100%;
  z-index: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-hero-placeholder {
  width: 100%;
  height: 100%;
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%);
}

.hero-pattern::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(167, 139, 250, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167, 139, 250, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
}

.hero-icon {
  font-size: 4rem;
  color: rgba(167, 139, 250, 0.3);
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 10, 14, 1) 0%, transparent 100%);
}

.modal-badge {
  position: absolute;
  bottom: -12px;
  left: 2rem;
  z-index: 2;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  padding: 0.35rem 0.875rem;
}

.modal-body {
  position: relative;
  z-index: 1;
  padding: 2.5rem 2rem 2rem;
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-base);
  line-height: 1.2;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff 0%, var(--primary-glow) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glow-tag {
  background: rgba(167, 139, 250, 0.08);
  border: 1px solid rgba(167, 139, 250, 0.2);
  color: var(--primary-glow);
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
}

.modal-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(167, 139, 250, 0.2) 0%, transparent 100%);
  margin: 1.5rem 0;
}

.modal-desc {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.8;
  margin-bottom: 2rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.modal-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.8), rgba(6, 182, 212, 0.8));
  color: white;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
  transition: all 0.3s ease;
}

.modal-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.5);
}

.btn-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.modal-action-btn:hover .btn-icon {
  transform: translateX(4px);
}

@media (max-width: 900px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
  .modal-body {
    padding: 2.5rem 1.5rem 1.5rem;
  }
  .modal-title {
    font-size: 1.4rem;
  }
  .projects-tabs {
    gap: 0.375rem;
  }
  .projects-tab {
    padding: 0.5rem 1rem;
    font-size: 0.78rem;
  }
}
</style>

<template>
  <section id="references" class="section">
    <div class="section-inner">
      <div ref="headerEl" class="section-header">
        <span class="section-label">{{ kvt('testimonials.label') }}</span>
        <h2 class="section-title">{{ kvt('testimonials.title') }}</h2>
      </div>

      <div ref="cardsEl" class="testimonials-grid">
        <div
          v-for="item in testimonials"
          :key="item.id"
          class="testimonial-card glass"
        >
          <UIcon name="i-lucide-quote" class="quote-icon" />
          <p class="quote-text">{{ kvt(item.quoteKey) }}</p>
          <div class="author">
            <div class="author-avatar">
              {{ item.name.charAt(0) }}
            </div>
            <div>
              <p class="author-name">{{ item.name }}</p>
              <p class="author-meta">{{ kvt(item.titleKey) }} · {{ item.organization }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
const { testimonials } = usePortfolioDataRuntime()
const { rt: kvt } = useRuntimeT()
const headerEl = ref<HTMLElement>()
const cardsEl = ref<HTMLElement>()

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
  if (cardsEl.value) {
    gsap.from('.testimonial-card', {
      scrollTrigger: { trigger: cardsEl.value, start: 'top 85%' },
      opacity: 0,
      y: 40,
      stagger: 0.18,
      duration: 0.85,
    })
  }
})
</script>

<style scoped>
.section {
  background: linear-gradient(
    180deg,
    rgba(124, 58, 237, 0.04) 0%,
    transparent 100%
  );
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.testimonial-card {
  border-radius: 1.25rem;
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 30px rgba(124, 58, 237, 0.15);
}

.quote-icon {
  color: var(--primary-glow);
  font-size: 1.75rem;
  opacity: 0.6;
}

.quote-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.8;
  flex: 1;
  font-style: italic;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}

.author-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-base);
}

.author-meta {
  font-size: 0.73rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

@media (max-width: 900px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
    max-width: 520px;
    margin: 0 auto;
  }
}
</style>

<template>
  <section id="hero" class="hero">
    <!-- Particle canvas -->
    <canvas ref="canvasEl" class="hero-canvas" aria-hidden="true" />

    <!-- Gradient overlay -->
    <div class="hero-overlay" />

    <!-- Content -->
    <div class="hero-content">
      <p class="hero-eyebrow">{{ $t('hero.eyebrow') }}</p>
      <h1 class="hero-name">{{ $t('hero.name') }}</h1>
      <div class="hero-subtitle-wrap">
        <span class="hero-subtitle">{{ $t('hero.subtitle') }}</span>
      </div>
      <div class="hero-role-wrap">
        <span class="hero-role">{{ displayedRole }}<span class="cursor">|</span></span>
      </div>
      <a
        href="#about"
        class="hero-cta"
        @click.prevent="scrollToAbout"
      >
        {{ $t('hero.cta') }}
        <span class="cta-arrow">↓</span>
      </a>
    </div>

    <!-- Scroll indicator -->
    <div class="scroll-indicator" aria-hidden="true">
      <div class="scroll-line" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { useParticles } from '~/composables/useParticles'

const { t, tm, rt } = useI18n()
const canvasEl = ref<HTMLCanvasElement>()
const displayedRole = ref('')

const { initCanvas, destroy } = useParticles()

// ─── Typed text ───────────────────────────────────────────────────
let roleIndex = 0
let charIndex = 0
let isDeleting = false
let typingTimer: ReturnType<typeof setTimeout>

const roles = computed<string[]>(() => {
  const messages = tm('hero.roles')
  if (Array.isArray(messages)) return messages.map(m => rt(m))
  return []
})

function typeRole() {
  const role = roles.value[roleIndex]
  if (!role) return

  if (!isDeleting) {
    displayedRole.value = role.slice(0, ++charIndex)
    if (charIndex === role.length) {
      isDeleting = true
      typingTimer = setTimeout(typeRole, 2400)
      return
    }
  } else {
    displayedRole.value = role.slice(0, --charIndex)
    if (charIndex === 0) {
      isDeleting = false
      roleIndex = (roleIndex + 1) % roles.value.length
    }
  }
  typingTimer = setTimeout(typeRole, isDeleting ? 35 : 65)
}

// ─── GSAP entrance ────────────────────────────────────────────────
function runEntrance() {
  gsap.set('.hero-eyebrow',     { opacity: 0, y: 30 })
  gsap.set('.hero-name',        { opacity: 0, y: 60 })
  gsap.set('.hero-subtitle-wrap', { opacity: 0, y: 20 })
  gsap.set('.hero-role-wrap',   { opacity: 0, y: 20 })
  gsap.set('.hero-cta',         { opacity: 0, y: 20 })
  gsap.set('.scroll-indicator', { opacity: 0 })

  const tl = gsap.timeline({ delay: 0.15 })
  tl.to('.hero-eyebrow',     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .to('.hero-name',        { opacity: 1, y: 0, duration: 1,   ease: 'power3.out' }, '-=0.3')
    .to('.hero-subtitle-wrap', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .to('.hero-role-wrap',   { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', onComplete: typeRole }, '-=0.3')
    .to('.hero-cta',         { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('.scroll-indicator', { opacity: 1,        duration: 0.6, ease: 'power2.out' }, '-=0.2')
}

function scrollToAbout() {
  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  if (canvasEl.value) {
    initCanvas(canvasEl.value)
  }
  runEntrance()
})

onUnmounted(() => {
  destroy()
  clearTimeout(typingTimer)
})
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--bg);
  transition: background-color 0.3s;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.03) 50%,
    var(--bg) 100%
  );
  transition: background 0.3s;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 1.5rem;
  max-width: 900px;
}

.hero-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--primary-glow);
  margin-bottom: 1.5rem;
}

.hero-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(3rem, 10vw, 7.5rem);
  font-weight: 700;
  line-height: 0.95;
  color: var(--text-base);
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text-base) 0%, var(--primary-glow) 60%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 40px rgba(167, 139, 250, 0.2));
}

.hero-subtitle-wrap {
  margin-bottom: 0.75rem;
}

.hero-subtitle {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.2rem, 3vw, 1.75rem);
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.01em;
}

.hero-role-wrap {
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
}

.hero-role {
  font-size: clamp(0.95rem, 2vw, 1.2rem);
  font-weight: 400;
  color: var(--primary-glow);
  letter-spacing: 0.02em;
}

.cursor {
  color: var(--primary-glow);
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {
  50% { opacity: 0; }
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: 1px solid rgba(167, 139, 250, 0.35);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-base);
  text-decoration: none;
  transition: all 0.3s;
  backdrop-filter: blur(4px);
  background: rgba(124, 58, 237, 0.08);
}

.hero-cta:hover {
  background: rgba(124, 58, 237, 0.2);
  border-color: rgba(167, 139, 250, 0.6);
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);
  transform: translateY(-2px);
}

.cta-arrow {
  display: inline-block;
  animation: float-arrow 1.8s ease-in-out infinite;
}

@keyframes float-arrow {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(4px); }
}

.scroll-indicator {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.scroll-line {
  width: 1px;
  height: 50px;
  margin: 0 auto;
  background: linear-gradient(to bottom, var(--primary-glow), transparent);
  animation: scroll-drop 2s ease-in-out infinite;
}

@keyframes scroll-drop {
  0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
  50%  { opacity: 1; }
  100% { opacity: 0; transform: scaleY(1); transform-origin: top; }
}
</style>

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

const { t } = useI18n()
const canvasEl = ref<HTMLCanvasElement>()
const displayedRole = ref('')

// ─── Typed text (letter by letter, sequential) ────────────────────
let roleIndex = 0
let charIndex = 0
let isDeleting = false
let typingTimer: ReturnType<typeof setTimeout>

const roles = computed<string[]>(() => t('hero.roles') as unknown as string[])

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

// ─── Advanced Particle System ─────────────────────────────────────
const PARTICLE_COLORS = [
  [167, 139, 250], // violet
  [124, 58, 237],  // purple
  [6, 182, 212],   // cyan
  [192, 132, 252], // light violet
  [99, 102, 241],  // indigo
]

class Particle {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  radius: number
  color: number[]
  alpha: number
  density: number

  constructor(w: number, h: number) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.baseX = this.x
    this.baseY = this.y
    this.vx = (Math.random() - 0.5) * 0.3
    this.vy = (Math.random() - 0.5) * 0.3
    this.radius = Math.random() * 2 + 0.5
    this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
    this.alpha = Math.random() * 0.5 + 0.2
    this.density = Math.random() * 30 + 10
  }

  update(mouseX: number, mouseY: number, mouseActive: boolean, w: number, h: number) {
    // Mouse repel effect
    if (mouseActive) {
      const dx = this.x - mouseX
      const dy = this.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const REPEL_RADIUS = 120
      if (dist < REPEL_RADIUS) {
        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
        const angle = Math.atan2(dy, dx)
        this.vx += Math.cos(angle) * force * 2
        this.vy += Math.sin(angle) * force * 2
      }
    }

    // Velocity with friction
    this.vx *= 0.96
    this.vy *= 0.96

    // Drift back to base position gently
    const driftX = (this.baseX - this.x) * 0.005
    const driftY = (this.baseY - this.y) * 0.005
    this.vx += driftX
    this.vy += driftY

    // Add tiny random movement
    this.vx += (Math.random() - 0.5) * 0.05
    this.vy += (Math.random() - 0.5) * 0.05

    // Apply velocity
    this.x += this.vx
    this.y += this.vy

    // Wrap edges
    if (this.x < -10) this.x = w + 10
    if (this.x > w + 10) this.x = -10
    if (this.y < -10) this.y = h + 10
    if (this.y > h + 10) this.y = -10
  }

  draw(ctx: CanvasRenderingContext2D) {
    const [r, g, b] = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`
    ctx.fill()
  }
}

let particles: Particle[] = []
let animFrame: number
let ctx: CanvasRenderingContext2D | null = null
let mouseX = -1000
let mouseY = -1000
let mouseActive = false

function getParticleCount() {
  const w = window.innerWidth
  if (w < 600) return 80
  if (w < 1024) return 140
  return 220
}

function initCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resize()
  drawLoop()
}

function resize() {
  const canvas = canvasEl.value
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx?.scale(dpr, dpr)

  // Respawn particles on resize
  spawnParticles()
}

function spawnParticles() {
  const w = window.innerWidth
  const h = window.innerHeight
  const count = getParticleCount()
  particles = Array.from({ length: count }, () => new Particle(w, h))
}

function burstParticles(x: number, y: number) {
  const BURST_COUNT = 15
  const w = window.innerWidth
  const h = window.innerHeight
  for (let i = 0; i < BURST_COUNT; i++) {
    const p = new Particle(w, h)
    p.x = x
    p.y = y
    p.baseX = x + (Math.random() - 0.5) * 200
    p.baseY = y + (Math.random() - 0.5) * 200
    const angle = (Math.PI * 2 * i) / BURST_COUNT
    const speed = Math.random() * 4 + 2
    p.vx = Math.cos(angle) * speed
    p.vy = Math.sin(angle) * speed
    p.radius = Math.random() * 2.5 + 1
    p.alpha = 0.8
    particles.push(p)
  }

  // Keep particle count reasonable
  if (particles.length > getParticleCount() + 100) {
    particles.splice(0, particles.length - getParticleCount())
  }
}

function drawLoop() {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return

  const w = window.innerWidth
  const h = window.innerHeight

  ctx.clearRect(0, 0, w, h)

  // Update and draw particles
  for (const p of particles) {
    p.update(mouseX, mouseY, mouseActive, w, h)
    p.draw(ctx)
  }

  // Draw connections
  const MAX_DIST = 100
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distSq = dx * dx + dy * dy
      if (distSq < MAX_DIST * MAX_DIST) {
        const dist = Math.sqrt(distSq)
        const alpha = (1 - dist / MAX_DIST) * 0.12
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`
        ctx.lineWidth = 0.6
        ctx.stroke()
      }
    }
  }

  // Draw mouse glow
  if (mouseActive) {
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 120)
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.06)')
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(mouseX - 120, mouseY - 120, 240, 240)
  }

  animFrame = requestAnimationFrame(drawLoop)
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
  mouseActive = true
}

function onMouseLeave() {
  mouseActive = false
  mouseX = -1000
  mouseY = -1000
}

function onClick(e: MouseEvent) {
  burstParticles(e.clientX, e.clientY)
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    mouseX = e.touches[0].clientX
    mouseY = e.touches[0].clientY
    mouseActive = true
  }
}

function onTouchEnd() {
  mouseActive = false
  mouseX = -1000
  mouseY = -1000
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
  initCanvas()
  runEntrance()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('click', onClick)
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('touchend', onTouchEnd)
})

onUnmounted(() => {
  cancelAnimationFrame(animFrame)
  clearTimeout(typingTimer)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseleave', onMouseLeave)
  window.removeEventListener('click', onClick)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
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

/* Scroll indicator */
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

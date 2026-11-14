<template>
  <section id="hero" ref="sectionEl" class="hero">
    <!-- Particle canvas -->
    <canvas ref="canvasEl" class="hero-canvas" aria-hidden="true" />

    <!-- Gradient overlay -->
    <div class="hero-overlay" />

    <!-- Unified Hero + AI Voice Bot -->
    <div class="hero-content">
      <!-- 1. Başlık Bloğu -->
      <div class="hero-header">
        <p class="hero-eyebrow">{{ kvt('hero.eyebrow') }}</p>
        <h1 class="hero-name">
          <span class="hero-name-gradient">{{ displayedTitle }}</span><span v-if="titleTyping" class="hero-name-cursor" aria-hidden="true">|</span>
        </h1>
        <div class="hero-subtitle-wrap">
          <span class="hero-subtitle">{{ kvt('hero.subtitle') }}</span>
        </div>
        <div class="hero-role-wrap">
          <Transition name="role-fade" mode="out-in">
            <span :key="roleIndex" class="hero-role">{{ currentRole }}</span>
          </Transition>
        </div>
      </div>

      <!-- 2. AI Konuşma Spektrumu ve Kontroller (Hemen Altında) -->
      <div class="hero-voice">
        <div
          class="spectrum-container"
          role="button"
          :aria-label="isListening ? $t('voice.listening') : $t('voice.speakBtn')"
          tabindex="0"
          @click="handleToggle"
          @keydown.enter="handleToggle"
        >
          <canvas ref="spectrumCanvasEl" class="spectrum-canvas" />
        </div>

        <div ref="btnEl" class="btn-wrap">
          <template v-if="mounted && !isSupported">
            <p class="not-supported">{{ $t('voice.notSupported') }}</p>
            <div class="text-fallback">
              <div class="fallback-input-wrap">
                <input
                  v-model="textInput"
                  class="fallback-input"
                  :placeholder="$t('voice.textPlaceholder')"
                  :disabled="isProcessing"
                  @keydown.enter.prevent="handleTextSubmit"
                />
                <button
                  class="fallback-send"
                  :disabled="!textInput.trim() || isProcessing"
                  @click="handleTextSubmit"
                >
                  <UIcon v-if="isProcessing" name="i-lucide-loader-circle" class="spin" />
                  <UIcon v-else name="i-lucide-send" />
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <!-- Live transcript box -->
            <Transition name="slide-up">
              <div v-if="isListening || (transcript && !aiResponse)" class="live-transcript">
                <span class="rec-dot" :class="{ active: isListening }" />
                <p class="live-text">{{ transcript || '...' }}</p>
              </div>
            </Transition>

            <button
              v-if="!speechFailed"
              class="speak-btn"
              :class="{ active: isListening, processing: isProcessing }"
              :disabled="isProcessing"
              @click="handleToggle"
            >
              <div class="waveform">
                <span
                  v-for="i in 4"
                  :key="`l${i}`"
                  class="wbar"
                  :class="{ animate: isListening }"
                  :style="{ animationDelay: `${i * 0.08}s`, height: `${6 + i * 3}px` }"
                />
              </div>
              <span class="speak-label">
                <template v-if="isListening">{{ $t('voice.listening') }}</template>
                <template v-else-if="isProcessing">{{ $t('voice.processing') }}</template>
                <template v-else>{{ $t('voice.speakBtn') }}</template>
              </span>
              <div class="waveform">
                <span
                  v-for="i in 4"
                  :key="`r${i}`"
                  class="wbar"
                  :class="{ animate: isListening }"
                  :style="{ animationDelay: `${(5 - i) * 0.08}s`, height: `${6 + (5 - i) * 3}px` }"
                />
              </div>
            </button>

            <div v-if="speechFailed" class="text-fallback">
              <p class="fallback-label">{{ $t('voice.textFallbackLabel') }}</p>
              <div class="fallback-input-wrap">
                <input
                  v-model="textInput"
                  class="fallback-input"
                  :placeholder="$t('voice.textPlaceholder')"
                  :disabled="isProcessing"
                  @keydown.enter.prevent="handleTextSubmit"
                />
                <button
                  class="fallback-send"
                  :disabled="!textInput.trim() || isProcessing"
                  @click="handleTextSubmit"
                >
                  <UIcon v-if="isProcessing" name="i-lucide-loader-circle" class="spin" />
                  <UIcon v-else name="i-lucide-send" />
                </button>
              </div>
            </div>

            <Transition name="slide-up">
              <div v-if="aiResponse" class="results">
                <div class="result-box ai">
                  <p class="result-label">{{ $t('voice.responseLabel') }}</p>
                  <p class="result-text">{{ aiResponse }}</p>
                  <Transition name="slide-up">
                    <button v-if="isSpeaking" class="stop-speak-btn" @click="stopSpeaking">
                      <UIcon name="i-lucide-volume-x" />
                      <span>{{ $t('voice.stopSpeaking') }}</span>
                    </button>
                  </Transition>
                </div>
              </div>
            </Transition>

            <Transition name="slide-up">
              <p v-if="voiceError" class="voice-error">{{ voiceError }}</p>
            </Transition>
          </template>
        </div>
      </div>
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
import { useVoiceBot } from '~/composables/useVoiceBot'

const { rt, locale } = useI18n()
const { rt: kvt, rtm: kvtm } = useRuntimeT()

const sectionEl = ref<HTMLElement>()
const canvasEl = ref<HTMLCanvasElement>()
const btnEl = ref<HTMLElement>()
const displayedTitle = ref('')
const titleTyping = ref(true)
const mounted = ref(false)
const textInput = ref('')

const { initCanvas, destroy, emitSoundwave } = useParticles({
  particleDensityMultiplier: 0.75,
  maxDistance: 130,
})

const {
  transcript,
  aiResponse,
  isListening,
  isProcessing,
  isSupported,
  isSpeaking,
  speechFailed,
  error: voiceError,
  toggle,
  sendToAI,
  stopSpeaking,
} = useVoiceBot()

// ─── Typed main title (replays every 30s) ────────────────────────────
const TITLE_REPLAY_MS = 30_000

let titleCharIndex = 0
let titleTypingTimer: ReturnType<typeof setTimeout>
let titleReplayTimer: ReturnType<typeof setTimeout> | undefined
let rolesRotationStarted = false

const fullHeroTitle = computed(() => kvt('hero.name'))

function scheduleTitleReplay() {
  if (titleReplayTimer) clearTimeout(titleReplayTimer)
  titleReplayTimer = setTimeout(() => {
    titleReplayTimer = undefined
    clearTimeout(titleTypingTimer)
    titleCharIndex = 0
    displayedTitle.value = ''
    titleTyping.value = true
    typeTitle()
  }, TITLE_REPLAY_MS)
}

function typeTitle() {
  const full = fullHeroTitle.value
  if (!full) return
  displayedTitle.value = full.slice(0, ++titleCharIndex)
  if (titleCharIndex >= full.length) {
    titleTyping.value = false
    if (!rolesRotationStarted) {
      startRoleRotation()
      rolesRotationStarted = true
    }
    scheduleTitleReplay()
    return
  }
  titleTypingTimer = setTimeout(typeTitle, full.length > 24 ? 45 : 55)
}

// ─── Rotating roles (fade, no typewriter) ─────────────────────────
const roles = computed<string[]>(() => {
  const messages = kvtm('hero.roles') as unknown
  if (Array.isArray(messages)) return messages.map((m) => rt(m as never))
  return []
})

const roleIndex = ref(0)
const currentRole = computed(() => roles.value[roleIndex.value] ?? '')
let roleRotateTimer: ReturnType<typeof setInterval> | undefined

function startRoleRotation() {
  if (roleRotateTimer) clearInterval(roleRotateTimer)
  if (roles.value.length <= 1) return
  roleRotateTimer = setInterval(() => {
    roleIndex.value = (roleIndex.value + 1) % roles.value.length
  }, 3200)
}

// ─── Soundwave pulse on particles ─────────────────────────────────
let waveInterval: ReturnType<typeof setInterval> | null = null

watch([isSpeaking, isProcessing], ([speaking, processing]) => {
  if (!import.meta.client) return
  if (speaking || processing) {
    if (!waveInterval) {
      waveInterval = setInterval(() => {
        let lx = window.innerWidth / 2
        let ly = window.innerHeight * 0.65
        if (sectionEl.value && spectrumCanvasEl.value) {
          const sr = sectionEl.value.getBoundingClientRect()
          const cr = spectrumCanvasEl.value.getBoundingClientRect()
          lx = cr.left - sr.left + cr.width / 2
          ly = cr.top - sr.top + cr.height / 2
        }
        emitSoundwave(lx, ly)
      }, speaking ? 700 : 1800)
    }
  } else {
    if (waveInterval) {
      clearInterval(waveInterval)
      waveInterval = null
    }
  }
})

// ─── Volume simulation (transcript-driven, no extra getUserMedia) ──
let smoothedVol = 0.12
let targetVol = 0.12
let lastTranscLen = 0

function tickVolume() {
  if (isListening.value) {
    const len = transcript.value.length
    if (len > lastTranscLen) {
      targetVol = 0.55 + Math.random() * 0.45
      lastTranscLen = len
    } else {
      targetVol = Math.max(0.20, targetVol * 0.94)
    }
  } else if (isProcessing.value || isSpeaking.value) {
    targetVol = 0.32 + 0.14 * Math.abs(Math.sin(animTime * 2.5))
  } else {
    targetVol = 0.12
    lastTranscLen = 0
  }
  smoothedVol += (targetVol - smoothedVol) * 0.14
}

// ─── Filled audio waveform visualiser ─────────────────────────────
const spectrumCanvasEl = ref<HTMLCanvasElement>()
let animFrame: number | null = null
let spectrumDpr = 1
let animTime = 0

function resizeSpectrumCanvas() {
  const c = spectrumCanvasEl.value
  if (!c) return
  spectrumDpr = window.devicePixelRatio || 1
  const r = c.getBoundingClientRect()
  c.width = r.width * spectrumDpr
  c.height = r.height * spectrumDpr
}

function edgeTaper(nx: number): number {
  return Math.min(nx / 0.06, (1 - nx) / 0.06, 1)
}

function buildHeights(maxAMP: number, tOffset = 0): number[] {
  const N = 420
  const t = animTime + tOffset
  const out = new Array(N)
  for (let i = 0; i < N; i++) {
    const nx = i / (N - 1)
    const raw =
      0.36 * Math.abs(Math.sin(nx * Math.PI * 9.5 + t * 1.30)) +
      0.27 * Math.abs(Math.sin(nx * Math.PI * 6.1 + t * 0.90 + 1.1)) +
      0.22 * Math.abs(Math.sin(nx * Math.PI * 14.7 + t * 1.65 + 2.4)) +
      0.15 * Math.abs(Math.sin(nx * Math.PI * 3.8 + t * 0.55 + 0.8))
    out[i] = maxAMP * raw * edgeTaper(nx)
  }
  return out
}

function fillWave(
  ctx: CanvasRenderingContext2D,
  W: number,
  cy: number,
  hArr: number[],
  grad: CanvasGradient,
  dir: 1 | -1,
  alpha: number,
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.moveTo(0, cy)
  const n = hArr.length
  for (let i = 0; i < n; i++) {
    ctx.lineTo((i / (n - 1)) * W, cy + dir * hArr[i])
  }
  ctx.lineTo(W, cy)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}

function drawSpectrum() {
  const canvas = spectrumCanvasEl.value
  if (!canvas) {
    animFrame = requestAnimationFrame(drawSpectrum)
    return
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  tickVolume()
  animTime += isListening.value ? 0.014 + smoothedVol * 0.010 : 0.006

  const W = canvas.width / spectrumDpr
  const H = canvas.height / spectrumDpr
  const cy = H / 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.scale(spectrumDpr, spectrumDpr)

  const vol = Math.max(0.55, Math.min(1.15, smoothedVol * 1.6))
  const maxAMP = H * 0.48 * vol

  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0, '#00e5ff')
  grad.addColorStop(0.28, '#3b82f6')
  grad.addColorStop(0.60, '#8b5cf6')
  grad.addColorStop(1.0, '#ec4899')

  const h1 = buildHeights(maxAMP)
  const h2 = buildHeights(maxAMP * 0.70, 0.55)

  ctx.shadowColor = 'rgba(120, 60, 255, 0.50)'
  ctx.shadowBlur = 32
  fillWave(ctx, W, cy, h1, grad, -1, 0.55)
  ctx.shadowBlur = 0

  fillWave(ctx, W, cy, h1, grad, -1, 1.00)
  fillWave(ctx, W, cy, h2, grad, -1, 0.55)

  ctx.beginPath()
  ctx.moveTo(0, cy)
  ctx.lineTo(W, cy)
  ctx.strokeStyle = 'rgba(200, 180, 255, 0.55)'
  ctx.lineWidth = 0.8
  ctx.stroke()

  fillWave(ctx, W, cy, h1, grad, 1, 0.28)
  fillWave(ctx, W, cy, h2, grad, 1, 0.13)

  ctx.restore()
  animFrame = requestAnimationFrame(drawSpectrum)
}

// ─── Voice controls ───────────────────────────────────────────────
function handleToggle() {
  const lang = locale.value === 'tr' ? 'tr-TR' : 'en-US'
  toggle(lang)
}

function handleTextSubmit() {
  const text = textInput.value.trim()
  if (!text || isProcessing.value) return
  const lang = locale.value === 'tr' ? 'tr-TR' : 'en-US'
  textInput.value = ''
  sendToAI(lang, text)
}

// ─── GSAP entrance ────────────────────────────────────────────────
function runEntrance() {
  gsap.set('.hero-eyebrow', { opacity: 0, y: 24 })
  gsap.set('.hero-name', { opacity: 0, y: 40 })
  gsap.set('.hero-subtitle-wrap', { opacity: 0, y: 18 })
  gsap.set('.hero-role-wrap', { opacity: 0, y: 14 })
  gsap.set('.spectrum-container', { opacity: 0, y: 24 })
  if (btnEl.value) gsap.set(btnEl.value, { opacity: 0, y: 16 })
  gsap.set('.scroll-indicator', { opacity: 0 })

  const tl = gsap.timeline({ delay: 0.15 })
  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' })
    .to('.hero-name', { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', onComplete: typeTitle }, '-=0.3')
    .to('.hero-subtitle-wrap', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    .to('.hero-role-wrap', { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.3')
    .to('.spectrum-container', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
  if (btnEl.value) {
    tl.to(btnEl.value, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.45')
  }
  tl.to('.scroll-indicator', { opacity: 1, duration: 0.55, ease: 'power2.out' }, '-=0.2')
}

onMounted(() => {
  mounted.value = true
  if (canvasEl.value) {
    initCanvas(canvasEl.value)
  }
  if (spectrumCanvasEl.value) {
    resizeSpectrumCanvas()
    drawSpectrum()
  }
  window.addEventListener('resize', resizeSpectrumCanvas)
  runEntrance()
})

onUnmounted(() => {
  destroy()
  if (animFrame) cancelAnimationFrame(animFrame)
  if (waveInterval) clearInterval(waveInterval)
  window.removeEventListener('resize', resizeSpectrumCanvas)
  clearTimeout(titleTypingTimer)
  if (titleReplayTimer) clearTimeout(titleReplayTimer)
  if (roleRotateTimer) clearInterval(roleRotateTimer)
})

watch(fullHeroTitle, () => {
  clearTimeout(titleTypingTimer)
  if (titleReplayTimer) {
    clearTimeout(titleReplayTimer)
    titleReplayTimer = undefined
  }
  titleCharIndex = 0
  displayedTitle.value = ''
  titleTyping.value = true
  typeTitle()
})

watch(locale, () => {
  clearTimeout(titleTypingTimer)
  if (titleReplayTimer) {
    clearTimeout(titleReplayTimer)
    titleReplayTimer = undefined
  }
  if (roleRotateTimer) {
    clearInterval(roleRotateTimer)
    roleRotateTimer = undefined
  }
  rolesRotationStarted = false
  displayedTitle.value = ''
  titleCharIndex = 0
  titleTyping.value = true
  roleIndex.value = 0
  nextTick(() => {
    typeTitle()
  })
})
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(12rem, 18vh, 20rem) 1.5rem 5rem;
  overflow: hidden;
  background-color: var(--bg);
  transition: background-color 0.3s;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
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
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: clamp(1rem, 2.2vh, 1.75rem);
}

/* ─── 1. Hero Header Block ─────────────────────────────────────── */
.hero-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-eyebrow {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--primary-glow);
  margin: 0 0 0.75rem;
}

/* Gradient + filter on the same clipped layer breaks Turkish glyphs (ş, y…); glow lives on h1, clip only on inner span. */
.hero-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.5rem, 6.8vw, 5.25rem);
  font-weight: 700;
  line-height: 1.06;
  margin: 0 0 0.65rem;
  letter-spacing: -0.02em;
  overflow: visible;
  filter: drop-shadow(0 0 40px rgba(167, 139, 250, 0.2));
}

.hero-name-gradient {
  background: linear-gradient(135deg, var(--text-base) 0%, var(--primary-glow) 60%, #06b6d4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-name-cursor {
  color: var(--primary-glow);
  -webkit-text-fill-color: var(--primary-glow);
  animation: blink 1s step-end infinite;
  margin-left: 0.06em;
  font-weight: 300;
}

.hero-subtitle-wrap {
  margin-bottom: 0.35rem;
}

.hero-subtitle {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.05rem, 2.4vw, 1.45rem);
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.01em;
}

.hero-role-wrap {
  min-height: 1.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-fade-enter-active,
.role-fade-leave-active {
  transition: opacity 0.35s ease;
}

.role-fade-enter-from,
.role-fade-leave-to {
  opacity: 0;
}

.hero-role {
  font-size: clamp(0.95rem, 2vw, 1.15rem);
  font-weight: 400;
  color: var(--primary-glow);
  letter-spacing: 0.02em;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* ─── 2. AI Voice Spectrum & Controls ──────────────────────────── */
.hero-voice {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
}

.spectrum-container {
  position: relative;
  width: min(680px, 92vw);
  height: clamp(120px, 18vh, 175px);
  cursor: pointer;
  outline: none;
  transition: filter 0.4s;
}

.spectrum-container:hover {
  filter: brightness(1.1);
}

.spectrum-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.btn-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  max-width: 560px;
}

.live-transcript {
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.22);
  border-radius: 0.875rem;
  padding: 0.7rem 1rem;
  min-height: 2.6rem;
  text-align: left;
}

.rec-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.35);
  margin-top: 0.35rem;
  transition: background 0.3s;
}

.rec-dot.active {
  background: #06b6d4;
  box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.5);
  animation: rec-pulse 1.2s ease-out infinite;
}

@keyframes rec-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.55); }
  70%  { box-shadow: 0 0 0 7px rgba(6, 182, 212, 0); }
  100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
}

.live-text {
  font-size: 0.875rem;
  color: var(--text-base);
  line-height: 1.6;
  flex: 1;
  word-break: break-word;
}

.speak-btn {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  padding: 0.75rem 2rem;
  border: 1px solid rgba(6, 182, 212, 0.55);
  border-radius: 9999px;
  background: transparent;
  color: #06b6d4;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.1);
}

.speak-btn:hover:not(:disabled) {
  background: rgba(6, 182, 212, 0.07);
  border-color: rgba(6, 182, 212, 0.9);
  box-shadow: 0 0 24px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1);
  transform: translateY(-1px);
}

.speak-btn.active {
  background: rgba(6, 182, 212, 0.1);
  border-color: #06b6d4;
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.35);
  color: #22d3ee;
}

.speak-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.waveform {
  display: flex;
  align-items: center;
  gap: 3px;
}

.wbar {
  display: block;
  width: 2.5px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.7;
  transition: height 0.3s;
}

.wbar.animate {
  animation: wave-bar 0.5s ease infinite alternate;
}

.wbar.animate:nth-child(2) { animation-delay: 0.1s; }
.wbar.animate:nth-child(3) { animation-delay: 0.2s; }
.wbar.animate:nth-child(4) { animation-delay: 0.3s; }

@keyframes wave-bar {
  from { transform: scaleY(0.4); }
  to { transform: scaleY(1.4); }
}

.text-fallback {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.fallback-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}

.fallback-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  max-width: 460px;
}

.fallback-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 9999px;
  padding: 0.7rem 1.2rem;
  font-size: 0.85rem;
  color: var(--text-base);
  outline: none;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.fallback-input::placeholder {
  color: rgba(148, 163, 184, 0.45);
}

.fallback-input:focus {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08);
}

.fallback-input:disabled {
  opacity: 0.5;
}

.fallback-send {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4, #7c3aed);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.15s, box-shadow 0.3s;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
}

.fallback-send:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 0 24px rgba(6, 182, 212, 0.5);
}

.fallback-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spin {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  text-align: left;
}

.result-box {
  background: var(--surface);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 1rem;
  padding: 1rem 1.25rem;
}

.result-box.ai {
  border-color: rgba(124, 58, 237, 0.25);
  background: rgba(124, 58, 237, 0.06);
}

.result-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #06b6d4;
  margin-bottom: 0.35rem;
}

.result-box.ai .result-label {
  color: var(--primary-glow);
}

.result-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.7;
}

.stop-speak-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.45rem 1.05rem;
  border-radius: 9999px;
  border: 1px solid rgba(248, 113, 113, 0.4);
  background: rgba(248, 113, 113, 0.08);
  color: #f87171;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s;
  animation: stop-pulse 1.5s ease-in-out infinite;
}

.stop-speak-btn:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.7);
  box-shadow: 0 0 16px rgba(248, 113, 113, 0.2);
  transform: translateY(-1px);
}

@keyframes stop-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.15); }
  50% { box-shadow: 0 0 0 6px rgba(248, 113, 113, 0); }
}

.voice-error {
  font-size: 0.8rem;
  color: #f87171;
  text-align: center;
  max-width: 440px;
  line-height: 1.6;
  padding: 0.65rem 1.15rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: 0.75rem;
}

.not-supported {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
  max-width: 400px;
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* ─── Scroll Indicator ─────────────────────────────────────────── */
.scroll-indicator {
  position: relative;
  z-index: 2;
  margin-top: 1.5rem;
}

.scroll-line {
  width: 1px;
  height: 32px;
  margin: 0 auto;
  background: linear-gradient(to bottom, var(--primary-glow), transparent);
  animation: scroll-drop 2s ease-in-out infinite;
}

@keyframes scroll-drop {
  0% { opacity: 0; transform: scaleY(0); transform-origin: top; }
  50% { opacity: 1; }
  100% { opacity: 0; transform: scaleY(1); transform-origin: top; }
}

@media (min-width: 768px) {
  .hero {
    padding-top: clamp(15rem, 27vh, 21rem);
  }
}

@media (max-width: 600px) {
  .spectrum-container {
    height: 120px;
  }

  .fallback-input-wrap {
    max-width: 100%;
  }
}
</style>

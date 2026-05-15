<template>
  <section id="voice" ref="sectionEl" class="voice-section">
    <canvas ref="canvasEl" class="voice-canvas" aria-hidden="true" />
    <div class="bg-glow" aria-hidden="true" />

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
            <input v-model="textInput" class="fallback-input" :placeholder="$t('voice.textPlaceholder')"
              :disabled="isProcessing" @keydown.enter.prevent="handleTextSubmit" />
            <button class="fallback-send" :disabled="!textInput.trim() || isProcessing" @click="handleTextSubmit">
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

        <button v-if="!speechFailed" class="speak-btn"
          :class="{ active: isListening, processing: isProcessing }"
          :disabled="isProcessing" @click="handleToggle">
          <div class="waveform">
            <span v-for="i in 4" :key="`l${i}`" class="wbar" :class="{ animate: isListening }"
              :style="{ animationDelay: `${i * 0.08}s`, height: `${6 + i * 3}px` }" />
          </div>
          <span class="speak-label">
            <template v-if="isListening">{{ $t('voice.listening') }}</template>
            <template v-else-if="isProcessing">{{ $t('voice.processing') }}</template>
            <template v-else>{{ $t('voice.speakBtn') }}</template>
          </span>
          <div class="waveform">
            <span v-for="i in 4" :key="`r${i}`" class="wbar" :class="{ animate: isListening }"
              :style="{ animationDelay: `${(5 - i) * 0.08}s`, height: `${6 + (5 - i) * 3}px` }" />
          </div>
        </button>

        <div v-if="speechFailed" class="text-fallback">
          <p class="fallback-label">{{ $t('voice.textFallbackLabel') }}</p>
          <div class="fallback-input-wrap">
            <input v-model="textInput" class="fallback-input" :placeholder="$t('voice.textPlaceholder')"
              :disabled="isProcessing" @keydown.enter.prevent="handleTextSubmit" />
            <button class="fallback-send" :disabled="!textInput.trim() || isProcessing" @click="handleTextSubmit">
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
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { useVoiceBot } from '~/composables/useVoiceBot'
import { useParticles } from '~/composables/useParticles'

const { locale } = useI18n()
const {
  transcript, aiResponse,
  isListening, isProcessing, isSupported, isSpeaking,
  speechFailed, error: voiceError,
  toggle, sendToAI, stopSpeaking,
} = useVoiceBot()

const mounted   = ref(false)
const textInput = ref('')
const sectionEl = ref<HTMLElement>()
const btnEl     = ref<HTMLElement>()

// ── Particles ─────────────────────────────────────────────────
const canvasEl = ref<HTMLCanvasElement>()
const { initCanvas, destroy, emitSoundwave } = useParticles({ particleDensityMultiplier: 0.65, maxDistance: 130 })
let waveInterval: ReturnType<typeof setInterval> | null = null

watch([isSpeaking, isProcessing], ([speaking, processing]) => {
  if (!import.meta.client) return
  if (speaking || processing) {
    if (!waveInterval) {
      waveInterval = setInterval(() => {
        const lx = sectionEl.value ? sectionEl.value.clientWidth / 2 : window.innerWidth / 2
        const ly = sectionEl.value ? sectionEl.value.clientHeight * 0.45 : window.innerHeight / 2
        emitSoundwave(lx, ly)
      }, speaking ? 700 : 1800)
    }
  } else {
    if (waveInterval) { clearInterval(waveInterval); waveInterval = null }
  }
})

// ── Volume simulation (transcript-driven, no extra getUserMedia) ──
// Using transcript changes as a proxy avoids conflicting with SpeechRecognition's mic stream.
let smoothedVol   = 0.12
let targetVol     = 0.12
let lastTranscLen = 0

function tickVolume() {
  if (isListening.value) {
    const len = transcript.value.length
    if (len > lastTranscLen) {
      // New words detected → spike volume
      targetVol     = 0.55 + Math.random() * 0.45
      lastTranscLen = len
    } else {
      // No new words → decay
      targetVol = Math.max(0.20, targetVol * 0.94)
    }
  } else if (isProcessing.value || isSpeaking.value) {
    targetVol = 0.30 + 0.12 * Math.abs(Math.sin(animTime * 2.5))
  } else {
    targetVol     = 0.12
    lastTranscLen = 0
  }
  smoothedVol += (targetVol - smoothedVol) * 0.14
}

// ── Silk-ribbon dual-bundle visualiser ───────────────────────
// Two bundles of sine lines:
//   Bundle A  phases 0 → π   → CYAN  → clusters at the TOP peaks
//   Bundle B  phases π → 2π  → PURPLE → clusters at the BOTTOM peaks
// At the zero-crossings the two bundles interleave and spread →
// the distinct "X crossing" and silk-ribbon look from the reference.
// Additive opacity stacking creates the bright ribbon bands automatically
// — no per-line glow needed.

const N_BUNDLE = 90   // lines per bundle (180 total)
const FREQ     = 1.6  // ~1.6 full sine cycles across the canvas

// Precomputed per-line data (immutable after init)
const bundleA = Array.from({ length: N_BUNDLE }, (_, i) => ({
  phase: (i / (N_BUNDLE - 1)) * Math.PI,                       // 0 → π
  jitter: 1 + (i / (N_BUNDLE - 1) - 0.5) * 0.06,              // ±3 % freq variation
}))
const bundleB = Array.from({ length: N_BUNDLE }, (_, i) => ({
  phase: Math.PI + (i / (N_BUNDLE - 1)) * Math.PI,             // π → 2π
  jitter: 1 + (i / (N_BUNDLE - 1) - 0.5) * 0.06,
}))

const spectrumCanvasEl = ref<HTMLCanvasElement>()
let animFrame   : number | null = null
let spectrumDpr = 1
let animTime    = 0

function resizeSpectrumCanvas() {
  const c = spectrumCanvasEl.value; if (!c) return
  spectrumDpr = window.devicePixelRatio || 1
  const r = c.getBoundingClientRect()
  c.width  = r.width  * spectrumDpr
  c.height = r.height * spectrumDpr
}

function drawBundle(
  ctx: CanvasRenderingContext2D,
  bundle: { phase: number; jitter: number }[],
  W: number, H: number, cy: number,
  AMP: number,
  rr: number, gg: number, bb: number,
) {
  // Pass 1 — thin core lines (additive stacking gives bright ribbon band)
  ctx.shadowBlur = 0
  ctx.lineWidth  = 0.9
  for (const line of bundle) {
    const alpha = 0.095
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha})`
    for (let xi = 0; xi <= Math.ceil(W); xi++) {
      const nx = xi / W
      const y  = cy + AMP * Math.sin(nx * FREQ * line.jitter * Math.PI * 2 + line.phase + animTime)
      if (xi === 0) ctx.moveTo(xi, y); else ctx.lineTo(xi, y)
    }
    ctx.stroke()
  }

  // Pass 2 — sparse glow pass (every 4th line, wider+blurry)
  ctx.shadowColor = `rgba(${rr},${gg},${bb},0.9)`
  ctx.lineWidth   = 1.4
  for (let i = 0; i < bundle.length; i += 4) {
    const line  = bundle[i]
    const alpha = 0.055
    ctx.shadowBlur  = 14
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha})`
    for (let xi = 0; xi <= Math.ceil(W); xi++) {
      const nx = xi / W
      const y  = cy + AMP * Math.sin(nx * FREQ * line.jitter * Math.PI * 2 + line.phase + animTime)
      if (xi === 0) ctx.moveTo(xi, y); else ctx.lineTo(xi, y)
    }
    ctx.stroke()
  }
}

function drawSpectrum() {
  const canvas = spectrumCanvasEl.value
  if (!canvas) { animFrame = requestAnimationFrame(drawSpectrum); return }
  const ctx = canvas.getContext('2d'); if (!ctx) return

  tickVolume()
  // Wave travels left; speed increases with volume while listening
  animTime += isListening.value ? 0.009 + smoothedVol * 0.007 : 0.005

  const W  = canvas.width  / spectrumDpr
  const H  = canvas.height / spectrumDpr
  const cy = H / 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.scale(spectrumDpr, spectrumDpr)

  const vol = Math.max(0.22, smoothedVol * 1.5)
  const AMP = H * 0.46 * vol  // nearly fills canvas height

  // Bundle A — CYAN  #06b6d4
  drawBundle(ctx, bundleA, W, H, cy, AMP,  6, 182, 212)
  // Bundle B — PURPLE #7c3aed
  drawBundle(ctx, bundleB, W, H, cy, AMP, 124,  58, 237)

  ctx.restore()
  animFrame = requestAnimationFrame(drawSpectrum)
}

// ── Controls ──────────────────────────────────────────────────
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

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  mounted.value = true
  if (canvasEl.value) initCanvas(canvasEl.value)
  if (spectrumCanvasEl.value) { resizeSpectrumCanvas(); drawSpectrum() }
  window.addEventListener('resize', resizeSpectrumCanvas)

  const st = { trigger: sectionEl.value, start: 'top 72%' }
  gsap.from('.spectrum-container', { scrollTrigger: st, opacity: 0, y: 36, duration: 1.3, ease: 'power3.out' })
  if (btnEl.value) {
    gsap.from(btnEl.value, {
      scrollTrigger: { trigger: btnEl.value, start: 'top 85%' },
      opacity: 0, y: 20, duration: 0.8,
    })
  }
})
onUnmounted(() => {
  destroy()
  if (animFrame)    cancelAnimationFrame(animFrame)
  if (waveInterval) clearInterval(waveInterval)
  window.removeEventListener('resize', resizeSpectrumCanvas)
})
</script>

<style scoped>
.voice-canvas { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

.voice-section {
  position: relative; min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3rem; padding: 6rem 1.5rem; overflow: hidden; background-color: var(--bg);
}

.bg-glow {
  position: absolute; top: 50%; left: 50%; translate: -50% -50%;
  width: 800px; height: 800px; border-radius: 50%;
  background: radial-gradient(circle,rgba(6,182,212,0.05) 0%,rgba(124,58,237,0.04) 40%,transparent 70%);
  pointer-events: none;
}

.spectrum-container {
  position: relative; z-index: 2;
  width: min(820px, 96vw); height: 280px;
  cursor: pointer; outline: none; border-radius: 0.75rem;
  transition: filter 0.4s;
}
.spectrum-container:hover { filter: brightness(1.10); }
.spectrum-canvas { width: 100%; height: 100%; display: block; }

/* ── Controls ─────────────────────────────────────────────── */
.btn-wrap {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
  gap: 1.5rem; width: 100%; max-width: 600px;
}

/* ── Live transcript box ──────────────────────────────────── */
.live-transcript {
  width: 100%;
  max-width: 520px;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.22);
  border-radius: 0.875rem;
  padding: 0.75rem 1rem;
  min-height: 2.8rem;
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
  0%   { box-shadow: 0 0 0 0   rgba(6, 182, 212, 0.55); }
  70%  { box-shadow: 0 0 0 7px rgba(6, 182, 212, 0);    }
  100% { box-shadow: 0 0 0 0   rgba(6, 182, 212, 0);    }
}

.live-text {
  font-size: 0.875rem;
  color: var(--text-base);
  line-height: 1.6;
  flex: 1;
  word-break: break-word;
}

.speak-btn {
  display: inline-flex; align-items: center; gap: 1.25rem;
  padding: 0.875rem 2.25rem;
  border: 1px solid rgba(6,182,212,0.55); border-radius: 9999px;
  background: transparent; color: #06b6d4;
  font-family: 'Space Grotesk', sans-serif; font-size: 0.875rem;
  font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer; transition: all 0.3s; box-shadow: 0 0 12px rgba(6,182,212,0.1);
}
.speak-btn:hover:not(:disabled) {
  background: rgba(6,182,212,0.07); border-color: rgba(6,182,212,0.9);
  box-shadow: 0 0 24px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.1);
  transform: translateY(-1px);
}
.speak-btn.active { background: rgba(6,182,212,0.1); border-color: #06b6d4; box-shadow: 0 0 30px rgba(6,182,212,0.35); color: #22d3ee; }
.speak-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.waveform { display: flex; align-items: center; gap: 3px; }
.wbar { display: block; width: 2.5px; border-radius: 2px; background: currentColor; opacity: 0.7; transition: height 0.3s; }
.wbar.animate { animation: wave-bar 0.5s ease infinite alternate; }
.wbar.animate:nth-child(2) { animation-delay: 0.1s; }
.wbar.animate:nth-child(3) { animation-delay: 0.2s; }
.wbar.animate:nth-child(4) { animation-delay: 0.3s; }
@keyframes wave-bar { from { transform: scaleY(0.4); } to { transform: scaleY(1.4); } }

.text-fallback { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.fallback-label { font-size: 0.8rem; color: var(--text-muted); text-align: center; }
.fallback-input-wrap { display: flex; align-items: center; gap: 0.625rem; width: 100%; max-width: 480px; }
.fallback-input {
  flex: 1; background: var(--surface); border: 1px solid rgba(6,182,212,0.25); border-radius: 9999px;
  padding: 0.75rem 1.25rem; font-size: 0.875rem; color: var(--text-base);
  outline: none; font-family: 'Inter', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
}
.fallback-input::placeholder { color: rgba(148,163,184,0.4); }
.fallback-input:focus { border-color: rgba(6,182,212,0.5); box-shadow: 0 0 0 3px rgba(6,182,212,0.08); }
.fallback-input:disabled { opacity: 0.5; }

.fallback-send {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg,#06b6d4,#7c3aed); border: none;
  display: flex; align-items: center; justify-content: center;
  color: white; cursor: pointer; flex-shrink: 0;
  transition: transform 0.15s, box-shadow 0.3s; box-shadow: 0 0 12px rgba(6,182,212,0.3);
}
.fallback-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 0 24px rgba(6,182,212,0.5); }
.fallback-send:disabled { opacity: 0.4; cursor: not-allowed; }

.spin { animation: spin 1.2s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.results { width: 100%; display: flex; flex-direction: column; gap: 0.875rem; }
.result-box { background: var(--surface); border: 1px solid rgba(6,182,212,0.15); border-radius: 1rem; padding: 1.125rem 1.375rem; }
.result-box.ai { border-color: rgba(124,58,237,0.25); background: rgba(124,58,237,0.06); }
.result-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #06b6d4; margin-bottom: 0.375rem; }
.result-box.ai .result-label { color: var(--primary-glow); }
.result-text { font-size: 0.875rem; color: var(--text-muted); line-height: 1.7; }

.stop-speak-btn {
  display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.875rem;
  padding: 0.5rem 1.125rem; border-radius: 9999px;
  border: 1px solid rgba(248,113,113,0.4); background: rgba(248,113,113,0.08);
  color: #f87171; font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem;
  font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
  cursor: pointer; transition: all 0.25s; animation: stop-pulse 1.5s ease-in-out infinite;
}
.stop-speak-btn:hover { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.7); box-shadow: 0 0 16px rgba(248,113,113,0.2); transform: translateY(-1px); }
@keyframes stop-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.15); } 50% { box-shadow: 0 0 0 6px rgba(248,113,113,0); } }

.voice-error { font-size: 0.825rem; color: #f87171; text-align: center; max-width: 450px; line-height: 1.6; padding: 0.75rem 1.25rem; background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 0.75rem; }
.not-supported { font-size: 0.875rem; color: var(--text-muted); text-align: center; max-width: 400px; line-height: 1.6; margin-bottom: 0.5rem; }

.slide-up-enter-active, .slide-up-leave-active { transition: opacity 0.4s, transform 0.4s; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }

@media (max-width: 600px) {
  .spectrum-container { height: 190px; }
  .fallback-input-wrap { max-width: 100%; }
}
</style>

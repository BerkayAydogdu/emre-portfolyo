<template>
  <section id="voice" ref="sectionEl" class="voice-section">
    <!-- Background radial glow -->
    <div class="bg-glow" aria-hidden="true" />

    <!-- Orb + rings -->
    <div ref="orbWrapEl" class="orb-wrap">
      <div class="ring ring-3" />
      <div class="ring ring-2" />
      <div class="ring ring-1" />
      <div
        class="orb"
        :class="{ listening: isListening, processing: isProcessing }"
        role="button"
        :aria-label="isListening ? $t('voice.listening') : $t('voice.speakBtn')"
        tabindex="0"
        @click="handleToggle"
        @keydown.enter="handleToggle"
      >
        <div class="orb-inner" />
      </div>
    </div>

    <!-- Text -->
    <div ref="textEl" class="voice-text">
      <h2 class="voice-tagline">{{ $t('voice.tagline') }}</h2>
      <p class="voice-desc">{{ $t('voice.orbSubtitle') }}</p>
    </div>

    <!-- SPEAK button + fallback -->
    <div ref="btnEl" class="btn-wrap">
      <template v-if="mounted && !isSupported">
        <p class="not-supported">{{ $t('voice.notSupported') }}</p>
        <!-- Even if speech is not supported, allow text input -->
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
        <!-- Speak button (hidden when speech has failed and fallback is active) -->
        <button
          v-if="!speechFailed"
          class="speak-btn"
          :class="{ active: isListening, processing: isProcessing }"
          :disabled="isProcessing"
          @click="handleToggle"
        >
          <!-- Left waveform -->
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

          <!-- Right waveform (mirror) -->
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

        <!-- Text input fallback (shows after speech fails OR alongside speech button) -->
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

        <!-- Results -->
        <Transition name="slide-up">
          <div v-if="transcript || aiResponse" class="results">
            <div v-if="transcript" class="result-box">
              <p class="result-label">{{ $t('voice.transcriptLabel') }}</p>
              <p class="result-text">{{ transcript }}</p>
            </div>
            <div v-if="aiResponse" class="result-box ai">
              <p class="result-label">{{ $t('voice.responseLabel') }}</p>
              <p class="result-text">{{ aiResponse }}</p>
              <!-- Stop speaking button -->
              <Transition name="slide-up">
                <button
                  v-if="isSpeaking"
                  class="stop-speak-btn"
                  @click="stopSpeaking"
                >
                  <UIcon name="i-lucide-volume-x" />
                  <span>{{ $t('voice.stopSpeaking') }}</span>
                </button>
              </Transition>
            </div>
          </div>
        </Transition>

        <!-- Error message -->
        <Transition name="slide-up">
          <p v-if="voiceError" class="voice-error">
            {{ voiceError }}
          </p>
        </Transition>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useVoiceBot } from '~/composables/useVoiceBot'

const { locale } = useI18n()
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
const mounted = ref(false)
const textInput = ref('')

const sectionEl = ref<HTMLElement>()
const orbWrapEl = ref<HTMLElement>()
const textEl = ref<HTMLElement>()
const btnEl = ref<HTMLElement>()

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

onMounted(() => {
  mounted.value = true

  const st = { trigger: sectionEl.value, start: 'top 72%' }

  // Rings expand in
  gsap.from('.ring', {
    scrollTrigger: st,
    scale: 0,
    opacity: 0,
    stagger: 0.12,
    duration: 1.1,
    ease: 'power3.out',
  })

  // Orb bounces in
  gsap.from('.orb', {
    scrollTrigger: st,
    scale: 0,
    opacity: 0,
    duration: 1.3,
    ease: 'back.out(2)',
    delay: 0.15,
  })

  // Text fades up
  if (textEl.value) {
    gsap.from(textEl.value.children, {
      scrollTrigger: { trigger: textEl.value, start: 'top 80%' },
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 0.9,
    })
  }

  // Button fades up
  if (btnEl.value) {
    gsap.from(btnEl.value, {
      scrollTrigger: { trigger: btnEl.value, start: 'top 85%' },
      opacity: 0,
      y: 20,
      duration: 0.8,
    })
  }
})
</script>

<style scoped>
/* ─── Section ─────────────────────────────────────────────── */
.voice-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  padding: 6rem 1.5rem;
  overflow: hidden;
  background-color: var(--bg);
}

/* ─── Bg radial glow ──────────────────────────────────────── */
.bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: 800px;
  height: 800px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(6, 182, 212, 0.06) 0%,
    rgba(124, 58, 237, 0.05) 40%,
    transparent 70%
  );
  pointer-events: none;
}

/* ─── Orb wrap ────────────────────────────────────────────── */
.orb-wrap {
  position: relative;
  width: 560px;
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ─── Rings ───────────────────────────────────────────────── */
.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  border-radius: 50%;
  border: 1px solid rgba(6, 182, 212, 0.2);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.05) inset;
}

.ring-1 { width: 280px; height: 280px; border-color: rgba(6, 182, 212, 0.3); }
.ring-2 { width: 420px; height: 420px; border-color: rgba(6, 182, 212, 0.18); }
.ring-3 { width: 556px; height: 556px; border-color: rgba(6, 182, 212, 0.1); }

/* ─── Orb ─────────────────────────────────────────────────── */
.orb {
  position: relative;
  z-index: 2;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 32%,
    #c084fc 0%,
    #06b6d4 38%,
    #7c3aed 65%,
    #4f46e5 100%
  );
  box-shadow:
    0 0 50px rgba(6, 182, 212, 0.65),
    0 0 100px rgba(124, 58, 237, 0.45),
    0 0 180px rgba(6, 182, 212, 0.2);
  animation: orb-breathe 4s ease-in-out infinite;
  cursor: pointer;
  transition: box-shadow 0.4s;
}

.orb.listening {
  animation: orb-listening 1.2s ease-in-out infinite;
  box-shadow:
    0 0 60px rgba(6, 182, 212, 0.9),
    0 0 120px rgba(124, 58, 237, 0.6),
    0 0 220px rgba(6, 182, 212, 0.35);
}

.orb.processing {
  animation: orb-spin-glow 2s linear infinite;
}

.orb-inner {
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 40% 35%,
    rgba(255, 255, 255, 0.25),
    transparent 60%
  );
}

@keyframes orb-breathe {
  0%, 100% { transform: scale(1);    box-shadow: 0 0 50px rgba(6,182,212,0.65), 0 0 100px rgba(124,58,237,0.45); }
  50%       { transform: scale(1.06); box-shadow: 0 0 70px rgba(6,182,212,0.8),  0 0 130px rgba(124,58,237,0.55); }
}

@keyframes orb-listening {
  0%, 100% { transform: scale(1);    }
  50%       { transform: scale(1.1); }
}

@keyframes orb-spin-glow {
  0%   { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

/* ─── Text ────────────────────────────────────────────────── */
.voice-text {
  text-align: center;
  max-width: 600px;
}

.voice-tagline {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.1rem, 2.5vw, 1.6rem);
  font-weight: 700;
  color: #06b6d4;
  text-shadow: 0 0 24px rgba(6, 182, 212, 0.55);
  margin-bottom: 1rem;
  letter-spacing: 0.01em;
}

.voice-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.8;
  max-width: 480px;
  margin: 0 auto;
}

/* ─── Button area ─────────────────────────────────────────── */
.btn-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
}

/* ─── Speak button ────────────────────────────────────────── */
.speak-btn {
  display: inline-flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.875rem 2.25rem;
  border: 1px solid rgba(6, 182, 212, 0.55);
  border-radius: 9999px;
  background: transparent;
  color: #06b6d4;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
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

/* ─── Waveform bars ───────────────────────────────────────── */
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

/* ─── Text input fallback ─────────────────────────────────── */
.text-fallback {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
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
  max-width: 480px;
}

.fallback-input {
  flex: 1;
  background: rgba(15, 15, 26, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 9999px;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  color: var(--text-base);
  outline: none;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.fallback-input::placeholder {
  color: rgba(148, 163, 184, 0.4);
}

.fallback-input:focus {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08);
}

.fallback-input:disabled {
  opacity: 0.5;
}

.fallback-send {
  width: 42px;
  height: 42px;
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

@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Results ─────────────────────────────────────────────── */
.results {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.result-box {
  background: rgba(15, 15, 26, 0.7);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 1rem;
  padding: 1.125rem 1.375rem;
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
  margin-bottom: 0.375rem;
}

.result-box.ai .result-label {
  color: var(--primary-glow);
}

.result-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.7;
}

/* ─── Stop speaking button ────────────────────────────────── */
.stop-speak-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.875rem;
  padding: 0.5rem 1.125rem;
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
  50%       { box-shadow: 0 0 0 6px rgba(248, 113, 113, 0); }
}

/* ─── Error ───────────────────────────────────────────────── */
.voice-error {
  font-size: 0.825rem;
  color: #f87171;
  text-align: center;
  max-width: 450px;
  line-height: 1.6;
  padding: 0.75rem 1.25rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: 0.75rem;
}

/* ─── Not supported ───────────────────────────────────────── */
.not-supported {
  font-size: 0.875rem;
  color: var(--text-muted);
  text-align: center;
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

@media (max-width: 600px) {
  .orb-wrap {
    width: 320px;
    height: 320px;
  }

  .ring-1 { width: 180px; height: 180px; }
  .ring-2 { width: 262px; height: 262px; }
  .ring-3 { width: 316px; height: 316px; }

  .orb {
    width: 110px;
    height: 110px;
  }

  .fallback-input-wrap {
    max-width: 100%;
  }
}
</style>

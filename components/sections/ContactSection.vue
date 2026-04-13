<template>
  <section id="contact" class="section contact-section">
    <div class="section-inner">
      <!-- Header -->
      <div ref="headerEl" class="contact-header">
        <span class="section-label">{{ $t('contact.label') }}</span>
        <h2 class="section-title contact-title">{{ $t('contact.title') }}</h2>
        <p class="contact-subtitle">{{ $t('contact.subtitle') }}</p>
      </div>

      <div ref="bodyEl" class="contact-body">
        <!-- Form -->
        <div class="form-wrap">
          <Transition name="slide-up" mode="out-in">
            <div v-if="submitted" class="success-msg">
              <UIcon name="i-lucide-check-circle" class="success-icon" />
              <p>{{ $t('contact.form.success') }}</p>
            </div>
            <form v-else class="contact-form" @submit.prevent="submitForm">
              <div class="form-field">
                <label>{{ $t('contact.form.name') }}</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  :placeholder="$t('contact.form.namePlaceholder')"
                  required
                />
              </div>
              <div class="form-field">
                <label>{{ $t('contact.form.email') }}</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  :placeholder="$t('contact.form.emailPlaceholder')"
                  required
                />
              </div>
              <div class="form-field">
                <label>{{ $t('contact.form.message') }}</label>
                <textarea
                  v-model="form.message"
                  class="form-input"
                  rows="5"
                  :placeholder="$t('contact.form.messagePlaceholder')"
                  required
                />
              </div>
              <button type="submit" class="submit-btn" :disabled="submitting">
                <UIcon v-if="submitting" name="i-lucide-loader-circle" class="btn-icon spin" />
                <UIcon v-else name="i-lucide-send" class="btn-icon" />
                {{ submitting ? $t('contact.form.sending') : $t('contact.form.submit') }}
              </button>
            </form>
          </Transition>
        </div>

        <!-- Info panel -->
        <div class="info-panel">
          <!-- Contact info -->
          <div class="info-block">
            <div class="info-item">
              <div class="info-icon-wrap">
                <UIcon name="i-lucide-mail" class="info-icon" />
              </div>
              <div>
                <p class="info-label">Email</p>
                <a :href="`mailto:${$t('contact.info.email')}`" class="info-value">
                  {{ $t('contact.info.email') }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon-wrap">
                <UIcon name="i-lucide-map-pin" class="info-icon" />
              </div>
              <div>
                <p class="info-label">{{ $t('contact.location') }}</p>
                <p class="info-value">{{ $t('contact.info.location') }}</p>
              </div>
            </div>
          </div>

          <!-- Social links -->
          <div class="social-block">
            <p class="info-label" style="margin-bottom: 1rem;">{{ $t('contact.social') }}</p>
            <div class="social-links">
              <a
                v-for="social in socials"
                :key="social.label"
                :href="social.href"
                :aria-label="social.label"
                class="social-btn"
                target="_blank"
                rel="noopener"
              >
                <UIcon :name="social.icon" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer line -->
      <div ref="footerEl" class="footer-line">
        <p class="footer-text">
          © {{ new Date().getFullYear() }} Emre · {{ $t('contact.copyright') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const headerEl = ref<HTMLElement>()
const bodyEl = ref<HTMLElement>()
const footerEl = ref<HTMLElement>()

const form = reactive({ name: '', email: '', message: '' })
const submitting = ref(false)
const submitted = ref(false)

const socials = [
  { label: 'GitHub',   href: '#', icon: 'i-simple-icons-github' },
  { label: 'LinkedIn', href: '#', icon: 'i-simple-icons-linkedin' },
  { label: 'Twitter',  href: '#', icon: 'i-simple-icons-x' },
]

async function submitForm() {
  submitting.value = true
  // UI-only for now: simulate a short delay then show success
  await new Promise((r) => setTimeout(r, 900))
  submitting.value = false
  submitted.value = true
}

onMounted(() => {
  if (headerEl.value) {
    gsap.from(headerEl.value.children, {
      scrollTrigger: { trigger: headerEl.value, start: 'top 85%' },
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.8,
    })
  }
  if (bodyEl.value) {
    gsap.from(bodyEl.value.children, {
      scrollTrigger: { trigger: bodyEl.value, start: 'top 85%' },
      opacity: 0,
      y: 40,
      stagger: 0.2,
      duration: 0.9,
    })
  }
})
</script>

<style scoped>
.contact-section {
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(124, 58, 237, 0.04) 40%,
    transparent 100%
  );
  padding-bottom: 4rem;
}

.contact-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.contact-title {
  font-size: clamp(2.5rem, 6vw, 5rem);
}

.contact-subtitle {
  margin-top: 0.875rem;
  color: var(--text-muted);
  font-size: 1rem;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.contact-body {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
  align-items: start;
  margin-bottom: 4rem;
}

/* Form */
.form-wrap {}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.03em;
}

.form-input {
  background: rgba(15, 15, 26, 0.6);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: var(--text-base);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: 'Inter', sans-serif;
  resize: none;
  width: 100%;
}

.form-input::placeholder {
  color: rgba(148, 163, 184, 0.4);
}

.form-input:focus {
  border-color: rgba(167, 139, 250, 0.4);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08);
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.875rem 2rem;
  background: var(--primary);
  border: none;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.3s;
  align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
  background: #6d28d9;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon.spin {
  animation: spin 1.2s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Success */
.success-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  background: rgba(124, 58, 237, 0.06);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 1.25rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.success-icon {
  font-size: 3rem;
  color: #22c55e;
}

/* Info panel */
.info-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon {
  color: var(--primary-glow);
}

.info-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.info-value {
  font-size: 0.9rem;
  color: var(--text-base);
  text-decoration: none;
  transition: color 0.2s;
}

a.info-value:hover {
  color: var(--primary-glow);
}

/* Social */
.social-links {
  display: flex;
  gap: 0.75rem;
}

.social-btn {
  width: 44px;
  height: 44px;
  border-radius: 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.25s;
  font-size: 1rem;
}

.social-btn:hover {
  background: rgba(124, 58, 237, 0.15);
  border-color: rgba(167, 139, 250, 0.4);
  color: var(--text-base);
  transform: translateY(-2px);
}

/* Footer */
.footer-line {
  border-top: 1px solid var(--border-subtle);
  padding-top: 2rem;
  text-align: center;
}

.footer-text {
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.5);
}

@media (max-width: 768px) {
  .contact-body {
    grid-template-columns: 1fr;
  }

  .info-panel {
    order: -1;
  }
}
</style>

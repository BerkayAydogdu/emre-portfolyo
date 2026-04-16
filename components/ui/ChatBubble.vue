<template>
  <div v-if="chatEnabled" class="chat-root">
    <!-- Panel -->
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="chat-panel glass"
        data-lenis-prevent
      >
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <UIcon name="i-lucide-bot" class="text-violet-400" />
            </div>
            <div>
              <p class="chat-title">{{ $t('chat.title') }}</p>
              <p class="chat-status">
                <span class="status-dot" />
                {{ $t('chat.online') }}
              </p>
              <p v-if="pageContextShort" class="chat-context-hint">{{ pageContextShort }}</p>
            </div>
          </div>
          <button class="close-btn" aria-label="Close chat" @click="isOpen = false">
            <UIcon name="i-lucide-x" />
          </button>
        </div>

        <!-- Messages -->
        <div ref="messagesEl" class="chat-messages">
          <!-- Welcome -->
          <div v-if="messages.length === 0" class="welcome-msg">
            <p>{{ welcomeMessage }}</p>
          </div>

          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="msg-row"
            :class="msg.role"
          >
            <div class="msg-bubble">
              {{ msg.content }}
              <span v-if="msg.role === 'assistant' && i === messages.length - 1 && isLoading" class="typing-cursor">▌</span>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isLoading && messages[messages.length - 1]?.role !== 'assistant'" class="msg-row assistant">
            <div class="msg-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <div class="chat-prompt-block">
          <p class="chat-input-lead">{{ inputLeadText }}</p>
          <div class="chat-suggestions" role="list">
            <button
              v-for="(s, i) in suggestionPrompts"
              :key="i"
              type="button"
              class="chat-suggestion-chip"
              @click="applySuggestion(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>
        <div class="chat-input-area">
          <input
            ref="inputEl"
            v-model="inputText"
            class="chat-input"
            :placeholder="$t('chat.placeholder')"
            :disabled="isLoading || !chatEnabled"
            @keydown.enter.exact.prevent="send"
            @keydown.shift.enter="() => {}"
          />
          <button
            class="send-btn"
            :disabled="!inputText.trim() || isLoading"
            aria-label="Send"
            @click="send"
          >
            <UIcon name="i-lucide-send" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Trigger button -->
    <button
      type="button"
      class="chat-trigger"
      :class="{ active: isOpen, 'chat-trigger--disabled': !chatEnabled }"
      :disabled="!chatEnabled"
      :title="!chatEnabled ? $t('chat.disabledHint') : ''"
      aria-label="Open AI chat"
      @click="toggleChat"
    >
      <span v-if="!isOpen && chatEnabled" class="pulse-ring" />
      <span v-if="!isOpen && chatEnabled" class="pulse-ring delay" />
      <UIcon :name="isOpen ? 'i-lucide-x' : 'i-lucide-message-circle'" class="trigger-icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCloudflareAI } from '~/composables/useCloudflareAI'

const route = useRoute()
const { t } = useI18n()
const { chatEnabled } = useChatAvailability()
const chatPageContext = useChatPageContext()

const isReaderRoute = computed(
  () => route.path.startsWith('/yazi/') || route.path.startsWith('/proje/'),
)

const welcomeMessage = computed(() => {
  if (!chatEnabled.value) return t('chat.welcome')
  if (isReaderRoute.value) return t('chat.welcomeReaderHi')
  return t('chat.welcomeDigitalMindHi')
})

const inputLeadText = computed(() =>
  isReaderRoute.value ? t('chat.inputLeadReader') : t('chat.inputLeadDigitalMind'),
)

const suggestionPrompts = computed(() =>
  isReaderRoute.value
    ? [t('chat.readerSuggest1'), t('chat.readerSuggest2'), t('chat.readerSuggest3')]
    : [t('chat.suggest1'), t('chat.suggest2'), t('chat.suggest3')],
)

function applySuggestion(text: string) {
  inputText.value = text
  nextTick(() => inputEl.value?.focus())
}

const pageContextShort = computed(() => {
  const w = chatPageContext.value.where
  if (!w) return ''
  return w.length > 72 ? `${w.slice(0, 69)}…` : w
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const isOpen = ref(false)
const inputText = ref('')
const isLoading = ref(false)
const messages = ref<Message[]>([])
const messagesEl = ref<HTMLElement>()
const inputEl = ref<HTMLInputElement>()

/** After closing the panel, the next send uses only that message + page context (model “forgets” prior turns). */
const forgetPriorTurnsForApi = ref(false)

function resetChatSession() {
  messages.value = []
  inputText.value = ''
  isLoading.value = false
  forgetPriorTurnsForApi.value = false
}

function focusPageContent() {
  if (!import.meta.client) return
  nextTick(() => {
    inputEl.value?.blur()
    const main = document.querySelector('main')
    if (main instanceof HTMLElement) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
      main.focus({ preventScroll: true })
    }
  })
}

watch(chatEnabled, (on) => {
  if (!on) {
    isOpen.value = false
    resetChatSession()
  }
})

watch(
  () => route.path,
  () => {
    resetChatSession()
    isOpen.value = false
  },
)

watch(isOpen, (open) => {
  if (!open) {
    forgetPriorTurnsForApi.value = true
    focusPageContent()
  }
})

const { streamChat } = useCloudflareAI()

function toggleChat() {
  if (!chatEnabled.value) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      inputEl.value?.focus()
      scrollToBottom()
    })
  }
}

async function send() {
  if (!chatEnabled.value) return
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: text })
  isLoading.value = true
  scrollToBottom()

  const aiIndex = messages.value.length
  messages.value.push({ role: 'assistant', content: '' })

  const historyForApi = forgetPriorTurnsForApi.value
    ? [{ role: 'user' as const, content: text }]
    : messages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
  forgetPriorTurnsForApi.value = false

  try {
    await streamChat(
      historyForApi,
      (token) => {
        messages.value[aiIndex].content += token
        scrollToBottom()
      },
      { pageContext: chatPageContext.value },
    )
  } catch {
    messages.value[aiIndex].content = t('chat.error')
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}
</script>

<style scoped>
/*
  Chat sits under layout div with color: var(--text-base). Nuxt UI / Tailwind can also set
  text color on inputs. We split styles by html.light vs dark chrome so light mode never
  gets dark-on-dark text.
*/
.chat-root {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

/* Panel */
.chat-panel {
  width: 360px;
  height: 540px;
  max-height: min(540px, 70vh);
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.25), 0 20px 60px rgba(0,0,0,0.5);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 15, 26, 0.92);
  flex-shrink: 0;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.2);
  border: 1px solid rgba(167, 139, 250, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark page theme: light copy on dark chrome */
.chat-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc !important;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  color: #cbd5e1 !important;
}

.chat-context-hint {
  margin-top: 0.35rem;
  font-size: 0.65rem;
  line-height: 1.35;
  color: #cbd5e1 !important;
  max-width: 220px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

.close-btn {
  background: none;
  border: none;
  color: #cbd5e1 !important;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f8fafc !important;
}

/* Messages — min-height:0 so flex lets this region shrink and scroll (was blocking scroll) */
.chat-messages {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: 2px;
}

.welcome-msg {
  text-align: center;
  padding: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.6;
}

.msg-row {
  display: flex;
}

.msg-row.user {
  justify-content: flex-end;
}

.msg-row.assistant {
  justify-content: flex-start;
}

.msg-bubble {
  max-width: 80%;
  padding: 0.625rem 0.875rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.msg-row.user .msg-bubble {
  background: rgba(124, 58, 237, 0.35);
  color: var(--text-base);
  border-bottom-right-radius: 0.25rem;
  border: 1px solid rgba(167, 139, 250, 0.2);
}

/* Dark site: assistant = dark bubble + light text (never inherit layout color) */
.msg-row.assistant .msg-bubble {
  background: rgba(22, 22, 35, 0.98);
  color: #f1f5f9 !important;
  border-bottom-left-radius: 0.25rem;
  border: 1px solid rgba(148, 163, 184, 0.28);
}

.typing-cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Typing dots */
.msg-bubble.typing {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 0.75rem 1rem;
}

.msg-bubble.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-glow);
  animation: bounce-dot 1.2s ease infinite;
}

.msg-bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
.msg-bubble.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%           { transform: translateY(-6px); opacity: 1; }
}

.chat-prompt-block {
  flex-shrink: 0;
  padding: 0.75rem 1rem 0.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(12, 12, 22, 0.65);
}

.chat-input-lead {
  margin: 0 0 0.5rem;
  font-size: 0.72rem;
  line-height: 1.45;
  color: #94a3b8;
}

.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chat-suggestion-chip {
  font-size: 0.68rem;
  line-height: 1.3;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(167, 139, 250, 0.35);
  background: rgba(124, 58, 237, 0.12);
  color: #e9d5ff;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
}

.chat-suggestion-chip:hover {
  background: rgba(124, 58, 237, 0.22);
  border-color: rgba(167, 139, 250, 0.55);
}

/* Input */
.chat-input-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 15, 26, 0.92);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  background: rgba(30, 27, 58, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.75rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8rem;
  color: #f8fafc !important;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input::placeholder {
  color: #94a3b8 !important;
}

.chat-input:focus {
  border-color: rgba(167, 139, 250, 0.4);
}

.chat-input:disabled {
  opacity: 0.5;
}

.send-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.1s;
}

.send-btn:hover:not(:disabled) {
  background: #6d28d9;
}

.send-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Trigger */
.chat-trigger {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
  transition: background 0.2s, transform 0.2s;
}

.chat-trigger:hover {
  background: #6d28d9;
  transform: scale(1.05);
}

.chat-trigger.active {
  background: #6d28d9;
}

.chat-trigger--disabled {
  opacity: 0.42;
  cursor: not-allowed;
  filter: grayscale(0.35);
  box-shadow: none;
}

.chat-trigger--disabled:hover {
  transform: none;
  background: var(--primary);
}

.trigger-icon {
  color: white;
  font-size: 1.375rem;
  z-index: 1;
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--primary);
  animation: pulse-ring 2s ease-out infinite;
}

.pulse-ring.delay {
  animation-delay: 1s;
}

@media (max-width: 480px) {
  .chat-panel {
    width: calc(100vw - 2rem);
    height: min(520px, 72vh);
    max-height: min(520px, 72vh);
  }
}

/* Light site theme: use page tokens so header / bubbles / input are never dark-on-dark */
html.light .chat-header {
  background: var(--surface);
  border-bottom-color: var(--border-subtle);
}

html.light .chat-title {
  color: var(--text-base) !important;
}

html.light .chat-status,
html.light .chat-context-hint {
  color: var(--text-muted) !important;
}

html.light .close-btn {
  color: var(--text-muted) !important;
}

html.light .close-btn:hover {
  color: var(--text-base) !important;
}

html.light .msg-row.assistant .msg-bubble {
  background: #eef2f6;
  color: var(--text-base) !important;
  border: 1px solid var(--border-subtle);
}

html.light .chat-prompt-block {
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  border-top-color: var(--border-subtle);
}

html.light .chat-input-lead {
  color: var(--text-muted);
}

html.light .chat-suggestion-chip {
  border-color: var(--border-subtle);
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--text-base);
}

html.light .chat-suggestion-chip:hover {
  background: color-mix(in srgb, var(--primary) 18%, transparent);
}

html.light .chat-input-area {
  background: var(--surface);
  border-top-color: var(--border-subtle);
}

html.light .chat-input {
  background: #ffffff;
  color: var(--text-base) !important;
  border: 1px solid var(--border-subtle);
}

html.light .chat-input::placeholder {
  color: var(--text-muted) !important;
}
</style>

<template>
  <div class="chat-root">
    <!-- Panel -->
    <Transition name="slide-up">
      <div v-if="isOpen" class="chat-panel glass">
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
            <p>{{ $t('chat.welcome') }}</p>
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

        <!-- Input -->
        <div class="chat-input-area">
          <input
            ref="inputEl"
            v-model="inputText"
            class="chat-input"
            :placeholder="$t('chat.placeholder')"
            :disabled="isLoading"
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
      class="chat-trigger"
      :class="{ active: isOpen }"
      aria-label="Open AI chat"
      @click="toggleChat"
    >
      <span v-if="!isOpen" class="pulse-ring" />
      <span v-if="!isOpen" class="pulse-ring delay" />
      <UIcon :name="isOpen ? 'i-lucide-x' : 'i-lucide-message-circle'" class="trigger-icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCloudflareAI } from '~/composables/useCloudflareAI'

const { t } = useI18n()

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'emre-chat-history'
const isOpen = ref(false)
const inputText = ref('')
const isLoading = ref(false)
const messages = ref<Message[]>([])
const messagesEl = ref<HTMLElement>()
const inputEl = ref<HTMLInputElement>()

const { streamChat } = useCloudflareAI()

// Persist chat history
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) messages.value = JSON.parse(saved)
  } catch {}
})

watch(
  messages,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val.slice(-30)))
    } catch {}
  },
  { deep: true },
)

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      inputEl.value?.focus()
      scrollToBottom()
    })
  }
}

async function send() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: text })
  isLoading.value = true
  scrollToBottom()

  const aiIndex = messages.value.length
  messages.value.push({ role: 'assistant', content: '' })

  try {
    await streamChat(
      messages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      (token) => {
        messages.value[aiIndex].content += token
        scrollToBottom()
      },
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
  height: 500px;
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.25), 0 20px 60px rgba(0,0,0,0.5);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(15, 15, 26, 0.6);
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

.chat-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-base);
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  color: var(--text-muted);
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
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-base);
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
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

.msg-row.assistant .msg-bubble {
  background: rgba(15, 15, 26, 0.8);
  color: var(--text-muted);
  border-bottom-left-radius: 0.25rem;
  border: 1px solid var(--border-subtle);
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

/* Input */
.chat-input-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--border-subtle);
  background: rgba(15, 15, 26, 0.6);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  background: rgba(30, 27, 58, 0.5);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8rem;
  color: var(--text-base);
  outline: none;
  transition: border-color 0.2s;
}

.chat-input::placeholder {
  color: var(--text-muted);
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
    height: 420px;
  }
}
</style>

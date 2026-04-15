<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="login-logo">⚡</span>
        <h1>Admin Panel</h1>
        <p>PIN ve Google Authenticator kodunu gir</p>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <UFormField label="PIN" :error="errors.pin">
          <UInput
            v-model="pin"
            type="password"
            placeholder="••••••"
            autocomplete="current-password"
            :disabled="loading"
            autofocus
            size="lg"
            @input="errors.pin = ''"
          />
        </UFormField>

        <UFormField label="Authenticator Kodu" :error="errors.code">
          <UInput
            ref="codeInput"
            v-model="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            autocomplete="one-time-code"
            :disabled="loading"
            size="lg"
            @input="onCodeInput"
          />
        </UFormField>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          :title="errorMessage"
          icon="i-lucide-alert-circle"
          class="login-error"
        />

        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          :disabled="pin.length === 0 || code.length !== 6"
        >
          Giriş Yap
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: [],
})

// Redirect to /admin if already authenticated
const { data } = await useFetch('/api/admin/auth/me', { server: false }).catch(() => ({ data: null }))
if (data?.value) navigateTo('/admin')

const pin = ref('')
const code = ref('')
const loading = ref(false)
const errorMessage = ref('')
const errors = reactive({ pin: '', code: '' })
const codeInput = ref()

function onCodeInput() {
  errors.code = ''
  // Auto-submit when 6 digits entered
  if (code.value.length === 6 && pin.value.length > 0) {
    submit()
  }
}

async function submit() {
  if (loading.value) return
  errorMessage.value = ''

  loading.value = true
  try {
    await $fetch('/api/admin/auth/verify', {
      method: 'POST',
      body: { pin: pin.value, code: code.value },
    })
    navigateTo('/admin')
  }
  catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if (status === 429) {
      errorMessage.value = 'Çok fazla hatalı deneme. 10 dakika bekle.'
    }
    else {
      errorMessage.value = 'PIN veya kod hatalı. Tekrar dene.'
    }
    code.value = ''
    nextTick(() => codeInput.value?.input?.focus())
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 40px 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 36px;
  display: block;
  margin-bottom: 12px;
}

.login-header h1 {
  font-size: 22px;
  margin: 0 0 6px;
  color: var(--text-base);
}

.login-header p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-error {
  margin: 0;
}
</style>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
    
    <div class="w-full max-w-md">
      <UCard class="shadow-xl ring-1 ring-gray-200 dark:ring-gray-800" :ui="{ body: { padding: 'px-8 py-10 sm:px-10 sm:py-12' } }">
        <div class="text-center mb-10">
          <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 ring-1 ring-primary-200 dark:ring-primary-800/50 shadow-sm">
            <UIcon name="i-lucide-zap" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">PIN ve Google Authenticator kodunu gir</p>
        </div>

        <form class="flex flex-col gap-6" @submit.prevent="submit">
          <UFormField label="PIN Değeri" :error="errors.pin" size="xl">
            <UInput
              v-model="pin"
              type="password"
              placeholder="••••••"
              autocomplete="current-password"
              :disabled="loading"
              autofocus
              icon="i-lucide-lock"
              class="w-full"
              @input="errors.pin = ''"
            />
          </UFormField>

          <UFormField label="Authenticator Kodu" :error="errors.code" size="xl">
            <UInput
              ref="codeInput"
              v-model="code"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              autocomplete="one-time-code"
              :disabled="loading"
              icon="i-lucide-smartphone"
              class="w-full"
              @input="onCodeInput"
            />
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="red"
            variant="soft"
            :title="errorMessage"
            icon="i-lucide-alert-circle"
            class="mb-2"
          />

          <UButton
            type="submit"
            block
            size="xl"
            :loading="loading"
            :disabled="pin.length === 0 || code.length !== 6"
            color="primary"
            class="mt-4 font-bold tracking-wide"
          >
            Sisteme Giriş Yap
          </UButton>
        </form>
      </UCard>
      
      <div class="text-center mt-8 text-sm text-gray-400 dark:text-gray-500">
        &copy; {{ new Date().getFullYear() }} Dijital Antropoloji
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: [],
})

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
  if (code.value.length === 6 && pin.value.length > 0) submit()
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
    errorMessage.value = status === 429
      ? 'Çok fazla hatalı deneme. 10 dakika bekle.'
      : 'PIN veya kod hatalı. Tekrar dene.'
    code.value = ''
    nextTick(() => codeInput.value?.input?.focus())
  }
  finally {
    loading.value = false
  }
}
</script>



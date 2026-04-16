<template>
  <div class="login-wrapper">
    <UCard class="login-card">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Paneli</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Devam etmek için şifrenizi girin</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <UFormField label="Kullanıcı Adı" name="username">
          <UInput
            v-model="username"
            type="text"
            placeholder="Kullanıcı adınızı girin"
            icon="i-heroicons-user"
            size="lg"
            :disabled="loading"
            autocomplete="username"
            autofocus
          />
        </UFormField>

        <UFormField label="Şifre" name="password">
          <UInput
            v-model="password"
            type="password"
            placeholder="Şifrenizi girin"
            icon="i-heroicons-lock-closed"
            size="lg"
            :disabled="loading"
            autocomplete="current-password"
          />
        </UFormField>

        <UAlert
          v-if="error"
          color="warning"
          variant="soft"
          icon="i-heroicons-information-circle"
          :title="error"
        />

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="loading"
        >
          Giriş Yap
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'Admin Girişi'
})

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Lütfen kullanıcı adı ve şifre girin.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    if (res.success) {
      // Hard redirect to avoid Nuxt client-side routing/cookie issues after login
      window.location.href = '/admin'
    }
  } catch (err: any) {
    if (err.data?.statusMessage) {
      error.value = err.data.statusMessage
    } else if (err.data?.message) {
      error.value = err.data.message
    } else {
      error.value = 'Giriş işlemi başarısız oldu.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9; /* Same as admin-root background */
  font-family: 'Inter', sans-serif;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Force light theme colors for the login card inside the dark mode by overriding locally if needed
   Nuxt UI components handle dark mode automatically, but admin layout forces light.
   So let's enforce light mode style manually since layout is false. */
.login-wrapper {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text-base: #0f172a;
  background-color: var(--bg);
}

:deep(.bg-white) {
  background-color: var(--surface) !important;
}
:deep(.text-gray-900) {
  color: var(--text-base) !important;
}
</style>

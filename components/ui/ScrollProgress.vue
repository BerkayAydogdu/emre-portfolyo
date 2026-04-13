<template>
  <div class="scroll-progress-track" aria-hidden="true">
    <div class="scroll-progress-bar" :style="{ width: `${progress}%` }" />
  </div>
</template>

<script setup lang="ts">
const progress = ref(0)

function onScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.scroll-progress-track {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: transparent;
  z-index: 100;
}

.scroll-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  transition: width 0.1s linear;
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.8);
}
</style>

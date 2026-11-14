<template>
  <div>
    <HeroSection />
    <AboutSection />
    <SocialMarquee />
    
    <DigitalMindApp />
    
    <TestimonialsSection />
    <ContactSection />
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

useHead({
  title: computed(() =>
    locale.value === 'tr'
      ? 'Emre Çete Portföy Sayfası'
      : 'Emre Çete Portfolio Page'
  ),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        locale.value === 'tr'
          ? 'Dijital iletişim, medya çalışmaları, yazılar, projeler, araştırmalar...'
          : 'Digital communication, media studies, writings, projects, researches...'
      ),
    },
    {
      property: 'og:title',
      content: 'Emre Çete Portfolio Page',
    },
    {
      property: 'og:description',
      content: 'Digital communication, media studies, writings, projects, researches...',
    },
  ],
})
</script>

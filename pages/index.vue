<template>
  <div>
    <HeroSection />
    <VoiceBotSection />
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
      ? 'Emre — Dijital Antropolog & Düşünce Üreticisi'
      : 'Emre — Digital Anthropologist & Thought Producer'
  ),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        locale.value === 'tr'
          ? 'Teknoloji, kültür ve insan ilişkilerinin kesişim noktasında çalışan dijital antropolog ve araştırmacı.'
          : 'A digital anthropologist and researcher working at the intersection of technology, culture, and human relations.'
      ),
    },
    {
      property: 'og:title',
      content: 'Emre — Digital Anthropologist',
    },
    {
      property: 'og:description',
      content: 'Teknoloji, kültür ve insan ilişkilerinin kesişim noktasında çalışan araştırmacı.',
    },
  ],
})
</script>

<template>
  <div class="relative min-h-screen" style="background-color: var(--bg); color: var(--text-base); transition: background-color 0.3s, color 0.3s;">
    <NavBar />
    <ScrollProgress />
    <main>
      <slot />
    </main>
    <ChatBubble />
  </div>
</template>

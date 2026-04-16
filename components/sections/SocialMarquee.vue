<template>
  <section class="social-showcase-section">
    <div class="social-header">
      <h2 class="social-title">{{ $t('contact.social') }}</h2>
    </div>

    <div class="marquee-fade-left"></div>
    <div class="marquee-fade-right"></div>
    
    <div class="marquee-container">
      <div class="marquee-track">
        
        <!-- İki Set Döngü (Sonsuz animasyon için) -->
        <div v-for="set in 2" :key="`set-${set}`" class="marquee-content" :aria-hidden="set === 2">
          
          <a v-for="(item, idx) in showcaseItems" :key="`${set}-${idx}`" :href="item.url" target="_blank" class="showcase-card group">
            
            <!-- Type: Image (Instagram-like) -->
            <div v-if="item.type === 'instagram'" class="card-bg">
              <img :src="item.image" class="bg-img" alt="" />
              <div class="overlay inst-overlay"></div>
              <div class="platform-badge">
                <UIcon :name="item.icon" class="badge-icon" />
                <span>{{ item.platform }}</span>
              </div>
              <div class="card-content-bottom">
                <div class="handle">{{ item.handle }}</div>
                <div class="action-btn">Profili Gör</div>
              </div>
            </div>

            <!-- Type: Text (X-like) -->
            <div v-if="item.type === 'x'" class="card-bg x-bg">
              <div class="platform-badge">
                <UIcon :name="item.icon" class="badge-icon" />
                <span>{{ item.platform }}</span>
              </div>
              <div class="card-content-center">
                <div class="tweet-text">{{ item.text }}</div>
              </div>
              <div class="card-content-bottom">
                <div class="handle">{{ item.handle }}</div>
                <div class="action-btn">Takip Et</div>
              </div>
            </div>

            <!-- Type: Article (Medium-like) -->
            <div v-if="item.type === 'medium'" class="card-bg">
              <img :src="item.image" class="bg-img" alt="" />
              <div class="overlay medium-overlay"></div>
              <div class="platform-badge">
                <UIcon :name="item.icon" class="badge-icon" />
                <span>{{ item.platform }}</span>
              </div>
              <div class="card-content-bottom">
                <div class="article-title">{{ item.title }}</div>
                <div class="handle mt-2">{{ item.handle }}</div>
              </div>
            </div>

            <!-- Type: Profile (LinkedIn-like) -->
            <div v-if="item.type === 'linkedin'" class="card-bg linkedin-bg">
              <div class="lin-header-img"></div>
              <div class="platform-badge absolute top-4 right-4 z-10">
                <UIcon :name="item.icon" class="badge-icon" />
              </div>
              <div class="card-content-lin">
                <div class="avatar-ph">
                  <img v-if="item.image" :src="item.image" class="avatar-img" alt="" />
                  <UIcon v-else name="i-lucide-user" />
                </div>
                <div class="lin-name">{{ item.handle }}</div>
                <div class="lin-title">{{ item.title }}</div>
                <div class="action-btn mt-4 w-full text-center">Bağlantı Kur</div>
              </div>
            </div>

            <div class="glow-border"></div>
          </a>

        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { socials } = usePortfolioDataRuntime()

// Fallback in case socials isn't populated yet or undefined.
const showcaseItems = computed(() => socials.value || [])
</script>

<style scoped>
.social-showcase-section {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  overflow: hidden;
  padding: 2rem 0 4rem;
  background: var(--surface);
  border-top: 1px solid rgba(124, 58, 237, 0.1);
  border-bottom: 1px solid rgba(124, 58, 237, 0.1);
}

.social-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.social-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  font-size: 2.0rem;
  color: var(--text-base);
}

.marquee-fade-left,
.marquee-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10vw;
  z-index: 10;
  pointer-events: none;
}

.marquee-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--surface) 0%, transparent 100%);
}

.marquee-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--surface) 0%, transparent 100%);
}

.marquee-container {
  width: 100%;
}

.marquee-track {
  display: flex;
  width: fit-content;
  animation: slideShowcase 45s linear infinite;
}

.marquee-container:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes slideShowcase {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-content {
  display: flex;
  gap: 2.5rem;
  padding-right: 2.5rem;
  align-items: center;
}

/* ─── KOCAMAN KART TASARIMI ───────────────────────────── */
.showcase-card {
  position: relative;
  width: 320px;
  height: 460px;
  border-radius: 24px;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;
  flex-shrink: 0;
  text-decoration: none;
  color: var(--text-base);
}

.showcase-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 58, 237, 0.2);
  border-color: rgba(167, 139, 250, 0.5);
  z-index: 20;
}

.card-bg {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s;
}

.showcase-card:hover .bg-img {
  transform: scale(1.08);
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.inst-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%);
}
.medium-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 100%);
}

.platform-badge {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.05em;
}

.badge-icon {
  font-size: 1.2rem;
}

.card-content-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1.5rem 1.5rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.handle {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.article-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.4rem;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  color: #fff;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.showcase-card:hover .action-btn {
  background: white;
  color: black;
}

/* ── X (Twitter) card ─────────────────────────────────── */
.x-bg {
  background: #0a0a0a;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}
/* subtle radial glow behind tweet text */
.x-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 70%),
    radial-gradient(ellipse 80% 60% at 80% 80%, rgba(29,155,240,0.08) 0%, transparent 60%);
  pointer-events: none;
}
/* horizontal scan-line texture */
.x-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px
  );
  pointer-events: none;
}
.x-bg .platform-badge {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.12);
  color: #fff;
}
.x-bg .platform-badge .badge-icon { color: #fff; }
.x-bg .card-content-bottom { color: #fff; }
.x-bg .action-btn {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
  color: #fff;
}
.x-bg:hover .action-btn,
.showcase-card:hover .x-bg .action-btn {
  background: #fff;
  color: #000;
}
.card-content-center {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  margin-top: 2rem;
}
.tweet-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #e7e9ea;
  font-family: 'Space Grotesk', sans-serif;
}

/* ── LinkedIn card ─────────────────────────────────────── */
.linkedin-bg {
  background: #f3f2ef;
}
.lin-header-img {
  height: 120px;
  background: linear-gradient(135deg, #0a66c2 0%, #0077b5 50%, #004182 100%);
  position: relative;
  z-index: 1;
}
.linkedin-bg .platform-badge {
  background: rgba(0,0,0,0.45);
  border-color: rgba(255,255,255,0.2);
  color: #fff;
}
.linkedin-bg .platform-badge .badge-icon { color: #fff; }
.card-content-lin {
  position: relative;
  z-index: 2;
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.avatar-ph {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #e1e9ee;
  border: 4px solid #f3f2ef;
  margin-top: -45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #9aabb7;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.lin-name {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.35rem;
  margin-bottom: 0.5rem;
  color: #000;
}
.lin-title {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
}
.linkedin-bg .action-btn {
  background: transparent;
  border: 2px solid #0a66c2;
  color: #0a66c2;
  font-weight: 700;
  border-radius: 999px;
}
.showcase-card:hover .linkedin-bg .action-btn {
  background: #0a66c2;
  color: #fff;
}

/* Force white text on image overlays */
.inst-overlay ~ .card-content-bottom,
.inst-overlay ~ .platform-badge,
.medium-overlay ~ .card-content-bottom,
.medium-overlay ~ .platform-badge {
  color: #fff;
}
.inst-overlay ~ .platform-badge .badge-icon,
.medium-overlay ~ .platform-badge .badge-icon {
  color: #fff;
}

@media (max-width: 768px) {
  .showcase-card {
    width: 280px;
    height: 400px;
    scroll-snap-align: center;
  }

  .marquee-track {
    animation: none;
    padding: 0 1rem;
  }

  .marquee-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .marquee-container::-webkit-scrollbar {
    display: none;
  }

  .marquee-fade-left,
  .marquee-fade-right {
    width: 2rem;
  }
}
</style>

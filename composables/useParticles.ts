import { onMounted, onUnmounted } from 'vue'

const PARTICLE_COLORS = [
  [124, 58, 237],  // purple (neon)
  [6, 182, 212],   // cyan
  [99, 102, 241],  // indigo
  [167, 139, 250], // violet
]

export interface ParticleSystemOptions {
  particleDensityMultiplier?: number
  maxDistance?: number
}

export function useParticles(options: ParticleSystemOptions = {}) {
  let particles: Particle[] = []
  let animFrame: number
  let ctx: CanvasRenderingContext2D | null = null
  let canvas: HTMLCanvasElement | null = null

  // Interaction State
  let mouseX = -1000
  let mouseY = -1000
  let mouseActive = false

  // Soundwave Reactivity State
  let sourceX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0
  let sourceY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  let waveRadius = 0
  let waveActive = false

  class Particle {
    x: number
    y: number
    baseX: number
    baseY: number
    vx: number
    vy: number
    radius: number
    color: number[]
    alpha: number

    constructor(w: number, h: number) {
      this.x = Math.random() * w
      this.y = Math.random() * h
      this.baseX = this.x
      this.baseY = this.y
      // Daha stabil ve yavaş başlangıç hızı (fütüristik, havada asılı kalma)
      this.vx = (Math.random() - 0.5) * 0.1
      this.vy = (Math.random() - 0.5) * 0.1
      this.radius = Math.random() * 1.5 + 0.5 // biraz daha ince noktalar
      this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
      this.alpha = Math.random() * 0.5 + 0.1
    }

    update(w: number, h: number) {
      // 1. Mouse Repel (Fare ile ağır ağır itilme)
      if (mouseActive) {
        const dx = this.x - mouseX
        const dy = this.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const REPEL_RADIUS = 160
        if (dist < REPEL_RADIUS) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
          const angle = Math.atan2(dy, dx)
          this.vx += Math.cos(angle) * force * 0.6 // Yumuşak itiş
          this.vy += Math.sin(angle) * force * 0.6
        }
      }

      // 2. Soundwave Pulse (Yapay zeka konuşurken yayılan sismik dalga)
      if (waveActive) {
        const dx = this.x - sourceX
        const dy = this.y - sourceY
        const dist = Math.sqrt(dx * dx + dy * dy)
        // Dalga çemberinin içindeyse
        if (Math.abs(dist - waveRadius) < 60) {
          const force = (60 - Math.abs(dist - waveRadius)) * 0.008
          const angle = Math.atan2(dy, dx)
          this.vx += Math.cos(angle) * force
          this.vy += Math.sin(angle) * force
          this.alpha = Math.min(0.9, this.alpha + 0.05) // Dalga geçerken hafif parlama
        }
      }

      // Daha yavaş sönümlenme ve sürtünme (zerrelerin akıcı süzülmesi için)
      this.vx *= 0.94
      this.vy *= 0.94

      // Kendi orijinal pozisyonlarına mikroskobik yavaşlıkta dönme
      const driftX = (this.baseX - this.x) * 0.002
      const driftY = (this.baseY - this.y) * 0.002
      this.vx += driftX
      this.vy += driftY

      // Çok çok az rastgele titreşim (canlı hissettirmek için)
      this.vx += (Math.random() - 0.5) * 0.015
      this.vy += (Math.random() - 0.5) * 0.015

      // Pozisyonu uygula
      this.x += this.vx
      this.y += this.vy

      // Ekrandan çıkarsa karşıdan yavaşça belirsin
      if (this.x < -20) this.x = w + 20
      if (this.x > w + 20) this.x = -20
      if (this.y < -20) this.y = h + 20
      if (this.y > h + 20) this.y = -20
    }

    draw(context: CanvasRenderingContext2D) {
      const [r, g, b] = this.color
      context.beginPath()
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`
      context.fill()
    }
  }

  function getParticleCount() {
    if (!import.meta.client) return 50
    const w = window.innerWidth
    let base = 110 // Parçacık sayısı büyük ölçüde azaltıldı (Daha temiz/fütüristik görünüm)
    if (w < 600) base = 40
    else if (w < 1024) base = 70
    return Math.floor(base * (options.particleDensityMultiplier || 1))
  }

  function initCanvas(canvasEl: HTMLCanvasElement) {
    canvas = canvasEl
    ctx = canvas.getContext('2d')
    resize()
    drawLoop()
    bindEvents()
  }

  function resize() {
    if (!canvas || !ctx || !import.meta.client) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx.scale(dpr, dpr)
    
    sourceX = window.innerWidth / 2
    sourceY = window.innerHeight / 2

    spawnParticles()
  }

  function spawnParticles() {
    if (!import.meta.client) return
    const w = window.innerWidth
    const h = window.innerHeight
    const count = getParticleCount()
    particles = Array.from({ length: count }, () => new Particle(w, h))
  }

  function triggerBurst(x: number, y: number) {
    if (!import.meta.client) return
    const BURST_COUNT = 6 // Patlama efektindeki parça sayısını azalttık
    const w = window.innerWidth
    const h = window.innerHeight
    for (let i = 0; i < BURST_COUNT; i++) {
      const p = new Particle(w, h)
      p.x = x
      p.y = y
      p.baseX = x + (Math.random() - 0.5) * 100
      p.baseY = y + (Math.random() - 0.5) * 100
      const angle = (Math.PI * 2 * i) / BURST_COUNT
      const speed = Math.random() * 2 + 1 // Daha yavaş klik patlaması
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed
      p.radius = Math.random() * 2 + 0.5
      p.alpha = 0.6
      particles.push(p)
    }

    if (particles.length > getParticleCount() + 30) {
      particles.splice(0, particles.length - getParticleCount())
    }
  }

  function emitSoundwave(x: number, y: number) {
    sourceX = x
    sourceY = y
    waveActive = true
    waveRadius = 10 // Dalga en içten başlar
  }

  function drawLoop() {
    if (!canvas || !ctx || !import.meta.client) return

    const w = window.innerWidth
    const h = window.innerHeight

    ctx.clearRect(0, 0, w, h)

    // Expand wave (Dalga genişlemesi)
    if (waveActive) {
      waveRadius += 6 // Dalgayı yavaşlattık (daha dijital bir hissiyat)
      if (waveRadius > Math.max(w, h) + 100) {
        waveActive = false
      }
      
      // İzometrik enerji ringi çizimi
      ctx.beginPath()
      ctx.arc(sourceX, sourceY, waveRadius, 0, Math.PI * 2)
      const alpha = Math.max(0, 0.25 - (waveRadius / 1000))
      ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})` // Cyan tonda dalga
      ctx.lineWidth = 1 + alpha * 2
      ctx.stroke()
    }

    for (const p of particles) {
      p.update(w, h)
      p.draw(ctx)
    }

    const MAX_DIST = options.maxDistance || 150 // Az parça olduğu için bağları uzattık
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distSq = dx * dx + dy * dy
        if (distSq < MAX_DIST * MAX_DIST) {
          const dist = Math.sqrt(distSq)
          const alpha = (1 - dist / MAX_DIST) * 0.15 // Çok ince şeffaf bağlar
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`
          ctx.lineWidth = 0.5 // İnce geometrik çizgiler
          ctx.stroke()
        }
      }
    }

    // Fare ışıklandırması (Glow)
    if (mouseActive) {
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 150)
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.05)') // Mavi/Neon ışık
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(mouseX - 150, mouseY - 150, 300, 300)
    }

    animFrame = requestAnimationFrame(drawLoop)
  }

  function onMouseMove(e: MouseEvent) {
    mouseX = e.clientX
    mouseY = e.clientY
    mouseActive = true
  }

  function onMouseLeave() {
    mouseActive = false
    mouseX = -1000
    mouseY = -1000
  }

  function onClick(e: MouseEvent) {
    // Sadece Hero tarafında etki etmesi daha iyi olabilir ama genel canvas için de fena değil
    triggerBurst(e.clientX, e.clientY)
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX
      mouseY = e.touches[0].clientY
      mouseActive = true
    }
  }

  function bindEvents() {
    if (!import.meta.client) return
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('click', onClick)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onMouseLeave)
  }

  function unbindEvents() {
    if (!import.meta.client) return
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseleave', onMouseLeave)
    window.removeEventListener('click', onClick)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onMouseLeave)
  }

  function destroy() {
    if (import.meta.client) {
      cancelAnimationFrame(animFrame)
      unbindEvents()
    }
  }

  return {
    initCanvas,
    destroy,
    emitSoundwave,
  }
}

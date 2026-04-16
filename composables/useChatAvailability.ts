import { onBeforeUnmount, onMounted, computed, watch, nextTick } from 'vue'

/**
 * Chat is only available when:
 * - On a project or article reader page (/proje/*, /yazi/*)
 * - On home (/) while #digital-mind is in the URL or the #digital-mind section is in view
 * Not available: rest of home (hero, etc.), admin, other pages.
 *
 * `dm-chat-section-in-view` is shared with useChatPageContext so folder catalog + hints
 * stay in sync when the visitor is browsing The Digital Mind (even without hash).
 */
export function useChatAvailability() {
  const route = useRoute()
  const digitalMindInView = useState('dm-chat-section-in-view', () => false)
  let observer: IntersectionObserver | null = null

  function setupObserver() {
    if (!import.meta.client) return
    const el = document.getElementById('digital-mind')
    if (!el) return

    observer?.disconnect()
    observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        // Any visible slice counts — strict ratios failed when scrolling inside folders
        digitalMindInView.value = !!e?.isIntersecting
      },
      { root: null, threshold: [0, 0.05, 0.1, 0.25], rootMargin: '0px' },
    )
    observer.observe(el)
  }

  onMounted(() => {
    if (!import.meta.client) return
    setupObserver()
    requestAnimationFrame(setupObserver)
    window.setTimeout(setupObserver, 500)
  })

  watch(
    () => route.fullPath,
    () => {
      if (import.meta.client) {
        nextTick(() => setupObserver())
      }
    },
  )

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  const chatEnabled = computed(() => {
    const path = route.path
    if (path.startsWith('/admin')) return false
    if (path.startsWith('/proje/') || path.startsWith('/yazi/')) return true

    if (path === '/' || path === '') {
      const hash = (route.hash || '').toLowerCase()
      if (hash === '#digital-mind') return true
      return digitalMindInView.value
    }

    return false
  })

  return { chatEnabled, digitalMindInView }
}

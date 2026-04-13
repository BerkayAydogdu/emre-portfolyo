import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useScrollAnimation() {
  function fadeUp(
    target: string | Element | Element[],
    options: gsap.TweenVars = {},
  ) {
    return gsap.from(target, {
      scrollTrigger: {
        trigger: target as Element,
        start: 'top 88%',
      },
      opacity: 0,
      y: 40,
      duration: 0.9,
      ...options,
    })
  }

  function staggerIn(
    trigger: string | Element,
    children: string,
    stagger = 0.1,
    options: gsap.TweenVars = {},
  ) {
    const selector =
      typeof trigger === 'string' ? `${trigger} ${children}` : children

    return gsap.from(selector, {
      scrollTrigger: {
        trigger: trigger as Element,
        start: 'top 88%',
      },
      opacity: 0,
      y: 30,
      stagger,
      duration: 0.7,
      ...options,
    })
  }

  function slideInLeft(target: string | Element, options: gsap.TweenVars = {}) {
    return gsap.from(target, {
      scrollTrigger: {
        trigger: target as Element,
        start: 'top 85%',
      },
      opacity: 0,
      x: -60,
      duration: 1,
      ...options,
    })
  }

  function slideInRight(target: string | Element, options: gsap.TweenVars = {}) {
    return gsap.from(target, {
      scrollTrigger: {
        trigger: target as Element,
        start: 'top 85%',
      },
      opacity: 0,
      x: 60,
      duration: 1,
      ...options,
    })
  }

  function drawLine(target: string | Element, options: gsap.TweenVars = {}) {
    return gsap.from(target, {
      scrollTrigger: {
        trigger: target as Element,
        start: 'top 90%',
        end: 'bottom 10%',
        scrub: 0.5,
      },
      scaleY: 0,
      transformOrigin: 'top center',
      ...options,
    })
  }

  onUnmounted(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill())
  })

  return { fadeUp, staggerIn, slideInLeft, slideInRight, drawLine }
}

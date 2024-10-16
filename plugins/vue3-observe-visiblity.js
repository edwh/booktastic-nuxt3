const observers = new WeakMap()

const intersectionObserverDirective = {
  beforeMount(el, binding) {
    // We need the directive to be defined on the server as well as the client so that
    // SSR works.
    if (process.client) {
      let callback
      let options = {}
      let entryTopWasVisible = false
      let entryBottomWasVisible = false
      let entryWasObserved = false

      // Check if binding.value is a function or an object
      if (typeof binding.value === 'function') {
        callback = binding.value
      } else {
        ;({ callback, options } = binding.value)
      }
      // let timer

      const observerCallback = (entries, observer) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting
          const { boundingClientRect, intersectionRect } = entry

          // Calculate visibility of the top and bottom of the element
          const isTopVisible =
            isVisible && intersectionRect.top >= boundingClientRect.top
          const isBottomVisible =
            isVisible && intersectionRect.bottom >= boundingClientRect.bottom

          if (options.observeFullElement && entry.isIntersecting) {
            if (entry.target.classList.contains('top-sentinel')) {
              entryTopWasVisible = true
            } else if (entry.target.classList.contains('bottom-sentinel')) {
              entryBottomWasVisible = true
            }

            entryWasObserved = entryTopWasVisible && entryBottomWasVisible
          }

          // We can't throttle the callback without making the throttle aware of the callback values, otherwise some
          // callbacks will never happen.
          const cb = () => {
            callback(isVisible, {
              isTopVisible,
              isBottomVisible,
              entryWasObserved,
              entry,
              observer,
            })
          }

          if (options.observeFullElement) {
            entryWasObserved && cb()
            entryWasObserved = false
          } else {
            cb()
          }
        })
      }

      const observer = new IntersectionObserver(observerCallback, options)

      if (options.observeFullElement) {
        const topSentinel = document.createElement('div')
        topSentinel.classList.add('top-sentinel')
        el.prepend(topSentinel)

        const bottomSentinel = document.createElement('div')
        bottomSentinel.classList.add('bottom-sentinel')
        el.appendChild(bottomSentinel)

        const sentinels = [topSentinel, bottomSentinel]
        sentinels.forEach((item, index) => {
          item.style.height = '1px'
          item.style.width = '1px'
          item.style.position = 'absolute'
          item.style[index === 0 ? 'top' : 'bottom'] = '0'
          observer.observe(item)
        })
        return
      }

      observers.set(el, observer)
      observer.observe(el)
    }
  },
  unmounted(el) {
    if (process.client) {
      const observer = observers.get(el)
      if (observer) {
        observer.disconnect()
        observers.delete(el)
      }
    }
  },
}

// Usage with Nuxt.js or Vue application
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('observe-visibility', intersectionObserverDirective)
})

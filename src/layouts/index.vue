<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from './Header/index.vue'
import FloatingMusicPlayer from '@/components/MusicPlayer/FloatingMusicPlayer.vue'

const route = useRoute()
const router = useRouter()
const mainElement = ref<HTMLElement | null>(null)
const swipeStart = ref<{ x: number; y: number } | null>(null)
const swipeRoutes = ['/', '/focus', '/sounds', '/setting']

const showFloatingMusicPlayer = computed(() => {
  return route.path !== '/setting'
})
const dockMusicPlayer = computed(() => route.path === '/sounds')

const isMobileSwipeEnabled = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.innerWidth < 768
}

const hasHorizontalScrollableParent = (target: HTMLElement) => {
  let element: HTMLElement | null = target
  while (element && element !== mainElement.value) {
    const style = window.getComputedStyle(element)
    const canScrollX = element.scrollWidth > element.clientWidth + 1
    if (canScrollX && style.overflowX !== 'hidden' && style.overflowX !== 'visible') {
      return true
    }
    element = element.parentElement
  }

  return false
}

const shouldIgnoreSwipe = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return true
  }

  const interactiveSelector = [
    'a',
    'button',
    'input',
    'select',
    'textarea',
    '[contenteditable="true"]',
    '[role="button"]',
    '[role="slider"]',
    '[data-swipe-ignore]',
    '.music-player-host',
    '.music-list-scroll',
  ].join(',')

  return Boolean(target.closest(interactiveSelector)) || hasHorizontalScrollableParent(target)
}

const currentSwipeRouteIndex = () => {
  return swipeRoutes.findIndex((path) => path === route.path)
}

const navigateBySwipe = (direction: 'next' | 'previous') => {
  const currentIndex = currentSwipeRouteIndex()
  if (currentIndex === -1) {
    return
  }

  const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
  const nextRoute = swipeRoutes[nextIndex]
  if (!nextRoute) {
    return
  }

  void router.push(nextRoute)
}

const onTouchStart = (event: TouchEvent) => {
  if (!isMobileSwipeEnabled() || event.touches.length !== 1 || shouldIgnoreSwipe(event.target)) {
    swipeStart.value = null
    return
  }

  const touch = event.touches[0]
  if (!touch) {
    return
  }
  swipeStart.value = {
    x: touch.clientX,
    y: touch.clientY,
  }
}

const onTouchEnd = (event: TouchEvent) => {
  const start = swipeStart.value
  swipeStart.value = null
  if (!start || !isMobileSwipeEnabled() || event.changedTouches.length !== 1) {
    return
  }

  const touch = event.changedTouches[0]
  if (!touch) {
    return
  }
  const deltaX = touch.clientX - start.x
  const deltaY = touch.clientY - start.y
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  if (absX < 72 || absY > 64 || absX < absY * 1.4) {
    return
  }

  navigateBySwipe(deltaX < 0 ? 'next' : 'previous')
}

const onTouchCancel = () => {
  swipeStart.value = null
}
</script>

<template>
  <div
    class="min-h-screen w-full bg-bg-main text-text-main font-sans transition-colors duration-700 selection:bg-selection"
  >
    <Header />
    <main
      ref="mainElement"
      class="mx-auto flex min-h-screen w-full justify-center overflow-x-hidden pt-28 md:pt-24"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
      @touchcancel.passive="onTouchCancel"
    >
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-route" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <FloatingMusicPlayer
      :visible="showFloatingMusicPlayer"
      :dock-in-sounds="dockMusicPlayer"
    />
  </div>
</template>

<style scoped></style>

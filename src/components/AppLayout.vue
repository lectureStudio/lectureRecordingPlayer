<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { useSettingsStore } from '@/stores/settings'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// Settings store: preferred source of sidebar position
const settings = useSettingsStore()

// Determine the current sidebar position: prefer settings over the default value
const position = computed(() => settings.sidebarPosition ?? 'right')
const isLeft = computed(() => position.value === 'left')
const showSidebar = computed(() => position.value !== 'none')

// Fullscreen awareness for layout adjustments
const fullscreenActive = ref<boolean>(false)
function onFsChange() {
  fullscreenActive.value = !!document.fullscreenElement
    || document.documentElement.classList.contains('app-fullscreen')
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFsChange)
  onFsChange()

  const observer = new MutationObserver(onFsChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFsChange)
    observer.disconnect()
  })
})
</script>

<template>
  <!-- Root container: full size app layout -->
  <div class="w-full h-dvh flex flex-col bg-base-200 text-base-content">
    <!-- Top header (always at top, non-sticky) -->
    <header
      class="bg-base-100 border-b border-base-300"
      :class="fullscreenActive ? 'h-0 overflow-visible bg-transparent' : ''"
    >
      <slot name="top"></slot>
    </header>

    <!-- Main area: sidebar + content on md+; on mobile only content -->
    <div class="flex-1 min-h-0 flex">
      <!-- Desktop sidebar (md and up) -->
      <aside
        v-if="showSidebar"
        class="hidden lg:block w-64 shrink-0 border-base-300 bg-base-100"
        :class="[
          isLeft ? 'order-1 border-r' : 'order-3 border-l',
        ]"
        aria-label="Sidebar"
      >
        <div class="flex h-full overflow-auto">
          <slot name="sidebar"></slot>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 min-w-0 min-h-0 overflow-auto order-2">
        <section class="h-full">
          <slot></slot>
        </section>
      </main>
    </div>

    <!-- Bottom bar -->
    <nav
      class="bg-base-100"
      :class="fullscreenActive ? 'h-0 overflow-visible bg-transparent' : ''"
    >
      <slot name="bottom"></slot>
    </nav>
  </div>

  <!-- Mobile drawer for sidebar (DaisyUI) -->
  <div v-if="showSidebar" class="drawer lg:hidden">
    <input id="app-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content"></div>
    <div class="drawer-side" :class="isLeft ? 'drawer-start' : 'drawer-end'">
      <label
        for="app-drawer"
        aria-label="Close sidebar"
        class="drawer-overlay"
      ></label>
      <aside
        id="mobile-sidebar"
        class="w-72 max-w-[85vw] min-h-full bg-base-100 border-base-300 shadow-xl"
        :class="isLeft ? 'border-r' : 'border-l'"
      >
        <div class="p-3 border-b border-base-300 flex items-center justify-between">
          <div class="font-medium">Sidebar</div>
          <label
            for="app-drawer"
            class="btn btn-ghost btn-xs"
            aria-label="Close sidebar"
          >
            <AppIcon name="dismiss" class="w-4" />
          </label>
        </div>
        <div class="h-[calc(100%-2.5rem)] overflow-auto">
          <slot name="sidebar">
            <div class="p-4 text-sm opacity-70">Sidebar (mobile)</div>
          </slot>
        </div>
      </aside>
    </div>
  </div>
</template>

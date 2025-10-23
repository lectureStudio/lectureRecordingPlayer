<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import SplitPane from '@/components/SplitPane.vue'
import { useSettingsStore } from '@/stores/settings'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// Settings store: preferred source of sidebar position
const settings = useSettingsStore()

// Determine the current sidebar position: prefer settings over the default value
const position = computed(() => settings.sidebarPosition ?? 'right')
const isLeft = computed(() => position.value === 'left')
const showSidebar = computed(() => position.value !== 'none')

// Responsive state
const isLargeScreen = ref(false)

// Check if the screen is large enough for the sidebar
const checkScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 1024 // lg breakpoint
}

// Show sidebar only on large screens AND when sidebar is enabled
const shouldShowSidebar = computed(() =>
  showSidebar.value && isLargeScreen.value
)

// Use computed properties to get/set split pane sizes from settings
const sidePaneSize = computed({
  get: () => settings.splitPaneSizes.sidebar,
  set: (value: number) => {
    settings.setSplitPaneSizes({
      ...settings.splitPaneSizes,
      sidebar: value,
    })
  },
})

const mainPaneSize = computed({
  get: () => settings.splitPaneSizes.main,
  set: (value: number) => {
    settings.setSplitPaneSizes({
      ...settings.splitPaneSizes,
      main: value,
    })
  },
})

function onPaneResize({ first, second }: { first: number; second: number }) {
  // Correctly identify which pane is sidebar vs. main based on the current position
  const [sidebarSize, mainSize] = isLeft.value
    ? [first, second]
    : [second, first]

  // Update settings store with new sizes
  settings.setSplitPaneSizes({
    sidebar: sidebarSize,
    main: mainSize,
  })

  // Persist the changes
  settings.persist()
}

// Fullscreen awareness for layout adjustments
const fullscreenActive = ref<boolean>(false)
function onFsChange() {
  fullscreenActive.value = !!document.fullscreenElement
    || document.documentElement.classList.contains('app-fullscreen')
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFsChange)
  onFsChange()

  // Check the initial screen size
  checkScreenSize()

  // Listen for window resize
  window.addEventListener('resize', checkScreenSize)

  const observer = new MutationObserver(onFsChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFsChange)
    window.removeEventListener('resize', checkScreenSize)
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

    <!-- Main area: responsive sidebar + content -->
    <div class="flex-1 min-h-0 flex">
      <!-- Desktop: SplitPane with sidebar (only on large screens) -->
      <SplitPane
        v-if="shouldShowSidebar"
        @resize="onPaneResize"
        class="h-full"
        :first-pane-size="isLeft ? sidePaneSize : mainPaneSize"
        :first-pane-min-size="isLeft ? 5 : 70"
        :first-pane-max-size="isLeft ? 30 : 95"
        :second-pane-size="isLeft ? mainPaneSize : sidePaneSize"
        :second-pane-min-size="isLeft ? 70 : 5"
        :second-pane-max-size="isLeft ? 95 : 30"
        :vertical="true"
        :resizable="true"
      >
        <!-- First pane: sidebar when left, main when right -->
        <template #first>
          <aside
            v-if="isLeft"
            class="w-full h-full shrink-0 border-r border-base-300 bg-base-100"
            aria-label="Sidebar"
          >
            <div class="flex h-full overflow-auto">
              <slot name="sidebar"></slot>
            </div>
          </aside>
          <main v-else class="flex-1 h-full min-w-0 min-h-0 overflow-auto">
            <section class="h-full">
              <slot name="main"></slot>
            </section>
          </main>
        </template>

        <!-- Second pane: main when left, sidebar when right -->
        <template #second>
          <main
            v-if="isLeft"
            class="flex-1 h-full min-w-0 min-h-0 overflow-auto"
          >
            <section class="h-full">
              <slot name="main"></slot>
            </section>
          </main>
          <aside
            v-else
            class="w-full h-full shrink-0 border-l border-base-300 bg-base-100"
            aria-label="Sidebar"
          >
            <div class="flex h-full overflow-auto">
              <slot name="sidebar"></slot>
            </div>
          </aside>
        </template>
      </SplitPane>

      <!-- Mobile/Small screens: Just main content (no split pane) -->
      <main v-else class="flex-1 h-full min-w-0 min-h-0 overflow-auto">
        <section class="h-full">
          <slot name="main"></slot>
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
  <div v-if="showSidebar && !isLargeScreen" class="drawer">
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

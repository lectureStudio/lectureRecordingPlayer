<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import SearchField from '@/components/SearchField.vue'
import ThemeSwitch from '@/components/ThemeSwitch.vue'
import { useFullscreenControls } from '@/composables/useFullscreenControls.ts'
import { useSettingsStore } from '@/stores/settings.ts'
import { computed } from 'vue'

const settings = useSettingsStore()

const showSidebar = computed(() => settings.sidebarPosition !== 'none')

const { fullscreen, controlsVisible } = useFullscreenControls()

const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: '#{title}',
  },
)
</script>

<template>
  <div
    class="px-4 py-3 flex items-center flex-wrap gap-3 bg-base-100 border-b border-base-300"
    :class="fullscreen
    ? 'fixed top-0 left-0 right-0 z-40 transform-gpu transition-all duration-200 ease-out '
      + (controlsVisible
        ? 'opacity-90 translate-y-0'
        : 'opacity-0 -translate-y-full pointer-events-none')
    : ''"
  >
    <!-- Mobile: open sidebar button visible on smaller screens -->
    <label
      v-if="showSidebar"
      for="app-drawer"
      class="lg:hidden btn btn-ghost btn-sm w-7 h-7"
      aria-label="Open sidebar"
      role="button"
    >
      <AppIcon name="navigation" class="w-5" />
    </label>

    <h1 class="font-semibold">{{ props.title }}</h1>

    <!-- Spacer -->
    <div class="flex-1" />

    <SearchField class="sm:w-[18rem] order-last sm:order-none" />
    <ThemeSwitch class="opacity-70" />
  </div>
</template>

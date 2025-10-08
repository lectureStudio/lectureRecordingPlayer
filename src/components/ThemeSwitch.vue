<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import type { Theme } from '@schemas/settings'
import { computed, onMounted, watch } from 'vue'

const settings = useSettingsStore()

// Computed binding to the store theme
const theme = computed<Theme>({
  get: () => settings.theme ?? 'light',
  set: (val) => {
    settings.setTheme(val)
    settings.persist()
  },
})

function detectPreferredTheme(): Theme {
  const prefersDark = window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.classList.toggle('dark', theme === 'dark'); // tailwind dark:*
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

onMounted(() => {
  // Load settings from storage if available
  const loaded = settings.loadFromStorage()
  // Respect OS preference only on the first run (no settings in storage)
  if (!loaded) {
    settings.setTheme(detectPreferredTheme())
    settings.persist()
  }
  applyTheme(theme.value)
})

watch(theme, (t) => {
  applyTheme(t)
})
</script>

<template>
  <button
    type="button"
    class="btn btn-ghost btn-circle"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
    title="Toggle theme"
  >
    <AppIcon v-if="theme === 'dark'" name="dark-mode" class="w-6" />
    <AppIcon v-else name="light-mode" class="w-6" />
  </button>
</template>

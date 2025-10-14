<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'

/**
 * Component props
 */
const props = defineProps<{
  /** Function to call when the button is clicked */
  onClick: () => void
}>()
</script>

<template>
  <div class="hidden md:inline-block">
    <!-- Button to open dialog -->
    <button
      class="btn btn-ghost btn-circle opacity-70"
      @click="props.onClick"
      aria-label="Show keyboard shortcuts"
    >
      <AppIcon name="keyboard" class="w-5" />
    </button>
  </div>
</template>

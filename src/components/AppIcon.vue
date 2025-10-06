<script setup lang="ts">
import { fluentIconMap, type FluentIconName } from '@/utils/icons'
import { computed, type PropType } from 'vue'

const props = defineProps({
  name: {
    type: String as PropType<FluentIconName>,
    required: true,
  },
})

const icon = computed(() => fluentIconMap[props.name] || null)
</script>

<template>
  <div
    v-if="icon"
    v-html="icon"
    class="inline-flex items-center justify-center"
  >
  </div>
</template>

<style scoped>
:deep(svg *) {
  fill: currentColor;
}

/* Respect explicit none values from the source SVG */
:deep(svg [fill='none']) {
  fill: none !important;
}
:deep(svg [stroke='none']) {
  stroke: none !important;
}
</style>

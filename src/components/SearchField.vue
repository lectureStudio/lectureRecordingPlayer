<script setup lang="ts">
import { useKeyboard } from '@/composables/useKeyboard.ts'
import { usePdfStore } from '@/stores/pdf'
import { type Ref, ref, watch } from 'vue'

const pdfStore = usePdfStore()

const searchRootRef: Ref<HTMLElement | null> = ref(null)
// Keep a ref to the actual input to focus it from a global shortcut
const searchInputRef: Ref<HTMLInputElement | null> = ref(null)

// Search state for the NavigationBar input
const searchText = ref('')

useKeyboard(
  [
    {
      keys: [{ key: 'ArrowUp' }],
      handler: () => void pdfStore.findPrev(),
      when: () => !!searchText.value.trim(),
      description: 'Previous page',
    },
    {
      keys: [{ key: 'ArrowDown' }],
      handler: () => void pdfStore.findNext(),
      when: () => !!searchText.value.trim(),
      description: 'Next page',
    },
  ],
  {
    ignoreEditable: false,
    onlyWhenTargetInside: searchRootRef,
    capture: true,
  },
)
useKeyboard(
  [
    {
      // Windows/Linux: Ctrl+K, macOS: Meta(Command)+K
      keys: [
        { key: 'k', ctrl: true },
        { key: 'k', meta: true },
      ],
      handler: () => {
        searchInputRef.value?.focus()
        // Select existing text for quick replacement
        searchInputRef.value?.select()
      },
      description: 'Focus search',
    },
  ],
  {
    ignoreEditable: false, // allow triggering even when focus is in an input
    capture: true,
  },
)

// Auto-cancel PDF search when the input is cleared
watch(
  () => searchText.value,
  (val) => {
    const q = val.trim()
    if (!q && pdfStore.lastQuery) {
      pdfStore.cancelSearch()
    }
  },
)

function triggerSearch() {
  const q = searchText.value.trim()
  if (!q) {
    // If the user presses Enter on empty field, ensure search is canceled
    if (pdfStore.lastQuery) {
      pdfStore.cancelSearch()
    }
    return
  }
  // If the same query, jump to the next match; else perform a new search
  if (q === pdfStore.lastQuery) {
    pdfStore.findNext()
  }
  else {
    pdfStore.search(q)
  }
}
</script>

<template>
  <div ref="searchRootRef" class="w-full xl:ms-4">
    <div class="input input-sm input-ghost rounded-full bg-base-200 hover:bg-base-300 focus-visible:bg-base-300 cursor-pointer transition-colors focus:outline-none items-center w-full gap-2">
      <AppIcon name="search" class="w-3.5 opacity-50" />
      <input
        ref="searchInputRef"
        type="search"
        placeholder="Search"
        v-model="searchText"
        @keydown.enter.prevent="triggerSearch"
      />
      <span v-if="!pdfStore.lastQuery" class="font-mono opacity-60 space-x-0.5">
        <kbd class="kbd kbd-sm">⌘</kbd>
        <kbd class="kbd kbd-sm">K</kbd>
      </span>
      <div v-else class="flex items-center gap-1 ms-1">
        <span class="opacity-60 text-xs tabular-nums">
          {{
            pdfStore.matchesTotal > 0
            ? `${pdfStore.matchesCurrent} / ${pdfStore.matchesTotal}`
            : 0
          }}
        </span>
        <div class="flex items-center gap-1 ms-1">
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            :disabled="pdfStore.matchesTotal === 0"
            title="Previous match"
            @click="pdfStore.findPrev()"
          >
            <AppIcon name="search-prev" class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            :disabled="pdfStore.matchesTotal === 0"
            title="Next match"
            @click="pdfStore.findNext()"
          >
            <AppIcon name="search-next" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

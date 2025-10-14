<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { formatKey, keyboardShortcuts } from '@/utils/keyboardShortcuts'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const showDialog = ref(false)

// Handle ESC key to close the dialog
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showDialog.value) {
    showDialog.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// Expose method to show dialog programmatically
const showShortcutsDialog = () => {
  showDialog.value = true
}

// Expose the method for use in parent components
defineExpose({
  showShortcutsDialog,
})
</script>

<template>
  <!-- DaisyUI Dialog -->
  <dialog
    :open="showDialog"
    class="modal"
    @click.self="showDialog = false"
  >
    <div class="modal-box h-11/12 w-11/12 max-w-2xl flex flex-col">
      <!-- Sticky Header -->
      <div class="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 class="text-lg font-bold">Keyboard Shortcuts</h3>
        <button
          class="btn btn-sm btn-circle btn-ghost"
          @click="showDialog = false"
          aria-label="Close"
        >
          <AppIcon name="dismiss" class="w-4" />
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto space-y-6">
        <div
          v-for="category in keyboardShortcuts"
          :key="category.category"
          class="space-y-3"
        >
          <h4 class="text-sm font-semibold text-base-content/60 uppercase tracking-wide">
            {{ category.category }}
          </h4>

          <div class="space-y-2">
            <div
              v-for="item in category.items"
              :key="item.description"
              class="flex items-center justify-between py-2 px-3 rounded-lg bg-base-200/50"
            >
              <span class="text-sm">{{ item.description }}</span>
              <div class="flex items-center justify-end gap-1 flex-wrap">
                <template v-for="(key, index) in item.keys" :key="key">
                  <div class="flex items-center gap-1">
                    <template v-if="key.includes(' + ')">
                      <kbd
                        v-for="(keyPart, partIndex) in key.split(' + ')"
                        :key="partIndex"
                        class="kbd kbd-sm"
                      >
                        {{
                          formatKey(
                            keyPart.trim(),
                          )
                        }}
                      </kbd>
                    </template>
                    <kbd
                      v-else
                      class="kbd kbd-sm"
                    >
                      {{ formatKey(key) }}
                    </kbd>
                  </div>
                  <span
                    v-if="index < item.keys.length - 1"
                    class="text-xs text-base-content/50 mx-1"
                  >
                    or
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="modal-action flex-shrink-0 mt-6">
        <button
          class="btn btn-primary btn-sm"
          @click="showDialog = false"
          aria-label="Close dialog"
        >
          Got it
        </button>
      </div>
    </div>
  </dialog>
</template>

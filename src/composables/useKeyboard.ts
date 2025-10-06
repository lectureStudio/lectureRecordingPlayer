import { onBeforeUnmount, onMounted, type Ref, ref } from 'vue'

/**
 * Defines a keyboard key combination for binding.
 */
export type KeyDef = {
  /** The key value (e.key). */
  key?: string // e.key
  /** The key code (e.code). */
  code?: string // e.code
  /** Whether Ctrl key must be pressed. */
  ctrl?: boolean
  /** Whether the Shift key must be pressed. */
  shift?: boolean
  /** Whether the Alt key must be pressed. */
  alt?: boolean
  /** Whether the Meta key must be pressed. */
  meta?: boolean
  /** Repeat behavior: false=block repeats, true=only repeats, 'allow'=both. */
  repeat?: boolean | 'allow' // false=block repeats, true=only repeats, 'allow'=both
  /** Use the primary modifier (Ctrl on Win/Linux, Meta on macOS). */
  primary?: boolean // Ctrl on Win/Linux, Meta on macOS
}

/**
 * Defines a keyboard shortcut binding with handler and optional conditions.
 */
export type KeyBinding = {
  /** Key definition(s) that trigger this binding. */
  keys: KeyDef | KeyDef[]
  /** Handler function called when a key combination matches. Return false to skip preventDefault. */
  handler: (e: KeyboardEvent) => void | boolean // return false to skip preventDefault
  /** Additional guard condition that must be true for binding to execute. */
  when?: () => boolean // additional guard
  /** Human-readable description of what this binding does. */
  description?: string
  /** Priority for resolving conflicts (higher priority wins). */
  priority?: number
}

/**
 * Configuration options for the useKeyboard composable.
 */
export type UseKeyboardOptions = {
  /** Reactive boolean to enable/disable keyboard handling. */
  enabled?: Ref<boolean>
  /** Whether to ignore key events from editable elements. */
  ignoreEditable?: boolean
  /** If provided, only handle events when the event target is inside (or equal to) this root element. */
  onlyWhenTargetInside?: Ref<HTMLElement | null> | HTMLElement | null
  /** Use the capture phase for event listener. */
  capture?: boolean
}

/**
 * Checks if the given event target is an editable element that should
 * typically receive keyboard input.
 *
 * @param target - The event target to check, usually from a keyboard event.
 *
 * @returns True if the target is an editable element (input, textarea, contentEditable, etc.).
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) {
    return true
  }
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true
  }
  // Treat common text-like input types as editable
  const t = (target as HTMLInputElement).type
  return ['text', 'search', 'url', 'email', 'number', 'password', 'tel'].includes(t)
}

/**
 * Detects if the current platform is macOS (including iPhone/iPad).
 * Used to determine the appropriate primary modifier key for keyboard shortcuts.
 *
 * @returns True if running on macOS, iPhone, or iPad; false otherwise.
 */
function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
}

function matchKey(e: KeyboardEvent, def: KeyDef): boolean {
  const wantCtrl = def.primary ? !isMac() || def.ctrl === true : def.ctrl
  const wantMeta = def.primary ? isMac() || def.meta === true : def.meta

  const modsOk = (wantCtrl === undefined ? true : e.ctrlKey === wantCtrl)
    && (def.shift === undefined ? true : e.shiftKey === def.shift)
    && (def.alt === undefined ? true : e.altKey === def.alt)
    && (wantMeta === undefined ? true : e.metaKey === wantMeta)

  if (!modsOk) {
    return false
  }

  const keyOk = def.key ? e.key === def.key : true
  const codeOk = def.code ? e.code === def.code : true

  if (!keyOk || !codeOk) {
    return false
  }
  if (def.repeat === true) {
    return e.repeat
  }
  if (def.repeat === false) {
    return !e.repeat
  }

  return true // 'allow' or undefined
}

/**
 * Composable for handling keyboard shortcuts and key bindings.
 *
 * This composable allows you to register multiple keyboard shortcuts with different
 * key combinations, modifiers, and conditions. It automatically handles event
 * registration/cleanup and provides options for enabling/disabling shortcuts
 * and ignoring input from editable elements.
 *
 * @param bindings - Array of keyboard shortcut definitions with handlers.
 * @param options - Configuration options for keyboard handling behavior.
 *
 * @returns Object containing the enabled ref for controlling keyboard handling.
 *
 * @example
 * ```typescript
 * const { enabled } = useKeyboard([
 *   {
 *     keys: { key: 's', primary: true },
 *     handler: () => save(),
 *     description: 'Save document'
 *   },
 *   {
 *     keys: { key: 'Escape' },
 *     handler: () => closeModal(),
 *     when: () => isModalOpen.value
 *   }
 * ])
 * ```
 */
export function useKeyboard(bindings: KeyBinding[], options: UseKeyboardOptions = {}) {
  const enabled = options.enabled ?? ref(true)
  const ignoreEditable = options.ignoreEditable ?? true
  const onlyInsideRef: Ref<HTMLElement | null> = (options.onlyWhenTargetInside as Ref<HTMLElement | null>)
    ?? ref((options.onlyWhenTargetInside as HTMLElement | null) ?? null)

  const onKeyDown = (e: Event) => {
    if (!enabled.value) {
      return
    }
    // If scoping is set, only handle when the target is within the scoped root
    if (onlyInsideRef.value && e.target instanceof Node) {
      if (!onlyInsideRef.value.contains(e.target)) {
        return
      }
    }
    if (ignoreEditable && isEditableTarget(e.target)) {
      return
    }

    const kbdEvent = e as KeyboardEvent

    // sort by priority desc once per event
    const sorted = [...bindings].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

    for (const b of sorted) {
      if (b.when && !b.when()) {
        continue
      }
      const defs = Array.isArray(b.keys) ? b.keys : [b.keys]
      if (defs.some((d) => matchKey(kbdEvent, d))) {
        const result = b.handler(kbdEvent)
        if (result !== false) {
          e.preventDefault()
          e.stopPropagation()
        }
        return
      }
    }
  }

  onMounted(() => {
    const eventTarget = onlyInsideRef.value ?? window
    eventTarget.addEventListener('keydown', onKeyDown, { capture: options.capture ?? false })
  })
  onBeforeUnmount(() => {
    const eventTarget = onlyInsideRef.value ?? window
    eventTarget.removeEventListener('keydown', onKeyDown, { capture: options.capture ?? false })
  })

  // Return the scoping ref so the caller can assign its element later
  return { enabled, onlyWhenTargetInside: onlyInsideRef }
}

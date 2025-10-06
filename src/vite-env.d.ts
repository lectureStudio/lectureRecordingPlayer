/// <reference types="vite/client" />

declare module 'vue-virtual-scroller' {
  export interface RecycleScrollerProps {
    items: unknown[]
    keyField?: string
    direction?: 'vertical' | 'horizontal'
    itemSize?: number | null
    gridItems?: number
    itemSecondarySize?: number
    minItemSize?: number | string | null
    sizeField?: string
    typeField?: string
    buffer?: number
    pageMode?: boolean
    prerender?: number
    emitUpdate?: boolean
    updateInterval?: number
    skipHover?: boolean
    listTag?: string
    itemTag?: string
    listClass?: string | object | unknown[]
    itemClass?: string | object | unknown[]
  }

  export interface RecycleScrollerEmits {
    resize: () => void
    visible: () => void
    hidden: () => void
    update: (
      startIndex: number,
      endIndex: number,
      visibleStartIndex: number,
      visibleEndIndex: number,
    ) => void
    'scroll-start': () => void
    'scroll-end': () => void
  }

  export interface RecycleScrollerExpose {
    scrollToItem: (index: number) => void
    scrollToPosition: (position: number) => void
  }

  export interface RecycleScrollerSlots {
    default(props: { item: unknown; index: number; active: boolean }): VNode[]
    before?(): VNode[]
    after?(): VNode[]
    empty?(): VNode[]
  }

  export type RecycleScrollerType = DefineComponent<{
    props: RecycleScrollerProps
    emits: RecycleScrollerEmits
    expose: RecycleScrollerExpose
    slots: SlotsType<RecycleScrollerSlots>
  }>

  export const RecycleScroller: RecycleScrollerType
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import App from '@/App.vue'

// Mock child components to focus on mount only
vi.mock('@/components/NavigationBar.vue', () => ({ default: { name: 'NavigationBar', template: '<div />' } }))
vi.mock('@/components/SlideView.vue', () => ({ default: { name: 'SlideView', template: '<div />' } }))
vi.mock('@/components/AppLayout.vue', () => ({ default: { name: 'AppLayout', template: '<div><slot name="top"/><slot name="sidebar"/><slot name="bottom"/><slot/></div>' } }))
vi.mock('@/components/MediaControlsBar.vue', () => ({ default: { name: 'MediaControlsBar', template: '<div />' } }))
vi.mock('@/components/PDFThumbnailBar.vue', () => ({ default: { name: 'PDFThumbnailBar', template: '<div />' } }))

// Mock services and stores used by App
vi.mock('@/services/recordingLoader.ts', () => ({ loadRecording: vi.fn(async () => ({ duration: 0, document: {} })) }))

vi.mock('@/stores/mediaControls.ts', () => ({ useMediaControlsStore: () => reactive({ totalTime: 0 }) }))
vi.mock('@/stores/recording.ts', () => ({ useRecordingStore: () => ({ setRecording: vi.fn() }) }))
vi.mock('@/stores/pdf', () => ({ usePdfStore: () => ({ load: vi.fn(async () => {}), dispose: vi.fn() }) }))

describe('App', () => {
  beforeEach(() => {
    // prevent real network calls
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404, statusText: 'Not Found' }) as Response))
  })

  it('should mount without crashing', async () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })
})

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
  mozRequestFullScreen?: () => Promise<void> | void
  msRequestFullscreen?: () => Promise<void> | void
}

function isFullscreenApiSupported(): boolean {
  const el = document.documentElement as FullscreenElement
  return !!(
    el.requestFullscreen
    || el.webkitRequestFullscreen
    || el.mozRequestFullScreen
  )
}

function isSimulatedActive(): boolean {
  return document.documentElement.classList.contains('app-fullscreen')
}

export { isFullscreenApiSupported, isSimulatedActive }

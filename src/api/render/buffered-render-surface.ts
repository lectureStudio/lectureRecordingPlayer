import { RenderSurface } from './render-surface'

class BufferedRenderSurface extends RenderSurface {
  private readonly bufferCanvas: HTMLCanvasElement

  private readonly resizeObserver: ResizeObserver

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    this.bufferCanvas = document.createElement('canvas')
    this.bufferCanvas.width = canvas.width
    this.bufferCanvas.height = canvas.height
    this.canvasContext = this.bufferCanvas.getContext('2d')

    this.resizeObserver = new ResizeObserver((entries) => {
      if (!entries?.length) {
        return
      }

      const entry = entries[0]
      // The canvas width/height attributes reflect the new dimensions including DPR
      const { width, height } = entry!.target as HTMLCanvasElement

      if (this.bufferCanvas.width !== width || this.bufferCanvas.height !== height) {
        this.bufferCanvas.width = width
        this.bufferCanvas.height = height
        // Invalidate the last rendered page to force a full re-render,
        // as the aspect ratio and scale will have changed.
        this.lastRenderedPage = undefined
      }
    })

    this.resizeObserver.observe(this.canvas)
  }

  override clear(): void {
    this.canvasContext?.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height)
    this.lastRenderedPage = undefined
    this.lastRenderedScale = undefined
  }

  override getDrawableCanvas(): HTMLCanvasElement {
    return this.bufferCanvas
  }

  override present(): void {
    const mainCtx = this.canvas.getContext('2d')
    if (mainCtx) {
      mainCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      mainCtx.drawImage(this.bufferCanvas, 0, 0)
    }
  }

  override destroy(): void {
    this.resizeObserver.disconnect()
  }
}

export { BufferedRenderSurface, RenderSurface }

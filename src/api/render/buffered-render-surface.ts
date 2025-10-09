import { RenderSurface } from './render-surface'

/**
 * A render surface implementation that uses a buffer canvas for drawing operations.
 * Drawing is performed on an offscreen canvas and then copied to the main canvas
 * when the present method is called, which can improve performance and prevent flickering.
 *
 * @extends RenderSurface
 */
class BufferedRenderSurface extends RenderSurface {
  /** Canvas element used as an offscreen buffer for drawing operations */
  private readonly bufferCanvas: HTMLCanvasElement

  /** Observer that tracks size changes of the main canvas */
  private readonly resizeObserver: ResizeObserver

  /**
   * Creates a new buffered render surface.
   * Sets up the buffer canvas and resize observer to maintain synchronized dimensions.
   *
   * @param canvas - The HTMLCanvasElement to render to.
   */
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

  /**
   * Clears the buffer canvas and resets the rendering state.
   * @override
   */
  override clear(): void {
    this.canvasContext?.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height)
    this.lastRenderedPage = undefined
    this.lastRenderedScale = undefined
  }

  /**
   * Returns the buffer canvas that can be drawn on.
   * @override
   *
   * @returns The buffer canvas element.
   */
  override getDrawableCanvas(): HTMLCanvasElement {
    return this.bufferCanvas
  }

  /**
   * Copies the contents of the buffer canvas to the main canvas.
   * This method should be called after all drawing operations are complete.
   * @override
   */
  override present(): void {
    const mainCtx = this.canvas.getContext('2d')
    if (mainCtx) {
      mainCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      mainCtx.drawImage(this.bufferCanvas, 0, 0)
    }
  }

  /**
   * Cleans up resources used by this render surface.
   * Disconnects the resize observer to prevent memory leaks.
   * @override
   */
  override destroy(): void {
    this.resizeObserver.disconnect()
  }
}

export { BufferedRenderSurface }

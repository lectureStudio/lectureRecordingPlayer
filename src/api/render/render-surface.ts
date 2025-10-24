import { AnnotationMode, type PDFPageProxy } from 'pdfjs-dist'
import type { RenderTask } from 'pdfjs-dist/types/src/display/api'
import { Rectangle } from '../geometry/rectangle'
import { Shape } from '../model/shape/shape'
import type { ShapeRenderer } from './shape.renderer'

/**
 * RenderSurface is responsible for rendering PDF pages and shapes onto a canvas element.
 * It manages the rendering context, transformations, and delegates shape rendering to
 * specialized renderers.
 */
class RenderSurface {
  /** The HTML canvas element used for rendering */
  protected canvas: HTMLCanvasElement

  /** The 2D rendering context for the canvas */
  protected canvasContext: CanvasRenderingContext2D | null

  /** Map of shape names to their specialized renderers */
  protected readonly renderers: Map<string, ShapeRenderer>

  /** Transformation matrix for rendering operations */
  private transform: DOMMatrix

  /** Current PDF rendering task, or null if no rendering is in progress */
  protected renderTask: RenderTask | null = null

  /** Last rendered PDF page number */
  protected lastRenderedPage: number | undefined

  /** Last rendered scale factor */
  protected lastRenderedScale: number | undefined

  /** Last rendered X translation */
  protected lastRenderedX: number | undefined

  /** Last rendered Y translation */
  protected lastRenderedY: number | undefined

  /**
   * Creates a new render surface associated with the given canvas.
   *
   * @param canvas - The HTML canvas element to render on.
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.canvasContext = canvas.getContext('2d')
    this.renderers = new Map()
    this.transform = new DOMMatrix()
  }

  /**
   * Gets the HTML canvas element used for drawing.
   *
   * @returns The canvas element.
   */
  getDrawableCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  /**
   * Updates the canvas element used for rendering.
   * This is useful when the canvas element changes (e.g., component remounting).
   *
   * @param newCanvas - The new HTML canvas element to use for rendering.
   */
  setCanvas(newCanvas: HTMLCanvasElement): void {
    // Cancel any ongoing render task
    if (this.renderTask) {
      this.renderTask.cancel()
      this.renderTask = null
    }

    // Update the canvas and context
    this.canvas = newCanvas
    this.canvasContext = newCanvas.getContext('2d')

    // Reset rendering state since we have a new canvas
    this.lastRenderedPage = undefined
    this.lastRenderedScale = undefined
    this.lastRenderedX = undefined
    this.lastRenderedY = undefined
  }

  /**
   * Presents the current render state. This is a no-op for non-buffered surfaces.
   */
  present(): void {
    // No-op for non-buffered surface
  }

  /**
   * Clears the canvas and resets the rendering state.
   */
  clear(): void {
    this.canvasContext?.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.lastRenderedPage = undefined
    this.lastRenderedScale = undefined
  }

  /**
   * Releases resources associated with this surface. This is a no-op for non-buffered surfaces.
   */
  destroy(): void {
    // No-op for non-buffered surface
  }

  /**
   * Registers a renderer for a specific shape type.
   *
   * @param shapeName - The name of the shape class.
   * @param render - The renderer implementation for the shape.
   */
  registerRenderer(shapeName: string, render: ShapeRenderer): void {
    this.renderers.set(shapeName, render)
  }

  /**
   * Renders an array of shapes.
   *
   * @param shapes - Array of shapes to render.
   */
  renderShapes(shapes: Shape[]): void {
    for (const shape of shapes) {
      this.renderShape(shape)
    }
  }

  /**
   * Renders a single shape with appropriate transformations.
   *
   * @param shape - The shape to render.
   * @param dirtyRegion - Optional region that needs updating.
   */
  renderShape(shape: Shape, dirtyRegion?: Rectangle): void {
    const renderer = this.renderers.get(shape.constructor.name)

    if (renderer && this.canvasContext) {
      const s = this.canvas.width * this.transform.m11
      const tx = this.transform.m41 * s
      const ty = this.transform.m42 * s

      this.canvasContext.setTransform(1, 0, 0, 1, 0, 0)
      this.canvasContext.save()
      this.canvasContext.translate(-tx, -ty)
      this.canvasContext.scale(s, s)

      renderer.render(this.canvasContext, shape, dirtyRegion)

      this.canvasContext.restore()
    }
  }

  /**
   * Renders a PDF page onto the canvas with the appropriate scaling and transformation.
   * Optimizes rendering by skipping already rendered pages with the same parameters.
   * Cancels any ongoing render task before starting a new one.
   *
   * @param page - The PDF page proxy object to render.
   *
   * @returns A promise that resolves when rendering is complete.
   */
  async renderPdfPage(page: PDFPageProxy): Promise<void> {
    if (!this.canvasContext) {
      return
    }

    const dpr = window.devicePixelRatio || 1
    const initialViewport = page.getViewport({ scale: 1 })
    const scale = this.canvas.clientWidth / initialViewport.width * this.transform.m11
    const tx = this.transform.m41 * this.transform.m11 * this.canvas.width
    const ty = this.transform.m42 * this.transform.m11 * this.canvas.width

    if (
      this.lastRenderedPage === page.pageNumber && this.lastRenderedScale === scale
      && this.lastRenderedX === tx && this.lastRenderedY === ty
    ) {
      console.log('Skipping render of page %d', page.pageNumber)
      return
    }
    if (this.renderTask) {
      this.renderTask.cancel()
    }

    const viewport = page.getViewport({ scale })

    const renderTask = page.render({
      canvasContext: this.canvasContext,
      canvas: null,
      viewport,
      annotationMode: AnnotationMode.DISABLE,
    })
    this.renderTask = renderTask

    try {
      // Reset transform before applying DPR scale
      this.canvasContext.setTransform(dpr, 0, 0, dpr, -tx, -ty)

      await renderTask.promise

      this.lastRenderedPage = page.pageNumber
      this.lastRenderedScale = scale
      this.lastRenderedX = tx
      this.lastRenderedY = ty
    }
    catch (error) {
      if ((error as Error).name !== 'RenderingCancelledException') {
        // re-throw non-cancellation errors
        throw error
      }
    }
    finally {
      if (this.renderTask === renderTask) {
        this.renderTask = null
      }
    }
  }

  /**
   * Sets the transformation matrix used for rendering operations.
   * Creates a copy of the provided matrix to avoid reference issues.
   *
   * @param transform - The transformation matrix to apply.
   */
  setTransform(transform: DOMMatrix): void {
    this.transform = DOMMatrix.fromMatrix(transform)
  }
}

export { RenderSurface }

import { AnnotationMode, type PDFPageProxy } from 'pdfjs-dist'
import type { RenderTask } from 'pdfjs-dist/types/src/display/api'
import { Rectangle } from '../geometry/rectangle'
import { Shape } from '../model/shape/shape'
import type { ShapeRenderer } from './shape.renderer'

class RenderSurface {
  protected readonly canvas: HTMLCanvasElement

  protected canvasContext: CanvasRenderingContext2D | null

  protected readonly renderers: Map<string, ShapeRenderer>

  private transform: DOMMatrix

  protected renderTask: RenderTask | null = null
  protected lastRenderedPage: number | undefined
  protected lastRenderedScale: number | undefined
  protected lastRenderedX: number | undefined
  protected lastRenderedY: number | undefined

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.canvasContext = canvas.getContext('2d')
    this.renderers = new Map()
    this.transform = new DOMMatrix()
  }

  getDrawableCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  present(): void {
    // No-op for non-buffered surface
  }

  clear(): void {
    this.canvasContext?.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.lastRenderedPage = undefined
    this.lastRenderedScale = undefined
  }

  destroy(): void {
    // No-op for non-buffered surface
  }

  registerRenderer(shapeName: string, render: ShapeRenderer): void {
    this.renderers.set(shapeName, render)
  }

  renderShapes(shapes: Shape[]): void {
    for (const shape of shapes) {
      this.renderShape(shape)
    }
  }

  renderShape(shape: Shape, dirtyRegion?: Rectangle): void {
    const renderer = this.renderers.get(shape.constructor.name)

    if (renderer && this.canvasContext) {
      const s = this.canvas.width * this.transform.m11
      const tx = this.transform.m41 * s
      const ty = this.transform.m42 * s

      this.canvasContext.save()
      this.canvasContext.translate(-tx, -ty)
      this.canvasContext.scale(s, s)

      renderer.render(this.canvasContext, shape, dirtyRegion)

      this.canvasContext.restore()
    }
  }

  async renderPdfPage(page: PDFPageProxy, _pageRect: Rectangle | undefined): Promise<void> {
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

  renderSurface(surface: RenderSurface): void {
    if (this.canvasContext) {
      this.canvasContext.drawImage(surface.canvas, 0, 0)
    }
  }

  setTransform(transform: DOMMatrix): void {
    this.transform = DOMMatrix.fromMatrix(transform)
  }
}

export { RenderSurface }

import { usePdfStore } from '@/stores/pdf'
import { Rectangle } from '../geometry/rectangle'
import { Page } from '../model/page'
import { PageChangeType, PageEvent } from '../model/page-event'
import { ArrowShape } from '../model/shape/arrow.shape'
import { EllipseShape } from '../model/shape/ellipse.shape'
import { LineShape } from '../model/shape/line.shape'
import { PenShape } from '../model/shape/pen.shape'
import { PointerShape } from '../model/shape/pointer.shape'
import { RectangleShape } from '../model/shape/rectangle.shape'
import { SelectShape } from '../model/shape/select.shape'
import { Shape } from '../model/shape/shape'
import { StrokeShape } from '../model/shape/stroke.shape'
import { TextHighlightShape } from '../model/shape/text-highlight.shape'
import { TextShape } from '../model/shape/text.shape'
import { ZoomShape } from '../model/shape/zoom.shape'
import { ArrowRenderer } from './arrow.renderer'
import { EllipseRenderer } from './ellipse.renderer'
import { HighlighterRenderer } from './highlighter.renderer'
import { LineRenderer } from './line.renderer'
import { PenRenderer } from './pen.renderer'
import { PointerRenderer } from './pointer.renderer'
import { RectangleRenderer } from './rectangle.renderer'
import { RenderSurface } from './render-surface'
import { SelectRenderer } from './select.renderer'
import { TextHighlightRenderer } from './text-highlight.renderer'
import { TextRenderer } from './text.renderer'
import { VideoRenderSurface } from './video-render-surface'
import { ZoomRenderer } from './zoom.renderer'

class RenderController {
  private readonly pageChangeListener: (event: PageEvent) => void

  private readonly actionRenderSurface: RenderSurface

  private readonly volatileRenderSurface: RenderSurface

  private readonly videoRenderSurface: VideoRenderSurface

  private readonly pdfStore: ReturnType<typeof usePdfStore>

  private page: Page | undefined

  private lastShape: Shape | null = null

  private seek: boolean = false

  private resizeObserver: ResizeObserver | null = null

  constructor(actionSurface: RenderSurface, volatileSurface: RenderSurface, videoSurface: VideoRenderSurface) {
    this.actionRenderSurface = actionSurface
    this.volatileRenderSurface = volatileSurface
    this.videoRenderSurface = videoSurface
    this.pdfStore = usePdfStore()

    this.registerShapeRenderers(this.actionRenderSurface)
    this.registerShapeRenderers(this.volatileRenderSurface)

    this.pageChangeListener = this.pageChanged.bind(this)
    this.setupResizeObserver()
  }

  setPage(page: Page): void {
    if (this.page) {
      // Disable rendering for previous page.
      this.disableRendering()
    }

    this.page = page

    if (!this.seek) {
      this.enableRendering()
    }

    this.renderAllLayers()
  }

  setSeek(seek: boolean): void {
    this.seek = seek

    if (seek) {
      this.disableRendering()
    }
    else {
      this.enableRendering()

      // Finished the seeking step. Render the current state.
      this.renderAllLayers()
    }
  }

  playVideo(
    startTimestamp: number,
    videoOffset: number,
    videoLength: number,
    contentWidth: number,
    contentHeight: number,
    fileName: string,
  ) {
    // Load the video
    this.videoRenderSurface.loadVideo(fileName, startTimestamp, videoOffset, videoLength, contentWidth, contentHeight)

    // Sync video time with current media time (this will handle showing/hiding video and slides)
    this.videoRenderSurface.seekToMediaTime()

    // Update video playback state based on media store
    this.videoRenderSurface.updatePlaybackState()
  }

  /**
   * Stops video playback and shows PDF/canvas elements again.
   */
  stopVideo(): void {
    this.videoRenderSurface.stop()
    this.videoRenderSurface.hide()
    this.showPdfAndCanvas()
  }

  /**
   * Hides PDF and canvas elements when video is playing.
   */
  hidePdfAndCanvas(): void {
    const pdfViewer = document.querySelector('.pdfViewer')
    const actionCanvas = this.actionRenderSurface.getDrawableCanvas()
    const volatileCanvas = this.volatileRenderSurface.getDrawableCanvas()

    if (pdfViewer) {
      ;(pdfViewer as HTMLElement).style.display = 'none'
    }
    if (actionCanvas) {
      actionCanvas.style.display = 'none'
    }
    if (volatileCanvas) {
      volatileCanvas.style.display = 'none'
    }

    // Update PDF store visibility state
    this.pdfStore.setVisibility(false)
  }

  /**
   * Shows PDF and canvas elements when video is not playing.
   */
  showPdfAndCanvas(): void {
    const pdfViewer = document.querySelector('.pdfViewer')
    const actionCanvas = this.actionRenderSurface.getDrawableCanvas()
    const volatileCanvas = this.volatileRenderSurface.getDrawableCanvas()

    if (pdfViewer) {
      ;(pdfViewer as HTMLElement).style.display = 'block'
    }
    if (actionCanvas) {
      actionCanvas.style.display = 'block'
    }
    if (volatileCanvas) {
      volatileCanvas.style.display = 'block'
    }

    // Update PDF store visibility state
    this.pdfStore.setVisibility(true)
  }

  /**
   * Updates video synchronization when media time changes.
   * This should be called from the media controls store watcher.
   */
  updateVideoSync(): void {
    if (this.videoRenderSurface.hasVideo()) {
      this.videoRenderSurface.seekToMediaTime()
    }
  }

  /**
   * Updates video playback state when media playback state changes.
   * This should be called from the media controls store watcher.
   */
  updateVideoPlaybackState(): void {
    if (this.videoRenderSurface.hasVideo()) {
      this.videoRenderSurface.updatePlaybackState()
    }
  }

  beginBulkRender(): void {
    if (!this.seek) {
      this.disableRendering()
    }
  }

  endBulkRender(): void {
    if (!this.seek) {
      this.refreshAnnotationLayers()
      this.enableRendering()
    }
  }

  destroy(): void {
    this.disableRendering()
    this.videoRenderSurface.destroy()
    
    // Clean up ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  }

  private enableRendering(): void {
    this.page?.addChangeListener(this.pageChangeListener)
  }

  private disableRendering(): void {
    this.page?.removeChangeListener(this.pageChangeListener)
  }

  private pageChanged(event: PageEvent): void {
    switch (event.changeType) {
      case PageChangeType.PageTransform:
        this.renderAllLayers()
        break

      case PageChangeType.Clear:
        this.clearAnnotationLayers()
        break

      case PageChangeType.ShapeAdded:
        if (this.lastShape && this.lastShape != event.shape) {
          this.renderPermanentLayer(this.lastShape)
        }
        if (event.shape) {
          this.renderVolatileLayer(event.shape, event.dirtyRegion)
        }
        break

      case PageChangeType.ShapeRemoved:
        this.refreshAnnotationLayers()
        break

      case PageChangeType.ShapeModified:
        if (event.shape) {
          this.renderVolatileLayer(event.shape, event.dirtyRegion)
        }
        break
    }
  }

  private clearAnnotationLayers(): void {
    this.volatileRenderSurface.clear()
    this.actionRenderSurface.clear()

    this.lastShape = null
  }

  private refreshAnnotationLayers(): void {
    if (!this.page) {
      return
    }

    const shapes = this.page.getShapes()
    const lastIndex = shapes.length - 1

    if (lastIndex >= 0) {
      // The page contains at least one shape.
      this.actionRenderSurface.clear()

      if (lastIndex > 0) {
        // Render all shapes except the last one on the permanent surface.
        this.actionRenderSurface.renderShapes(shapes.slice(0, lastIndex))
      }

      // Always render the last shape on the volatile surface.
      const lastShape = shapes[lastIndex]
      if (lastShape) {
        this.renderVolatileLayer(lastShape, lastShape.bounds)
      }
    }
    else {
      // The page contains no shapes.
      this.volatileRenderSurface.clear()
      this.actionRenderSurface.clear()

      this.lastShape = null
    }
  }

  private renderAllLayers(): void {
    const pageTransform = this.getPageTransform()

    this.setPdfPageTransform(pageTransform)

    this.volatileRenderSurface.setTransform(pageTransform)
    this.volatileRenderSurface.clear()

    this.actionRenderSurface.setTransform(pageTransform)
    this.actionRenderSurface.clear()
    this.actionRenderSurface.renderShapes(this.page!.getShapes())

    this.lastShape = null
  }

  private renderPermanentLayer(shape: Shape, dirtyRegion?: Rectangle): void {
    this.actionRenderSurface.renderShape(shape, dirtyRegion)
  }

  private renderVolatileLayer(shape: Shape, dirtyRegion: Rectangle | undefined): void {
    this.volatileRenderSurface.clear()
    this.volatileRenderSurface.renderShape(shape, dirtyRegion)

    this.lastShape = shape
  }

  private setPdfPageTransform(transform: DOMMatrix): void {
    const pdfStore = usePdfStore()

    if (!pdfStore.doc || !this.page) {
      return
    }

    const canvas = this.actionRenderSurface.getDrawableCanvas()

    const scale = transform.m11
    const tx = transform.m41 * transform.m11 * canvas.width
    const ty = transform.m42 * transform.m11 * canvas.width

    const pageTransform = new DOMMatrix()
    pageTransform.translateSelf(-tx, -ty)
    pageTransform.scaleSelf(scale, scale)

    pdfStore.setPageTransform(pageTransform)
  }

  private getPageTransform(): DOMMatrix {
    const pageBounds = this.page?.getSlideShape().bounds
    if (pageBounds === undefined || pageBounds.isEmpty()) {
      return new DOMMatrix()
    }

    const pageTransform = new DOMMatrix()
    pageTransform.translateSelf(pageBounds.x, pageBounds.y)
    pageTransform.scaleSelf(1.0 / pageBounds.width, 1.0 / pageBounds.height)

    return pageTransform
  }

  private setupResizeObserver(): void {
    const actionCanvas = this.actionRenderSurface.getDrawableCanvas()
    
    this.resizeObserver = new ResizeObserver(() => {
      // Only re-render if we have a page and are not seeking
      if (this.page && !this.seek) {
        this.renderAllLayers()
      }
    })
    
    // Observe the action canvas for size changes
    this.resizeObserver.observe(actionCanvas)
  }

  private registerShapeRenderers(renderSurface: RenderSurface): void {
    renderSurface.registerRenderer(PenShape.name, new PenRenderer())
    renderSurface.registerRenderer(StrokeShape.name, new HighlighterRenderer())
    renderSurface.registerRenderer(PointerShape.name, new PointerRenderer())
    renderSurface.registerRenderer(ArrowShape.name, new ArrowRenderer())
    renderSurface.registerRenderer(RectangleShape.name, new RectangleRenderer())
    renderSurface.registerRenderer(LineShape.name, new LineRenderer())
    renderSurface.registerRenderer(EllipseShape.name, new EllipseRenderer())
    renderSurface.registerRenderer(SelectShape.name, new SelectRenderer())
    renderSurface.registerRenderer(TextShape.name, new TextRenderer())
    renderSurface.registerRenderer(TextHighlightShape.name, new TextHighlightRenderer())
    renderSurface.registerRenderer(ZoomShape.name, new ZoomRenderer())
  }
}

export { RenderController }

import { usePdfStore } from '@/stores/pdf'
import { Page } from '../model/page'
import { ArrowShape } from '../model/shape/arrow.shape'
import { EllipseShape } from '../model/shape/ellipse.shape'
import { LineShape } from '../model/shape/line.shape'
import { PenShape } from '../model/shape/pen.shape'
import { PointerShape } from '../model/shape/pointer.shape'
import { RectangleShape } from '../model/shape/rectangle.shape'
import { SelectShape } from '../model/shape/select.shape'
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
import { ZoomRenderer } from './zoom.renderer'

/**
 * Controller responsible for rendering PDF pages and their associated shapes statically.
 * Handles page transformations and shape rendering by delegating to specific renderers.
 */
class StaticRenderController {
  /** The rendering surface responsible for drawing PDF pages and shapes. */
  private readonly renderSurface: RenderSurface

  /**
   * Creates a new StaticRenderController instance.
   *
   * @param renderSurface The surface on which content will be rendered.
   */
  constructor(renderSurface: RenderSurface) {
    this.renderSurface = renderSurface

    this.registerShapeRenderers(this.renderSurface)
  }

  /**
   * Renders a specific page and its associated shapes.
   *
   * @param page The page to render.
   *
   * @returns A promise that resolves when rendering is complete.
   */
  async renderPage(page: Page | undefined): Promise<void> {
    const pdfStore = usePdfStore()
    if (!pdfStore.doc || !page) {
      return
    }

    const pdfPage = await pdfStore.getPage(page.getPageNumber() + 1)
    if (!pdfPage) {
      return
    }

    const pageTransform = this.getPageTransform(page)

    this.renderSurface.setTransform(pageTransform)
    await this.renderSurface.renderPdfPage(pdfPage)
    this.renderSurface.present()
    this.renderSurface.renderShapes(page!.getShapes())
    this.renderSurface.present()
  }

  /**
   * Cleans up resources used by the controller.
   */
  destroy(): void {
    this.renderSurface.destroy()
  }

  /**
   * Calculates the transformation matrix for a page.
   *
   * @param page The page for which to calculate the transform.
   *
   * @returns A DOMMatrix representing the transformation.
   */
  private getPageTransform(page: Page): DOMMatrix {
    const pageBounds = page?.getSlideShape().bounds
    if (pageBounds === undefined || pageBounds.isEmpty()) {
      return new DOMMatrix()
    }

    const pageTransform = new DOMMatrix()
    pageTransform.translateSelf(pageBounds.x, pageBounds.y)
    pageTransform.scaleSelf(1.0 / pageBounds.width, 1.0 / pageBounds.height)

    return pageTransform
  }

  /**
   * Registers all shape renderers with the render surface.
   * Maps each shape type to its corresponding renderer.
   *
   * @param renderSurface The surface to register renderers with.
   */
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

export { StaticRenderController }

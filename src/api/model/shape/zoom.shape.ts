import { Brush } from '@/api/paint/brush'
import { Color } from '@/api/paint/color'
import { FormShape } from './form.shape'

class ZoomShape extends FormShape {
  constructor() {
    super(new Brush(Color.fromHex('#000000'), 0))
  }

  protected updateBounds(): void {
    super.updateBounds()

    // Keep the aspect ratio with width bias.
    const width = this.bounds.width

    this.bounds.height = Math.abs(width * 3.0 / 4.0) * Math.sign(this.bounds.height)
  }
}

export { ZoomShape }

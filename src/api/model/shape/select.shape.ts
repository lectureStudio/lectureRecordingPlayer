import { Brush } from '@/api/paint/brush'
import { Color } from '@/api/paint/color'
import { FormShape } from './form.shape'

class SelectShape extends FormShape {
  constructor() {
    super(new Brush(Color.fromHex('#000000'), 0))
  }
}

export { SelectShape }

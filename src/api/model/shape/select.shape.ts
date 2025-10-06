import { Brush } from '@/api/paint/brush.ts'
import { Color } from '@/api/paint/color.ts'
import { FormShape } from './form.shape'

class SelectShape extends FormShape {
  constructor() {
    super(new Brush(Color.fromHex('#000000'), 0))
  }
}

export { SelectShape }

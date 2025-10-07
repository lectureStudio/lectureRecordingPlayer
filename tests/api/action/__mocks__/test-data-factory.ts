import { ProgressiveDataView } from '@/api/action/parser/progressive-data-view'
import { PenPoint } from '@/api/geometry/pen-point'
import { Point } from '@/api/geometry/point'
import { Rectangle } from '@/api/geometry/rectangle'
import { Brush } from '@/api/paint/brush'
import { Color } from '@/api/paint/color'
import { Font } from '@/api/paint/font'

export class TestDataFactory {
  /**
   * Creates a buffer with action header data
   */
  static createActionHeaderBuffer(hasKeyEvent: boolean = false): ArrayBuffer {
    const bufferSize = hasKeyEvent ? 13 : 4 // 4 bytes for header, 9 more if key event
    const buffer = new ArrayBuffer(bufferSize)
    const view = new DataView(buffer)
    
    // Header with key event flag
    view.setInt32(0, hasKeyEvent ? 1 : 0)
    
    if (hasKeyEvent) {
      // Key event data
      view.setInt32(4, 65) // keyCode (A key)
      view.setInt32(8, 4) // modifiers (Ctrl = 4, Shift = 2, Alt = 8)
      view.setInt8(12, 0) // actionType (keydown)
    }
    
    return buffer
  }

  /**
   * Creates a buffer for tool brush action data
   */
  static createToolBrushActionBuffer(shapeHandle: number = 123, rgba: number = 0xFF0000FF, brushWidth: number = 2.5): ArrayBuffer {
    const buffer = new ArrayBuffer(17) // 4 + 4 + 1 + 8 bytes
    const view = new DataView(buffer)
    
    view.setInt32(0, shapeHandle)
    // Convert RGBA to ARGB format for Color.fromRGBNumber
    const argb = ((rgba & 0xFF) << 24) | ((rgba >> 8) & 0xFFFFFF)
    view.setInt32(4, argb)
    view.setInt8(8, 0) // lineCap
    view.setFloat64(9, brushWidth)
    
    return buffer
  }

  /**
   * Creates a complete buffer with header and tool brush action data
   */
  static createCompleteToolBrushActionBuffer(shapeHandle: number = 123, rgba: number = 0xFF0000FF, brushWidth: number = 2.5, hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const brushBuffer = this.createToolBrushActionBuffer(shapeHandle, rgba, brushWidth)
    return this.combineBuffers(headerBuffer, brushBuffer)
  }

  /**
   * Creates a buffer for tool drag action data
   */
  static createToolDragActionBuffer(x: number = 10.5, y: number = 20.5, pressure: number = 0.8): ArrayBuffer {
    const buffer = new ArrayBuffer(12) // 3 * 4 bytes
    const view = new DataView(buffer)
    
    view.setFloat32(0, x)
    view.setFloat32(4, y)
    view.setFloat32(8, pressure)
    
    return buffer
  }

  /**
   * Creates a buffer for text change action data
   */
  static createTextChangeActionBuffer(handle: number = 456, text: string = 'Hello World'): ArrayBuffer {
    const textBytes = new TextEncoder().encode(text)
    const buffer = new ArrayBuffer(8 + textBytes.length)
    const view = new DataView(buffer)
    
    view.setInt32(0, handle)
    view.setInt32(4, textBytes.length)
    
    // Copy text bytes
    const uint8View = new Uint8Array(buffer, 8)
    uint8View.set(textBytes)
    
    return buffer
  }

  /**
   * Creates a buffer for text move action data
   */
  static createTextMoveActionBuffer(handle: number = 789, x: number = 100.0, y: number = 200.0): ArrayBuffer {
    const buffer = new ArrayBuffer(20) // 4 + 8 + 8 bytes
    const view = new DataView(buffer)
    
    view.setInt32(0, handle)
    view.setFloat64(4, x)
    view.setFloat64(12, y)
    
    return buffer
  }

  /**
   * Creates a buffer for text highlight action data
   */
  static createTextHighlightActionBuffer(rgba: number = 0xFFFF00FF, bounds: Rectangle[] = []): ArrayBuffer {
    const buffer = new ArrayBuffer(8 + bounds.length * 32) // 4 + 4 + count * (4 * 8)
    const view = new DataView(buffer)
    
    // Convert RGBA to ARGB format for Color.fromRGBNumber
    const argb = ((rgba & 0xFF) << 24) | ((rgba >> 8) & 0xFFFFFF)
    view.setInt32(0, argb)
    view.setInt32(4, bounds.length)
    
    let offset = 8
    for (const bound of bounds) {
      view.setFloat64(offset, bound.x)
      view.setFloat64(offset + 8, bound.y)
      view.setFloat64(offset + 16, bound.width)
      view.setFloat64(offset + 24, bound.height)
      offset += 32
    }
    
    return buffer
  }

  /**
   * Creates a buffer for text font action data
   */
  static createTextFontActionBuffer(
    handle: number = 999,
    rgba: number = 0x0000FFFF,
    fontFamily: string = 'Arial',
    fontSize: number = 14.0,
    posture: number = 0,
    weight: number = 4,
    strikethrough: boolean = false,
    underline: boolean = false
  ): ArrayBuffer {
    const fontFamilyBytes = new TextEncoder().encode(fontFamily)
    const buffer = new ArrayBuffer(8 + 4 + fontFamilyBytes.length + 8 + 1 + 1 + 1 + 1)
    const view = new DataView(buffer)
    
    view.setInt32(0, handle)
    // Convert RGBA to ARGB format for Color.fromRGBNumber
    const argb = ((rgba & 0xFF) << 24) | ((rgba >> 8) & 0xFFFFFF)
    view.setInt32(4, argb)
    view.setInt32(8, fontFamilyBytes.length)
    
    // Copy font family bytes
    const uint8View = new Uint8Array(buffer, 12)
    uint8View.set(fontFamilyBytes)
    
    const offset = 12 + fontFamilyBytes.length
    view.setFloat64(offset, fontSize)
    view.setInt8(offset + 8, posture)
    view.setInt8(offset + 9, weight)
    view.setInt8(offset + 10, strikethrough ? 1 : 0)
    view.setInt8(offset + 11, underline ? 1 : 0)
    
    return buffer
  }

  /**
   * Creates a buffer for extend view action data
   */
  static createExtendViewActionBuffer(x: number = 0, y: number = 0, width: number = 100, height: number = 100): ArrayBuffer {
    const buffer = new ArrayBuffer(32) // 4 * 8 bytes
    const view = new DataView(buffer)
    
    view.setFloat64(0, x)
    view.setFloat64(8, y)
    view.setFloat64(16, width)
    view.setFloat64(24, height)
    
    return buffer
  }

  /**
   * Creates a buffer for screen action data
   */
  static createScreenActionBuffer(videoOffset: number = 0, videoLength: number = 1000, fileName: string = 'test.mp4'): ArrayBuffer {
    const fileNameBytes = new TextEncoder().encode(fileName)
    const buffer = new ArrayBuffer(12 + fileNameBytes.length)
    const view = new DataView(buffer)
    
    view.setInt32(0, videoOffset)
    view.setInt32(4, videoLength)
    view.setInt32(8, fileNameBytes.length)
    
    // Copy file name bytes
    const uint8View = new Uint8Array(buffer, 12)
    uint8View.set(fileNameBytes)
    
    return buffer
  }

  /**
   * Creates a ProgressiveDataView with the given buffer
   */
  static createProgressiveDataView(buffer: ArrayBuffer, byteOffset?: number, byteLength?: number): ProgressiveDataView {
    return new ProgressiveDataView(buffer, byteOffset, byteLength)
  }

  /**
   * Creates test instances of common objects
   */
  static createTestPenPoint(x: number = 10, y: number = 20, pressure: number = 0.5): PenPoint {
    return new PenPoint(x, y, pressure)
  }

  static createTestPoint(x: number = 100, y: number = 200): Point {
    return new Point(x, y)
  }

  static createTestRectangle(x: number = 0, y: number = 0, width: number = 100, height: number = 100): Rectangle {
    return new Rectangle(x, y, width, height)
  }

  static createTestBrush(color: Color = Color.fromRGBNumber(0xFF0000FF), width: number = 2.0): Brush {
    return new Brush(color, width)
  }

  static createTestColor(rgba: number = 0xFF0000FF): Color {
    return Color.fromRGBNumber(rgba)
  }

  static createTestFont(family: string = 'Arial', size: number = 12, style: string = 'normal', weight: string = '400'): Font {
    return new Font(family, size, style, weight)
  }

  /**
   * Creates a buffer for text highlight ext action data
   */
  static createTextHighlightExtActionBuffer(handle: number, rgba: number, bounds: Rectangle[]): ArrayBuffer {
    const buffer = new ArrayBuffer(12 + bounds.length * 32) // 4 + 4 + 4 + count * (4 * 8)
    const view = new DataView(buffer)
    
    view.setInt32(0, handle)
    // Convert RGBA to ARGB format for Color.fromRGBNumber
    const argb = ((rgba & 0xFF) << 24) | ((rgba >> 8) & 0xFFFFFF)
    view.setInt32(4, argb)
    view.setInt32(8, bounds.length)
    
    let offset = 12
    for (const bound of bounds) {
      view.setFloat64(offset, bound.x)
      view.setFloat64(offset + 8, bound.y)
      view.setFloat64(offset + 16, bound.width)
      view.setFloat64(offset + 24, bound.height)
      offset += 32
    }
    
    return buffer
  }

  /**
   * Creates a buffer for latex font action data
   */
  static createLatexFontActionBuffer(handle: number, fontType: number, fontSize: number, rgba: number): ArrayBuffer {
    const buffer = new ArrayBuffer(16) // 4 + 4 + 4 + 4 bytes
    const view = new DataView(buffer)
    
    view.setInt32(0, handle)
    view.setInt32(4, fontType)
    view.setFloat32(8, fontSize)
    // Convert RGBA to ARGB format for Color.fromRGBNumber
    const argb = ((rgba & 0xFF) << 24) | ((rgba >> 8) & 0xFFFFFF)
    view.setInt32(12, argb)
    
    return buffer
  }

  /**
   * Creates action header buffer with specific key event type
   */
  static createActionHeaderBufferWithKeyEvent(actionType: number): ArrayBuffer {
    const buffer = new ArrayBuffer(13)
    const view = new DataView(buffer)
    
    view.setInt32(0, 1) // has key event
    view.setInt32(4, 65) // keyCode
    view.setInt32(8, 0) // modifiers
    view.setInt8(12, actionType)
    
    return buffer
  }

  /**
   * Creates action header buffer with specific modifiers
   */
  static createActionHeaderBufferWithModifiers(modifiers: number): ArrayBuffer {
    const buffer = new ArrayBuffer(13)
    const view = new DataView(buffer)
    
    view.setInt32(0, 1) // has key event
    view.setInt32(4, 65) // keyCode
    view.setInt32(8, modifiers)
    view.setInt8(12, 0) // actionType (keydown)
    
    return buffer
  }

  /**
   * Creates a complete buffer with header and tool drag action data
   */
  static createCompleteToolDragActionBuffer(x: number = 10.5, y: number = 20.5, pressure: number = 0.8, hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const pointBuffer = this.createToolDragActionBuffer(x, y, pressure)
    return this.combineBuffers(headerBuffer, pointBuffer)
  }

  /**
   * Creates a complete buffer with header and text change action data
   */
  static createCompleteTextChangeActionBuffer(handle: number = 456, text: string = 'Hello World', hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const textBuffer = this.createTextChangeActionBuffer(handle, text)
    return this.combineBuffers(headerBuffer, textBuffer)
  }

  /**
   * Creates a complete buffer with header and text move action data
   */
  static createCompleteTextMoveActionBuffer(handle: number = 789, x: number = 100.0, y: number = 200.0, hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const moveBuffer = this.createTextMoveActionBuffer(handle, x, y)
    return this.combineBuffers(headerBuffer, moveBuffer)
  }

  /**
   * Creates a complete buffer with header and text highlight action data
   */
  static createCompleteTextHighlightActionBuffer(rgba: number = 0xFFFF00FF, bounds: Rectangle[] = [], hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const highlightBuffer = this.createTextHighlightActionBuffer(rgba, bounds)
    return this.combineBuffers(headerBuffer, highlightBuffer)
  }

  /**
   * Creates a complete buffer with header and text highlight ext action data
   */
  static createCompleteTextHighlightExtActionBuffer(handle: number = 222, rgba: number = 0x00FF00FF, bounds: Rectangle[] = [], hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const highlightBuffer = this.createTextHighlightExtActionBuffer(handle, rgba, bounds)
    return this.combineBuffers(headerBuffer, highlightBuffer)
  }

  /**
   * Creates a complete buffer with header and text font action data
   */
  static createCompleteTextFontActionBuffer(
    handle: number = 999,
    rgba: number = 0x0000FFFF,
    fontFamily: string = 'Arial',
    fontSize: number = 14.0,
    posture: number = 0,
    weight: number = 4,
    strikethrough: boolean = false,
    underline: boolean = false,
    hasKeyEvent: boolean = false
  ): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const fontBuffer = this.createTextFontActionBuffer(handle, rgba, fontFamily, fontSize, posture, weight, strikethrough, underline)
    return this.combineBuffers(headerBuffer, fontBuffer)
  }

  /**
   * Creates a complete buffer with header and latex font action data
   */
  static createCompleteLatexFontActionBuffer(handle: number = 444, fontType: number = 1, fontSize: number = 18.0, rgba: number = 0xFF0000FF, hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const fontBuffer = this.createLatexFontActionBuffer(handle, fontType, fontSize, rgba)
    return this.combineBuffers(headerBuffer, fontBuffer)
  }

  /**
   * Creates a complete buffer with header and extend view action data
   */
  static createCompleteExtendViewActionBuffer(x: number = 0, y: number = 0, width: number = 100, height: number = 100, hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const extendBuffer = this.createExtendViewActionBuffer(x, y, width, height)
    return this.combineBuffers(headerBuffer, extendBuffer)
  }

  /**
   * Creates a complete buffer with header and screen action data
   */
  static createCompleteScreenActionBuffer(videoOffset: number = 0, videoLength: number = 1000, fileName: string = 'test.mp4', hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const screenBuffer = this.createScreenActionBuffer(videoOffset, videoLength, fileName)
    return this.combineBuffers(headerBuffer, screenBuffer)
  }

  /**
   * Creates a complete buffer with header and rubber ext action data
   */
  static createCompleteRubberExtActionBuffer(shapeHandle: number = 555, hasKeyEvent: boolean = false): ArrayBuffer {
    const headerBuffer = this.createActionHeaderBuffer(hasKeyEvent)
    const handleBuffer = new ArrayBuffer(4)
    new DataView(handleBuffer).setInt32(0, shapeHandle)
    return this.combineBuffers(headerBuffer, handleBuffer)
  }

  /**
   * Combines two ArrayBuffers into one
   */
  static combineBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    const combined = new ArrayBuffer(buffer1.byteLength + buffer2.byteLength)
    const view1 = new Uint8Array(buffer1)
    const view2 = new Uint8Array(buffer2)
    const combinedView = new Uint8Array(combined)
    
    combinedView.set(view1, 0)
    combinedView.set(view2, buffer1.byteLength)
    
    return combined
  }
}

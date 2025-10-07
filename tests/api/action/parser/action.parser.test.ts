import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ActionParser } from '@/api/action/parser/action.parser'
import { ActionType } from '@/api/action/action-type'
import { TestDataFactory } from '../__mocks__/test-data-factory'
import { ProgressiveDataView } from '@/api/action/parser/progressive-data-view'

// Import all action classes for type checking
import { ClearShapesAction } from '@/api/action/clear-shapes.action'
import { UndoAction } from '@/api/action/undo.action'
import { RedoAction } from '@/api/action/redo.action'
import { KeyAction } from '@/api/action/key.action'
import { PenAction } from '@/api/action/pen.action'
import { HighlighterAction } from '@/api/action/highlighter.action'
import { PointerAction } from '@/api/action/pointer.action'
import { ArrowAction } from '@/api/action/arrow.action'
import { LineAction } from '@/api/action/line.action'
import { RectangleAction } from '@/api/action/rectangle.action'
import { EllipseAction } from '@/api/action/ellipse.action'
import { CloneAction } from '@/api/action/clone.action'
import { SelectAction } from '@/api/action/select.action'
import { SelectGroupAction } from '@/api/action/select-group.action'
import { LatexAction } from '@/api/action/latex.action'
import { LatexFontAction } from '@/api/action/latex-font.action'
import { TextAction } from '@/api/action/text.action'
import { TextChangeAction } from '@/api/action/text-change.action'
import { TextFontAction } from '@/api/action/text-font.action'
import { TextMoveAction } from '@/api/action/text-move.action'
import { TextRemoveAction } from '@/api/action/text-remove.action'
import { TextHighlightAction } from '@/api/action/text-highlight.action'
import { TextHighlightActionExt } from '@/api/action/text-highlight.action-ext'
import { ToolBeginAction } from '@/api/action/tool-begin.action'
import { ToolExecuteAction } from '@/api/action/tool-execute.action'
import { ToolEndAction } from '@/api/action/tool-end.action'
import { PanAction } from '@/api/action/pan.action'
import { ExtendViewAction } from '@/api/action/extend-view.action'
import { ZoomAction } from '@/api/action/zoom.action'
import { ZoomOutAction } from '@/api/action/zoom-out.action'
import { RubberAction } from '@/api/action/rubber.action'
import { RubberActionExt } from '@/api/action/rubber.action-ext'
import { ScreenAction } from '@/api/action/screen.action'

describe('ActionParser', () => {
  let dataView: ProgressiveDataView

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parse', () => {
    describe('atomic actions', () => {
      it('should parse CLEAR_SHAPES action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.CLEAR_SHAPES, 13)
        
        expect(action).toBeInstanceOf(ClearShapesAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse UNDO action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.UNDO, 13)
        
        expect(action).toBeInstanceOf(UndoAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse REDO action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.REDO, 13)
        
        expect(action).toBeInstanceOf(RedoAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse KEY action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.KEY, 13)
        
        expect(action).toBeInstanceOf(KeyAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse CLONE action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.CLONE, 13)
        
        expect(action).toBeInstanceOf(CloneAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse SELECT action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.SELECT, 13)
        
        expect(action).toBeInstanceOf(SelectAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse SELECT_GROUP action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.SELECT_GROUP, 13)
        
        expect(action).toBeInstanceOf(SelectGroupAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse PANNING action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.PANNING, 13)
        
        expect(action).toBeInstanceOf(PanAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse ZOOM_OUT action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.ZOOM_OUT, 13)
        
        expect(action).toBeInstanceOf(ZoomOutAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should parse RUBBER action', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.RUBBER, 13)
        
        expect(action).toBeInstanceOf(RubberAction)
        expect(action?.keyEvent).toBeNull()
      })
    })

    describe('tool brush actions', () => {
      it('should parse PEN action with brush data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolBrushActionBuffer(123, 0xFF0000FF, 2.5)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.PEN, 30)
        
        expect(action).toBeInstanceOf(PenAction)
        expect((action as PenAction).shapeHandle).toBe(123)
        expect((action as PenAction).brush).toBeDefined()
        expect((action as PenAction).brush?.width).toBe(2.5)
        expect((action as PenAction).brush?.color.r).toBe(255)
        expect((action as PenAction).brush?.color.g).toBe(0)
        expect((action as PenAction).brush?.color.b).toBe(0)
        expect((action as PenAction).brush?.color.a).toBe(1)
      })

      it('should parse HIGHLIGHTER action with brush data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolBrushActionBuffer(456, 0xFFFF00FF, 3.0)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.HIGHLIGHTER, 30)
        
        expect(action).toBeInstanceOf(HighlighterAction)
        expect((action as HighlighterAction).shapeHandle).toBe(456)
        expect((action as HighlighterAction).brush).toBeDefined()
        expect((action as HighlighterAction).brush?.width).toBe(3.0)
        expect((action as HighlighterAction).brush?.color.r).toBe(255)
        expect((action as HighlighterAction).brush?.color.g).toBe(255)
        expect((action as HighlighterAction).brush?.color.b).toBe(0)
        expect((action as HighlighterAction).brush?.color.a).toBe(1)
      })

      it('should parse POINTER action with brush data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolBrushActionBuffer(789, 0x0000FFFF, 1.5)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.POINTER, 30)
        
        expect(action).toBeInstanceOf(PointerAction)
        expect((action as PointerAction).shapeHandle).toBe(789)
        expect((action as PointerAction).brush).toBeDefined()
        expect((action as PointerAction).brush?.width).toBe(1.5)
        expect((action as PointerAction).brush?.color.r).toBe(0)
        expect((action as PointerAction).brush?.color.g).toBe(0)
        expect((action as PointerAction).brush?.color.b).toBe(255)
        expect((action as PointerAction).brush?.color.a).toBe(1)
      })

      it('should parse ARROW action with brush data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolBrushActionBuffer(111, 0x00FF00FF, 2.0)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.ARROW, 30)
        
        expect(action).toBeInstanceOf(ArrowAction)
        expect((action as ArrowAction).shapeHandle).toBe(111)
        expect((action as ArrowAction).brush).toBeDefined()
        expect((action as ArrowAction).brush?.width).toBe(2.0)
        expect((action as ArrowAction).brush?.color.r).toBe(0)
        expect((action as ArrowAction).brush?.color.g).toBe(255)
        expect((action as ArrowAction).brush?.color.b).toBe(0)
        expect((action as ArrowAction).brush?.color.a).toBe(1)
      })

      it('should parse LINE action with brush data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolBrushActionBuffer(222, 0xFF00FFFF, 1.0)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.LINE, 30)
        
        expect(action).toBeInstanceOf(LineAction)
        expect((action as LineAction).shapeHandle).toBe(222)
        expect((action as LineAction).brush).toBeDefined()
        expect((action as LineAction).brush?.width).toBe(1.0)
        expect((action as LineAction).brush?.color.r).toBe(255)
        expect((action as LineAction).brush?.color.g).toBe(0)
        expect((action as LineAction).brush?.color.b).toBe(255)
        expect((action as LineAction).brush?.color.a).toBe(1)
      })

      it('should parse RECTANGLE action with brush data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolBrushActionBuffer(333, 0x800080FF, 2.5)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.RECTANGLE, 30)
        
        expect(action).toBeInstanceOf(RectangleAction)
        expect((action as RectangleAction).shapeHandle).toBe(333)
        expect((action as RectangleAction).brush).toBeDefined()
        expect((action as RectangleAction).brush?.width).toBe(2.5)
        expect((action as RectangleAction).brush?.color.r).toBe(128)
        expect((action as RectangleAction).brush?.color.g).toBe(0)
        expect((action as RectangleAction).brush?.color.b).toBe(128)
        expect((action as RectangleAction).brush?.color.a).toBe(1)
      })

      it('should parse ELLIPSE action with brush data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolBrushActionBuffer(444, 0x008080FF, 3.5)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.ELLIPSE, 30)
        
        expect(action).toBeInstanceOf(EllipseAction)
        expect((action as EllipseAction).shapeHandle).toBe(444)
        expect((action as EllipseAction).brush).toBeDefined()
        expect((action as EllipseAction).brush?.width).toBe(3.5)
        expect((action as EllipseAction).brush?.color.r).toBe(0)
        expect((action as EllipseAction).brush?.color.g).toBe(128)
        expect((action as EllipseAction).brush?.color.b).toBe(128)
        expect((action as EllipseAction).brush?.color.a).toBe(1)
      })

      it('should parse ZOOM action with brush data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolBrushActionBuffer(555, 0x808080FF, 1.5)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.ZOOM, 30)
        
        expect(action).toBeInstanceOf(ZoomAction)
        expect((action as ZoomAction).shapeHandle).toBe(555)
        expect((action as ZoomAction).brush).toBeDefined()
        expect((action as ZoomAction).brush?.width).toBe(1.5)
        expect((action as ZoomAction).brush?.color.r).toBe(128)
        expect((action as ZoomAction).brush?.color.g).toBe(128)
        expect((action as ZoomAction).brush?.color.b).toBe(128)
        expect((action as ZoomAction).brush?.color.a).toBe(1)
      })
    })

    describe('tool drag actions', () => {
      it('should parse TOOL_BEGIN action with point data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolDragActionBuffer(10.5, 20.5, 0.8)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TOOL_BEGIN, 25)
        
        expect(action).toBeInstanceOf(ToolBeginAction)
        expect((action as ToolBeginAction).point).toBeDefined()
        expect((action as ToolBeginAction).point?.x).toBe(10.5)
        expect((action as ToolBeginAction).point?.y).toBe(20.5)
        expect((action as ToolBeginAction).point?.p).toBeCloseTo(0.8, 5)
      })

      it('should parse TOOL_EXECUTE action with point data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolDragActionBuffer(15.0, 25.0, 0.9)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TOOL_EXECUTE, 25)
        
        expect(action).toBeInstanceOf(ToolExecuteAction)
        expect((action as ToolExecuteAction).point).toBeDefined()
        expect((action as ToolExecuteAction).point?.x).toBe(15.0)
        expect((action as ToolExecuteAction).point?.y).toBe(25.0)
        expect((action as ToolExecuteAction).point?.p).toBeCloseTo(0.9, 5)
      })

      it('should parse TOOL_END action with point data', () => {
        const completeBuffer = TestDataFactory.createCompleteToolDragActionBuffer(20.0, 30.0, 0.0)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TOOL_END, 25)
        
        expect(action).toBeInstanceOf(ToolEndAction)
        expect((action as ToolEndAction).point).toBeDefined()
        expect((action as ToolEndAction).point?.x).toBe(20.0)
        expect((action as ToolEndAction).point?.y).toBe(30.0)
        expect((action as ToolEndAction).point?.p).toBe(0.0)
      })
    })

    describe('text actions', () => {
      it('should parse LATEX action with handle', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        const handleBuffer = new ArrayBuffer(4)
        new DataView(handleBuffer).setInt32(0, 123)
        const combinedBuffer = TestDataFactory.combineBuffers(headerBuffer, handleBuffer)
        dataView = TestDataFactory.createProgressiveDataView(combinedBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.LATEX, 17)
        
        expect(action).toBeInstanceOf(LatexAction)
      })

      it('should parse TEXT action with handle', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        const handleBuffer = new ArrayBuffer(4)
        new DataView(handleBuffer).setInt32(0, 456)
        const combinedBuffer = TestDataFactory.combineBuffers(headerBuffer, handleBuffer)
        dataView = TestDataFactory.createProgressiveDataView(combinedBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TEXT, 17)
        
        expect(action).toBeInstanceOf(TextAction)
      })

      it('should parse TEXT_CHANGE action with handle and text', () => {
        const completeBuffer = TestDataFactory.createCompleteTextChangeActionBuffer(789, 'Hello World')
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TEXT_CHANGE, 25)
        
        expect(action).toBeInstanceOf(TextChangeAction)
        expect((action as TextChangeAction)['handle']).toBe(789)
        expect((action as TextChangeAction)['text']).toBe('Hello World')
      })

      it('should parse TEXT_LOCATION_CHANGE action with handle and point', () => {
        const completeBuffer = TestDataFactory.createCompleteTextMoveActionBuffer(999, 100.0, 200.0)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TEXT_LOCATION_CHANGE, 25)
        
        expect(action).toBeInstanceOf(TextMoveAction)
        expect((action as TextMoveAction)['handle']).toBe(999)
        expect((action as TextMoveAction)['point'].x).toBe(100.0)
        expect((action as TextMoveAction)['point'].y).toBe(200.0)
      })

      it('should parse TEXT_REMOVE action with handle', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        const handleBuffer = new ArrayBuffer(4)
        new DataView(handleBuffer).setInt32(0, 111)
        const combinedBuffer = TestDataFactory.combineBuffers(headerBuffer, handleBuffer)
        dataView = TestDataFactory.createProgressiveDataView(combinedBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TEXT_REMOVE, 17)
        
        expect(action).toBeInstanceOf(TextRemoveAction)
        expect((action as TextRemoveAction)['handle']).toBe(111)
      })

      it('should parse TEXT_SELECTION action with color and bounds', () => {
        const bounds = [
          TestDataFactory.createTestRectangle(0, 0, 100, 50),
          TestDataFactory.createTestRectangle(0, 50, 100, 50)
        ]
        const completeBuffer = TestDataFactory.createCompleteTextHighlightActionBuffer(0xFFFF00FF, bounds)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TEXT_SELECTION, 25)
        
        expect(action).toBeInstanceOf(TextHighlightAction)
        expect((action as TextHighlightAction)['color'].r).toBe(255)
        expect((action as TextHighlightAction)['color'].g).toBe(255)
        expect((action as TextHighlightAction)['color'].b).toBe(0)
        expect((action as TextHighlightAction)['color'].a).toBe(1)
        expect((action as TextHighlightAction)['textBounds']).toHaveLength(2)
        expect((action as TextHighlightAction)['textBounds']?.[0]?.x).toBe(0)
        expect((action as TextHighlightAction)['textBounds']?.[0]?.y).toBe(0)
        expect((action as TextHighlightAction)['textBounds']?.[0]?.width).toBe(100)
        expect((action as TextHighlightAction)['textBounds']?.[0]?.height).toBe(50)
      })

      it('should parse TEXT_SELECTION_EXT action with handle, color and bounds', () => {
        const bounds = [TestDataFactory.createTestRectangle(10, 20, 80, 30)]
        const completeBuffer = TestDataFactory.createCompleteTextHighlightExtActionBuffer(222, 0x00FF00FF, bounds)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TEXT_SELECTION_EXT, 25)
        
        expect(action).toBeInstanceOf(TextHighlightActionExt)
        expect((action as TextHighlightActionExt)['shapeHandle']).toBe(222)
        expect((action as TextHighlightActionExt)['color'].r).toBe(0)
        expect((action as TextHighlightActionExt)['color'].g).toBe(255)
        expect((action as TextHighlightActionExt)['color'].b).toBe(0)
        expect((action as TextHighlightActionExt)['color'].a).toBe(1)
        expect((action as TextHighlightActionExt)['textBounds']).toHaveLength(1)
        expect((action as TextHighlightActionExt)['textBounds']?.[0]?.x).toBe(10)
        expect((action as TextHighlightActionExt)['textBounds']?.[0]?.y).toBe(20)
        expect((action as TextHighlightActionExt)['textBounds']?.[0]?.width).toBe(80)
        expect((action as TextHighlightActionExt)['textBounds']?.[0]?.height).toBe(30)
      })

      it('should parse TEXT_FONT_CHANGE action with font data', () => {
        const completeBuffer = TestDataFactory.createCompleteTextFontActionBuffer(
          333, 0x0000FFFF, 'Times New Roman', 16.0, 1, 6, true, false
        )
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.TEXT_FONT_CHANGE, 25)
        
        expect(action).toBeInstanceOf(TextFontAction)
        expect((action as TextFontAction)['handle']).toBe(333)
        expect((action as TextFontAction)['font'].family).toBe('Times New Roman')
        expect((action as TextFontAction)['font'].size).toBe(16.0)
        expect((action as TextFontAction)['font'].style).toBe('italic')
        expect((action as TextFontAction)['font'].weight).toBe('700')
        expect((action as TextFontAction)['textColor'].r).toBe(0)
        expect((action as TextFontAction)['textColor'].g).toBe(0)
        expect((action as TextFontAction)['textColor'].b).toBe(255)
        expect((action as TextFontAction)['textColor'].a).toBe(1)
        expect((action as TextFontAction)['textAttributes'].get('strikethrough')).toBe(true)
        expect((action as TextFontAction)['textAttributes'].get('underline')).toBe(false)
      })

      it('should parse LATEX_FONT_CHANGE action with font data', () => {
        const completeBuffer = TestDataFactory.createCompleteLatexFontActionBuffer(444, 1, 18.0, 0xFF0000FF)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.LATEX_FONT_CHANGE, 25)
        
        expect(action).toBeInstanceOf(LatexFontAction)
        expect((action as LatexFontAction)['handle']).toBe(444)
        expect((action as LatexFontAction)['font'].family).toBe('Arial')
        expect((action as LatexFontAction)['font'].size).toBe(18.0)
        expect((action as LatexFontAction)['textColor'].r).toBe(255)
        expect((action as LatexFontAction)['textColor'].g).toBe(0)
        expect((action as LatexFontAction)['textColor'].b).toBe(0)
        expect((action as LatexFontAction)['textColor'].a).toBe(1)
      })
    })

    describe('special actions', () => {
      it('should parse EXTEND_VIEW action with rectangle data', () => {
        const completeBuffer = TestDataFactory.createCompleteExtendViewActionBuffer(10, 20, 100, 200)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.EXTEND_VIEW, 45)
        
        expect(action).toBeInstanceOf(ExtendViewAction)
        expect((action as ExtendViewAction)['rect'].x).toBe(10)
        expect((action as ExtendViewAction)['rect'].y).toBe(20)
        expect((action as ExtendViewAction)['rect'].width).toBe(100)
        expect((action as ExtendViewAction)['rect'].height).toBe(200)
      })

      it('should parse RUBBER_EXT action with shape handle', () => {
        const completeBuffer = TestDataFactory.createCompleteRubberExtActionBuffer(555)
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.RUBBER_EXT, 17)
        
        expect(action).toBeInstanceOf(RubberActionExt)
        expect((action as RubberActionExt).shapeHandle).toBe(555)
      })

      it('should parse SCREEN action with video data', () => {
        const completeBuffer = TestDataFactory.createCompleteScreenActionBuffer(0, 1000, 'test.mp4')
        dataView = TestDataFactory.createProgressiveDataView(completeBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.SCREEN, 25)
        
        expect(action).toBeInstanceOf(ScreenAction)
      })
    })

    describe('key event handling', () => {
      it('should parse action with key event', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer(true)
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.CLEAR_SHAPES, 13)
        
        expect(action).toBeInstanceOf(ClearShapesAction)
        expect(action?.keyEvent).toBeDefined()
        expect(action?.keyEvent?.type).toBe('keydown')
        expect(action?.keyEvent?.ctrlKey).toBe(true)
        expect(action?.keyEvent?.shiftKey).toBe(false)
        expect(action?.keyEvent?.altKey).toBe(false)
      })

      it('should parse action without key event', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer(false)
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, ActionType.UNDO, 13)
        
        expect(action).toBeInstanceOf(UndoAction)
        expect(action?.keyEvent).toBeNull()
      })

      it('should handle different key event types', () => {
        const testCases = [
          { actionType: 0, expectedType: 'keydown' },
          { actionType: 1, expectedType: 'keyup' },
          { actionType: 2, expectedType: 'keypress' }
        ]

        for (const testCase of testCases) {
          const headerBuffer = TestDataFactory.createActionHeaderBufferWithKeyEvent(testCase.actionType)
          dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
          
          const action = ActionParser.parse(dataView, ActionType.KEY, 13)
          
          expect(action?.keyEvent?.type).toBe(testCase.expectedType)
        }
      })

      it('should handle key event modifiers', () => {
        const testCases = [
          { modifiers: 0, shift: false, ctrl: false, alt: false },
          { modifiers: 2, shift: true, ctrl: false, alt: false },
          { modifiers: 4, shift: false, ctrl: true, alt: false },
          { modifiers: 8, shift: false, ctrl: false, alt: true },
          { modifiers: 14, shift: true, ctrl: true, alt: true }
        ]

        for (const testCase of testCases) {
          const headerBuffer = TestDataFactory.createActionHeaderBufferWithModifiers(testCase.modifiers)
          dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
          
          const action = ActionParser.parse(dataView, ActionType.KEY, 13)
          
          expect(action?.keyEvent?.shiftKey).toBe(testCase.shift)
          expect(action?.keyEvent?.ctrlKey).toBe(testCase.ctrl)
          expect(action?.keyEvent?.altKey).toBe(testCase.alt)
        }
      })
    })

    describe('error handling', () => {
      it('should return null for unknown action type', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBuffer()
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        const action = ActionParser.parse(dataView, 999, 13)
        
        expect(action).toBeNull()
      })

      it('should throw error for unknown key event type', () => {
        const headerBuffer = TestDataFactory.createActionHeaderBufferWithKeyEvent(99)
        dataView = TestDataFactory.createProgressiveDataView(headerBuffer)
        
        expect(() => {
          ActionParser.parse(dataView, ActionType.KEY, 13)
        }).toThrow('Unknown key event type')
      })
    })
  })
})

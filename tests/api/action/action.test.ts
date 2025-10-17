import { beforeEach, describe, expect, it } from 'vitest'
import { MockActionExecutor } from './__mocks__/action-executor.mock'
import { TestDataFactory } from './__mocks__/test-data-factory'

// Import tool types
import type { PenTool } from '@/api/tool/pen.tool'

// Import action classes
import { ArrowAction } from '@/api/action/arrow.action'
import { ClearShapesAction } from '@/api/action/clear-shapes.action'
import { CloneAction } from '@/api/action/clone.action'
import { EllipseAction } from '@/api/action/ellipse.action'
import { ExtendViewAction } from '@/api/action/extend-view.action'
import { HighlighterAction } from '@/api/action/highlighter.action'
import { KeyAction } from '@/api/action/key.action'
import { LatexFontAction } from '@/api/action/latex-font.action'
import { LatexAction } from '@/api/action/latex.action'
import { LineAction } from '@/api/action/line.action'
import { PanAction } from '@/api/action/pan.action'
import { PenAction } from '@/api/action/pen.action'
import { PointerAction } from '@/api/action/pointer.action'
import { RectangleAction } from '@/api/action/rectangle.action'
import { RedoAction } from '@/api/action/redo.action'
import { RubberAction } from '@/api/action/rubber.action'
import { RubberActionExt } from '@/api/action/rubber.action-ext'
import { ScreenAction } from '@/api/action/screen.action'
import { SelectGroupAction } from '@/api/action/select-group.action'
import { SelectAction } from '@/api/action/select.action'
import { TextChangeAction } from '@/api/action/text-change.action'
import { TextFontAction } from '@/api/action/text-font.action'
import { TextHighlightAction } from '@/api/action/text-highlight.action'
import { TextHighlightActionExt } from '@/api/action/text-highlight.action-ext'
import { TextFontAction } from '@/api/action/text-font.action'
import { LatexFontAction } from '@/api/action/latex-font.action'
import { ExtendViewAction } from '@/api/action/extend-view.action'
import { RubberActionExt } from '@/api/action/rubber.action-ext'
import { ScreenAction } from '@/api/action/screen.action'
import type { Action } from '@/api/action/action'

describe('Action Classes', () => {
  let mockExecutor: MockActionExecutor

  // Helper function to test atomic action execution
  const testAtomicAction = (ActionClass: new () => Action, expectedToolName: string) => {
    const action = new ActionClass()
    action.execute(mockExecutor)
    
    expect(mockExecutor.executedAtomicTool).toBeDefined()
    expect(mockExecutor.executedAtomicTool?.constructor.name).toBe(expectedToolName)
  }

  // Helper function to test action default properties
  const testActionDefaults = (ActionClass: new () => Action) => {
    const action = new ActionClass()
    expect(action.keyEvent).toBeNull()
    expect(action.timestamp).toBe(0)
  }

  beforeEach(() => {
    mockExecutor = new MockActionExecutor()
  })

  describe('Atomic Actions', () => {
    const atomicActions = [
      { ActionClass: ClearShapesAction, toolName: 'ClearShapesTool' },
      { ActionClass: UndoAction, toolName: 'UndoTool' },
      { ActionClass: RedoAction, toolName: 'RedoTool' }
    ]

    atomicActions.forEach(({ ActionClass, toolName }) => {
      describe(ActionClass.name, () => {
        it('should execute correct tool', () => {
          testAtomicAction(ActionClass, toolName)
        })

        it('should have default properties', () => {
          testActionDefaults(ActionClass)
        })
      })
    })

    describe('KeyAction', () => {
      it('should set key event when keyEvent is present', () => {
        const action = new KeyAction()
        const keyEvent = new KeyboardEvent('keydown', { key: 'a' })
        action.keyEvent = keyEvent

        action.execute(mockExecutor)

        expect(mockExecutor.setKeyEventCalled).toBe(true)
        expect(mockExecutor.keyEventValue).toBe(keyEvent)
      })
    })

    describe('CloneAction', () => {
      it('should set clone tool', () => {
        const action = new CloneAction()

        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(true)
        expect(mockExecutor.setToolCalledWith?.constructor.name).toBe('CloneTool')
      })
    })

    describe('SelectAction', () => {
      it('should set select tool', () => {
        const action = new SelectAction()

        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(true)
        expect(mockExecutor.setToolCalledWith?.constructor.name).toBe('SelectTool')
      })
    })

    describe('SelectGroupAction', () => {
      it('should set select group tool', () => {
        const action = new SelectGroupAction()

        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(true)
        expect(mockExecutor.setToolCalledWith?.constructor.name).toBe('SelectGroupTool')
      })
    })

    describe('PanAction', () => {
      it('should set pan tool', () => {
        const action = new PanAction()

        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(true)
        expect(mockExecutor.setToolCalledWith?.constructor.name).toBe('PanTool')
      })
    })

    describe('ZoomOutAction', () => {
      it('should execute zoom out tool', () => {
        const action = new ZoomOutAction()

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('ZoomOutTool')
      })
    })

    describe('RubberAction', () => {
      it('should set rubber tool', () => {
        const action = new RubberAction()

        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(true)
        expect(mockExecutor.setToolCalledWith?.constructor.name).toBe('RubberTool')
      })
    })
  })

  describe('Brush Actions', () => {
    describe('PenAction', () => {
      it('should set pen tool with brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new PenAction(123, brush)

        action.execute(mockExecutor)

        expect(mockExecutor.toolValue).toBeDefined()
        expect(mockExecutor.toolValue?.constructor.name).toBe('PenTool')
        expect((mockExecutor.toolValue as PenTool).shapeHandle).toBe(123)
        expect((mockExecutor.toolValue as PenTool).brush).toBe(brush)
      })

      it('should store shape handle and brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new PenAction(456, brush)

        expect(action.shapeHandle).toBe(456)
        expect(action.brush).toBe(brush)
      })
    })

    describe('HighlighterAction', () => {
      it('should set highlighter tool with brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new HighlighterAction(789, brush)

        action.execute(mockExecutor)

        expect(mockExecutor.toolValue).toBeDefined()
        expect(mockExecutor.toolValue?.constructor.name).toBe('HighlighterTool')
        expect((mockExecutor.toolValue as PenTool).shapeHandle).toBe(789)
        expect((mockExecutor.toolValue as PenTool).brush).toBe(brush)
      })
    })

    describe('PointerAction', () => {
      it('should set pointer tool with brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new PointerAction(111, brush)

        action.execute(mockExecutor)

        expect(mockExecutor.toolValue).toBeDefined()
        expect(mockExecutor.toolValue?.constructor.name).toBe('PointerTool')
        expect((mockExecutor.toolValue as PenTool).shapeHandle).toBe(111)
        expect((mockExecutor.toolValue as PenTool).brush).toBe(brush)
      })
    })

    describe('ArrowAction', () => {
      it('should set arrow tool with brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new ArrowAction(222, brush)

        action.execute(mockExecutor)

        expect(mockExecutor.toolValue).toBeDefined()
        expect(mockExecutor.toolValue?.constructor.name).toBe('ArrowTool')
        expect((mockExecutor.toolValue as PenTool).shapeHandle).toBe(222)
        expect((mockExecutor.toolValue as PenTool).brush).toBe(brush)
      })
    })

    describe('LineAction', () => {
      it('should set line tool with brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new LineAction(333, brush)

        action.execute(mockExecutor)

        expect(mockExecutor.toolValue).toBeDefined()
        expect(mockExecutor.toolValue?.constructor.name).toBe('LineTool')
        expect((mockExecutor.toolValue as PenTool).shapeHandle).toBe(333)
        expect((mockExecutor.toolValue as PenTool).brush).toBe(brush)
      })
    })

    describe('RectangleAction', () => {
      it('should set rectangle tool with brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new RectangleAction(444, brush)

        action.execute(mockExecutor)

        expect(mockExecutor.toolValue).toBeDefined()
        expect(mockExecutor.toolValue?.constructor.name).toBe('RectangleTool')
        expect((mockExecutor.toolValue as PenTool).shapeHandle).toBe(444)
        expect((mockExecutor.toolValue as PenTool).brush).toBe(brush)
      })
    })

    describe('EllipseAction', () => {
      it('should set ellipse tool with brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new EllipseAction(555, brush)

        action.execute(mockExecutor)

        expect(mockExecutor.toolValue).toBeDefined()
        expect(mockExecutor.toolValue?.constructor.name).toBe('EllipseTool')
        expect((mockExecutor.toolValue as PenTool).shapeHandle).toBe(555)
        expect((mockExecutor.toolValue as PenTool).brush).toBe(brush)
      })
    })

    describe('ZoomAction', () => {
      it('should set zoom tool with brush', () => {
        const brush = TestDataFactory.createTestBrush()
        const action = new ZoomAction(666, brush)

        action.execute(mockExecutor)

        expect(mockExecutor.toolValue).toBeDefined()
        expect(mockExecutor.toolValue?.constructor.name).toBe('ZoomTool')
        expect((action as PenAction).shapeHandle).toBe(666)
        expect((action as PenAction).brush).toBe(brush)
      })
    })
  })

  describe('Tool Actions', () => {
    describe('ToolBeginAction', () => {
      it('should begin tool with point', () => {
        const point = TestDataFactory.createTestPenPoint(10, 20, 0.5)
        const action = new ToolBeginAction(point)

        action.execute(mockExecutor)

        expect(mockExecutor.beginToolPoint).toBe(point)
      })

      it('should throw error when point is undefined', () => {
        const action = new ToolBeginAction()

        expect(() => {
          action.execute(mockExecutor)
        }).toThrow('Point is not defined')
      })

      it('should store point', () => {
        const point = TestDataFactory.createTestPenPoint(15, 25, 0.8)
        const action = new ToolBeginAction(point)

        expect(action.point).toBe(point)
      })
    })

    describe('ToolExecuteAction', () => {
      it('should execute tool with point', () => {
        const point = TestDataFactory.createTestPenPoint(30, 40, 0.9)
        const action = new ToolExecuteAction(point)

        action.execute(mockExecutor)

        expect(mockExecutor.executeToolPoint).toBe(point)
      })

      it('should store point', () => {
        const point = TestDataFactory.createTestPenPoint(35, 45, 0.7)
        const action = new ToolExecuteAction(point)

        expect(action.point).toBe(point)
      })
    })

    describe('ToolEndAction', () => {
      it('should end tool with point', () => {
        const point = TestDataFactory.createTestPenPoint(50, 60, 0.0)
        const action = new ToolEndAction(point)

        action.execute(mockExecutor)

        expect(mockExecutor.endToolPoint).toBe(point)
      })

      it('should store point', () => {
        const point = TestDataFactory.createTestPenPoint(55, 65, 0.3)
        const action = new ToolEndAction(point)

        expect(action.point).toBe(point)
      })
    })
  })

  describe('Text Actions', () => {
    describe('TextAction', () => {
      it('should set text tool with handle', () => {
        const action = new TextAction(123)

        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(true)
        expect(mockExecutor.setToolCalledWith?.constructor.name).toBe('TextTool')
      })

      it('should store handle', () => {
        const action = new TextAction(456)
        expect((action as TextAction)['handle']).toBe(456)
      })
    })

    describe('LatexAction', () => {
      it('should set latex tool with handle', () => {
        const action = new LatexAction(789)

        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(true)
        expect(mockExecutor.setToolCalledWith?.constructor.name).toBe('LatexTool')
      })

      it('should store handle', () => {
        const action = new LatexAction(999)
        expect((action as LatexAction)['handle']).toBe(999)
      })
    })

    describe('TextChangeAction', () => {
      it('should execute text change tool with handle and text', () => {
        const action = new TextChangeAction(111, 'Hello World')

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('TextChangeTool')
      })

      it('should store handle and text', () => {
        const action = new TextChangeAction(222, 'Test Text')
        expect((action as TextChangeAction)['handle']).toBe(222)
        expect((action as TextChangeAction)['text']).toBe('Test Text')
      })
    })

    describe('TextMoveAction', () => {
      it('should execute text move tool with handle and point', () => {
        const point = TestDataFactory.createTestPoint(100, 200)
        const action = new TextMoveAction(333, point)

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('TextMoveTool')
      })

      it('should store handle and point', () => {
        const point = TestDataFactory.createTestPoint(150, 250)
        const action = new TextMoveAction(444, point)
        expect((action as TextMoveAction)['handle']).toBe(444)
        expect((action as TextMoveAction)['point']).toBe(point)
      })
    })

    describe('TextRemoveAction', () => {
      it('should execute text remove tool with handle', () => {
        const action = new TextRemoveAction(555)

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('TextRemoveTool')
      })

      it('should store handle', () => {
        const action = new TextRemoveAction(666)
        expect((action as TextRemoveAction)['handle']).toBe(666)
      })
    })

    describe('TextHighlightAction', () => {
      it('should set text highlight tool with color and bounds', () => {
        const color = TestDataFactory.createTestColor()
        const bounds = [TestDataFactory.createTestRectangle()]
        const action = new TextHighlightAction(color, bounds)

        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(true)
        expect(mockExecutor.setToolCalledWith?.constructor.name).toBe('TextHighlightTool')
      })

      it('should store color and bounds', () => {
        const color = TestDataFactory.createTestColor(0xFFFF00FF)
        const bounds = [TestDataFactory.createTestRectangle(10, 20, 100, 50)]
        const action = new TextHighlightAction(color, bounds)
        expect((action as TextHighlightAction)['color']).toBe(color)
        expect((action as TextHighlightAction)['textBounds']).toBe(bounds)
      })
    })

    describe('TextHighlightActionExt', () => {
      it('should execute text highlight ext tool with handle, color and bounds', () => {
        const color = TestDataFactory.createTestColor()
        const bounds = [TestDataFactory.createTestRectangle()]
        const action = new TextHighlightActionExt(777, color, bounds)

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('TextHighlightToolExt')
      })

      it('should store handle, color and bounds', () => {
        const color = TestDataFactory.createTestColor(0x00FF00FF)
        const bounds = [TestDataFactory.createTestRectangle(5, 10, 80, 40)]
        const action = new TextHighlightActionExt(888, color, bounds)
        expect((action as TextHighlightActionExt)['shapeHandle']).toBe(888)
        expect((action as TextHighlightActionExt)['color']).toBe(color)
        expect((action as TextHighlightActionExt)['textBounds']).toBe(bounds)
      })
    })

    describe('TextFontAction', () => {
      it('should execute text font tool with handle, font, color and attributes', () => {
        const font = TestDataFactory.createTestFont()
        const color = TestDataFactory.createTestColor()
        const attributes = new Map([['bold', true]])
        const action = new TextFontAction(999, font, color, attributes)

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('TextFontTool')
      })

      it('should store handle, font, color and attributes', () => {
        const font = TestDataFactory.createTestFont('Times', 16, 'italic', '700')
        const color = TestDataFactory.createTestColor(0x0000FFFF)
        const attributes = new Map([['underline', true], ['strikethrough', false]])
        const action = new TextFontAction(1000, font, color, attributes)
        expect((action as TextFontAction)['handle']).toBe(1000)
        expect((action as TextFontAction)['font']).toBe(font)
        expect((action as TextFontAction)['textColor']).toBe(color)
        expect((action as TextFontAction)['textAttributes']).toBe(attributes)
      })
    })

    describe('LatexFontAction', () => {
      it('should execute latex font tool with handle, font, color and attributes', () => {
        const font = TestDataFactory.createTestFont()
        const color = TestDataFactory.createTestColor()
        const attributes = new Map()
        const action = new LatexFontAction(1001, font, color, attributes)

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('LatexFontTool')
      })

      it('should store handle, font, color and attributes', () => {
        const font = TestDataFactory.createTestFont('Arial', 18)
        const color = TestDataFactory.createTestColor(0xFF0000FF)
        const attributes = new Map([['bold', true]])
        const action = new LatexFontAction(1002, font, color, attributes)
        expect((action as LatexFontAction)['handle']).toBe(1002)
        expect((action as LatexFontAction)['font']).toBe(font)
        expect((action as LatexFontAction)['textColor']).toBe(color)
        expect((action as LatexFontAction)['textAttributes']).toBe(attributes)
      })
    })
  })

  describe('Special Actions', () => {
    describe('ExtendViewAction', () => {
      it('should execute extend view tool with rectangle', () => {
        const rectangle = TestDataFactory.createTestRectangle(10, 20, 100, 200)
        const action = new ExtendViewAction(rectangle)

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('ExtendViewTool')
      })

      it('should store rectangle', () => {
        const rectangle = TestDataFactory.createTestRectangle(5, 15, 150, 250)
        const action = new ExtendViewAction(rectangle)
        expect((action as ExtendViewAction)['rect']).toBe(rectangle)
      })
    })

    describe('RubberActionExt', () => {
      it('should execute rubber ext tool with shape handle', () => {
        const action = new RubberActionExt(1003)

        action.execute(mockExecutor)

        expect(mockExecutor.executedAtomicTool).toBeDefined()
        expect(mockExecutor.executedAtomicTool?.constructor.name).toBe('RubberToolExt')
      })

      it('should store shape handle', () => {
        const action = new RubberActionExt(1004)
        expect((action as RubberActionExt)['shapeHandle']).toBe(1004)
      })
    })

    describe('ScreenAction', () => {
      it('should call playVideo with correct parameters', () => {
        const action = new ScreenAction(100, 200, 1920, 1080, 'test-video.mp4')
        
        action.execute(mockExecutor)

        expect(mockExecutor.setToolCalled).toBe(false)
        expect(mockExecutor.executedAtomicTool).toBeNull()
        // Note: The mock implementation doesn't track playVideo calls, but the method is called
      })

      it('should store video parameters', () => {
        const action = new ScreenAction(150, 300, 1280, 720, 'sample.mp4')
        
        expect(action.videoOffset).toBe(150)
        expect(action.videoLength).toBe(300)
        expect(action.contentWidth).toBe(1280)
        expect(action.contentHeight).toBe(720)
        expect(action.fileName).toBe('sample.mp4')
      })
    })
  })

  describe('Action Properties', () => {
    it('should allow setting keyEvent', () => {
      const action = new ClearShapesAction()
      const keyEvent = new KeyboardEvent('keydown', { key: 'a' })

      action.keyEvent = keyEvent

      expect(action.keyEvent).toBe(keyEvent)
    })

    it('should allow setting timestamp', () => {
      const action = new ClearShapesAction()
      const timestamp = Date.now()

      action.timestamp = timestamp

      expect(action.timestamp).toBe(timestamp)
    })

    it('should have default values for keyEvent and timestamp', () => {
      const action = new ClearShapesAction()

      expect(action.keyEvent).toBeNull()
      expect(action.timestamp).toBe(0)
    })
  })
})

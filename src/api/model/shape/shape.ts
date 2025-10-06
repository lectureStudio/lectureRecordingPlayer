import { PenPoint } from '../../geometry/pen-point'
import { Point } from '../../geometry/point'
import { Rectangle } from '../../geometry/rectangle'
import { TypedEvent } from '../../utils/event-listener'
import type { Disposable, Listener } from '../../utils/event-listener'
import { ShapeEvent } from './shape-event'

abstract class Shape {
  private readonly _points: PenPoint[] = []

  private readonly _bounds: Rectangle = Rectangle.empty()

  private readonly changeEvent = new TypedEvent<ShapeEvent>()

  private shapeHandle: number | undefined = undefined

  private selected: boolean = false

  private keyEvent: KeyboardEvent | undefined

  protected abstract updateBounds(): void

  getHandle(): number | undefined {
    return this.shapeHandle
  }

  setHandle(handle: number): void {
    this.shapeHandle = handle
  }

  addPoint(point: PenPoint): boolean {
    const count = this._points.length
    let last = null

    if (count > 0) {
      last = this._points[count - 1]
    }
    if (last && point.equals(last)) {
      return false
    }

    this._points.push(point)

    return true
  }

  get points(): PenPoint[] {
    return this._points
  }

  contains(point: PenPoint): boolean {
    return this._bounds.containsPoint(point)
  }

  intersects(rect: Rectangle): boolean {
    return this._bounds.intersection(rect) != null
  }

  get bounds(): Rectangle {
    return this._bounds
  }

  getKeyEvent(): KeyboardEvent | undefined {
    return this.keyEvent
  }

  setKeyEvent(event: KeyboardEvent | undefined): void {
    this.keyEvent = event
  }

  isSelected(): boolean {
    return this.selected
  }

  setSelected(selected: boolean): void {
    if (this.selected == selected) {
      return
    }

    this.selected = selected

    this.fireShapeEvent(new ShapeEvent(this, this.bounds))
  }

  moveByDelta(delta: Point): void {
    for (const point of this._points) {
      point.subtract(delta)
    }

    this.updateBoundsByDelta(delta)

    this.fireShapeEvent(new ShapeEvent(this, this.bounds))
  }

  clone(): Shape {
    return Object.create(this)
  }

  addChangeListener(listener: Listener<ShapeEvent>): Disposable {
    return this.changeEvent.subscribe(listener)
  }

  removeChangeListener(listener: Listener<ShapeEvent>): void {
    this.changeEvent.unsubscribe(listener)
  }

  protected updateBoundsByDelta(delta: Point): void {
    this.bounds.x -= delta.x
    this.bounds.y -= delta.y
  }

  protected fireShapeEvent(event: ShapeEvent): void {
    this.changeEvent.publish(event)
  }
}

export { Shape }

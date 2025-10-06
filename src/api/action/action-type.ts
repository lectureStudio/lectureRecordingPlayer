// Replaced TS enum with a const object and a type alias to be compatible with
// environments using `erasableSyntaxOnly`/isolated compilation (e.g., Vue + Volar),
// which disallow runtime enums.

const ActionType = {
  /*
   * Tool actions
   */
  TOOL_BEGIN: 0,
  TOOL_EXECUTE: 1,
  TOOL_END: 2,

  /*
   * Stroke actions
   */
  PEN: 3,
  HIGHLIGHTER: 4,
  POINTER: 5,

  /*
   * Form actions
   */
  ARROW: 6,
  LINE: 7,
  RECTANGLE: 8,
  ELLIPSE: 9,

  /*
   * Text actions
   */
  TEXT: 10,
  TEXT_CHANGE: 11,
  TEXT_FONT_CHANGE: 12,
  TEXT_LOCATION_CHANGE: 13,
  TEXT_REMOVE: 14,
  TEXT_SELECTION: 15,

  LATEX: 16,
  LATEX_FONT_CHANGE: 17,

  /*
   * Rearrangement actions
   */
  UNDO: 18,
  REDO: 19,
  CLONE: 20,
  SELECT: 21,
  SELECT_GROUP: 22,
  RUBBER: 23,
  CLEAR_SHAPES: 24,

  /*
   * Zoom actions
   */
  PANNING: 25,
  EXTEND_VIEW: 26,
  ZOOM: 27,
  ZOOM_OUT: 28,

  /*
   * Atomic actions
   */
  NEXT_PAGE: 29,
  KEY: 30,

  STATIC: 31,

  PAGE: 32,

  RUBBER_EXT: 33,
  TEXT_SELECTION_EXT: 34,

  SCREEN: 35,
} as const

// Union type of all ActionType numeric values
export type ActionTypeCode = typeof ActionType[keyof typeof ActionType]

export { ActionType }

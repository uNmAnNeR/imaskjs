// @flow


/** Checks if value is string */
export
function isString (str: mixed): boolean %checks {
  return typeof str === 'string' || str instanceof String;
}

/**
  Direction
  @prop {string} NONE
  @prop {string} LEFT
  @prop {string} FORCE_LEFT
  @prop {string} RIGHT
  @prop {string} FORCE_RIGHT
*/
export
const DIRECTION = {
  NONE: 'NONE',
  LEFT: 'LEFT',
  FORCE_LEFT: 'FORCE_LEFT',
  RIGHT: 'RIGHT',
  FORCE_RIGHT: 'FORCE_RIGHT',
}
/**
  Direction
  @enum {string}
*/
export
type Direction = $Values<typeof DIRECTION>;

/** Returns next char index in direction */
export
function indexInDirection (pos: number, direction: Direction): number {
  if (direction === DIRECTION.LEFT) --pos;
  return pos;
}

/** Returns next char position in direction */
export
function posInDirection (pos: number, direction: Direction): number {
  switch (direction) {
    case DIRECTION.LEFT:
    case DIRECTION.FORCE_LEFT:
      return --pos;
    case DIRECTION.RIGHT:
    case DIRECTION.FORCE_RIGHT:
      return ++pos;
    default:
      return pos;
  }
}

/** */
export
function forceDirection (direction: Direction): Direction {
  switch (direction) {
    case DIRECTION.LEFT:
      return DIRECTION.FORCE_LEFT;
    case DIRECTION.RIGHT:
      return DIRECTION.FORCE_RIGHT;
    default:
      return direction;
  }
}

/** Escapes regular expression control chars */
export
function escapeRegExp (str: string): string {
  return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
}


// cloned from https://github.com/epoberezkin/fast-deep-equal with small changes
export
function objectIncludes (b: any, a: any): boolean {
  if (a === b) return true;

  var arrA = Array.isArray(a)
    , arrB = Array.isArray(b)
    , i;

  if (arrA && arrB) {
    if (a.length != b.length) return false;
    for (i = 0; i < a.length; i++)
      if (!objectIncludes(a[i], b[i])) return false;
    return true;
  }

  if (arrA != arrB) return false;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA && dateB) return a.getTime() == b.getTime();
    if (dateA != dateB) return false;

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA && regexpB) return a.toString() == b.toString();
    if (regexpA != regexpB) return false;

    var keys = Object.keys(a);
    // if (keys.length !== Object.keys(b).length) return false;

    for (i = 0; i < keys.length; i++)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = 0; i < keys.length; i++)
      if(!objectIncludes(b[keys[i]], a[keys[i]])) return false;

    return true;
  } else if (a && b && typeof a === 'function' && typeof b === 'function') {
      return a.toString() === b.toString()
  }

  return false;
}

/** Selection range */
export
type Selection = {
  start: number;
  end: number;
};

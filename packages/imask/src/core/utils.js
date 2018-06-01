// @flow


/** Checks if value is string */
export
function isString (str: mixed): boolean %checks {
  return typeof str === 'string' || str instanceof String;
}

/**
  Direction
  @prop {number} NONE
  @prop {number} LEFT
  @prop {number} RIGHT
*/
export
const DIRECTION = {
  NONE: 0,
  LEFT: -1,
  RIGHT: 1
}
/**
  Direction
  @enum {number}
*/
export
type Direction = $Values<typeof DIRECTION>;

/** Returns next char position in direction */
export
function indexInDirection (pos: number, direction: Direction): number {
  if (direction === DIRECTION.LEFT) --pos;
  return pos;
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
    var keys = Object.keys(a);
    // if (keys.length !== Object.keys(b).length) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA && dateB) return a.getTime() == b.getTime();
    if (dateA != dateB) return false;

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA && regexpB) return a.toString() == b.toString();
    if (regexpA != regexpB) return false;

    for (i = 0; i < keys.length; i++)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = 0; i < keys.length; i++)
      if(!objectIncludes(a[keys[i]], b[keys[i]])) return false;

    return true;
  }

  return false;
}

/* eslint-disable no-undef */
export
const g: any = typeof window !== 'undefined' && window ||
  typeof global !== 'undefined' && global.global === global && global ||
  typeof self !== 'undefined' && self.self === self && self ||
  {};
/* eslint-enable no-undef */

/** Selection range */
export
type Selection = {
  start: number;
  end: number;
};

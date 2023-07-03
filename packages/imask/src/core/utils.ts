/** Checks if value is string */
export
function isString (str: unknown): str is string {
  return typeof str === 'string' || str instanceof String;
}

/** Checks if value is object */
export
function isObject (obj: unknown): obj is object {
  return typeof obj === 'object' && obj != null && obj?.constructor?.name === 'Object';
}

export
function pick<T extends Record<string, any>, K extends keyof T, V extends T[keyof T]> (
  obj: T,
  keys: K[] | ((v: V, k: K) => boolean),
): Pick<T, K> {
  if (Array.isArray(keys)) return pick(obj, (_, k) => keys.includes(k));
  return (Object.entries(obj) as unknown as Array<[K, V]>)
    .reduce((acc, [k, v]) => {
      if (keys(v, k)) acc[k] = v;
      return acc;
    }, {} as any);
}

/** Direction */
export
const DIRECTION = {
  NONE: 'NONE',
  LEFT: 'LEFT',
  FORCE_LEFT: 'FORCE_LEFT',
  RIGHT: 'RIGHT',
  FORCE_RIGHT: 'FORCE_RIGHT',
} as const;

/** Direction */
export
type Direction = typeof DIRECTION[keyof typeof DIRECTION];

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

  const arrA = Array.isArray(a), arrB = Array.isArray(b);
  let i;

  if (arrA && arrB) {
    if (a.length != b.length) return false;
    for (i = 0; i < a.length; i++)
      if (!objectIncludes(a[i], b[i])) return false;
    return true;
  }

  if (arrA != arrB) return false;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const dateA = a instanceof Date, dateB = b instanceof Date;
    if (dateA && dateB) return a.getTime() == b.getTime();
    if (dateA != dateB) return false;

    const regexpA = a instanceof RegExp, regexpB = b instanceof RegExp;
    if (regexpA && regexpB) return a.toString() == b.toString();
    if (regexpA != regexpB) return false;

    const keys = Object.keys(a);
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

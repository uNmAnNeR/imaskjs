export
function isString (str) {
  return typeof str === 'string' || str instanceof String;
}

export
function conform (res, str, fallback='') {
  return isString(res) ?
    res :
    res ?
      str :
      fallback;
}

export
const DIRECTION = {
  NONE: 0,
  LEFT: -1,
  RIGHT: 1
}

export
function indexInDirection (pos, direction) {
  if (direction === DIRECTION.LEFT) --pos;
  return pos;
}

export
function refreshValueOnSet (target, key, descriptor) {
  const method = descriptor.set;
  descriptor.set = function (...args) {
    return this.withValueRefresh(method.bind(this, ...args));
  };
}

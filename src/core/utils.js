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
function refreshValue (target, key, descriptor) {
  const method = descriptor.set;
  descriptor.set = function (...args) {
    let unmasked;
    if (this.isInitialized) unmasked = this.unmaskedValue;
    const ret = method.call(this, ...args);
    if (unmasked != null) this.unmaskedValue = unmasked;
    return ret;
  };
}

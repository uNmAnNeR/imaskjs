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
var DIRECTION = {
  NONE: 0,
  LEFT: -1,
  RIGHT: 1
}


export
function extendDetailsAdjustments(str, details) {
  var cursorPos = details.cursorPos;
  var oldSelection = details.oldSelection;
  var oldValue = details.oldValue;

  var startChangePos = Math.min(cursorPos, oldSelection.start);
  var insertedCount = cursorPos - startChangePos;
  // Math.max for opposite operation
  var removedCount = Math.max((oldSelection.end - startChangePos) ||
    // for Delete
    oldValue.length - str.length, 0);

  return {
    ...details,
    startChangePos,
    head: str.substring(0, startChangePos),
    tail: str.substring(startChangePos + insertedCount),
    inserted: str.substr(startChangePos, insertedCount),
    removed: oldValue.substr(startChangePos, removedCount),
    removeDirection: removedCount &&
      ((oldSelection.end === cursorPos || insertedCount) ?
        DIRECTION.RIGHT :
        DIRECTION.LEFT)
  };
}


export
function indexInDirection (pos, direction) {
  if (direction === DIRECTION.LEFT) --pos;
  return pos;
}

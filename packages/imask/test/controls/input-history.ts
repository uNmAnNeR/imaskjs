import assert from 'assert';
import { describe, it, beforeEach } from 'node:test';

import InputHistory from '../../src/controls/input-history';


describe('InputHistory', function () {
  const history = new InputHistory();

  beforeEach(function () {
    history.clear();
  });

  it('should work', function () {
    const state1 = { unmaskedValue: '1', selection: { start: 0, end: 1 } };
    const state2 = { unmaskedValue: '2', selection: { start: 1, end: 2 } };

    history.push(state1);
    history.push(state2);
    assert.equal(history.currentIndex, 1);

    assert.equal(history.undo(), state1);
    assert.equal(history.currentIndex, 0);

    assert.equal(history.redo(), state2);
    assert.equal(history.currentIndex, 1);

    history.clear();
    assert.equal(history.states.length, 0);
  });
});

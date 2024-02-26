import assert from 'assert';
import { describe, it } from 'node:test';

import ActionDetails from '../../src/core/action-details';
import { DIRECTION } from '../../src/core/utils';


describe('ActionDetails', function () {
  it('should handle insert', function () {
    const ad = new ActionDetails({
      value: '1234',
      cursorPos: 3,
      oldValue: '124',
      oldSelection: { start: 2, end: 2 },
    });
    
    assert.equal(ad.removedCount, 0);
    assert.equal(ad.insertedCount, 1);
    assert.equal(ad.removeDirection, DIRECTION.NONE);
  });

  it('should handle backspace', function () {
    const ad = new ActionDetails({
      value: '124',
      cursorPos: 2,
      oldValue: '1234',
      oldSelection: { start: 3, end: 3 },
    });
    
    assert.equal(ad.removedCount, 1);
    assert.equal(ad.insertedCount, 0);
    assert.equal(ad.removeDirection, DIRECTION.LEFT);
  });

  it('should handle delete', function () {
    const ad = new ActionDetails({
      value: '124',
      cursorPos: 2,
      oldValue: '1234',
      oldSelection: { start: 2, end: 2 },
    });
    
    assert.equal(ad.removedCount, 1);
    assert.equal(ad.insertedCount, 0);
    assert.equal(ad.removeDirection, DIRECTION.RIGHT);
  });

  it('should fix old selection end', function () {
    const ad = new ActionDetails({
      value: '1111',
      cursorPos: 4,
      oldValue: '0000',
      // this is not common for input text
      // but sometimes happens because of HMR/autocomplete
      oldSelection: { start: 0, end: 0 },
    });
    
    assert.equal(ad.removedCount, 4, 'invalid removedCount');
    assert.equal(ad.insertedCount, 4, 'invalid insertedCount');
    assert.equal(ad.removeDirection, DIRECTION.NONE);
  });
});

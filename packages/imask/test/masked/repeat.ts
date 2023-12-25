import assert from 'assert';
import { beforeEach, describe, it } from 'node:test';

import RepeatMask from '../../src/masked/repeat';


describe('RepeatMask', function () {
  const masked = new RepeatMask({
    mask: '0',
    lazy: false,
  });

  beforeEach(function () {
    masked.updateOptions({
      mask: '0',
      lazy: false,
      repeat: Infinity,
    });
    masked.unmaskedValue = '';
  });

  it('should extend pattern', function () {
    for (let i=1; i<=3; ++i) {
      masked.value = '1'.repeat(i);
      assert.equal(masked.value, '1'.repeat(i));
    }
  });

  it('should trim tail', function () {
    masked.value = '123';
    assert.equal(masked.value, '123');

    masked.remove(2);
    assert.equal(masked.value, '12');
  });

  it('should update repeat', function () {
    masked.updateOptions({ repeat: 3 });
    assert.equal(masked.value, '_'.repeat(3));

    masked.updateOptions({ repeat: 1 });
    assert.equal(masked.value, '_');

    masked.updateOptions({ repeat: Infinity });
    assert.equal(masked.value, '');
  });

  it('should consider minimum block count', function () {
    masked.updateOptions({ repeat: [ 3, 5 ] });
    assert.equal(masked.value, '_'.repeat(3));

    masked.value = '1234';
    assert.equal(masked.value, '1234');

    masked.value = '';
    assert.equal(masked.value, '_'.repeat(3));
  });
});

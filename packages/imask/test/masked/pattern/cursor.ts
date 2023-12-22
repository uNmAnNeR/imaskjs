import assert from 'assert';
import { describe, it, beforeEach } from 'node:test';

import MaskedPattern from '../../../src/masked/pattern';
import { DIRECTION } from '../../../src/core/utils';


describe('Align LEFT', function () {
  const masked = new MaskedPattern({
    mask: '',
    lazy: false,
  });

  beforeEach(function () {
    masked.updateOptions({mask: '', lazy: false});
    masked.unmaskedValue = '';
  });

  it('should align after XX', function () {
    ['XX*', 'XX[*]'].forEach(mask => {
      masked.updateOptions({mask});
      masked.value = '';

      assert.equal(masked.nearestInputPos(0), 2);
      assert.equal(masked.nearestInputPos(0, DIRECTION.LEFT), 0);

      assert.equal(masked.nearestInputPos(1), 2);
      assert.equal(masked.nearestInputPos(1, DIRECTION.LEFT), 0);

      assert.equal(masked.nearestInputPos(2), 2);
      assert.equal(masked.nearestInputPos(2, DIRECTION.LEFT), 2);

      assert.equal(masked.nearestInputPos(3, DIRECTION.LEFT), 2);
    });
  });

  it('should align before XX with DIRECTION.LEFT', function () {
    ['XX*', 'XX[*]'].forEach(mask => {
      masked.updateOptions({mask, lazy: true});
      for (let pos=0; pos<masked._blocks.length-1; ++pos) {
        assert.equal(masked.nearestInputPos(pos, DIRECTION.LEFT), 0);
      }
    });
  });

  it('should align before XX', function () {
    ['*XX', '[*]XX'].forEach(mask => {
      masked.updateOptions({mask});
      for (let pos=0; pos<masked._blocks.length-1; ++pos) {
        assert.ok(masked.nearestInputPos(pos) <= 1);
      }
    });
  });

  it('should align before required', function () {
    masked.updateOptions({mask: '[*]XX*'});
    assert.equal(masked.nearestInputPos(masked.value.length, DIRECTION.LEFT), 2);

    masked.updateOptions({mask: '*XX*'});
    assert.equal(masked.nearestInputPos(masked.value.length, DIRECTION.LEFT), 0);
  });

  it('should align after filled', function () {
    masked.updateOptions({mask: '**X*'});
    masked.unmaskedValue = 'a';
    assert.equal(masked.nearestInputPos(1, DIRECTION.LEFT), 1);
    assert.equal(masked.nearestInputPos(masked.value.length, DIRECTION.LEFT), 1);

    masked.unmaskedValue = 'aa';
    assert.equal(masked.nearestInputPos(masked.value.length, DIRECTION.LEFT), 2);
    assert.equal(masked.nearestInputPos(masked.value.length-1, DIRECTION.LEFT), 2);
  });

  it('should align after filled and fixed with lazy', function () {
    masked.updateOptions({
      mask: '0X0',
      lazy: true,
    });

    masked.value = '1X';
    assert.equal(masked.nearestInputPos(masked.value.length, DIRECTION.LEFT), 1);
  });

  it('should align at 0', function () {
    masked.updateOptions({
      mask: 'XX0',
      lazy: true,
    });

    masked.value = 'XX';
    assert.equal(masked.nearestInputPos(1, DIRECTION.LEFT), 0);
  });

  it('should align after filled optional', function () {
    masked.updateOptions({
      mask: '[000]',
    });

    masked.value = '111';
    assert.equal(masked.nearestInputPos(3, DIRECTION.LEFT), 3);
  });
});

describe('Align RIGHT', function () {
  const masked = new MaskedPattern({
    mask: '',
    lazy: false,
  });

  beforeEach(function () {
    masked.updateOptions({mask: '', lazy: false});
    masked.unmaskedValue = '';
  });

  it('should align right inside block', function () {
    masked.updateOptions({
      mask: 'dw',
      lazy: false,
      blocks: {
        d: {mask: '00'},
        w: {mask: 'aa'},
      }
    });
    // set only chars
    masked.unmaskedValue = 'aa';
    assert.equal(masked.nearestInputPos(1, DIRECTION.RIGHT), 2);
  });
});


describe('Align NONE', function () {
  const masked = new MaskedPattern({
    mask: '',
    lazy: false,
  });

  beforeEach(function () {
    masked.updateOptions({mask: '', lazy: false});
    masked.unmaskedValue = '';
  });

  it('should align after filled', function () {
    masked.updateOptions({
      mask: '0.0',
    });

    masked.value = '1.1';
    assert.equal(masked.nearestInputPos(1, DIRECTION.NONE), 1);
  });

  it('should align before input', function () {
    masked.updateOptions({
      mask: '0.0',
    });

    masked.value = '1.';
    assert.equal(masked.nearestInputPos(2, DIRECTION.NONE), 2);
  });

  it('should align before last fixed', function () {
    masked.updateOptions({
      mask: '0.',
    });

    masked.value = '1.';
    assert.equal(masked.nearestInputPos(2, DIRECTION.NONE), 1);
  });
});

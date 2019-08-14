import { assert } from 'chai';

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
      for (var pos=0; pos<masked._blocks.length; ++pos) {
        assert.equal(masked.nearestInputPos(pos), 2);
        assert.equal(masked.nearestInputPos(pos, DIRECTION.LEFT), 2);
      }
    });
  });

  it('should align before XX with DIRECTION.LEFT', function () {
    ['XX*', 'XX[*]'].forEach(mask => {
      masked.updateOptions({mask, lazy: true});
      for (var pos=0; pos<masked._blocks.length-1; ++pos) {
        assert.equal(masked.nearestInputPos(pos, DIRECTION.LEFT), 0);
      }
    });
  });

  it('should align before XX', function () {
    ['*XX', '[*]XX'].forEach(mask => {
      masked.updateOptions({mask});
      for (var pos=0; pos<masked._blocks.length-1; ++pos) {
        assert.isAtMost(masked.nearestInputPos(pos), 1);
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
    assert.equal(masked.nearestInputPos(masked.value.length, DIRECTION.LEFT), 3);
    assert.equal(masked.nearestInputPos(masked.value.length-1, DIRECTION.LEFT), 3);
  });

  it('should align after filled and fixed with lazy', function () {
    masked.updateOptions({
      mask: '0X0',
      lazy: true,
    });

    masked.value = '1X';
    assert.equal(masked.nearestInputPos(masked.value.length, DIRECTION.LEFT), 1);
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

  // TODO

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

import MaskedPattern from '../../../src/masked/pattern';
import {DIRECTION} from '../../../src/core/utils';


describe('Align left', function () {
  const masked = new MaskedPattern({
    mask: '',
    placeholderLazy: false,
  });

  beforeEach(function () {
    masked.updateOptions({mask: ''});
    masked.unmaskedValue = '';
  });

  it('should align after XX', function () {
    ['XX*', 'XX[*]'].forEach(mask => {
      masked.updateOptions({mask});
      for (var pos=0; pos<masked._charDefs.length; ++pos) {
        assert.equal(masked.nearestInputPos(pos), 2);
      }
    });
  });

  it('should align before XX with DIRECTION.LEFT', function () {
    ['XX*', 'XX[*]'].forEach(mask => {
      masked.updateOptions({mask});
      for (var pos=0; pos<masked._charDefs.length-1; ++pos) {
        assert.equal(masked.nearestInputPos(pos, DIRECTION.LEFT), 0);
      }
    });
  });

  it('should align before XX', function () {
    ['*XX', '[*]XX'].forEach(mask => {
      masked.updateOptions({mask});
      for (var pos=0; pos<masked._charDefs.length-1; ++pos) {
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
});

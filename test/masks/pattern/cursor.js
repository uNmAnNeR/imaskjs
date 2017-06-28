import el from '../el-stub';
import IMask from '../../../src/imask';

describe('Align left', function () {
  const mask = new IMask.PatternMask(new el, {
    mask: '',
    placeholder: {
      show: 'always'
    }
  });

  beforeEach(function () {
    mask.mask = '';
    mask.unmaskedValue = '';
  });

  it('should align after XX', function () {
    ['XX*', 'XX[*]'].forEach(pattern => {
      mask.mask = pattern;
      for (var pos=0; pos<mask.defs().length; ++pos) {
        assert.equal(mask._nearestInputPos(pos), 2);
      }
    });
  });

  it('should align before XX', function () {
    ['*XX', '[*]XX'].forEach(pattern => {
      mask.mask = pattern;
      for (var pos=0; pos<mask.defs().length; ++pos) {
        assert.isAtMost(mask._nearestInputPos(pos), 1);
      }
    });
  });

  it('should align before required', function () {
    mask.mask = '[*]XX*';
    assert.equal(mask._nearestInputPos(mask.rawValue.length), 2);

    mask.mask = '*XX*';
    assert.equal(mask._nearestInputPos(mask.rawValue.length), 0);
  });

  it('should align after filled', function () {
    mask.mask = '**X*';
    mask.unmaskedValue = 'a';
    assert.equal(mask._nearestInputPos(1), 1);
    assert.equal(mask._nearestInputPos(mask.rawValue.length), 1);

    mask.unmaskedValue = 'aa';
    assert.equal(mask._nearestInputPos(mask.rawValue.length), 3);
    assert.equal(mask._nearestInputPos(mask.rawValue.length-1), 3);
  });
});

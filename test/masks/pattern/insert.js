import el from '../el-stub';
import IMask from '../../../src/imask';

describe('Insert', function () {
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

  it('should skip empty and consider dot', function () {
    mask.mask = '0{.}0';
    mask.unmaskedValue = '.2';

    assert.equal(mask.rawValue, '_.2');
  });

  it('should skip empty and not consider dot', function () {
    mask.mask = '0.0';
    mask.unmaskedValue = '.2';

    assert.equal(mask.rawValue, '_._');
  });

  it('should not skip empty', function () {
    ['0.0', '0{.}0'].forEach(pattern => {
      mask.mask = pattern;
      mask.rawValue = '.2';
      assert.equal(mask.rawValue, '2._');
    });
  });
});

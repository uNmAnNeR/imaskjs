import el from '../el-stub';
import IMask from '../../../src/imask';

describe('Extract', function () {
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

  // TODO check on bounds

  it('should extract input', function () {
    // TODO
    // mask.mask = '0{.}0';
    // mask.unmaskedValue = '.2';

    // assert.equal(mask.rawValue, '_.2');
  });
});

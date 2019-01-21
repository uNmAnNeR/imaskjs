import { assert } from 'chai';

import MaskedPattern from '../../../src/masked/pattern';


describe('Extract', function () {
  const mask = new MaskedPattern({
    mask: '',
    lazy: false,
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

import { assert } from 'chai';

import { createMask } from '../../src';


describe('Masked Factory', function () {
  describe('#createMask', function () {
    const mask = createMask({ mask: Number });

    const masked = createMask(mask);
    assert.equal(masked, mask);

    masked.mask = createMask({ mask });
    assert.equal(masked, mask);
  });
});

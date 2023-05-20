import assert from 'assert';
import { describe, it } from 'node:test';

import { createMask } from '../../src';
import type Masked from '../../src/masked/base';


describe('Masked Factory', function () {
  describe('#createMask', function () {
    const mask = createMask({ mask: Number });

    const masked = createMask(mask);
    assert.equal(masked, mask);

    (masked as Masked).updateOptions({ mask: createMask({ mask }) });
    assert.equal(masked, mask);
  });
});

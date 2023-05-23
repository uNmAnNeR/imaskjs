import assert from 'assert';
import { describe, it } from 'node:test';

import createMask, { maskedClass, normalizeOpts } from '../../src/masked/factory';
import type Masked from '../../src/masked/base';
import MaskedNumber from '../../src/masked/number';


describe('Masked Factory', function () {
  describe('#maskedClass', function () {
    it('should clone mask from masked', function () {
      const masked = createMask({ mask: Number });

      const constructorClass = maskedClass(Number);
      const instanceClass = maskedClass(masked);
      const classClass = maskedClass(MaskedNumber);

      assert.equal(constructorClass, instanceClass);
      assert.equal(constructorClass, classClass);
    });
  });

  describe('#normalizeOpts', function () {
    it('should return masked clone', function () {
      const masked = createMask({ mask: Number });
      const opts = normalizeOpts(masked);

      assert.equal(opts.mask, masked.constructor);
      assert.notEqual(opts, masked);
    });
  });

  describe('#createMask', function () {
    it('should clone mask from masked', function () {
      const masked = createMask({ mask: Number });
      const cloneMasked = createMask({ mask: masked });

      assert.equal(masked.mask, cloneMasked.mask);
      assert.notEqual(masked, cloneMasked);
    });

    it('should update options from masked', function () {
      const mask = createMask({ mask: Number });

      assert.equal(mask, createMask(mask));
      assert.notEqual(mask, createMask({ mask }));
    });
  });
});

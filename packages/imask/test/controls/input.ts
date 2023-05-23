import assert from 'assert';
import { describe, it, beforeEach } from 'node:test';

import IMask, { InputMask, createMask } from '../../src';
import { MaskedNumberOptions } from '../../src/masked/number';
import MaskElementStub from './mask-element-stub';


describe('InputMask', function () {
  const imask = new InputMask(new MaskElementStub(), {
    mask: '',
  });

  beforeEach(function () {
    imask.mask = '';
    imask.unmaskedValue = '';
  });


  describe('#set mask', function () {
    it('should not set when null', function () {
      const oldMask = imask.mask;
      const oldMasked = imask.masked;

      imask.mask = null;
      assert.equal(imask.mask, oldMask);
      assert.equal(imask.masked, oldMasked);

      imask.mask = undefined;
      assert.equal(imask.mask, oldMask);
      assert.equal(imask.masked, oldMasked);
    });

    it('should not set when equal', function () {
      const oldMasked = imask.masked;

      imask.mask = '';
      assert.equal(imask.masked, oldMasked);
    });

    it('should set new mask', function () {
      [Date, Number, 'string', /regexp/, function () {}, Date, createMask({mask: Number})].forEach(mask => {
        let oldMask = imask.mask;
        let oldMasked = imask.masked;

        imask.mask = mask as any;
        assert.notEqual(imask.mask, oldMask);
        assert.notEqual(imask.masked, oldMasked);

        oldMask = imask.mask;
        oldMasked = imask.masked;

        imask.mask = mask as any;
        if (mask !== Date) assert.equal(imask.mask, oldMask);
        assert.equal(imask.masked, oldMasked);
      });
    });
  });

  describe('#update options', function () {
    it('should update mask and set options', function () {
      const oldMask = imask.mask;
      const oldMasked = imask.masked;
      const opts = {
        mask: Number,
        max: 100
      };

      (imask as unknown as InputMask<MaskedNumberOptions>).updateOptions(opts);
      assert.ok(imask.masked instanceof IMask.MaskedNumber);
      assert.equal(imask.masked.max, opts.max);
    });
  });

  describe('#typed value', function () {
    it('should be typed', function () {
      const nmask = (imask as unknown as InputMask<MaskedNumberOptions>);
      nmask.updateOptions({
        mask: Number,
        max: Infinity,
      });
      const value = 100;
      nmask.typedValue = value;
      assert.strictEqual(nmask.typedValue, value);
      assert.strictEqual(nmask.unmaskedValue, String(value));

      const str = '200';
      nmask.unmaskedValue = str;
      assert.strictEqual(nmask.typedValue, Number(str));
      assert.strictEqual(nmask.unmaskedValue, str);
    });
  });

  describe('#update value when overwrite option is true', function () {
    it('should update mask and set new value', function () {
      const nmask = (imask as unknown as InputMask<MaskedNumberOptions>);
      nmask.updateOptions({
        mask: Number,
        overwrite: true
      });

      const value = '100';
      nmask.value = value;
      assert.strictEqual(nmask.value, value);
    });
  });
});

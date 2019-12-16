import { assert } from 'chai';

import IMask, { InputMask } from '../../src';
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
      [Date, Number, 'string', /regexp/, function () {}, Date].forEach(mask => {
        let oldMask = imask.mask;
        let oldMasked = imask.masked;

        imask.mask = mask;
        assert.notEqual(imask.mask, oldMask);
        assert.notEqual(imask.masked, oldMasked);


        oldMask = imask.mask;
        oldMasked = imask.masked;

        imask.mask = mask;
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

      imask.updateOptions(opts);
      assert.instanceOf(imask.masked, IMask.MaskedNumber, 'masked is MaskedNumber');
      assert.equal(imask.masked.max, opts.max);
    });
  });

  describe('#typed value', function () {
    it('should be typed', function () {
      imask.updateOptions({
        mask: Number
      });
      const value = 100;
      imask.typedValue = value;
      assert.strictEqual(imask.typedValue, value);
      assert.strictEqual(imask.unmaskedValue, String(value));

      const str = '200';
      imask.unmaskedValue = str;
      assert.strictEqual(imask.typedValue, Number(str));
      assert.strictEqual(imask.unmaskedValue, str);
    });
  });

  describe('#update value when overwrite option is true', function () {
    it('should update mask and set new value', function () {
      imask.updateOptions({
        mask: Number,
        overwrite: true
      });

      const value = "100";
      imask.value = value;
      assert.strictEqual(imask.value, value);
    });
  });
});

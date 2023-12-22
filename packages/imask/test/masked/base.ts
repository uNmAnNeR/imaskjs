import assert from 'assert';
import { describe, it } from 'node:test';

import MaskedPattern from '../../src/masked/pattern';
import MaskedDate from '../../src/masked/date';
import MaskedNumber from '../../src/masked/number';
import { DIRECTION } from '../../src/core/utils';
import { MaskedRange } from '../../src';


describe('Masked', function () {
  describe('#eager is true', function () {
    const masked = new MaskedPattern({
      eager: true,
      mask: '0.0',
    });

    masked.append('1', { input: true });
    assert.equal(masked.value, '1.');

    masked.splice(1, 1, '', DIRECTION.LEFT);
    assert.equal(masked.value, '');

    masked.append('12', { input: true });
    assert.equal(masked.value, '1.2');

    masked.splice(1, 1, '', DIRECTION.RIGHT);
    assert.equal(masked.value, '1.');
  });

  describe('#eager with fixed', function () {
    const masked = new MaskedPattern({
      eager: true,
      lazy: true,
      mask: '{12}-0',
    });

    assert.equal(masked.value, '');
    masked.append('1', { input: true, raw: true });
    assert.equal(masked.value, '12-1');

    masked.updateOptions({ eager: false });
    masked.value = '';
    masked.append('1', { input: true });
    assert.equal(masked.value, '1');

    masked.updateOptions({ mask: '0-12-0', eager: true });
    masked.value = '';
    masked.append('11', { input: true, raw: true });
    assert.equal(masked.value, '1-12-1');

    masked.splice(5, 1, '', DIRECTION.FORCE_LEFT);
    assert.equal(masked.value, '1');
  });

  describe('#eager is false', function () {
    const masked = new MaskedPattern({
      mask: '0.0',
    });

    masked.append('1', { input: true });
    assert.equal(masked.value, '1');

    masked.splice(0, 1, '', DIRECTION.LEFT);
    assert.equal(masked.value, '');

    masked.append('12', { input: true });
    assert.equal(masked.value, '1.2');

    masked.splice(1, 1, '', DIRECTION.RIGHT);
    assert.equal(masked.value, '1.2');
  });

  describe('#eager is "append"', function () {
    const masked = new MaskedPattern({
      eager: 'append',
      mask: '0.0',
    });

    masked.append('1', { input: true });
    assert.equal(masked.value, '1.');

    masked.splice(1, 1, '', DIRECTION.LEFT);
    assert.equal(masked.value, '1');
  });

  describe('#eager is "remove"', function () {
    const masked = new MaskedPattern({
      eager: 'remove',
      mask: '0.0',
    });

    masked.append('1', { input: true });
    assert.equal(masked.value, '1');

    masked.append('2', { input: true });
    assert.equal(masked.value, '1.2');

    masked.splice(2, 1, '', DIRECTION.LEFT);
    assert.equal(masked.value, '1');
  });

  describe('#typedValueEquals', function () {
    it('should be true', function () {
      const masked = new MaskedDate();

      assert(masked.typedValueEquals(''));
      assert(masked.typedValueEquals(undefined));
      assert(masked.typedValueEquals(null));

      const d = new Date();
      masked.typedValue = d;
      assert(masked.typedValueEquals(new Date(d)));
    });

    it('should be false', function () {
      const masked = new MaskedNumber();

      assert(masked.typedValueEquals(''));
      assert(!masked.typedValueEquals(0));

      masked.value = '0';
      assert(masked.typedValueEquals(0));
    });
  });

  describe('#overwrite', function () {
    it('should work with tail shift', function () {
      const masked = new MaskedPattern({
        mask: '$num{.}cents',
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: ',',
            scale: 0,
          },
          cents: {
            mask: '`0`0',
            min: 0,
          }
        },
        overwrite: true,
      });

      masked.value = '123.45';
      assert.strictEqual(masked.value, '$123.45');

      masked.splice(4, 0, '0', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.value, '$1,230.45');
    });

    it('should work with autofix', function () {
      const masked = new MaskedRange({
        from: 1,
        to: 31,
        autofix: 'pad',
        overwrite: true,
      });

      masked.value = '12';
      assert.strictEqual(masked.value, '12');

      masked.splice(0, 0, '3', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.value, '31');

      masked.splice(0, 0, '4', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.value, '04');
    });
  });

  describe('#splice', function () {
    const masked = new MaskedPattern({
      mask: '+{7}(000)000-00-00',
    });

    it('should start insert from selection', function () {
      const v = '+7(111)222-33-44'
      masked.value = v;
      assert.strictEqual(masked.value, v);

      masked.splice(0, masked.value.length, v, DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.value, v);
    });

    it('should start insert from selection', function () {
      const v = '+7(111)222-33-44'
      masked.value = v;
      assert.strictEqual(masked.value, v);

      masked.splice(0, masked.value.length, v, DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.value, v);
    });
  });

  describe('#skipInvalid', function () {
    it('should skip invalid', function () {
      const masked = new MaskedPattern({ mask: '0000' });

      masked.value = '0a1.2 3';
      assert.strictEqual(masked.value, '0123');
    });

    it('should not skip invalid', function () {
      const masked = new MaskedPattern({ mask: '0000', skipInvalid: false });

      masked.value = '0a1.2 3';
      assert.strictEqual(masked.value, '0');
    });
  });

  describe('#withValueRefresh', function () {
    it('should commit after adding tail', function () {
      const masked = new MaskedNumber({ scale: 2, normalizeZeros: false, padFractionalZeros: true });

      masked.unmaskedValue = '11.00';
      assert.strictEqual(masked.value, '11,00');

      masked.updateOptions({ normalizeZeros: true, padFractionalZeros: false });
      assert.strictEqual(masked.value, '11');
    });
  });
});

import assert from 'assert';
import { describe, it, beforeEach } from 'node:test';

import MaskedNumber from '../../src/masked/number';
import { DIRECTION } from '../../src/core/utils';


describe('MaskedNumber', function () {
  const masked = new MaskedNumber();

  beforeEach(function () {
    masked.updateOptions({
      thousandsSeparator: '',
      radix: ',',
      scale: 2,
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
    });
    masked.unmaskedValue = '';
  });

  describe('#_normalizeZeros', function () {
    assert.equal(masked._normalizeZeros(''), '');
    assert.equal(masked._normalizeZeros('000'), '0');
    assert.equal(masked._normalizeZeros('0,'), '0');
    assert.equal(masked._normalizeZeros('000,01'), '0,01');
    assert.equal(masked._normalizeZeros('-000,01'), '-0,01');
    assert.equal(masked._normalizeZeros('000,00'), '0');
    assert.equal(masked._normalizeZeros(',00'), '0');
    assert.equal(masked._normalizeZeros('100,00'), '100');
    assert.equal(masked._normalizeZeros('000,010'), '0,01');
    assert.equal(masked._normalizeZeros('-000,0100'), '-0,01');
  });

  describe('#_padFractionalZeros', function () {
    assert.equal(masked._padFractionalZeros(''), '');
    assert.equal(masked._padFractionalZeros('0'), '0,00');
    assert.equal(masked._padFractionalZeros(',0'), ',00');
    assert.equal(masked._padFractionalZeros('0,0'), '0,00');
  });

  describe('#unmaskedValue', function () {
    masked.updateOptions({
      thousandsSeparator: ' ',
      normalizeZeros: false
    });

    masked.value = '1000,02';
    assert.equal(masked.unmaskedValue, '1000.02');

    masked.unmaskedValue = '9999.88';
    assert.equal(masked.value, '9 999,88');
  });

  describe('#typedValue', function () {
    masked.updateOptions({
      thousandsSeparator: ' '
    });

    masked.typedValue = 1000;
    assert.strictEqual(masked.unmaskedValue, '1000');
    assert.strictEqual(masked.value, '1 000');
    assert.strictEqual(masked.typedValue, 1000);

    masked.unmaskedValue = '9999.88';
    assert.equal(typeof masked.typedValue, 'number');
    assert.strictEqual(masked.typedValue, 9999.88);
  });

  describe('#mapToRadix', function () {
    masked.updateOptions({
      scale: 2,
      thousandsSeparator: '.',
      padFractionalZeros: true,
      radix: ',',
      mapToRadix: ['.'],
    });

    it('should map for raw input', function () {
      masked.value = '';
      masked.splice(0, 0, '12345.67', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.unmaskedValue, '12345.67');
      assert.strictEqual(masked.value, '12345,67');
    });

    it('should NOT map for setting value', function () {
      masked.value = '12.345,67';
      assert.strictEqual(masked.unmaskedValue, '12345.67');
      assert.strictEqual(masked.value, '12345,67');
    });
  });

  it('should format exponentials numbers correctly', function () {
    masked.updateOptions({
      thousandsSeparator: '',
      radix: ',',
      padFractionalZeros: false,
      scale: 10,
    });
    masked.typedValue = 0.0000001;
    assert.strictEqual(masked.unmaskedValue, '0.0000001');
    assert.strictEqual(masked.value, '0,0000001');
  });

  it('should drop fractional part if scale is 0', function () {
    masked.updateOptions({
      thousandsSeparator: '',
      radix: ',',
      padFractionalZeros: false,
      scale: 2,
    });
    masked.typedValue = 99.99;
    assert.strictEqual(masked.value, '99,99');

    masked.updateOptions({ scale: 0 });
    assert.strictEqual(masked.value, '99');
  });

  describe('#autofix', function () {
    const max = 200;
    const min = -10;
    
    beforeEach(function () {
      masked.updateOptions({
        autofix: true,
        max,
        min,
      });
      masked.unmaskedValue = '100';
    });

    it('should round to max on input at the end', function () {
      masked.splice(3, 0, '1', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.typedValue, max);
    });

    it('should round to max on input at the beginning', function () {
      masked.splice(0, 0, '1', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.typedValue, max);
    });

    it('should round to max on input in the middle', function () {
      masked.splice(1, 0, '1', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.typedValue, max);
    });

    it('should round to min on input sign at the beginning', function () {
      masked.splice(0, 0, '-', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.typedValue, min);
    });
  });
});

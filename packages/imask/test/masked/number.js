import { assert } from 'chai';

import MaskedNumber from '../../src/masked/number';


describe('MaskedNumber', function () {
  const masked = new MaskedNumber();

  beforeEach(function () {
    masked.updateOptions({
      thousandsSeparator: '',
      radix: ',',
      scale: 2,
    });
    masked.unmaskedValue = '';
  });

  describe('#_normalizeZeros', function () {
    assert.isEmpty(masked._normalizeZeros(''));
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
    assert.isEmpty(masked._padFractionalZeros(''));
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
    assert.isNumber(masked.typedValue);
    assert.strictEqual(masked.typedValue, 9999.88);
  });
});

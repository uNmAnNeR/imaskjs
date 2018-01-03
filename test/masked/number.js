import MaskedNumber from '../../src/masked/number';


describe('MaskedNumber', function () {
  const masked = new MaskedNumber();

  beforeEach(function () {
    // masked.updateOptions({mask: ''});
    masked.unmaskedValue = '';
  });

  describe('#_normalizeZeros', function () {
    beforeEach(function () {
      masked.updateOptions({
        radix: ','
      });
    });

    it('should keep empty', function () {
      assert.isEmpty(masked._normalizeZeros(''));
    });

    it('should remove leading zeros', function () {
      assert.equal(masked._normalizeZeros('000'), '0');
      assert.equal(masked._normalizeZeros('0,'), '0');
      assert.equal(masked._normalizeZeros('000,01'), '0,01');
      assert.equal(masked._normalizeZeros('-000,01'), '-0,01');
    });

    it('should remove trailing zeros', function () {
      assert.equal(masked._normalizeZeros('000,00'), '0');
      assert.equal(masked._normalizeZeros(',00'), '0');
      assert.equal(masked._normalizeZeros('100,00'), '100');
      assert.equal(masked._normalizeZeros('000,010'), '0,01');
      assert.equal(masked._normalizeZeros('-000,0100'), '-0,01');
    });
  });

  describe('#_padFractionalZeros', function () {
    beforeEach(function () {
      masked.updateOptions({
        radix: ',',
        scale: 2
      });
    });

    it('should keep empty', function () {
      assert.isEmpty(masked._padFractionalZeros(''));
    });

    it('should add trailing zeros', function () {
      assert.equal(masked._padFractionalZeros('0'), '0,00');
      assert.equal(masked._padFractionalZeros('0,0'), '0,00');
    });
  });
});

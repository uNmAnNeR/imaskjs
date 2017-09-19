import MaskedPattern from '../../../src/masked/pattern';


describe('Align left', function () {
  const mask = new MaskedPattern({
    mask: '',
    placeholder: {lazy: false}
  });

  beforeEach(function () {
    mask.mask = '';
    mask.unmaskedValue = '';
  });

  it('should align after XX', function () {
    ['XX*', 'XX[*]'].forEach(pattern => {
      mask.mask = pattern;
      for (var pos=0; pos<mask._charDefs.length; ++pos) {
        assert.equal(mask.nearestInputPos(pos), 2);
      }
    });
  });

  it('should align before XX', function () {
    ['*XX', '[*]XX'].forEach(pattern => {
      mask.mask = pattern;
      for (var pos=0; pos<mask._charDefs.length; ++pos) {
        assert.isAtMost(mask.nearestInputPos(pos), 1);
      }
    });
  });

  it('should align before required', function () {
    mask.mask = '[*]XX*';
    assert.equal(mask.nearestInputPos(mask.value.length), 2);

    mask.mask = '*XX*';
    assert.equal(mask.nearestInputPos(mask.value.length), 0);
  });

  it('should align after filled', function () {
    mask.mask = '**X*';
    mask.unmaskedValue = 'a';
    assert.equal(mask.nearestInputPos(1), 1);
    assert.equal(mask.nearestInputPos(mask.value.length), 1);

    mask.unmaskedValue = 'aa';
    assert.equal(mask.nearestInputPos(mask.value.length), 3);
    assert.equal(mask.nearestInputPos(mask.value.length-1), 3);
  });
});

import { assert } from 'chai';

import MaskedRange from '../../src/masked/range';


describe('MaskedRange', function () {
  const masked = new MaskedRange();

  beforeEach(function () {
    masked.updateOptions({
      maxLength: 0,
      from: 1,
      to: 100,
      autofix: false,
    });
    masked.unmaskedValue = '';
  });

  describe('autofix: pad', function () {
    masked.updateOptions({
      maxLength: 3,
      from: 0,
      to: 5,
      autofix: 'pad',
    });

    masked.append('0', {input: true});
    assert.equal(masked.value, '0');

    masked.append('8', {input: true});
    assert.equal(masked.value, '005');

    masked.unmaskedValue = '';
    masked.append('2', {input: true});
    assert.equal(masked.value, '002');
  });
});

import assert from 'assert';
import { describe, it } from 'node:test';

import MaskedRegExp from '../../src/masked/regexp';


describe('MaskedRegExp', function () {
  it('should match', function () {
    const masked = new MaskedRegExp({ mask: /^[1-6]\d{0,5}$/ });

    masked.value = '600000';
    assert.equal(masked.value, '600000');
  });

  it('should partially match', function () {
    const masked = new MaskedRegExp({
      mask: /^[1-6]\d{5}$/
    });

    masked.value = '600000';
    assert.equal(masked.value, '');

    masked.updateOptions({ partialize: true });
    masked.value = '600000';
    assert.equal(masked.value, '600000');
  });
});

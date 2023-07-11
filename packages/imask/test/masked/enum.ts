import assert from 'assert';
import { describe, it } from 'node:test';

import MaskedEnum from '../../src/masked/enum';


describe('MaskedEnum', function () {
  it('should work with different length', function () {
    const _enum = ['a', 'bc', 'def'];
    const masked = new MaskedEnum({ enum: _enum });

    _enum.forEach(e => {
      masked.value = e;
      assert.equal(masked.value, e);
    });
  });

  it('should set required and optional chars', function () {
    const masked = new MaskedEnum({ enum: ['a', 'bc', 'def'], lazy: false });
    masked.value = '';

    assert.equal(masked.value, '_');
  });

  it('should update options', function () {
    const masked = new MaskedEnum({ enum: ['A', 'B'] });

    masked.value = 'A';
    assert.equal(masked.value, 'A');

    masked.updateOptions({ enum: ['C', 'D'] });
    assert.equal(masked.value, '');

    masked.value = 'C';
    assert.equal(masked.value, 'C');
  });
});

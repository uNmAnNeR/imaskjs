import { assert } from 'chai';

import MaskedPattern from '../../src/masked/pattern';
import { DIRECTION } from '../../src/core/utils';


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
    masked.append('1', { input: true });
    assert.equal(masked.value, '12-1');

    masked.updateOptions({ eager: false });
    masked.value = '';
    masked.append('1', { input: true });
    assert.equal(masked.value, '1');

    masked.updateOptions({ mask: '0-12-0', eager: true });
    masked.value = '';
    masked.append('11', { input: true });
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
});

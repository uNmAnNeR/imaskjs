import assert from 'assert';
import { beforeEach, describe, it } from 'node:test';

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

  it('should update options', function () {
    masked.updateOptions({
      from: 0,
      to: 15,
      maxLength: 0,
      autofix: false,
    });
    masked.unmaskedValue = '';
    masked.append('6', { input: true });
    assert.equal(masked.value, '');

    masked.updateOptions({
      autofix: 'pad',
    });
    masked.unmaskedValue = '';
    masked.append('6', { input: true });
    assert.equal(masked.value, '06');
  });

  it('should pad value', function () {
    masked.updateOptions({
      from: 0,
      to: 100,
      maxLength: 0,
      autofix: 'pad',
    });

    masked.value = '';
    masked.pad();
    assert.equal(masked.value, '000');

    masked.value = '2';
    masked.pad();
    assert.equal(masked.value, '002');

    masked.value = '02';
    masked.pad();
    assert.equal(masked.value, '002');
  });

  it('should not pad value on tail', function () {
    masked.updateOptions({
      from: 0,
      to: 20,
      maxLength: 0,
      autofix: 'pad',
    });

    masked.value = '';
    masked.appendTail('3');
    assert.equal(masked.value, '2');
  });
});

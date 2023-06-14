import assert from 'assert';
import { describe } from 'node:test';

import '../../src';
import createMask from '../../src/masked/factory';
import { pipe, PIPE_TYPE } from '../../src/masked/pipe';


describe('Pipe', function () {
  const mask = {
    mask: Number,
    thousandsSeparator: ' ',
    padFractionalZeros: true,
  };

  describe('pipe', function () {
    assert.strictEqual(pipe('1,01', mask), '1,01');
    assert.strictEqual(pipe('1,01', mask, PIPE_TYPE.MASKED, PIPE_TYPE.MASKED), '1,01');
    assert.strictEqual(pipe('1,01', mask, PIPE_TYPE.MASKED, PIPE_TYPE.UNMASKED), '1.01');
    assert.strictEqual(pipe('1,01', mask, PIPE_TYPE.MASKED, PIPE_TYPE.TYPED), 1.01);

    assert.strictEqual(pipe('1.01', mask, PIPE_TYPE.UNMASKED), '1,01');
    assert.strictEqual(pipe('1.01', mask, PIPE_TYPE.UNMASKED, PIPE_TYPE.UNMASKED), '1.01');
    assert.strictEqual(pipe('1.01', mask, PIPE_TYPE.UNMASKED, PIPE_TYPE.TYPED), 1.01);

    assert.strictEqual(pipe(1.01, mask, PIPE_TYPE.TYPED), '1,01');
    assert.strictEqual(pipe(1.01, mask, PIPE_TYPE.TYPED, PIPE_TYPE.UNMASKED), '1.01');
    assert.strictEqual(pipe(1.01, mask, PIPE_TYPE.TYPED, PIPE_TYPE.TYPED), 1.01);
  });

  describe('keep masked value', function () {
    const masked = createMask(mask);
    masked.value = '123';

    assert.strictEqual(pipe('789', masked), '789,00');
    assert.strictEqual(masked.value, '123,00');
  });
});

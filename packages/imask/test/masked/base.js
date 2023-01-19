import { assert } from 'chai';

import MaskedPattern from '../../src/masked/pattern';
import MaskedDate from '../../src/masked/date';
import MaskedNumber from '../../src/masked/number';
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
    masked.append('1', { input: true, raw: true });
    assert.equal(masked.value, '12-1');

    masked.updateOptions({ eager: false });
    masked.value = '';
    masked.append('1', { input: true });
    assert.equal(masked.value, '1');

    masked.updateOptions({ mask: '0-12-0', eager: true });
    masked.value = '';
    masked.append('11', { input: true, raw: true });
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

  describe('#typedValueEquals', function () {
    it('should be true', function () {
      let masked = new MaskedDate();

      assert(masked.typedValueEquals(''));
      assert(masked.typedValueEquals(undefined));
      assert(masked.typedValueEquals(null));

      const d = new Date();
      masked.typedValue = d;
      assert(masked.typedValueEquals(new Date(d)));
    });

    it('should be false', function () {
      let masked = new MaskedNumber();

      assert(masked.typedValueEquals(''));
      console.log(masked.typedValue === 0);
      assert(!masked.typedValueEquals(0));

      masked.value = '0';
      assert(masked.typedValueEquals(0));
    });
  });

  describe('#overwrite', function () {
    it('should work with tail shift', function () {
      let masked = new MaskedPattern({
        mask: '$num{.}cents',
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: ',',
            scale: 0,
          },
          cents: {
            mask: '`0`0',
            signed: false,
          }
        },
        overwrite: true,
      });

      masked.value = '123.45';
      assert.strictEqual(masked.value, '$123.45');

      masked.splice(4, 0, '0', DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.value, '$1,230.45');
    });
  });

  describe('#splice', function () {
    let masked = new MaskedPattern({
      mask: '+{7}(000)000-00-00',
    });

    it('should start insert from selection', function () {
      const v = '+7(111)222-33-44'
      masked.value = v;
      assert.strictEqual(masked.value, v);

      masked.splice(0, masked.value.length, v, DIRECTION.NONE, { input: true, raw: true });
      assert.strictEqual(masked.value, v);
    });
  });
});

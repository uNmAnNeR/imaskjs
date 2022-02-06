import { assert } from 'chai';

import MaskedDynamic from '../../src/masked/dynamic';


describe('MaskedDynamic', function () {
  const masked = new MaskedDynamic();

  beforeEach(function () {
    masked.updateOptions({ mask: [] });
    masked.unmaskedValue = '';
  });

  describe('dispatch pattern with fixed at end', function () {
    masked.updateOptions({
      mask: [
        {
          mask: '',
        },
        {
          mask: 'number $',
          lazy: false,
          blocks: {
            number: {
              mask: Number,
              thousandsSeparator: ',',
              radix: '.'
            }
          }
        },
      ],
    });
    masked.unmaskedValue = '1';
    assert.equal(masked.value, '1 $');

    masked.unmaskedValue = '';
    assert.equal(masked.value, '');
  });

  describe('handle eager option', function () {
    masked.updateOptions({
      mask: [
        {
          mask: '0"',
          eager: true,
        },
        {
          mask: '0[0]"',
          eager: true,
        },
      ],
    });
    masked.value = '1';
    assert.equal(masked.value, '1"');

    masked.value = '12';
    assert.equal(masked.value, '12"');
  });
});

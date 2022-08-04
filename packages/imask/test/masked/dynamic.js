import { assert } from 'chai';

import MaskedDynamic from '../../src/masked/dynamic';


describe('MaskedDynamic', function () {
  const masked = new MaskedDynamic();

  beforeEach(function () {
    masked.updateOptions({ mask: [] });
    masked.unmaskedValue = '';
  });

  it('should dispatch pattern with fixed at end', function () {
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

  it('should handle eager option', function () {
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

  it('should handle flags correctly', function () {
    masked.updateOptions({
      mask: [
        {
          mask: '+00 {21} 0 000 0000',
          startsWith: '30',
          lazy: false,
          country: 'Greece'
        },
        {
          mask: '+0 000 000-00-00',
          startsWith: '7',
          lazy: false,
          country: 'Russia'
        },
        {
          mask: '0000000000000',
          startsWith: '',
          country: 'unknown'
        }
      ],
      dispatch: function (appended, dynamicMasked) {
        var number = (dynamicMasked.value + appended).replace(/\D/g,'');

        return dynamicMasked.compiledMasks.find(function (m) {
          return number.indexOf(m.startsWith) === 0;
        });
      }
    });
    masked.value = '70001234567';
    assert.equal(masked.currentMask.country, 'Russia');

    masked.splice(7, 1, '9');
    assert.equal(masked.unmaskedValue, '70009234567');
    assert.equal(masked.currentMask.country, 'Russia');
  });
});

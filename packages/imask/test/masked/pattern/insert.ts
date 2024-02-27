import assert from 'assert';
import { describe, it, beforeEach, mock } from 'node:test';

import { DIRECTION } from '../../../src/core/utils';
import '../../../src/masked/number';
import '../../../src/masked/repeat';
import type MaskedNumber from '../../../src/masked/number';
import MaskedRange from '../../../src/masked/range';
import MaskedPattern from '../../../src/masked/pattern';


describe('Insert', function () {
  const masked = new MaskedPattern({
    mask: '',
    lazy: false,
  });

  beforeEach(function () {
    masked.updateOptions({ mask: '', lazy: false, eager: false });
    masked.unmaskedValue = '';
  });

  it('should skip empty and consider dot', function () {
    masked.updateOptions({mask: '0{.}0'});
    masked.unmaskedValue = '.2';

    assert.equal(masked.value, '_.2');
  });

  it('should skip empty and not consider dot', function () {
    masked.updateOptions({mask: '0.0'});
    masked.unmaskedValue = '.2';

    assert.equal(masked.value, '_._');
  });

  it('should skip in lazy mode', function () {
    ['0.0', '0{.}0'].forEach(mask => {
      masked.updateOptions({mask, lazy: true});
      masked.unmaskedValue = '.2';
      assert.equal(masked.value, '2');
      masked.value = '.2';
      assert.equal(masked.value, '2');
    });
  });

  it('should not skip empty', function () {
    ['0.0', '0{.}0'].forEach(mask => {
      masked.updateOptions({mask});
      masked.value = '.2';
      assert.equal(masked.value, '2._');
    });
  });

  it('should consider equal fixed and skip not equal fixed', function () {
    masked.updateOptions({mask: '+{7}(000)000-00-00'});
    masked.value = '+79998887766';
    assert.equal(masked.unmaskedValue, '79998887766');
  });

  it('should prepare value before insert', function () {
    const prepareStub = mock.fn(v => v);
    masked.updateOptions({
      mask: '+{7}(000)000-00-00',
      prepareChar: prepareStub
    });
    const v = '+79998887766';
    masked.value = v;
    assert.equal(prepareStub.mock.callCount(), v.length);
  });

  it('should insert value in the middle', function () {
    masked.updateOptions({
      mask: '000',
    });
    masked.splice(1, 0, '1', DIRECTION.NONE);
    assert.equal(masked.value, '_1_');
  });

  it('should not skip blocks', function () {
    masked.updateOptions({
      mask: 'dw',
      lazy: true,
      blocks: {
        d: {
          mask: '00',
        },
        w: {
          mask: 'aa',
        },
      }
    });
    // should not jump over numbers
    masked.value = 'a';
    assert.equal(masked.value, '');
  });

  describe('RAW', function () {
    it('should set insert flag on fixed', function () {
      masked.updateOptions({mask: '+120'});
      masked.rawInputValue = '123';
      assert.equal(masked.rawInputValue, '123');

      masked.updateOptions({mask: '{+12}0'});
      masked.rawInputValue = '123';
      assert.equal(masked.rawInputValue, '123');
    });

    it('should keep trailing fixed on update options', function () {
      masked.updateOptions({mask: '0+'});
      masked.unmaskedValue = '11';
      assert.equal(masked.value, '1+');

      masked.updateOptions({ lazy: true });
      assert.equal(masked.value, '1+');
    });
  });

  describe('overwrite flag', function () {
    it('should shift value', function () {
      masked.updateOptions({ mask: '000', overwrite: 'shift' });
      masked.value = '123';
      assert.equal(masked.value, '123');

      masked.splice(0, 0, '0', DIRECTION.NONE);
      assert.equal(masked.value, '012');
    });

    it('should not shift if accepted', function () {
      masked.updateOptions({ mask: '00[aa]00', overwrite: 'shift' });
      masked.value = '1234';
      assert.equal(masked.value, '1234');

      masked.splice(2, 0, 'ab', DIRECTION.NONE);
      assert.equal(masked.value, '12ab34');
    });
  });

  describe('eager flag', function () {
    it('should correctly update value', function () {
      masked.updateOptions({
        mask: "+{3} 000",
        lazy: false,
        eager: true,
      });
      masked.value = masked.value;
      assert.equal(masked.value, '+3 ___');
    });
  });

  it('should set nested unmasked value', function () {
    masked.updateOptions({
      mask: '€ num',
      lazy: false,
      blocks: {
        num: {
          mask: Number,
          thousandsSeparator: ' ',
          radix: ',',
          mapToRadix: ['.'],
        },
      },
    });
    masked.unmaskedValue = '123.45';
    assert.equal(masked.value, '€ 123,45');

    (masked.maskedBlock('num') as MaskedNumber).updateOptions({ thousandsSeparator: '.' });
    assert.equal(masked.value, '€ 123,45');

    masked.unmaskedValue = '123.45';
    assert.equal(masked.value, '€ 123,45');
  });

  describe('secure text entry', function () {
    it('should hide value', function () {
      masked.updateOptions({
        mask: 'XXX-XX-0000',
        definitions: {
          X: {
            mask: '0',
            displayChar: 'X',
            placeholderChar: '#',
          },
        },
      });
      masked.unmaskedValue = '123456789';

      assert.equal(masked.value, '123-45-6789');
      assert.equal(masked.displayValue, 'XXX-XX-6789');
    });
  });

  describe('definitions', function () {
    it('should work', function () {
      masked.updateOptions({
        mask: '#00000',
        definitions: {
          '#': /[1-6]/,
        },
      });
      masked.unmaskedValue = '123456';

      assert.equal(masked.unmaskedValue, '123456');
      assert.equal(masked.value, '123456');
    });
  });

  describe('expose', function () {
    it('should expose number', function () {
      masked.updateOptions({
        mask: '$num',
        blocks: {
          num: {
            mask: Number,
            expose: true,
          },
        },
      });

      masked.value = '123';
      assert.equal(masked.value, '123');
      assert.equal(masked.displayValue, '$123');
      assert.equal(masked.typedValue, 123);

      (masked as unknown as MaskedPattern<number>).typedValue = 456;
      assert.equal(masked.typedValue, 456);
      assert.equal(masked.displayValue, '$456');

      masked.unmaskedValue = '789';
      assert.equal(masked.unmaskedValue, '789');
      assert.equal(masked.displayValue, '$789');
    });

    it('should correctly handle tail', function () {
      masked.updateOptions({
        mask: '$num aa',
        blocks: {
          num: {
            mask: Number,
            expose: true,
          },
        },
      });

      masked.resolve('123 aa');
      assert.equal(masked.value, '123');
      assert.equal(masked.displayValue, '$123 aa');

      masked.value = '321';
      assert.equal(masked.displayValue, '$321 aa');
    })
  });

  describe('blocks', function () {
    it('should shift char to another block', function () {
      masked.updateOptions({
        mask: 'num-num',
        blocks: {
          num: {
            mask: MaskedRange,
            from: 0,
            to: 9,
            autofix: true,
          },
        },
        lazy: false,
        overwrite: false,
      });

      masked.rawInputValue = '55';
      assert.equal(masked.value, '5-5');
    });

    it('should not skip char for incomplete range block', function () {
      masked.updateOptions({
        mask: 'num-num',
        blocks: {
          num: {
            mask: MaskedRange,
            from: 0,
            to: 10,
          },
        },
        lazy: true,
        overwrite: false,
      });

      masked.rawInputValue = 'aaaa';
      assert.equal(masked.value, '');
    });
  });

  describe('repeat', function () {
    it('should insert if possible and skip otherwise', function () {
      masked.updateOptions({
        mask: 'r0',
        blocks: {
          r: {
            mask: 'a',
            repeat: Infinity,
          },
        },
      });

      masked.value = 'aaaa';
      assert.equal(masked.value, 'aaaa_');

      masked.value = '0';
      assert.equal(masked.value, '0');

      masked.value = 'aa0';
      assert.equal(masked.value, 'aa0');
    });
  });

  describe('autofix: pad', function () {
    it('should pad', function () {
      masked.updateOptions({
        mask: 'Na',
        blocks: {
          N: {
            mask: MaskedRange,
            from: 0,
            to: 10,
          },
        },
        autofix: 'pad',
      });

      masked.value = '1';
      assert.equal(masked.value, '1__');

      masked.splice(1, 0, 'a');
      assert.equal(masked.value, '01a');
    });

    it('should not pad on tail', function () {
      masked.updateOptions({
        mask: 'HH:MM',
        blocks: {
          HH: {
            mask: MaskedRange,
            from: 0,
            to: 23,
            maxLength: 2,
          },
          MM: {
            mask: MaskedRange,
            from: 0,
            to: 59,
            maxLength: 2,
          },
        },
        autofix: 'pad',
        lazy: false,
      });

      masked.value = '13:34';
      assert.equal(masked.value, '13:34');

      masked.splice(0, 1);
      assert.equal(masked.value, '23:4_');
    });
  });
});

import { assert } from 'chai';
import sinon from 'sinon';

import MaskedPattern from '../../../src/masked/pattern';
import { DIRECTION } from '../../../src/core/utils.js';


describe('Insert', function () {
  const masked = new MaskedPattern({
    mask: '',
    lazy: false,
  });

  beforeEach(function () {
    masked.updateOptions({mask: '', lazy: false});
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

  it('should not set masked value as actual value when unmask is typed', function () {
    masked.updateOptions({mask: '0000-00-0000', unmask: 'typed'});
    masked.value = '1234121234';

    assert.equal(masked.value, '1234-12-1234');
    assert.equal(masked.unmaskedValue, '1234121234');
    assert.equal(masked.unmaskedValue, masked.typedValue);
  });

  it('should prepare value before insert', function () {
    const prepareStub = sinon.stub().returnsArg(0);
    masked.updateOptions({
      mask: '+{7}(000)000-00-00',
      prepare: prepareStub
    });
    masked.value = '+79998887766';
    assert(prepareStub.called);
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
  })
});

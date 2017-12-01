import MaskedPattern from '../../../src/masked/pattern';


describe('Insert', function () {
  const masked = new MaskedPattern({
    mask: '',
    placeholderLazy: false,
  });

  beforeEach(function () {
    masked.updateOptions({mask: ''});
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
    const prepareStub = sinon.stub().returnsArg(0);
    masked.updateOptions({
      mask: '+{7}(000)000-00-00',
      prepare: prepareStub
    });
    masked.value = '+79998887766';
    assert(prepareStub.called);
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
  });
});

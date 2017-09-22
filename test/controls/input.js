import IMask from '../../src/imask';
import InputMask from '../../src/controls/input';
import Element from '../masked/el-stub';


describe('InputMask', function () {
  const imask = new InputMask(new Element(), {
    mask: '',
  });

  beforeEach(function () {
    window.IMask = IMask;
    imask.mask = '';
    imask.unmaskedValue = '';
  });


  describe('#set mask', function () {
    it('should not set when null', function () {
      const oldMask = imask.mask;
      const oldMasked = imask.masked;

      imask.mask = null;
      assert.equal(imask.mask, oldMask);
      assert.equal(imask.masked, oldMasked);

      imask.mask = undefined;
      assert.equal(imask.mask, oldMask);
      assert.equal(imask.masked, oldMasked);
    });

    it('should not set when equal', function () {
      const oldMasked = imask.masked;

      imask.mask = '';
      assert.equal(imask.masked, oldMasked);
    });

    it('should set new mask', function () {
      [Date, Number, 'string', /regexp/, function () {}, Date].forEach(mask => {
        let oldMask = imask.mask;
        let oldMasked = imask.masked;

        imask.mask = mask;
        assert.notEqual(imask.mask, oldMask);
        assert.notEqual(imask.masked, oldMasked);


        oldMask = imask.mask;
        oldMasked = imask.masked;

        imask.mask = mask;
        assert.equal(imask.mask, oldMask);
        assert.equal(imask.masked, oldMasked);
      });
    });
  });
});

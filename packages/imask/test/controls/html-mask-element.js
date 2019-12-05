import { assert } from 'chai';

import HTMLMaskElement from '../../src/controls/html-mask-element';


describe('HTMLMaskElement', function () {
  describe('#get isActive', function () {
    it('should use getRootNode if available', function () {
      const input = {
        getRootNode () {
          return this;
        },
        get activeElement () {
          return this;
        }
      };

      const maskElement = new HTMLMaskElement(input);
      assert.strictEqual(maskElement.isActive, true);
    });

    it('should use document as a fallback', function () {
      const doc = global.document;

      const input = {};
      global.document = { activeElement: input };
      const maskElement = new HTMLMaskElement(input);
      assert.strictEqual(maskElement.isActive, true);

      global.document = doc;
    });
  });
});

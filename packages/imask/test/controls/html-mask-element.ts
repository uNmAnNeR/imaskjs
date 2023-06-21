import assert from 'assert';
import { describe, it } from 'node:test';

import HTMLInputMaskElement from '../../src/controls/html-input-mask-element';


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
      } as any;

      const maskElement = new HTMLInputMaskElement(input);
      assert.strictEqual(maskElement.isActive, true);
    });

    it('should use document as a fallback', function () {
      const doc = global.document;

      const input = {} as any;
      global.document = { activeElement: input } as any;
      const maskElement = new HTMLInputMaskElement(input);
      assert.strictEqual(maskElement.isActive, true);

      global.document = doc;
    });
  });
});

import assert from 'assert';
import { describe, it } from 'node:test';

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
      } as any;

      const maskElement = new HTMLMaskElement(input);
      assert.strictEqual(maskElement.isActive, true);
    });

    it('should use document as a fallback', function () {
      const doc = global.document;

      const input = {} as any;
      global.document = { activeElement: input } as any;
      const maskElement = new HTMLMaskElement(input);
      assert.strictEqual(maskElement.isActive, true);

      global.document = doc;
    });
  });
});

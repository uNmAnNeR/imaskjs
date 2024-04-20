import assert from 'assert';
import { describe, beforeEach } from 'node:test';

import MaskedDate from '../../src/masked/date';


describe('MaskedDate', function () {
  const masked = new MaskedDate();

  beforeEach(function () {
    masked.updateOptions({
      pattern: MaskedDate.DEFAULTS.pattern,
    });
    masked.unmaskedValue = '';
  });

  describe('#isDateExist', function () {
    masked.updateOptions({
      pattern: MaskedDate.DEFAULTS.pattern + '.',
      parse: MaskedDate.DEFAULTS.parse,
      lazy: false,
      format: function (date) {
        return MaskedDate.DEFAULTS.format(date, masked) + '.';
      },
    });
    assert(masked.isDateExist('12.12.2000'), 'date is not exists');
  });
});

import assert from 'assert';
import { describe, it } from 'node:test';
import { DIRECTION } from '../../src/core/utils';

import MaskedEnum from '../../src/masked/enum';


describe('MaskedEnum', function () {
  it('should work with different length', function () {
    const enum_ = ['a', 'bc', 'def'];
    const masked = new MaskedEnum({ enum: enum_ });

    enum_.forEach(e => {
      masked.value = e;
      assert.equal(masked.value, e);
    });
  });

  it('should set required and optional chars', function () {
    const masked = new MaskedEnum({ enum: ['a', 'bc', 'def'], lazy: false });
    masked.value = '';

    assert.equal(masked.value, '_');
  });

  it('should update options', function () {
    const masked = new MaskedEnum({ enum: ['A', 'B'] });

    masked.value = 'A';
    assert.equal(masked.value, 'A');

    masked.updateOptions({ enum: ['C', 'D'] });
    assert.equal(masked.value, '');

    masked.value = 'C';
    assert.equal(masked.value, 'C');
  });

  it('should autocomplete value', function () {
    const enum_ = ['aaa', 'bbb', 'ccc'];
    const masked = new MaskedEnum({ enum: enum_ });
    masked.append('a', { input: true, raw: true });

    assert.equal(masked.value, enum_[0]);
  });

  it('should autocomplete from the middle', function () {
    // _|b -> bbb
    const enum_ = ['aaa', 'bbb', 'ccc'];
    const masked = new MaskedEnum({ enum: enum_ });
    masked.splice(1, 0, 'b');

    assert.equal(masked.value, enum_[1]);
  });

  it('should remove all before >1 available options', function () {
    // aaa| -> aa|_ -> a|__
    const enum_ = ['aaa', 'abb', 'ccc'];
    const masked = new MaskedEnum({ enum: enum_ });
    masked.value = enum_[0];
    masked.splice(2, 1, '', DIRECTION.LEFT);

    assert.equal(masked.value, 'a');
  });

  it('should match using `matchValue` but pick chars from enum', function () {
    const enum_ = ['aaa', 'bbb', 'ccc'];
    const masked = new MaskedEnum({ enum: enum_, matchValue: (estr, istr, matchFrom) => MaskedEnum.DEFAULTS.matchValue(estr.toLowerCase(), istr.toLowerCase(), matchFrom) });
    masked.append('A', { input: true, raw: true });

    assert.equal(masked.value, 'aaa');
  });

  it('should skip char if does not match', function () {
    const enum_ = ['aaa', 'bbb', 'ccc'];
    const masked = new MaskedEnum({ enum: enum_ });
    const d = masked.append('x', { input: true, raw: true });

    assert.equal(d.skip, true);
  });

  it('should not skip char if complete', function () {
    const enum_ = ['aaa', 'bbb', 'ccc'];
    const masked = new MaskedEnum({ enum: enum_ });
    masked.value = 'aaa';
    const d = masked.append('x', { input: true, raw: true });

    assert.equal(d.skip, false);
  });
});

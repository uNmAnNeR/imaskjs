// @flow
import { DIRECTION } from '../../core/utils.js';
import type MaskedPattern from '../pattern.js';
import { type PatternBlock } from './block.js';


type PatternCursorState = { offset: number, index: number, ok: boolean };

export default
class PatternCursor {
  masked: MaskedPattern;
  offset: number;
  index: number;
  ok: boolean;
  _log: PatternCursorState[];

  constructor (masked: MaskedPattern, pos: number) {
    this.masked = masked;
    this._log = [];

    const { offset, index } = masked._mapPosToBlock(pos) || (
      pos < 0 ?
        // first
        { index: 0, offset: 0 } :
        // last
        { index: this.masked._blocks.length, offset: 0 }
    );
    this.offset = offset;
    this.index = index;
    this.ok = false;
  }

  get block (): PatternBlock {
    return this.masked._blocks[this.index];
  }

  get pos (): number {
    return this.masked._blockStartPos(this.index) + this.offset;
  }

  get state (): PatternCursorState {
    return { index: this.index, offset: this.offset, ok: this.ok };
  }

  set state (s: PatternCursorState) {
    Object.assign(this, s);
  }

  pushState () {
    this._log.push(this.state);
  }

  popState (): PatternCursorState {
    const s = this._log.pop();
    this.state = s;
    return s;
  }

  bindBlock () {
    if (this.block) return;
    if (this.index < 0) {
      this.index = 0;
      this.offset = 0;
    }
    if (this.index >= this.masked._blocks.length) {
      this.index = this.masked._blocks.length - 1;
      this.offset = this.block.value.length;
    }
  }

  _pushLeft(fn: () => ?boolean): boolean {
    this.pushState();
    for (this.bindBlock(); 0<=this.index; --this.index, this.offset=this.block?.value.length || 0) {
      if (fn()) return this.ok = true;
    }

    return this.ok = false;
  }

  _pushRight (fn: () => ?boolean): boolean {
    this.pushState();
    for (this.bindBlock(); this.index<this.masked._blocks.length; ++this.index, this.offset=0) {
      if (fn()) return this.ok = true;
    }

    return this.ok = false;
  }

  pushLeftBeforeFilled (): boolean {
    return this._pushLeft(() => {
      if (this.block.isFixed || !this.block.value) return;

      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_LEFT);
      if (this.offset !== 0) return true;
    });
  }

  pushLeftBeforeInput (): boolean {
    // cases:
    // filled input: 00|
    // optional empty input: 00[]|
    // nested block: XX<[]>|
    return this._pushLeft(() => {
      if (this.block.isFixed) return;

      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
      return true;
    });
  }

  pushLeftBeforeRequired (): boolean {
    return this._pushLeft(() => {
      if (this.block.isFixed || this.block.isOptional && !this.block.value) return;

      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
      return true;
    });
  }

  pushRightBeforeFilled (): boolean {
    return this._pushRight(() => {
      if (this.block.isFixed || !this.block.value) return;

      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_RIGHT);
      if (this.offset !== this.block.value.length) return true;
    });
  }

  pushRightBeforeInput (): boolean {
    return this._pushRight(() => {
      if (this.block.isFixed) return;

      // const o = this.offset;
      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
      // HACK cases like (STILL DOES NOT WORK FOR NESTED)
      // aa|X
      // aa<X|[]>X_    - this will not work
      // if (o && o === this.offset && this.block instanceof PatternInputDefinition) continue;
      return true;
    });
  }

  pushRightBeforeRequired (): boolean {
    return this._pushRight(() => {
      if (this.block.isFixed || this.block.isOptional && !this.block.value) return;

      // TODO check |[*]XX_
      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
      return true;
    });
  }
}

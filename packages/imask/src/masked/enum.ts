import MaskedPattern, { MaskedPatternState, type MaskedPatternOptions } from './pattern';
import { AppendFlags } from './base';
import IMask from '../core/holder';
import ChangeDetails from '../core/change-details';
import { DIRECTION } from '../core/utils';
import { TailDetails } from '../core/tail-details';
import ContinuousTailDetails from '../core/continuous-tail-details';


export
type MaskedEnumOptions = Omit<MaskedPatternOptions, 'mask'> & Pick<MaskedEnum, 'enum'> & Partial<Pick<MaskedEnum, 'matchValue'>>;

export
type MaskedEnumPatternOptions = MaskedPatternOptions & Partial<Pick<MaskedEnum, 'enum' | 'matchValue'>>;


/** Pattern which validates enum values */
export default
class MaskedEnum extends MaskedPattern {
  declare enum: Array<string>;
  /** Match enum value */
  declare matchValue: (enumStr: string, inputStr: string, matchFrom: number) => boolean;

  static DEFAULTS: typeof MaskedPattern.DEFAULTS & Pick<MaskedEnum, 'matchValue'> = {
    ...MaskedPattern.DEFAULTS,
    matchValue: (estr, istr, matchFrom) => estr.indexOf(istr, matchFrom) === matchFrom,
  };

  constructor (opts?: MaskedEnumOptions) {
    super({
      ...MaskedEnum.DEFAULTS,
      ...opts,
    } as MaskedPatternOptions); // mask will be created in _update
  }

  override updateOptions (opts: Partial<MaskedEnumOptions>) {
    super.updateOptions(opts);
  }

  override _update (opts: Partial<MaskedEnumOptions>) {
    const { enum: enum_, ...eopts }: MaskedEnumPatternOptions = opts;

    if (enum_) {
      const lengths = enum_.map(e => e.length);
      const requiredLength = Math.min(...lengths);
      const optionalLength = Math.max(...lengths) - requiredLength;

      eopts.mask = '*'.repeat(requiredLength);
      if (optionalLength) eopts.mask += '[' + '*'.repeat(optionalLength) + ']';

      this.enum = enum_;
    }

    super._update(eopts);
  }

  override _appendCharRaw (ch: string, flags: AppendFlags<MaskedPatternState>={}): ChangeDetails {
    const matchFrom = Math.min(this.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);

    const matches = this.enum.filter(e => this.matchValue(e, this.unmaskedValue + ch, matchFrom));

    if (matches.length) {
      if (matches.length === 1) {
        this._forEachBlocksInRange(0, this.value.length, (b, bi) => {
          const mch = matches[0][bi];
          if (bi >= this.value.length || mch === b.value) return;

          b.reset();
          b._appendChar(mch, flags);
        });
      }

      const d = super._appendCharRaw(matches[0][this.value.length], flags);

      if (matches.length === 1) {
        matches[0].slice(this.unmaskedValue.length).split('').forEach(mch => d.aggregate(super._appendCharRaw(mch)));
      }

      return d;
    }

    return new ChangeDetails({ skip: !this.isComplete });
  }

  override extractTail (fromPos: number=0, toPos: number=this.displayValue.length): TailDetails {
    // just drop tail
    return new ContinuousTailDetails('', fromPos);
  }

  override remove (fromPos: number=0, toPos: number=this.displayValue.length): ChangeDetails {
    if (fromPos === toPos) return new ChangeDetails();

    const matchFrom = Math.min(super.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);

    let pos: number;
    for (pos = fromPos; pos >= 0; --pos) {
      const matches = this.enum.filter(e => this.matchValue(e, this.value.slice(matchFrom, pos), matchFrom));
      if (matches.length > 1) break;
    }

    const details = super.remove(pos, toPos);
    details.tailShift += pos - fromPos;

    return details;
  }

  override get isComplete (): boolean {
    return this.enum.indexOf(this.value) >= 0;
  }
}


IMask.MaskedEnum = MaskedEnum;

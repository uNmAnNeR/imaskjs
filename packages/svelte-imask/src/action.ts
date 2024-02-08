import IMask, { type FactoryArg, type InputMask, type UpdateOpts } from 'imask';


function fireEvent<Opts extends FactoryArg> (el: HTMLElement, eventName: string, data: InputMask<Opts>) {
  const e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, true, true, data);
  el.dispatchEvent(e);
}

function initMask<Opts extends FactoryArg> (el: HTMLElement, opts: InputMask<Opts> | Opts): InputMask<Opts> {
  const maskRef = (opts instanceof IMask.InputMask ? opts : IMask(el, opts as Opts));
  return maskRef
    .on('accept', () => fireEvent(el, 'accept', maskRef))
    .on('complete', () => fireEvent(el, 'complete', maskRef));
}


export default
function IMaskAction<Opts extends FactoryArg> (el: HTMLElement, opts: Opts) {
  let maskRef: InputMask<Opts> | undefined;
  let created: boolean | undefined;

  function destroy (): void {
    if (created) maskRef?.destroy();
    maskRef = undefined;
    created = undefined;
  }

  function update (opts: InputMask<Opts> | Opts | UpdateOpts<Opts>): void {
    if (!opts) return destroy();

    if (opts instanceof IMask.InputMask || !maskRef) maskRef = initMask(el, opts as Opts);
    else maskRef.updateOptions(opts as UpdateOpts<Opts>);

    created = (opts as InputMask<Opts>) !== maskRef;
  }

  update(opts);

  return {
    update,
    destroy,
  };
}

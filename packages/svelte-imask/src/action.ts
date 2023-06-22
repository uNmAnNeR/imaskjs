import IMask, { type FactoryArg, type InputMask, type NormalizedOpts } from 'imask';


function fireEvent<Opts extends FactoryArg> (el: HTMLElement, eventName: string, data: InputMask<Opts>) {
  const e = document.createEvent('CustomEvent');
  e.initCustomEvent(eventName, true, true, data);
  el.dispatchEvent(e);
}

function initMask<Opts extends FactoryArg> (el: HTMLElement, opts: InputMask<Opts> | Opts) {
  const maskRef = (opts instanceof IMask.InputMask ? opts : IMask(el, opts as Opts));
  return maskRef
    .on('accept', () => fireEvent(el, 'accept', maskRef))
    .on('complete', () => fireEvent(el, 'complete', maskRef));
}


export default
function IMaskAction<Opts extends FactoryArg> (el: HTMLElement, opts: Opts) {
  let maskRef: InputMask<Opts> | undefined = opts && initMask(el, opts);

  function destroy (): void {
    if (maskRef) {
      maskRef.destroy();
      maskRef = undefined;
    }
  }

  function update (opts: InputMask<Opts> | Opts | Partial<NormalizedOpts<Opts>>): void {
    if (!opts) return destroy();

    if (opts instanceof IMask.InputMask) maskRef = opts;
    else if (maskRef) maskRef.updateOptions(opts as Partial<NormalizedOpts<Opts>>);
    else maskRef = initMask(el, opts as Opts);
  }

  return {
    update,
    destroy,
  };
}

import {Ref} from "vue";

export {IMask} from 'imask';
export const IMaskComponent: any;
export const IMaskDirective: any;

/**
 * We allow the user to provide the props of the component, which we watch in case it contains a mask definition,
 * To see what props are accepted see props.js
 */
type AcceptedProps = {mask: {}, [key: string]: any}

export declare function useIMask(
	props: AcceptedProps | Ref<AcceptedProps>,
	{
		emit,
		onAccept,
		onComplete,
	}?: {
		emit?: (eventName: string, val: any)=>void;
		onAccept?: ()=>void;
		onComplete?: ()=>void;
	}
): {
	el: Ref<HTMLInputElement>;
	mask: Readonly<Ref<{ typedValue: string, unmaskedValue: string, value: string }>>;
	masked: Ref<string>;
	unmasked: Ref<string>;
	typed: Ref<string>;
};

export const IMaskProps: any;
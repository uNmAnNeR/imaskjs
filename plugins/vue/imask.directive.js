/**
 * @desc vue-imask
 * @author unofficial <cangku@unofficial.cn>
 * @update 2017-11-28
 */

import IMask from 'imask';
import _ from 'lodash';
const thousandsSeparator = ' ';
export default function(Vue) {
    /**
     * how to use ?
     * v-mask:[mask type]="[String|Object|Array]"
     * mask type: regexp|pattern|number|date|dynamic/on-the-fly
     */
    Vue.directive('mask', (el, binding) => {
        let options;
        switch(binding.arg.toLowerCase()) {
            case 'date':
                options = _.extend({
                    mask: Date,
                    placeholder: {
                        lazy: false
                    }
                }, binding.value);
                new IMask(el, options);
                break;
                
            case 'dynamic':
                options = [];
                binding.value.map((val) => {
                    return options.push({
                        mask: val
                    })
                })
                new IMask(el, {
                    mask: options
                })
                break;

            case 'number':
                options = _.extend({
                    mask: Number,
                    thousandsSeparator: thousandsSeparator
                }, binding.value)
                new IMask(el, options)
                break;

            case 'on-the-fly':
                options = [];
                binding.value.map((val) => {
                    return options.push({
                        mask: val
                    })
                })
                new IMask(el, {
                    mask: options
                })
                break;

            case 'pattern':
                new IMask(el, {
                    mask: binding.value
                })
                break;

            case 'regexp':
                new IMask(el, {
                    mask: binding.value
                })
                break;

            default:
                // todo
        }
    })
}
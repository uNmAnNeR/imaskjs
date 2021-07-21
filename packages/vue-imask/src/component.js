import { isVue3 } from 'vue-demi';

import Component3 from './component3-composition';
import Component2 from './component2';


export default isVue3 ? Component3 : Component2;

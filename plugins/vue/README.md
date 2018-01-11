# vue-imask
`vue-imask` is a custom directive that relies on `imask`

## how to use
- install  
    ```
    npm i vue-imask
    ```
- import in `app.js`
    ```
    import imask from 'vue-imask'
    imask(Vue)
    ```

- use in `template`
    ```
    regexp: <input type="text" v-mask:regexp="/^[1-6]\d{0,5}$/">
    pattern: <input type="text" v-mask:pattern="'+{7}(000)000-00-00'">
    number: <input type="text" v-mask:number="{min: -1000, max: 1000}">
    number: <input type="text" v-mask:number="{min: 0, max: 2000}">
    date: <input type="text" v-mask:date="{min: new Date(2000, 0, 1), max: new Date(2020, 12, 31)}">
    dynamic: <input type="text" v-mask:dynamic="['+{7}(000)000-00-00', /^\S*@?\S*$/]">
    on-the-fly: <input type="text" v-mask:on-the-fly="['+{7}(000)000-00-00', /^\S*@?\S*$/]">
    ```
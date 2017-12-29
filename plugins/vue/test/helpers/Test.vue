<template>
  <div :class="containerClasses">
    <div role="button"
         @click="toggle"
         class="test-dom-container__toggle"
         v-text="buttonText"
    ></div>
    <div class="test-dom-container__content">
      <slot/>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    visible: true
  }),

  computed: {
    containerClasses () {
      return {
        'test-dom-container': true,
        'test-dom-container--hidden': !this.visible
      }
    },
    buttonText () {
      return this.visible ? '-' : '+'
    }
  },

  methods: {
    toggle () {
      this.visible = !this.visible
    }
  }
}
</script>

<style>
@charset "utf-8";

#mocha .test-dom-container {
  border: 1px solid #eee;
  border-bottom-color: #ddd;
  border-radius: 3px;
  clear: left;
  display: block;
  margin: 5px;
  max-width: calc(100% - 42px);
  padding: 15px;
  position: relative;
}

/* Allow overflow */
#mocha li.test {
  overflow: visible !important;
}

.test-dom-container {
  font: initial;
}

#mocha .test-dom-container--hidden {
  padding: 0;
  border: 0;
  margin: 0;
}

.test-dom-container__toggle {
  background-color: #edeeee;
  border-radius: 2px;
  color: #202129;
  cursor: pointer;
  display: block;
  left: -28px;
  padding: 0 3px;
  position: absolute;
  text-align: center;
  top: -24px;

  /* width - container border - spacing */
  user-select: none;
  width: 15px;
}

.test-dom-container__toggle:hover {
  background-color: #e1e2e2;
}

.test-dom-container__toggle:active {
  background-color: #d5d6d6;
}

.test-dom-container--hidden .test-dom-container__toggle {
  /* Add the 1px from border to both */
  top: -18px;

  /* width - spacing */
  left: -22px;
}

.test-dom-container--hidden .test-dom-container__content {
  display: none;
  visibility: hidden;
}
</style>

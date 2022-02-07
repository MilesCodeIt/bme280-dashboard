<template>
  <div class="card">
    <div class="header" v-show="this.title">
      <div class="icon">
        <i :class="this.icon"></i>
      </div>
      <div class="text">
        <div class="title">{{ this.title }}</div>
        <div class="subtitle">{{ this.subtitle }}</div>
      </div>
    </div>
    <div class="body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: ["title", "subtitle", "icon"],
};
</script>

<style lang="scss" scoped>
.card {
  border: solid 1px #eceff4;
  width: fit-content;
  padding: 10px;
  border-radius: 5px;
  .header {
    display: flex;
    * {
      padding: 5px;
    }
  }
}
</style>

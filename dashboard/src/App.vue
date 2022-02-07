<template>
  <div class="main">
    <Navbar class="navbar" />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";

export default {
  name: "App",
  components: {
    Navbar,
  },
};
</script>

<style lang="scss" scoped>
.main {
  background: #2e3440;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: start;
  align-items: auto;
  align-content: start;
  color: #fff;
}

.navbar {
  flex: 1;
}

.content {
  flex: 10;
}
</style>

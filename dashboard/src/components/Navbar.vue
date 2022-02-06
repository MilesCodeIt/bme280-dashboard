<template>
  <router-link to="/">Home</router-link> |
  <router-link to="/about">About</router-link>
</template>

<script>
export default {
  name: "Navbar",

  data() {
    return {
      items: [
        { title: "Dashboard", icon: "mdi-view-dashboard" },
        { title: "Photos", icon: "mdi-image" },
        { title: "About", icon: "mdi-help-box" },
      ],
      right: null,
    };
  },
};
</script>

<style>
</style>
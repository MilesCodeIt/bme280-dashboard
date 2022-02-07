<template>
  <ul class="navbar">
    <li>
      <router-link to="/">
        <i class="fas fa-home"></i>
      </router-link>
    </li>
    <li>
      <router-link to="/about">
        <i class="fas fa-info"></i>
      </router-link>
    </li>
  </ul>
</template>

<script>
import { mdiAccount } from "@mdi/js";

export default {
  name: "Navbar",
  data: () => ({}),
};
</script>

<style scoped lang="scss">
ul {
  list-style: none;
}

.navbar {
  display: flex;
  flex-direction: column;
  align-items: center;
}

li {
  margin: 10px;
  * {
    aspect-ratio: 1/1;
    width: 38px;
    text-align: center;
    text-decoration: none;
    color: #eceff4;
    transition: all 0.3s;
    padding: 10px;
    border-radius: 5px;
    :hover {
      background: #eceff4;
      color: #2e3440;
      text-decoration: solid;
    }
  }
}
</style>
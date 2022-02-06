<template>
  <div class="card">
    <div class="header">
      <div class="icon"></div>
      <div class="text">
        <div class="title"></div>
        <div class="subtitle"></div>
      </div>
    </div>
    <div class="body">
      <div class="temperature"></div>
      <div class="pressure"></div>
      <div class="humidity"></div>
    </div>
  </div>
  <div class="card"></div>
  {{ values }}
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import axios from "axios";

export default {
  name: "Home",
  components: {
    HelloWorld,
  },
  data: () => ({
    values: null,
    loading: false,
  }),
  mounted() {
    this.loading = true;
    axios
      .get("https://reqres.in/api/users?page=1")
      .then((response) => (this.values = response.data.data))
      .catch((error) => console.log(error))
      .finally(() => (this.loading = false));
  },
};
</script>

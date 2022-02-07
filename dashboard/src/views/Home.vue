<template>
  <div class="home">
    <h1>Dashboard :</h1>
    <Card :title="cardValues.title" :icon="cardValues.icon">
      <div class="mainTemperature">
        <p>11°C</p>
      </div>
      <div class="cards">
        <Card>
          <p>pressure</p>
          <p>1023</p>
        </Card>
        <Card>
          <p>humidity</p>
          <p>1023</p>
        </Card>
        <Card>
          <p>pressure</p>
          <p>1023</p>
        </Card>
      </div>
    </Card>
    <div class="card"></div>
  </div>
</template>

<style lang="scss" scoped>
.mainTemperature > p {
  padding: 5px;
}
.cards {
  display: flex;
}
</style>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import axios from "axios";
import Card from "../components/Card.vue";

export default {
  name: "Home",
  components: {
    HelloWorld,
    Card,
  },
  data: () => ({
    values: null,
    loading: false,
    cardValues: {
      title: "Gathered Data",
      icon: "fas fa-home",
    },
  }),
  mounted() {
    this.loading = true;
    axios
      .get("https://api.github.com/")
      .then((response) => (this.values = response.data))
      .catch((error) => console.log(error))
      .finally(() => (this.loading = false));
  },
};
</script>

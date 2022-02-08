<template>
  <div class="home">
    <h1>Dashboard :</h1>
    <Card :title="cardValues.title" :icon="cardValues.icon">
      <div class="mainTemperature">
        <p>{{ Math.round(values.d.temperature) }}°C</p>
      </div>

      <keep-alive>
        <div class="cards">
          <Card>
            <p>Pressure</p>
            <p>{{ Math.round(values.d.pressure) }} hPa</p>
          </Card>
          <Card>
            <p>Humidity</p>
            <p>{{ Math.round(values.d.humidity) }} %</p>
          </Card>
          <Card>
            <p>Altitude</p>
            <p>{{ Math.round(getAltitudeFromPressure(values.d.pressure)) }} m</p>
          </Card>
        </div>
      </keep-alive>
    </Card>

    <Card title="4-digits display" icon="fas fa-home">

    </Card>
  </div>
</template>


<style lang="scss" scoped>
.mainTemperature > p {
  padding: 5px;
}
.cards {
  display: flex;
  * {
    margin: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>

<script>
import HelloWorld from "@/components/HelloWorld.vue";
import Card from "@/components/Card.vue";
import getAltitudeFromPressure from "@/utils/getAltitudeFromPressure"

export default {
  name: "Home",
  components: {
    HelloWorld,
    Card,
  },
  data: () => ({
    values: {
      d: {
        temperature: 0,
        pressure: 0,
        humidity: 0,
      },
    },
    loading: false,
    cardValues: {
      title: "Gathered Data",
      icon: "fas fa-home",
    },
  }),
  methods: {
    getAltitudeFromPressure,
  },
  mounted() {
    // this.loading = true;
    // fetch("/api/data")
    //   .then((response) => response.json())
    //   .then(data => (this.values = data))
    //   .catch((error) => console.error(error))
    //   .finally(() => (this.loading = false));

    let loc = window.location,
      new_uri;
    if (loc.protocol === "https:") {
      new_uri = "wss:";
    } else {
      new_uri = "ws:";
    }
    new_uri += "//" + loc.host;
    new_uri += loc.pathname + "api/ws";

    console.log(new_uri);

    // Créer une connexion WebSocket
    const socket = new WebSocket(new_uri);

    // // La connexion est ouverte
    // socket.addEventListener('open', function (event) {
    //   socket.send('Coucou le serveur !');
    // });

    // Écouter les messages
    socket.addEventListener("message", (event) => {
      this.values = JSON.parse(event.data);
      console.log(this.values);
    });
  },
};
</script>

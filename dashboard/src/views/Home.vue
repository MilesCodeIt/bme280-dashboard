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
    {{this.values}}
    <div class="card"></div>
  </div>
</template>

<style lang="scss" scoped>
.mainTemperature > p {
  padding: 5px;
}
.cards {
  display: flex;
  *{
    margin: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
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
    fetch("/api/data")
      .then((response) => response.json())
      .then(data => (this.values = data))
      .catch((error) => console.error(error))
      .finally(() => (this.loading = false));

    let loc = window.location, new_uri;
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

    // La connexion est ouverte
    socket.addEventListener('open', function (event) {
      socket.send('Coucou le serveur !');
    });

    // Écouter les messages
    socket.addEventListener('message', function (event) {
      console.log('Voici un message du serveur', event.data);
    });
  },
  
};
</script>

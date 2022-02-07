import type { Router } from "express-ws";
import type { Database } from "../utils/database";

import express from "express";
import { database_events } from "../utils/database";
import * as bme280 from "../utils/bme280";

export default function createApiRoutes (
  database: Database
) {
  const router = express.Router() as Router;

  // MAJ toutes les 2 minutes.
  const update_interval = 1000 * 2;
  bme280.open()
    .then(device => {
      setInterval(async () => {
        const data = await device.read();
        await database.saveData();
        console.log(data);
      }, update_interval);
    })
    .catch(err => {
      console.error("Erreur lors de l'accès au BME280.")
      throw err;
    });
  
  router.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      websockets: req.protocol + "://" + req.get("host") + "/api/ws"
    });
  });

  database_events.on("value", console.info);

  router.ws("/ws", async (ws, _req) => {
    ws.on("connection", () => {
      ws.send({
        t: 0, // 'type': 0 (connection).
        d: 1 // 'data': true
      });
    });

    // À chaque sauvegarde dans la BDD, on envoie à
    // l'utilisateur les nouvelles données.
    database_events.on("value", data => {
      ws.send({
        t: 1, // 'type': 1 (save).
        d: data
      });
    });
  });

  return router;
}

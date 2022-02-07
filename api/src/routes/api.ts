import type { Router } from "express-ws";
import type { Database } from "../utils/database";
import type { Bme280ReadResponse } from "../utils/bme280";

import express from "express";

import { database_events } from "../utils/database";
import * as bme280 from "../utils/bme280";
import {parse} from "path/posix";

export default function createApiRoutes (
  database: Database
) {
  const router = express.Router() as Router;

  // MAJ toutes les 30 secondes sur la BDD.
  const update_interval = 1000 * 30;
  bme280.open()
    .then(device => {
      // Récupération des dernières données
      // et sauvegarde dans la BDD.
      setInterval(async () => {
        const data = await device.read() as Bme280ReadResponse;
        await database.saveData(data);
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

  router.get("/data", async (req, res) => {
    try {
      const from = req.query.from as string ?? undefined;
      const to = req.query.to as string ?? undefined;

      const data = await database.getData({
        from,
        to
      });

      res.status(200).json({
        success: true,
        data
      });
    }
    catch (e) {
      console.error("Une erreur est survenue dans '/data'.", e);

      res.status(500).json({
        success: false,
        error: e
      });
    }
  });

  router.ws("/ws", async (ws, _req) => {
    ws.on("connection", () => {
      ws.send({
        t: 0, // 'type': 0 (connection).
        d: 1 // 'data': true
      });
    });

    // À chaque sauvegarde dans la BDD, on envoie à
    // l'utilisateur les nouvelles données.
    database_events.on("value", (data: Bme280ReadResponse) => {
      ws.send({
        t: 1, // 'type': 1 (save).
        d: {
          t: data.temperature,
          h: data.humidity,
          p: data.pressure
        }
      });
    });
  });

  return router;
}

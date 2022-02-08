import type { Router } from "express-ws";
import type { Database } from "../utils/database";
import type { Bme280ReadResponse } from "../utils/bme280";

import express from "express";

import { database_events } from "../utils/database";
import getSensorData from "../utils/getSensorData";

export default function createApiRoutes (
  database: Database
) {
  const router = express.Router() as Router;
  let latest_data: Bme280ReadResponse | null = null;

  const getLatestData = async () => {
    latest_data = await getSensorData() as Bme280ReadResponse;
    await database.saveData(latest_data);
  };

  // Get the latest values from the sensor
  // and save them to database every 30 seconds.
  setInterval(getLatestData, 1000 * 30);
  getLatestData(); // Get them on start.
  
  router.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      websockets: req.protocol + "://" + req.get("host") + "/api/ws"
    });
  });

  // GET /api/data
  // Parameters: `?from=UNIX_MS&to=UNIX_MS`.
  router.get("/data", async (req, res) => {
    try {
      const from = req.query.from as string ?? undefined;
      const to = req.query.to as string ?? undefined;

      const rows = await database.getData({
        from,
        to
      });

      res.status(200).json({
        success: true,
        rows
      });
    }
    catch (e) {
      console.error("[/api/data]", e);

      res.status(500).json({
        success: false,
        message: "An error happened."
      });
    }
  });

  // WS /api/ws
  router.ws("/ws", async (ws, _req) => {
    // Send a success response on connection.
    ws.send(JSON.stringify({
      t: 0, // 'type': 0 (connection).
      d: latest_data
    }));

    // We send every sensors update in the database to
    // the user in real-time through WebSockets.
    database_events.on("value", (data_string) => {
      const data = JSON.parse(data_string) as Bme280ReadResponse;

      ws.send(JSON.stringify({
        t: 1, // 'type': 1 (save).
        d: data
      }));
    });
  });

  return router;
}

import type { Router } from "express-ws";
import type { Database } from "../utils/database";

import express from "express";
import * as bme280 from "../utils/bme280";

const isProduction = process.env.NODE_ENV === "production";

export default function createApiRoutes (
  database: Database
) {
  const router = express.Router() as Router;
  const bme280_device = isProduction
    ? bme280.open()
    : null;

  router.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      websockets: req.protocol + "://" + req.get("host") + "/api/ws"
    });
  });

  router.ws("/ws", async (ws, req) => {
    ws.on("connection", () => {
      ws.send({
        t: 0, // 'type': 0 (connection).
        d: 1 // 'data': true
      });
    });
  });

  return router;
}

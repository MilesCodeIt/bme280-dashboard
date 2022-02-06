import type { Router } from "express-ws";
import type { Database } from "../utils/database";
import express from "express";

export default function createApiRoutes (
  database: Database
) {
  const router = express.Router() as Router;

  router.get("/", (req, res) => {
    console.log(database)
    res.status(200).json({
      success: true,
      websockets: req.protocol + "://" + req.get("host") + "/api/ws"
    });
  });

  return router;
}

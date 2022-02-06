import type { Router } from "express-ws";
import express from "express";
const router = express.Router() as Router;

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    websockets: req.protocol + "://" + req.get("host") + "/api/ws"
  });
});

export default router;

import express from "express";
import expressWs from "express-ws";
import path from "path";
import minimist from "minimist";

// API routes defined below.
import api from "./routes";

// Production ENV key.
const isProduction = process.env.NODE_ENV === "production";
const args = minimist(process.argv.slice(2));

// Create the web server, including WebSockets.
const { app } = expressWs(express());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes.
app.use("/api", api);

// Dashboard (when production).
// JSON message (on development).
app.use(
  isProduction
    ? express.static(path.join(__dirname, "./public"))
    : (req, res) => {
      res.status(200).json({
        success: true,
        message: "Development server. Only '/api/*' routes are available. You also need to proxy '/api/*' to Vite.",
        href: req.protocol + '://' + req.get("host")
      });
    }
);

const PORT = parseInt(args.port) || 8080;
app.listen(PORT, () => {
  console.info(
    !isProduction
      ? `[API] Ready on port ${PORT}. Needs to be proxied in 'vite.config.js'.`
      : `[Server] Ready on port ${PORT}`
  );
});

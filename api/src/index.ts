import express from "express";
import expressWs from "express-ws";
import path from "path";
import minimist from "minimist";

import createApiRoutes from "./routes/api";
import loadDatabase from "./utils/database";

// Configuration.
const isProduction = process.env.NODE_ENV === "production";
const args = minimist(process.argv.slice(2));

/** Create Express server. */
async function createApp () {
  const { app } = expressWs(express());

  // Load local database (or create it).
  const database = await loadDatabase(
    args["sql-file"]
  );

  // Read body of requests.
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Routes.
  app.use("/api", createApiRoutes(database));
  app.use(
    isProduction
      // In production, deploy Vite bundle.
      ? express.static(path.join(__dirname, "./public"))

      // In development, deploy a JSON message.
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
        ? `[API] Available on port ${PORT}.` + " "
          + "Also, don't forget to proxy the URL in the file 'vite.config.js'."
        : `[Server] Ready on port ${PORT}`
    );
  });
}

// Lancement du serveur Express.
(async () => {
  console.info("[API] Starting Express and reading database...");
  await createApp();
})();

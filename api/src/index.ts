import express from "express";
import expressWs from "express-ws";
import path from "path";
import minimist from "minimist";

import createApiRoutes from "./routes/api";
import loadDatabase from "./utils/database";

// Configuration.
const isProduction = process.env.NODE_ENV === "production";
const args = minimist(process.argv.slice(2));

/** Création du serveur Express. */
async function createApp () {
  const { app } = expressWs(express());

  // Chargement de la BDD locale.
  const database = await loadDatabase(
    args["sql-file"]
  );

  // Permet de lire le body des requêtes..
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Routes du serveur web.
  app.use("/api", createApiRoutes(database));
  app.use(
    isProduction
      // Déploiement du build Vite (en production).
      ? express.static(path.join(__dirname, "./public"))

      // Création d'un middleware JSON (en dév).
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
        ? `[API] Disponible sur le port ${PORT}.` + " "
          + "Ne pas oublier de proxy l'URL dans le fichier 'vite.config.js'."
        : `[Server] Ready on port ${PORT}`
    );
  });
}

// Lancement du serveur Express.
(async () => {
  console.info("[API] Lancement du serveur Express...");
  await createApp();
})

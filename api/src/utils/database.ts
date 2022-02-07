import type {
  Database as SqlDatabase
} from "sql.js";

import type {
  Bme280ReadResponse
} from "./bme280";

import { promises as fs } from "fs";
import path from "path";
import initSqlJs from "sql.js";
import { EventEmitter } from "events";

export const database_events = new EventEmitter();

export class Database {
  private database: SqlDatabase;
  private file_path: string;

  constructor (
    file_path: string,
    database: SqlDatabase
  ) {
    this.file_path = file_path;
    this.database = database;
  }

  public async saveData (data?: Bme280ReadResponse) {
    try {
      if (data) {
        // Préparation de la requête SQL.
        const stmt = this.database.prepare("INSERT INTO sensor_data (temperature, pressure, humidity) VALUES (?, ?, ?);");

        // Ajout des valeurs aux paramètres.
        stmt.run([
          data.temperature,
          data.pressure,
          data.humidity
        ]);

        // Envoie de l'event.
        database_events.emit("value", data);
      }

      // Sauvegarde du fichier SQLite.
      const binaryArray = this.database.export();
      await fs.writeFile(this.file_path, binaryArray);
    }
    catch (e) {
      console.error(e);
      throw Error ("Erreur lors de la sauvegarde de la BDD.");
    }
  }

  public async getData (options: {
    from: string | null;
    to: string | null;
  } = {
    from: null,
    to: null
  }) {
    try {
      let sql = "SELECT * FROM sensor_data";

      // Ajoute le filtre, si nécessaire.
      if (options.from && options.to) {
        sql += " " + "WHERE timestamp BETWEEN datetime(?, 'unixepoch') AND datetime(?, 'unixepoch')";
      }

      // Ajoute le ";" à la fin.
      sql += ";";

      // Préparation de la requête.
      const stmt = this.database.prepare(sql);

      // Ajout des valeurs si nécessaire.
      if (options.from && options.to) {
        const from = Math.round(parseInt(options.from) / 1000);
        const to = Math.round(parseInt(options.to) / 1000);

        stmt.bind([
          from,
          to
        ]);
      }

      const rows = [];
      while (stmt.step()) {
        const current_row = stmt.getAsObject();
        rows.push(current_row);
      }

      // Fin de la requête.
      stmt.free();
      return rows;
    }
    catch (e) {
      console.error(e);
      throw Error ("Erreur lors de la récupération de données depuis la BDD.");
    }
  }
}

/**
 * @param custom_path - Entry `.sqlite` point.
 * It defaults to `(process.cwd)/data.sqlite`
 */
export default async function loadDatabase (
  custom_path?: string
) {
    if (custom_path && !custom_path.includes(".sqlite")) {
      throw Error ("Le fichier de BDD donné n'est pas un fichier .sqlite");
    }

    const default_file_path = path.join(
      process.cwd(), "./data.sqlite"
    );
    const file_path = custom_path || default_file_path;

    const SQL = await initSqlJs();

    try {
      const file_buffer = await fs.readFile(file_path);
      const database = new SQL.Database(file_buffer);

      return new Database(file_path, database);
    }
    catch (e) {
      const error: any = e;
      if (error.code !== "ENOENT") throw e;

      const database = new SQL.Database();
      const create_table = `CREATE TABLE sensor_data (
        id INTEGER PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        temperature REAL,
        pressure REAL,
        humidity REAL
      );`;

      database.run(create_table);

      const database_class = new Database(file_path, database);
      await database_class.saveData();

      return database_class;
    }
}


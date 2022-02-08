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

/** Events of the database.
 * "value": emitted on `#aveData()`.
 */
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

  /**
   * Save data to database if datas are given.
   * Save the final database locally.
   */
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

  /**
   * Retrieve data from the database.
   * - `from` and `to` are numbers in milliseconds.
   */
  public async getData (options: {
    from: string | null;
    to: string | null;
  } = {
    from: null,
    to: null
  }) {
    try {
      let sql = "SELECT * FROM sensor_data";

      // Take only a period of time if
      // timestamps are given.
      if (options.from && options.to) {
        sql += " " + "WHERE timestamp BETWEEN datetime(?, 'unixepoch') AND datetime(?, 'unixepoch')";
      }

      // Add trailling semi-colon.
      sql += ";";

      // Prepare SQL request.
      const stmt = this.database.prepare(sql);

      // Bind values if needed.
      if (options.from && options.to) {
        // Convert values from milliseconds to seconds
        // for SQLite.
        const from = Math.round(parseInt(options.from) / 1000);
        const to = Math.round(parseInt(options.to) / 1000);

        stmt.bind([
          from,
          to
        ]);
      }

      // Parsing the rows.
      const rows = [];
      while (stmt.step()) {
        const current_row = stmt.getAsObject();
        rows.push(current_row);
      }

      // End the statement and return rows.
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
 * @param custom_path - File SQLite to be used.
 * If the file doesn't exist, it will be created.
 * It defaults to `(process.cwd)/sensor_data.db`
 */
export default async function loadDatabase (
  custom_path?: string
) {
    // Defining the database file path.
    const default_file_path = path.join(
      process.cwd(), "./sensor_data.db"
    );
    const file_path = custom_path || default_file_path;

    // Initialization of "sql.js".
    const SQL = await initSqlJs();

    // Read database if file exists.
    try {
      const file_buffer = await fs.readFile(file_path);
      const database = new SQL.Database(file_buffer);

      return new Database(file_path, database);
    }
    // The file don't exists, so we create a new one
    // containing an empty table.
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

      // Create the table.
      database.run(create_table);

      const database_class = new Database(file_path, database);
      
      // Save the file locally.
      await database_class.saveData();

      return database_class;
    }
}


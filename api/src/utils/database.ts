import type {
  Database as SqlDatabase
} from "sql.js";

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

  public async saveData () {
    const binaryArray = this.database.export();

    try {
      database_events.emit("value", { "hello": "world" });
      await fs.writeFile(this.file_path, binaryArray);
    }
    catch (e) {
      console.error(e);
      throw Error ("Erreur lors de la sauvgarde de la BDD");
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
        id INT(16) NOT NULL PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        temperature FLOAT(8),
        pressure FLOAT(8),
        humidity FLOAT(8)
      );`;

      database.run(create_table);

      const database_class = new Database(file_path, database);
      await database_class.saveData();

      return database_class;
    }
}


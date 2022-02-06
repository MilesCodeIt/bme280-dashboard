"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.database_events = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const sql_js_1 = __importDefault(require("sql.js"));
const events_1 = require("events");
exports.database_events = new events_1.EventEmitter();
class Database {
    constructor(file_path, database) {
        this.file_path = file_path;
        this.database = database;
    }
    saveData() {
        return __awaiter(this, void 0, void 0, function* () {
            const binaryArray = this.database.export();
            try {
                exports.database_events.emit("value", { "hello": "world" });
                yield fs_1.promises.writeFile(this.file_path, binaryArray);
            }
            catch (e) {
                console.error(e);
                throw Error("Erreur lors de la sauvgarde de la BDD");
            }
        });
    }
}
exports.Database = Database;
function loadDatabase(custom_path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (custom_path && !custom_path.includes(".sqlite")) {
            throw Error("Le fichier de BDD donné n'est pas un fichier .sqlite");
        }
        const default_file_path = path_1.default.join(process.cwd(), "./data.sqlite");
        const file_path = custom_path || default_file_path;
        const SQL = yield (0, sql_js_1.default)();
        try {
            const file_buffer = yield fs_1.promises.readFile(file_path);
            const database = new SQL.Database(file_buffer);
            return new Database(file_path, database);
        }
        catch (e) {
            const error = e;
            if (error.code !== "ENOENT")
                throw e;
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
            yield database_class.saveData();
            return database_class;
        }
    });
}
exports.default = loadDatabase;
//# sourceMappingURL=database.js.map
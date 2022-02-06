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
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const path_1 = __importDefault(require("path"));
const minimist_1 = __importDefault(require("minimist"));
const api_1 = __importDefault(require("./routes/api"));
const database_1 = __importDefault(require("./utils/database"));
const isProduction = process.env.NODE_ENV === "production";
const args = (0, minimist_1.default)(process.argv.slice(2));
console.log(args);
function createApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const { app } = (0, express_ws_1.default)((0, express_1.default)());
        const database = yield (0, database_1.default)(args["sql-file"]);
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: false }));
        app.use("/api", (0, api_1.default)(database));
        app.use(isProduction
            ? express_1.default.static(path_1.default.join(__dirname, "./public"))
            : (req, res) => {
                res.status(200).json({
                    success: true,
                    message: "Development server. Only '/api/*' routes are available. You also need to proxy '/api/*' to Vite.",
                    href: req.protocol + '://' + req.get("host")
                });
            });
        const PORT = parseInt(args.port) || 8080;
        app.listen(PORT, () => {
            console.info(!isProduction
                ? `[API] Ready on port ${PORT}. Needs to be proxied in 'vite.config.js'.`
                : `[Server] Ready on port ${PORT}`);
        });
    });
}
createApp();
//# sourceMappingURL=index.js.map
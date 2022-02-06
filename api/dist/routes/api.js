"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
function createApiRoutes(database) {
    const router = express_1.default.Router();
    router.get("/", (req, res) => {
        console.log(database);
        res.status(200).json({
            success: true,
            websockets: req.protocol + "://" + req.get("host") + "/api/ws"
        });
    });
    return router;
}
exports.default = createApiRoutes;
//# sourceMappingURL=api.js.map
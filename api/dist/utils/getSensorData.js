"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bme280 = __importStar(require("./bme280"));
const getAltitudeFromPressure_1 = __importDefault(require("./getAltitudeFromPressure"));
const format = (number) => (Math.round(number * 100) / 100).toFixed(2);
const delay = (millis) => new Promise(resolve => setTimeout(resolve, millis));
function getSensorData() {
    return __awaiter(this, void 0, void 0, function* () {
        const sensor = yield bme280.open();
        const reading = yield sensor.read();
        const temperature = reading.temperature
            ? format(reading.temperature)
            : 0;
        const pressure = reading.pressure
            ? format(reading.pressure)
            : 0;
        const humidity = reading.humidity
            ? format(reading.humidity)
            : 0;
        const altitude = reading.pressure
            ? (0, getAltitudeFromPressure_1.default)(reading.pressure)
            : 0;
        const data = {
            temperature,
            pressure,
            humidity,
            altitude
        };
        yield delay(sensor.typicalMeasurementTime());
        yield sensor.close();
        return data;
    });
}
exports.default = getSensorData;
;
//# sourceMappingURL=getSensorData.js.map
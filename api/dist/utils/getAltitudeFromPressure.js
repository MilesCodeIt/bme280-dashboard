"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAltitudeFromPressure(pressure) {
    const a = pressure / 101325;
    const b = 1 / 5.25588;
    let c = Math.pow(a, b);
    c = 1.0 - c;
    c = c / 0.0000225577;
    c = c / 100;
    return c;
}
exports.default = getAltitudeFromPressure;
//# sourceMappingURL=getAltitudeFromPressure.js.map
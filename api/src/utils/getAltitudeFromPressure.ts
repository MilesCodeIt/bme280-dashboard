/**
 * Converti la pression en altitude.
 * Adaptée de la formule donné par 'Seeedstudio Grove BME280'.
 * @param pressure - Pression de l'air en 'hPa'.
 * @returns - Altitude en 'm' (mètres).
 */
export default function getAltitudeFromPressure (
  pressure: number
) {
  const a = pressure / 101325;
  const b = 1 / 5.25588;
  
  let c = Math.pow(a, b);
  c = 1.0 - c;
  c = c / 0.0000225577;
  c = c / 100;
  
  return c;
}

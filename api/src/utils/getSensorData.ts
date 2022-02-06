import * as bme280 from "./bme280";
import getAltitudeFromPressure from "./getAltitudeFromPressure";

const format = (number: number) => (Math.round(number * 100) / 100).toFixed(2);

const delay = (millis: number) => new Promise(resolve => setTimeout(resolve, millis));

export default async function getSensorData () {
  const sensor = await bme280.open();
  const reading = await sensor.read();

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
    ? getAltitudeFromPressure(reading.pressure)
    : 0;

  const data = {
    temperature,
    pressure,
    humidity,
    altitude
  };

  await delay(sensor.typicalMeasurementTime()); // 40 milliseconds, 25Hz

  await sensor.close();

  return data;
};


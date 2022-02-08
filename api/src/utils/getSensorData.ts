import * as bme280 from "./bme280";

const delay = (millis: number) => new Promise(resolve => setTimeout(resolve, millis));

export default async function getSensorData () {
  const sensor = await bme280.open();
  const data = await sensor.read();

  // 40 milliseconds, 25Hz
  await delay(sensor.typicalMeasurementTime());

  await sensor.close();
  return data;
};


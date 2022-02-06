import * as bme280 from "./utils/bme280";
import getAltitudeFromPressure from "./utils/getAltitudeFromPressure";

const format = (number: number) => (Math.round(number * 100) / 100).toFixed(2);

const delay = (millis: number) => new Promise(resolve => setTimeout(resolve, millis));

const reportContinuous = async () => {
  const sensor = await bme280.open();

  // 10 calculs.
  for (let i = 1; i <= 10; ++i) {
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

    console.info(data);

    await delay(sensor.typicalMeasurementTime()); // 40 milliseconds, 25Hz
  }

  await sensor.close();
};

reportContinuous().catch(console.log);

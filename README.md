# BME280 - Dashboard (Express + Vue)

> School project we've done using a Raspberry PI 4 with a Grove PI and the Grove BME280 I2C sensor.

## Installation

If you want to use our dashboard, you can build it on your hardware.

### Prerequisites

- Raspberry PI
- BME280
- Node.js ≥ 14
- Yarn (1.x)

You also need to know your BME280 sensor adresss and the bus it is connected to. Check also that your user is in the `i2c` group and I2C are enabled.

To get the bus number where the sensor is connected, use `i2cdetect -l` (`sudo apt-get install i2c-tools`) and you'll get a list of I2C busses available.

You can know the BME280 address by using `i2cdetect -y [BUS_NUMBER]`.

For us the value is `76` (so `0x76`), but it can be `0x77` depending on the models.

### Deploy

Clone this repository and CD into it.

```bash
git clone https://github.com/MilesCodeIt/bme280-dashboard
cd bme280-dashboard
```

Then install the dependencies.
```bash
# Install dependencies for the root, api and dashboard.
yarn && \
cd dashboard && yarn && cd .. && \
cd api && yarn && cd ..
```

Run the build script.
```bash
yarn build
```

Finally, start the server !
```bash
yarn start --port 8080 --bus-number 1 --bme280-address 118
```
- `--port`
  - Type: `number`.
  - Defaults to `8080`.
- `--bus-number`
  - Type: `number`.
  - Defaults to `1`.
- `--bme280-address`
  - Type: `number`.
  - Defaults to `118` (so `0x76` in **hexadecimal**).

Now navigate to port 8080 and you'll see the dashboard.

## Credits

Thanks you...

- [`i2c-bus`](https://www.npmjs.com/package/i2c-bus) for accessing I2C from Node.
- [`bme280`](https://github.com/fivdi/bme280). Most of the code for the sensor comes from here.
- Our school, [Lycée Turgot](https://www.lyc-turgot.ac-limoges.fr/), to make us do this project.
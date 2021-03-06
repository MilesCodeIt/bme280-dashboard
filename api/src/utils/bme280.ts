/**
 * Code pris de https://github.com/fivdi/bme280/blob/master/bme280.js
 * et légérement adapté pour notre projet.
 */
import type { PromisifiedBus } from "i2c-bus";
import i2c from "i2c-bus";

const DEFAULT_I2C_BUS = 1;
const DEFAULT_I2C_ADDRESS = 0x76;

export type Bme280ReadResponse = {
  temperature: number;
  humidity: number;
  pressure: number;
};

export const OVERSAMPLE = {
  SKIPPED: 0,
  X1: 1,
  X2: 2,
  X4: 3,
  X8: 4,
  X16: 5
};

export const FILTER = {
  OFF: 0,
  F2: 1,
  F4: 2,
  F8: 3,
  F16: 4
};

export const STANDBY = {
  MS_0_5: 0,
  MS_62_5: 1,
  MS_125: 2,
  MS_250: 3,
  MS_500: 4,
  MS_1000: 5,
  MS_10: 6,
  MS_20: 7
};

const MODE = {
  SLEEP: 0,
  FORCED: 1,
  NORMAL: 3
};

const REGS = {
  TP_COEFFICIENT: 0x88,
  CHIP_ID: 0xd0,
  RESET: 0xe0,
  H_COEFFICIENT: 0xe1,
  CTRL_HUM: 0xf2,
  STATUS: 0xf3,
  CTRL_MEAS: 0xf4,
  CONFIG: 0xf5,
  DATA: 0xf7
};

const REG_LENGTHS = {
  TP_COEFFICIENT: 26,
  H_COEFFICIENT: 7,
  DATA: 8
};

const CHIP_ID = 0x60;
const SOFT_RESET_COMMAND = 0xb6;

// STATUS register
const STATUS = {
  IM_UPDATE_BIT: 0x01,
  MEASURING_BIT: 0x08
};

// CTRL_HUM register
const CTRL_HUM = {
  OSRS_H_MASK: 0x07,
  OSRS_H_POS: 0x00
};

// CTRL_MEAS register
const CTRL_MEAS = {
  MODE_POS: 0x00,
  MODE_MASK: 0x03,
  OSRS_P_POS: 0x02,
  OSRS_T_POS: 0x05
};

// CONFIG register
const CONFIG = {
  FILTER_MASK: 0x1c,
  FILTER_POS: 2,
  STANDBY_MASK: 0xe0,
  STANDBY_POS: 5
};

/**
 * @param milliseconds - Temps à attendre en ms.
 */
const delay = (milliseconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, milliseconds + 1));


type BmeOpenOptions = {
  i2cBusNumber: number;
  i2cAddress: number;
  humidityOversampling: number;
  pressureOversampling: number;
  temperatureOversampling: number;
  filterCoefficient: number;
  standby: number;
  forcedMode: boolean;
};

export const open = async (options = {
  i2cBusNumber: DEFAULT_I2C_BUS,
  i2cAddress: DEFAULT_I2C_ADDRESS,
  humidityOversampling: OVERSAMPLE.X1,
  pressureOversampling: OVERSAMPLE.X1,
  temperatureOversampling: OVERSAMPLE.X1,
  filterCoefficient: FILTER.OFF,
  standby: STANDBY.MS_0_5,
  forcedMode: false
}) => {
  validateOpenOptions(options);

  // Ouverture du bus I2C.
  const i2cBus = await i2c.openPromisified(options.i2cBusNumber);

  const bme280I2c = new Bme280I2c(i2cBus, options);
  await bme280I2c.initialize();

  const device = new Bme280(bme280I2c);
  return device;
};

const validateOpenOptions = (options: BmeOpenOptions) => {
  if (typeof options !== 'object') {
    throw new Error('Expected options to be of type object.' +
      ` Got type ${typeof options}.`);
  }

  if (options.i2cBusNumber &&
      (!Number.isSafeInteger(options.i2cBusNumber) ||
       options.i2cBusNumber < 0)) {
    throw new Error('Expected i2cBusNumber to be a non-negative integer.' +
      ` Got "${options.i2cBusNumber}".`);
  }

  if (options.i2cAddress &&
      (!Number.isSafeInteger(options.i2cAddress) ||
       options.i2cAddress < 0 ||
       options.i2cAddress > 0x7f)) {
    throw new Error('Expected i2cAddress to be an integer' +
      ` >= 0 and <= 0x7f. Got "${options.i2cAddress}".`);
  }

  if (options.humidityOversampling &&
      !Object.values(OVERSAMPLE).includes(options.humidityOversampling)) {
    throw new Error('Expected humidityOversampling to be a value from' +
      ` Enum OVERSAMPLE. Got "${options.humidityOversampling}".`);
  }

  if (options.pressureOversampling &&
      !Object.values(OVERSAMPLE).includes(options.pressureOversampling)) {
    throw new Error('Expected pressureOversampling to be a value from' +
      ` Enum OVERSAMPLE. Got "${options.pressureOversampling}".`);
  }

  if (options.temperatureOversampling &&
      !Object.values(OVERSAMPLE).includes(options.temperatureOversampling)) {
    throw new Error('Expected temperatureOversampling to be a value from' +
      ` Enum OVERSAMPLE. Got "${options.temperatureOversampling}".`);
  }

  if (options.standby &&
      !Object.values(STANDBY).includes(options.standby)) {
    throw new Error('Expected standby to be a value from Enum' +
      ` STANDBY. Got "${options.standby}".`);
  }

  if (options.filterCoefficient &&
      !Object.values(OVERSAMPLE).includes(options.filterCoefficient)) {
    throw new Error('Expected filterCoefficient to be a value from Enum' +
      ` FILTER. Got "${options.filterCoefficient}".`);
  }

  if (options.forcedMode &&
      typeof options.forcedMode !== 'boolean') {
    throw new Error('Expected forcedMode to be a value of type' +
      ` boolean. Got type "${typeof options.forcedMode}".`);
  }
};

class Bme280I2c {
  private _i2cBus: PromisifiedBus;
  private _opts: BmeOpenOptions;
  private _coefficients: { [key: string]: number } | null;
  private forcedMode: boolean | undefined;

  constructor (
    i2cBus: PromisifiedBus,
    options: BmeOpenOptions
  ) {
    this._i2cBus = i2cBus;
    this._opts = options;
    this._coefficients = null;
  }

  readByte (register: number) {
    return this._i2cBus.readByte(this._opts.i2cAddress, register);
  }

  writeByte (register: number, byte: number) {
    return this._i2cBus.writeByte(this._opts.i2cAddress, register, byte);
  }

  readI2cBlock (
    register: number,
    length: number,
    buffer: Buffer
  ) {
    return this._i2cBus.readI2cBlock(
      this._opts.i2cAddress, register, length, buffer
    );
  }

  async checkChipId (tries = 5): Promise<void> {
    try {
      const chipId = await this.readByte(REGS.CHIP_ID);

      if (chipId !== CHIP_ID) {
        return Promise.reject(new Error(
          `L'ID de la chip BME280 attendue est de 0x${CHIP_ID.toString(16)}` +
          `. ID reçu 0x${chipId.toString(16)}.`
        ));
      }
    }
    catch (err) {
      if (tries > 1) {
        await delay(1);
        return this.checkChipId(tries - 1);
      }

      return Promise.reject(err);
    }
  }

  softReset() {
    return this.writeByte(REGS.RESET, SOFT_RESET_COMMAND);
  }

  async waitForImageRegisterUpdate (tries = 5): Promise<void> {
    await delay(2);

    const statusReg = await this.readByte(REGS.STATUS);
    if ((statusReg & STATUS.IM_UPDATE_BIT) !== 0) {
      if (tries - 1 > 0) {
        return this.waitForImageRegisterUpdate(tries - 1);
      }

      return Promise.reject(
        new Error("MAJ du registre de l'image a échoué.")
      );
    }
  }

  async readCoefficients () {
    const tpRegs = Buffer.alloc(REG_LENGTHS.TP_COEFFICIENT);
    const hRegs = Buffer.alloc(REG_LENGTHS.H_COEFFICIENT);

    await this.readI2cBlock(
      REGS.TP_COEFFICIENT, REG_LENGTHS.TP_COEFFICIENT, tpRegs
    );

    await this.readI2cBlock(
      REGS.H_COEFFICIENT, REG_LENGTHS.H_COEFFICIENT, hRegs
    );
    
    this._coefficients = Object.freeze({
      t1: tpRegs.readUInt16LE(0),
      t2: tpRegs.readInt16LE(2),
      t3: tpRegs.readInt16LE(4),

      p1: tpRegs.readUInt16LE(6),
      p2: tpRegs.readInt16LE(8),
      p3: tpRegs.readInt16LE(10),
      p4: tpRegs.readInt16LE(12),
      p5: tpRegs.readInt16LE(14),
      p6: tpRegs.readInt16LE(16),
      p7: tpRegs.readInt16LE(18),
      p8: tpRegs.readInt16LE(20),
      p9: tpRegs.readInt16LE(22),

      h1: tpRegs.readUInt8(25),
      h2: hRegs.readInt16LE(0),
      h3: hRegs.readUInt8(2),
      h4: (hRegs.readInt8(3) * 16) | (hRegs[4] & 0xf),
      h5: (hRegs.readInt8(5) * 16) | (hRegs[4] >> 4),
      h6: hRegs.readInt8(6)
    });
  }

  /**
   * Commentaire de la documentation du BME280:
   * (page 30, section 5.4.6 Register 0xF5 "config")
   * 
   * Writes to the "config" register in normal mode may be ignored. In sleep
   * mode writes are not ignored.
   * 
   * So ensure that the config register is set while in sleep mode before
   * setting the mode to normal/forced in the ctrl_meas register.
   */
  async configureSettings () {
    const configReg = await this.readByte(REGS.CONFIG);
    await this.writeByte(
      REGS.CONFIG,
      (configReg & ~(CONFIG.STANDBY_MASK | CONFIG.FILTER_MASK)) |
      (this._opts.standby << CONFIG.STANDBY_POS) |
      (this._opts.filterCoefficient << CONFIG.FILTER_POS)
    );

    const ctrlHumReg = await this.readByte(REGS.CTRL_HUM);
    await this.writeByte(
      REGS.CTRL_HUM,
      (ctrlHumReg & ~CTRL_HUM.OSRS_H_MASK) |
      (this._opts.humidityOversampling << CTRL_HUM.OSRS_H_POS)
    );

    const mode = this._opts.forcedMode ? MODE.SLEEP : MODE.NORMAL;
    await this.writeByte(
      REGS.CTRL_MEAS,
      (this._opts.temperatureOversampling << CTRL_MEAS.OSRS_T_POS) |
      (this._opts.pressureOversampling << CTRL_MEAS.OSRS_P_POS) |
      (mode << CTRL_MEAS.MODE_POS)
    );
  }

  async initialize () {
    await this.checkChipId();
    await this.softReset();
    await this.waitForImageRegisterUpdate();
    await this.readCoefficients();
    await this.configureSettings();

    if (!this.forcedMode) {
      return delay(
        this.maximumMeasurementTime()
      );
    }
  }

  async readRawData () {
    const dataRegs = await this.readI2cBlock(
      REGS.DATA, REG_LENGTHS.DATA, Buffer.alloc(REG_LENGTHS.DATA)
    );
    
    const regs = dataRegs.buffer;

    return {
      pressure: regs[0] << 12 | regs[1] << 4 | regs[2] >> 4,
      temperature: regs[3] << 12 | regs[4] << 4 | regs[5] >> 4,
      humidity: regs[6] << 8 | regs[7]
    };
  }

  compensateTemperature (adcT: number) {
    const c = this._coefficients;
    if (!c) return;

    return ((adcT / 16384 - c.t1 / 1024) * c.t2) +
      ((adcT / 131072 - c.t1 / 8192) * (adcT / 131072 - c.t1 / 8192) * c.t3);
  }

  compensateHumidity (adcH: number, tFine: number) {
    const c = this._coefficients;
    if (!c) return;

    let h = tFine - 76800;
    h = (adcH - (c.h4 * 64 + c.h5 / 16384 * h)) *
      (c.h2 / 65536 * (1 + c.h6 / 67108864 * h * (1 + c.h3 / 67108864 * h)));
    h = h * (1 - c.h1 * h / 524288);

    if (h > 100) {
      h = 100;
    } else if (h < 0) {
      h = 0;
    }

    return h;
  }

  compensatePressure (adcP: number, tFine: number) {
    const c = this._coefficients;
    if (!c) return;

    let var1 = tFine / 2 - 64000;
    let var2 = var1 * var1 * c.p6 / 32768;
    var2 = var2 + var1 * c.p5 * 2;
    var2 = (var2 / 4) + (c.p4 * 65536);
    var1 = (c.p3 * var1 * var1 / 524288 + c.p2 * var1) / 524288;
    var1 = (1 + var1 / 32768) * c.p1;

    if (var1 === 0) {
      return 0; // Évite une erreur d'une divison par 0.
    }

    let p = 1048576 - adcP;
    p = (p - (var2 / 4096)) * 6250 / var1;
    var1 = c.p9 * p * p / 2147483648;
    var2 = p * c.p8 / 32768;
    p = p + (var1 + var2 + c.p7) / 16;

    return p;
  }

  compensateRawData (rawData: Bme280ReadResponse) {
    const tFine = this.compensateTemperature(rawData.temperature) as number;

    let pressure = this.compensatePressure(rawData.pressure, tFine);
    let humidity = this.compensateHumidity(rawData.humidity, tFine);

    let temperature: number | undefined = tFine / 5120;
    if (this._opts.temperatureOversampling === OVERSAMPLE.SKIPPED) {
      temperature = undefined;
    }

    if (pressure) pressure /= 100;
    if (this._opts.pressureOversampling === OVERSAMPLE.SKIPPED) {
      pressure = undefined;
    }

    if (this._opts.humidityOversampling === OVERSAMPLE.SKIPPED) {
      humidity = undefined;
    }

    return {
      temperature,
      pressure,
      humidity
    };
  }

  async read () {
    const rawData = await this.readRawData();
    const compensatedRawData = this.compensateRawData(rawData);

    return compensatedRawData;
  }

  async triggerForcedMeasurement () {
    let ctrlMeas;
    let mode;
    const TRIES = 5;

    ctrlMeas = await this.readByte(REGS.CTRL_MEAS);
    mode = (ctrlMeas & CTRL_MEAS.MODE_MASK) >> CTRL_MEAS.MODE_POS;

    if (mode === MODE.NORMAL) {
      throw new Error(
        "'triggerForcedMeasurement' ne peut être invoqué en mode normal."
      );
    }

    // Si une messure forcé est en cours, la laisser
    // se terminer avant de continuer.
    for (let i = 1; i <= TRIES && mode !== MODE.SLEEP; ++i) {
      const millis = Math.ceil(
        this.maximumMeasurementTime() / TRIES
      );

      await delay(millis);
      
      ctrlMeas = await this.readByte(REGS.CTRL_MEAS);
      mode = (ctrlMeas & CTRL_MEAS.MODE_MASK) >> CTRL_MEAS.MODE_POS;
    }

    if (mode !== MODE.SLEEP) {
      throw new Error(
        "Erreur lors de l'exécution d'une mesure forcée"
        + ", le capteur n'est pas en mode 'SLEEP'."
      );
    }

    await this.writeByte(
      REGS.CTRL_MEAS,
      (ctrlMeas & ~CTRL_MEAS.MODE_MASK) |
      (MODE.FORCED << CTRL_MEAS.MODE_POS)
    );
  }

  typicalMeasurementTime () {
    const to = this._opts.temperatureOversampling;
    const po = this._opts.pressureOversampling;
    const ho = this._opts.humidityOversampling;

    return Math.ceil(1 +
      (to === OVERSAMPLE.SKIPPED ? 0 : 2 * Math.pow(2, to - 1)) +
      (po === OVERSAMPLE.SKIPPED ? 0 : 2 * Math.pow(2, po - 1) + 0.5) +
      (ho === OVERSAMPLE.SKIPPED ? 0 : 2 * Math.pow(2, ho - 1) + 0.5));
  }

  maximumMeasurementTime () {
    const to = this._opts.temperatureOversampling;
    const po = this._opts.pressureOversampling;
    const ho = this._opts.humidityOversampling;

    return Math.ceil(1.25 +
      (to === OVERSAMPLE.SKIPPED ? 0 : 2.3 * Math.pow(2, to - 1)) +
      (po === OVERSAMPLE.SKIPPED ? 0 : 2.3 * Math.pow(2, po - 1) + 0.575) +
      (ho === OVERSAMPLE.SKIPPED ? 0 : 2.3 * Math.pow(2, ho - 1) + 0.575));
  }

  close () {
    return this._i2cBus.close();
  }
}

class Bme280 {
  private _bme280I2c: Bme280I2c;

  constructor(bme280I2c: Bme280I2c) {
    this._bme280I2c = bme280I2c;
  }

  read() {
    return this._bme280I2c.read();
  }

  triggerForcedMeasurement() {
    return this._bme280I2c.triggerForcedMeasurement();
  }

  typicalMeasurementTime() {
    return this._bme280I2c.typicalMeasurementTime();
  }

  maximumMeasurementTime() {
    return this._bme280I2c.maximumMeasurementTime();
  }

  close() {
    return this._bme280I2c.close();
  }
}

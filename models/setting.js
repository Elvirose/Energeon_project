const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  email: { type: String },
  fan_power: { type: Number },
  bulb_power: { type: Number },
  tv_power: { type: Number },
  wash_power: { type: Number },
  ironbox_power: { type: Number },
  refrigerator_power: { type: Number },
  heater_power: { type: Number },
  oven_power: { type: Number },
  ac_power: { type: Number },
  device1_power: { type: Number },
  device2_power: { type: Number },
  device3_power: { type: Number },
  fan_quantity: { type: Number },
  bulb_quantity: { type: Number },
  tv_quantity: { type: Number },
  wash_quantity: { type: Number },
  ironbox_quantity: { type: Number },
  refrigerator_quantity: { type: Number },
  heater_quantity: { type: Number },
  oven_quantity: { type: Number },
  ac_quantity: { type: Number },
  device1_quantity: { type: Number },
  device2_quantity: { type: Number },
  device3_quantity: { type: Number },
});

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;

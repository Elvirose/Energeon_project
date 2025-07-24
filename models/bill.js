const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  email: { type: String },
  yearMonth: { type: String },
  targetBill: { type: Number },
  estimatedBill: { type: Number },
  actualBill: { type: Number },
});

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;

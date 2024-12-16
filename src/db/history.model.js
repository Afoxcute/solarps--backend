const mongoose = require("mongoose");

const history = new mongoose.Schema(
  {
    accountId: { type: String, default: "" },
    betType: { type: String, default: "" },
    betAmount: { type: Number, default: 0 },
    win: { type: Number, default: 0 },
    tx: { type: String, default: "" },
  },
  { timestamps: true }
)
module.exports = new mongoose.model('histories', history)
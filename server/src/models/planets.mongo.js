const { Schema, default: mongoose } = require("mongoose");

const planetsSchema = new Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Planet", planetsSchema);

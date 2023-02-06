const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;
mongoose.connection.once("open", () => {
  console.log("Mongo DB connection established");
});
mongoose.connection.on("error", (error) => {
  console.error(error);
});

mongoose.set("strictQuery", false);

async function mongoConnect() {
  mongoose.connect(MONGO_URL);
}
async function mongoDisconnect() {
  mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};

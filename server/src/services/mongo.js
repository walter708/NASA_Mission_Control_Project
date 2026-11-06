const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connection.once("open", () => {
  console.log("Mongo DB connection established");
});
mongoose.connection.on("error", (error) => {
  console.error(error);
});

mongoose.set("strictQuery", false);

async function mongoConnect() {
  const mongoUrl = process.env.MONGO_URL;
  if (process.env.NODE_ENV === "test" || process.env.EVALUATION_MODE === "true") {
    const expectedDatabase = process.env.NODE_ENV === "test" ? "/nasa_test" : "/nasa_evaluation";
    let url;
    try {
      url = new URL(mongoUrl);
    } catch {
      throw new Error("Evaluation and tests require a local disposable MongoDB URL");
    }
    if (
      url.protocol !== "mongodb:" ||
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      url.pathname !== expectedDatabase ||
      url.username || url.password || url.search || url.hash
    ) {
      throw new Error(`Evaluation and tests require local MongoDB database ${expectedDatabase}`);
    }
  }
  if (!mongoUrl) throw new Error("MONGO_URL is required; see server/.env.example");
  return mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 10000 });
}
async function mongoDisconnect() {
  return mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};

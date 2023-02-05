const http = require("http");
require("dotenv").config();

const { mongoConnect } = require("./services/mongo");
const app = require("./app");

const { loadPlanets } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

async function startServer() {
  await mongoConnect();
  await loadPlanets();
  await loadLaunchesData();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

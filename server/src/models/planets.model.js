const { parse } = require("csv-parse");
const fs = require("fs");
const planets = require("./planets.mongo");

const checkHabitation = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};

function loadPlanets() {
  return new Promise((resolve, rejects) => {
    fs.createReadStream("./data/kepler_data.csv")
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (checkHabitation(data)) {
          // TODO change create with insert + update = upsert
          await savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        rejects();
      })
      .on("end", async () => {
        const countOfHabitablePlanet = (await getAllPlanets()).length;
        console.log(
          `There are ${countOfHabitablePlanet} habitable planets available as of now!`
        );
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find(
    {},
    {
      __v: 0,
      _id: 0,
    }
  );
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.log("Error");
  }
}
module.exports = {
  loadPlanets,
  getAllPlanets,
};

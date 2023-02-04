const { rejects } = require("assert");
const { parse } = require("csv-parse");
const fs = require("fs");
const { resolve } = require("path");
const habitablePlanents = [];

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
      .on("data", (data) => {
        if (checkHabitation(data)) {
          habitablePlanents.push(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        rejects();
      })
      .on("end", () => {
        console.log(
          `There are ${habitablePlanents.length} habitable planets available as of now!`
        );
        // console.log("Closed");
        resolve();
      });
  });
}

function getAllPlanets() {
  return habitablePlanents;
}

module.exports = {
  loadPlanets,
  getAllPlanets,
};

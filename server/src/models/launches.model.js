const axios = require("axios");

const launchesCollections = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function getLatestFlightNumber() {
  try {
    const latestFlightNumber = await launchesCollections
      .findOne()
      .sort("-flightNumber");
    if (!latestFlightNumber) {
      return DEFAULT_FLIGHT_NUMBER;
    } else {
      return Number(latestFlightNumber.flightNumber);
    }
  } catch (err) {
    console.log(err);
  }
}

async function fetchLaunch(filter) {
  return await launchesCollections.findOne(filter);
}

async function exitingLaunchWithId(launchId) {
  return await fetchLaunch({
    flightNumber: launchId,
  });
}

// {
//   "flightNumber": 100, // flight_number
//   "customers": [
//       "ZTM",
//       "NASA"],
//   "launchDate": "2030-12-27T05:00:00.000Z", // date_local
//   "mission": "Kepler Exploration X", // name
//   "rocket": "Explorer IS1", // rocket.name
//   "success": false, // success
//   "target": "Kepler-452 b", // Not applicable
//   "upcoming": false // upcoming
// },

async function populateLaunches() {
  console.log("Downloading Launches...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: { name: 1 },
        },
        {
          path: "payloads",
          select: { customers: 1 },
        },
      ],
    },
  });

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launchDate = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      launchDate: launchDoc["date_local"],
      rocket: launchDoc["rocket"]["name"],
      success: launchDoc["success"],
      upcoming: launchDoc["upcoming"],
      customers: customers,
    };

    console.log(launchDate["flightNumber"], launchDate["mission"]);
    saveLaunch(launchDate);
  }
  console.log("Data from SpaceX API downloaded");
}

async function loadLaunchesData() {
  const hasLoadedLaunches = await fetchLaunch({
    flightNumber: 1,
    mission: "FalconSat",
    rocket: "Falcon 1",
  });

  if (hasLoadedLaunches) {
    console.log("SpaceX launches already loaded");
    return;
  } else {
    await populateLaunches();
  }
}

async function saveLaunch(launch) {
  await launchesCollections.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function getAllLaunches(skip, limit) {
  try {
    return await launchesCollections
      .find({}, { _id: 0, __v: 0 })
      .sort({ flightNumber: 1 })
      .skip(skip)
      .limit(limit);
  } catch (err) {
    console.log(err);
  }
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({ keplerName: launch.target });
  if (!planet) {
    throw new Error("Targert Planet not found");
  }
  const latestFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero To Mastery", "NASA"],
    flightNumber: latestFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesCollections.updateOne(
    {
      flightNumber: launchId,
    },
    {
      success: false,
      upcoming: false,
    }
  );
  return aborted.modifiedCount === 1;
}

module.exports = {
  exitingLaunchWithId,
  getAllLaunches,
  loadLaunchesData,
  scheduleNewLaunch,
  abortLaunchById,
};

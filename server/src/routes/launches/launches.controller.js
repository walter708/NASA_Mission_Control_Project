const {
  exitingLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
} = require("../../models/launches.model");
const { getPagnation } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  console.log(req.query.page, req.query.limit);
  const { skip, limit } = getPagnation(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunches(req, res) {
  launch = req.body;
  if (
    !launch.mission ||
    !launch.launchDate ||
    !launch.target ||
    !launch.rocket
  ) {
    return res.status(400).json({
      error: "Missing a launch property",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid Date value",
    });
  }

  await scheduleNewLaunch(launch);

  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = +req.params.id;

  // if it does not exist
  const exitingLaunch = await exitingLaunchWithId(launchId);
  if (!exitingLaunch) {
    return res.status(404).json({
      error: `Launch with id ${launchId} not found`,
    });
  }

  // if it does exist
  const abotedLaunch = abortLaunchById(launchId);
  if (!abotedLaunch) {
    return res.status(400).json({
      error: "Failed to abort",
    });
  }
  return res.status(200).json({
    message: "ok",
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunches,
  httpAbortLaunch,
};

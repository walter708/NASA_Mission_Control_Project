const {
  getAllLaunches,
  addNewLaunches,
  exitingLaunchWithId,
  abortLaunchById,
} = require("../../models/launches.model");

function httpGetAllLaunches(req, res) {
  return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunches(req, res) {
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

  addNewLaunches(launch);

  return res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
  const launchId = +req.params.id;

  // if it does not exist
  if (!exitingLaunchWithId(launchId)) {
    return res.status(404).json({
      error: `Launch with id ${launchId} not found`,
    });
  }

  // if it does exist
  const abotedLaunch = abortLaunchById(launchId);
  return res.status(200).json(abotedLaunch);
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunches,
  httpAbortLaunch,
};

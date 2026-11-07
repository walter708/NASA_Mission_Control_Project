const assert = require("node:assert/strict");
const { appendFileSync } = require("node:fs");
const request = require("supertest");
const app = require("../src/app");
const launches = require("../src/models/launches.mongo");
const { mongoConnect, mongoDisconnect } = require("../src/services/mongo");

async function reproduceAbort() {
  assert.equal(process.env.EVALUATION_MODE, "true");
  await mongoConnect();
  const flightNumber = 9001;
  const filter = { flightNumber };
  const api = request(app);
  const updateOne = launches.updateOne;
  let releaseWrite;
  const waitForRelease = new Promise((resolve) => {
    releaseWrite = resolve;
  });
  let write;

  try {
    await launches.create({
      flightNumber,
      mission: "Disposable abort check",
      rocket: "Example rocket",
      launchDate: new Date("2035-01-01T00:00:00Z"),
      upcoming: true,
      success: true,
    });
    launches.updateOne = (...args) => {
      write = waitForRelease.then(() => updateOne.apply(launches, args));
      return write;
    };
    const earlyResponse = await api.delete(`/v1/launches/${flightNumber}`).timeout(5000);
    assert.equal(earlyResponse.status, 200);
    assert.ok(write, "The abort should have initiated a write");
    const list = await api.get("/v1/launches").expect(200);
    assert.equal(list.body.find((launch) => launch.flightNumber === flightNumber).upcoming, true);

    releaseWrite();
    assert.equal((await write).modifiedCount, 1);
    const updatedList = await api.get("/v1/launches").expect(200);
    const aborted = updatedList.body.find((launch) => launch.flightNumber === flightNumber);
    assert.equal(aborted.upcoming, false);
    assert.equal(aborted.success, false);

    // Issue the same abort again without holding the write. Capture the real MongoDB result.
    launches.updateOne = (...args) => {
      write = updateOne.apply(launches, args).exec();
      return write;
    };
    const repeatedResponse = await api.delete(`/v1/launches/${flightNumber}`).timeout(5000);
    assert.equal(repeatedResponse.status, 200);
    const repeatedWrite = await write;
    assert.equal(repeatedWrite.matchedCount, 1);
    assert.equal(repeatedWrite.modifiedCount, 0);

    const results = [
      "### Abort bug reproduced with real MongoDB",
      "",
      "- With the write held, DELETE returned 200 and the immediate GET still showed the mission as upcoming.",
      "- After releasing the write, MongoDB modified one record and GET showed upcoming=false and success=false.",
      "- A repeat DELETE returned 200 while MongoDB matched one record and modified zero.",
      "",
    ].join("\n");
    console.log(results);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, results);
    }
  } finally {
    releaseWrite();
    if (write) await write.catch(() => {});
    launches.updateOne = updateOne;
    await launches.deleteOne(filter);
    await mongoDisconnect();
  }
}

reproduceAbort().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

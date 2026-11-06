const assert = require("node:assert/strict");

async function smoke() {
  const base = "http://127.0.0.1:8000";
  let response;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      response = await fetch(`${base}/v1/planets`);
      if (response.ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  assert(response && response.ok, "API did not start within 60 seconds");
  const planets = await response.json();
  assert(planets.some((planet) => planet.keplerName === "Kepler-1649 b"));
  const launchesResponse = await fetch(`${base}/v1/launches`);
  assert.equal(launchesResponse.status, 200);
  const launches = await launchesResponse.json();
  assert.equal(launches.length, 3, "Fresh evaluation DB should contain only example launches");
  assert(launches.every((launch) => launch.mission.startsWith("Example ")));
  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<html/i);
  console.log("PASS: API startup, bundled planets, example launch data, and HTML without internet access");
}

smoke().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

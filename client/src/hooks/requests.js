const BASE_API_URL = "http://localhost:3001/v1";
async function httpGetPlanets() {
  // Load planets and return as JSON.
  const response = await fetch(`${BASE_API_URL}/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.

  const response = await fetch(`${BASE_API_URL}/launches`);
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
}
async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    return fetch(`${BASE_API_URL}/launches`, {
      method: "POST",
      body: JSON.stringify(launch),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return {
      ok: false,
    };
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    return fetch(`${BASE_API_URL}/launches/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.log(error);
    return {
      ok: false,
    };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };

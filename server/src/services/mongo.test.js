const mongoose = require("mongoose");
const { mongoConnect } = require("./mongo");

describe("Disposable database safety", () => {
  const originalUrl = process.env.MONGO_URL;
  afterEach(() => {
    process.env.MONGO_URL = originalUrl;
    jest.restoreAllMocks();
  });

  test.each([
    "mongodb+srv://example.invalid/nasa_test",
    "mongodb://example.invalid/nasa_test",
    "mongodb://127.0.0.1:27017/production",
    "mongodb://127.0.0.1:27017/nasa_test?replicaSet=production",
    "mongodb://user:password@localhost/nasa_test",
  ])("rejects unsafe test configuration: %s", async (url) => {
    const connect = jest.spyOn(mongoose, "connect");
    process.env.MONGO_URL = url;
    await expect(mongoConnect()).rejects.toThrow(/local/);
    expect(connect).not.toHaveBeenCalled();
  });

  test("waits for the local database connection", async () => {
    let finish;
    jest.spyOn(mongoose, "connect").mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    let connected = false;
    const connection = mongoConnect().then(() => { connected = true; });
    await Promise.resolve();
    expect(connected).toBe(false);
    finish();
    await connection;
    expect(connected).toBe(true);
  });
});

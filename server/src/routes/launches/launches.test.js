const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanets } = require("../../models/planets.model");
describe("Test Launch API", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanets();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("should return 200 ok", async () => {
      response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "Exploring Procrations",
      rocket: "USS Mavin",
      target: "Kepler-1649 b",
      launchDate: "January 4, 2028",
    };
    const launchDataWithoutDate = {
      mission: "Exploring Procrations",
      rocket: "USS Mavin",
      target: "Kepler-1649 b",
    };

    const launchDataWithInvalidDate = {
      mission: "Exploring Procrations",
      rocket: "USS Mavin",
      target: "Kepler-1649 b",
      launchDate: "Hi",
    };
    test("should return 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);
      const responseDate = new Date(response.body.launchDate).valueOf();
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("should return 'Missing a launch property' ", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Missing a launch property",
      });
    });

    test("should return 'invalid date' ", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({ error: "Invalid Date value" });
    });
  });
});

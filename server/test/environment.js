// Never inherit a developer's .env or CI database secret for API tests.
process.env.NODE_ENV = "test";
process.env.EVALUATION_MODE = "true";
process.env.MONGO_URL = "mongodb://127.0.0.1:27017/nasa_test";
process.env.LAUNCH_DATA_SOURCE = "fixture";

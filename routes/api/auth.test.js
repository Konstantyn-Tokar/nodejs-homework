const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();

const app = require("../../app");
const { User } = require("../../models");

const { DB_HOST_TEST } = process.env;

describe("test auth", () => {
  let server;
  beforeAll(() => (server = app.listen(3000)));
  afterAll(() => server.close());

  beforeEach((done) => {
    mongoose.connect(DB_HOST_TEST).then(() => done());
  });

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(() => done());
    });
  });

  test("test signup route", async () => {
    const registerUser = {
      name: "Ms. Smith",
      email: "superkiller@purpose.shot",
      password: "123456789",
    };
    const response = await request(app)
      .post("/api/auth/signup")
      .setEncoding(registerUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Signup successs");

    const user = await User.findById(response.body._id);
    expect(user).toByThruthy();
    expect(user.name).toBe(registerUser.name);
    expect(user.email).toBe(registerUser.email);
  });
});

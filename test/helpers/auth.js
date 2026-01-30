const request = require("supertest");
const { app } = require("../../src/app");

async function loginAndGetToken() {
  const res = await request(app)
    .post("/auth/login")
    .send({ username: "admin", password: "admin123" })
    .expect(200);

  return res.body.token;
}

module.exports = { loginAndGetToken };

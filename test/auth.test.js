require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const { app } = require("../src/app");

describe("Auth /auth/login", () => {
    test("login OK devuelve token", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ username: "admin", password: "admin123" })
            .expect(200);

        expect(typeof res.body.token).toBe("string");
        expect(res.body.token.length).toBeGreaterThan(10);
    });

    test("login inválido devuelve 401", async () => {
        await request(app)
            .post("/auth/login")
            .send({ username: "admin", password: "bad" })
            .expect(401);
    });

    test("validación Joi: falta password => 400", async () => {
        await request(app)
            .post("/auth/login")
            .send({ username: "admin" })
            .expect(400);
    });
});

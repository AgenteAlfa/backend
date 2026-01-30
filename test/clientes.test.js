require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const { app } = require("../src/app");
const { loginAndGetToken } = require("./helpers/auth");

describe("Clientes", () => {
    let token;
    let createdId;

    beforeAll(async () => {
        token = await loginAndGetToken();
    });

    test("GET /clientes sin token => 401", async () => {
        await request(app).get("/clientes").expect(401);
    });

    test("POST /clientes crea cliente", async () => {
        const res = await request(app)
            .post("/clientes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre_cliente: "Test Cliente",
                telefono_cliente: "912345678",
                email_cliente: "test_cliente@correo.com"
            })
            .expect(201);

        expect(res.body.id_cliente).toBeTruthy();
        expect(res.body.activo_cliente).toBe(1);
        createdId = res.body.id_cliente;
    });

    test("GET /clientes/:id devuelve cliente", async () => {
        const res = await request(app)
            .get(`/clientes/${createdId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body.id_cliente).toBe(createdId);
    });

    test("PUT /clientes/:id actualiza", async () => {
        const res = await request(app)
            .put(`/clientes/${createdId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ nombre_cliente: "Test Cliente Updated" })
            .expect(200);

        expect(res.body.nombre_cliente).toBe("Test Cliente Updated");
    });

    test("DELETE /clientes/:id hace borrado lógico", async () => {
        await request(app)
            .delete(`/clientes/${createdId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);

        // getById filtra activos => ahora debe dar 404
        await request(app)
            .get(`/clientes/${createdId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });
});

require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const { app } = require("../src/app");
const { loginAndGetToken } = require("./helpers/auth");

describe("Citas", () => {
    let token;
    let clienteId;
    let citaId;

    beforeAll(async () => {
        token = await loginAndGetToken();

        // crea un cliente activo para colgar citas
        const c = await request(app)
            .post("/clientes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre_cliente: "Cliente Citas",
                telefono_cliente: "987654321",
                email_cliente: "cliente_citas@correo.com"
            })
            .expect(201);

        clienteId = c.body.id_cliente;
    });

    test("POST /citas crea cita (default pendiente)", async () => {
        const res = await request(app)
            .post("/citas")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fecha_cita: new Date().toISOString(),
                cliente_cita: clienteId
            })
            .expect(201);

        expect(res.body.id_cita).toBeTruthy();
        expect(res.body.estado).toBe("pendiente");
        citaId = res.body.id_cita;
    });

    test("PUT /citas/:id cambia estado a confirmada", async () => {
        const res = await request(app)
            .put(`/citas/${citaId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ estado: "confirmada" })
            .expect(200);

        expect(res.body.estado).toBe("confirmada");
    });

    test("GET /citas/estado/confirmada devuelve lista", async () => {
        const res = await request(app)
            .get("/citas/estado/confirmada")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });

    test("DELETE /citas/:id marca rechazado", async () => {
        await request(app)
            .delete(`/citas/${citaId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);

        const res = await request(app)
            .get(`/citas/${citaId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body.estado).toBe("rechazado");
    });
});

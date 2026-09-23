const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");
const { createApp, codeMatches } = require("../app");
const configuration = require("../config/env");
const defineModels = require("../db/models");
const mysqlUrl = process.env.SISMED_TEST_MYSQL_URL;
if (mysqlUrl) {
  const u = new URL(mysqlUrl);
  if (u.protocol !== "mysql:" || !u.pathname.endsWith("_test"))
    throw new Error("Usar una base MySQL vacía cuyo nombre termine en _test.");
}
const sequelize = mysqlUrl
  ? new Sequelize(mysqlUrl, { logging: false, timezone: "+00:00" })
  : new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      dialectModule: require("./sqlite-adapter"),
    });
const db = defineModels(sequelize);
const settings = {
  secret: "isolated-test-secret-at-least-32-characters-long",
  origins: ["http://localhost:3000"],
  registrationCode: "test-invite",
};
const app = createApp(db, settings);
let adminToken, staffToken, shiftId;
const date = new Date(
  Math.ceil((Date.now() + 86400000) / 1800000) * 1800000,
).toISOString();
const auth = (token) => ({ Authorization: `Bearer ${token}` });
before(async () => {
  // Refuse to modify any pre-existing database, even when explicitly given a test URL.
  assert.equal(
    (await sequelize.getQueryInterface().showAllTables()).length,
    0,
    "La base de pruebas debe estar vacía.",
  );
  await require("../db/migrations/001-initial")(sequelize.getQueryInterface());
  await db.User.create({
    name: "Prueba",
    lastname: "Administrador",
    email: "admin@example.test",
    password: await bcrypt.hash("test-password-1234", 4),
    role_id: 1,
  });
});
after(() => sequelize.close());
test("configuration refuses a missing/short signing secret", () => {
  assert.throws(() => configuration({}), /JWT_SECRET/);
  assert.equal(codeMatches("wrong", "test-invite"), false);
  assert.equal(codeMatches("", ""), false);
});
test("patients and appointment data require authentication", async () => {
  await request(app).get("/api/patient/search?dni=12345678").expect(401);
  await request(app).get("/api/shift/estado-turnos").expect(401);
  await request(app).get("/api/doctor/list").set(auth("invalid")).expect(401);
});
test("registration requires invitation and cannot self-assign administrator", async () => {
  const values = {
    nombre: "Recepción",
    apellido: "Prueba",
    email: "staff@example.test",
    password: "test-password-1234",
    role: 1,
  };
  await request(app)
    .post("/api/user/Registro-usuario")
    .send(values)
    .expect(403);
  await request(app)
    .post("/api/user/Registro-usuario")
    .send({ ...values, registrationCode: "test-invite" })
    .expect(201);
  assert.equal(
    (await db.User.findOne({ where: { email: values.email } })).role_id,
    2,
  );
});
test("login, own profile and roles work without exposing password", async () => {
  await request(app)
    .post("/api/user/login")
    .send({ email: "admin@example.test", password: "incorrect" })
    .expect(401);
  adminToken = (
    await request(app)
      .post("/api/user/login")
      .send({ email: "admin@example.test", password: "test-password-1234" })
      .expect(200)
  ).body.token;
  staffToken = (
    await request(app)
      .post("/api/user/login")
      .send({ email: "staff@example.test", password: "test-password-1234" })
      .expect(200)
  ).body.token;
  const profile = (
    await request(app)
      .get("/api/user/profile")
      .set(auth(adminToken))
      .expect(200)
  ).body.user;
  assert.equal(profile.password, undefined);
  assert.equal(profile.role.name, "Administrador");
  await request(app).get("/api/user/99999").set(auth(adminToken)).expect(403);
});
test("patient fields support real phone/address formats and duplicate DNI is rejected", async () => {
  const patient = {
    dni: "12345678",
    name: "Paciente",
    lastname: "Prueba",
    phone: "+54 11 5555-0000",
    street: "Calle de prueba 100",
    location: "Bella Vista",
  };
  await request(app)
    .post("/api/patient/createPatient")
    .set(auth(staffToken))
    .send({ ...patient, dni: "bad" })
    .expect(422);
  await request(app)
    .post("/api/patient/createPatient")
    .set(auth(staffToken))
    .send(patient)
    .expect(201);
  await request(app)
    .post("/api/patient/createPatient")
    .set(auth(staffToken))
    .send(patient)
    .expect(409);
  const result = await request(app)
    .get("/api/patient/search?dni=12345678")
    .set(auth(staffToken))
    .expect(200);
  assert.equal(result.body.patient.phone, patient.phone);
});
test("only admins create doctors and two doctors can share a specialty", async () => {
  const values = {
    tuition: "MP-100",
    name: "Médico",
    lastname: "Prueba",
    specialty: 1,
  };
  await request(app)
    .post("/api/doctor/createDoctor")
    .set(auth(staffToken))
    .send(values)
    .expect(403);
  await request(app)
    .post("/api/doctor/createDoctor")
    .set(auth(adminToken))
    .send(values)
    .expect(201);
  await request(app)
    .post("/api/doctor/createDoctor")
    .set(auth(adminToken))
    .send({ ...values, tuition: "MP-200" })
    .expect(201);
  assert.equal(
    (
      await request(app)
        .get("/api/doctor/list")
        .set(auth(staffToken))
        .expect(200)
    ).body.length,
    2,
  );
});
test("booking validates dates/references and enforces concurrent per-doctor uniqueness", async () => {
  const booking = { paciente_id: "12345678", doctor_id: "MP-100", fecha: date };
  await request(app)
    .post("/api/shift/create")
    .set(auth(staffToken))
    .send({ ...booking, fecha: "2020-01-01T09:00:00Z" })
    .expect(422);
  await request(app)
    .post("/api/shift/create")
    .set(auth(staffToken))
    .send({ ...booking, paciente_id: "99999999" })
    .expect(422);
  const results = await Promise.all(
    [1, 2].map(() =>
      request(app)
        .post("/api/shift/create")
        .set(auth(staffToken))
        .send(booking),
    ),
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
  shiftId = results.find((r) => r.status === 201).body.shift.id;
  await request(app)
    .post("/api/shift/create")
    .set(auth(staffToken))
    .send({ ...booking, doctor_id: "MP-200" })
    .expect(201);
});
test("list includes patient/doctor/specialty without extra requests", async () => {
  const result = await request(app)
    .get("/api/shift/estado-turnos")
    .set(auth(staffToken))
    .expect(200);
  assert.equal(result.body.length, 2);
  assert.equal(result.body[0].patient.DNI, "12345678");
  assert.equal(result.body[0].specialty.name, "Clínica médica");
  const future = new Date(new Date(date).getTime() + 86400000).toISOString();
  assert.equal(
    (
      await request(app)
        .get(`/api/shift/estado-turnos?from=${encodeURIComponent(future)}`)
        .set(auth(staffToken))
        .expect(200)
    ).body.length,
    0,
  );
});
test("cancellation is repeatable, preserves record and frees only its slot", async () => {
  await request(app)
    .put(`/api/shift/cambiar-estado/${shiftId}`)
    .set(auth(staffToken))
    .expect(200);
  await request(app)
    .put(`/api/shift/cambiar-estado/${shiftId}`)
    .set(auth(staffToken))
    .expect(200);
  const cancelled = await db.Shift.findByPk(shiftId);
  assert.equal(cancelled.estado_turno, false);
  assert.equal(cancelled.active_slot, null);
  await request(app)
    .post("/api/shift/create")
    .set(auth(staffToken))
    .send({ paciente_id: "12345678", doctor_id: "MP-100", fecha: date })
    .expect(201);
});
test("logout revokes server session and unknown routes are JSON 404", async () => {
  await request(app).post("/api/user/logout").set(auth(staffToken)).expect(200);
  await request(app).get("/api/user/profile").set(auth(staffToken)).expect(401);
  await request(app)
    .get("/no-such-route")
    .expect(404)
    .expect("Content-Type", /json/);
});

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const { createApp } = require('../app');
const mysqlUrl = process.env.SISMED_CLINICAL_TEST_MYSQL_URL;
if (mysqlUrl && !new URL(mysqlUrl).pathname.endsWith('_test')) throw new Error('Usar una base vacía terminada en _test');
const sequelize = mysqlUrl ? new Sequelize(mysqlUrl, { logging: false, timezone: '+00:00' }) : new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false, dialectModule: require('./sqlite-adapter') });
const db = require('../db/models')(sequelize);
const app = createApp(db, { secret: 'clinical-test-only-32-characters-secret', origins: [], registrationCode: 'invite' });
const tokens = {};
const headers = role => ({ Authorization: `Bearer ${tokens[role]}` });
let doctorUser;
const note = { reason: 'Control de prueba', history: 'Datos ficticios', assessment: '', diagnosis: '', plan: '', occurred_at: '2026-01-01T12:00:00Z', request_id: '6d49406e-229a-40c7-8013-a85647ab0101' };
before(async () => {
  assert.equal((await sequelize.getQueryInterface().showAllTables()).length, 0, 'La base debe estar vacía');
  await require('../db/migrations/001-initial')(sequelize.getQueryInterface());
  await sequelize.query('CREATE TABLE sismed_migrations (name VARCHAR(100) PRIMARY KEY)');
  await require('../db/migrations/002-clinical')(sequelize);
  await require('../db/migrations/002-clinical')(sequelize);
  await db.Doctor.create({ tuition: 'MP-CLINIC', name: 'Doctora', lastname: 'Prueba', specialties_id: 1 });
  await db.Patient.create({ DNI: '12345678', name: 'Paciente', lastname: 'Ficticio', phone: '1234', street: 'Prueba', location: 'Prueba' });
  for (const role of ['admin', 'staff', 'doctor']) {
    const u = await db.User.create({ name: role, lastname: 'Test', email: `${role}@example.test`, password: await bcrypt.hash('password-test-123', 4), role_id: role === 'admin' ? 1 : 2 });
    if (role === 'doctor') doctorUser = u.id;
    tokens[role] = (await request(app).post('/api/user/login').send({ email: u.email, password: 'password-test-123' }).expect(200)).body.token;
  }
});
after(() => sequelize.close());
test('clinical history rejects anonymous, reception and administrator', async () => {
  await request(app).get('/api/clinical/patients/12345678').expect(401);
  for (const role of ['admin', 'staff', 'doctor']) {
    await request(app).get('/api/clinical/patients/12345678').set(headers(role)).expect(403);
    await request(app).post('/api/clinical/patients/12345678/entries').set(headers(role)).send(note).expect(403);
  }
});
test('only admin can grant clinical access; grant revokes old session', async () => {
  const path = `/api/clinical/accounts/${doctorUser}`;
  await request(app).put(path).set(headers('staff')).send({ doctor_id: 'MP-CLINIC', enabled: true }).expect(403);
  await request(app).put('/api/clinical/accounts/1').set(headers('admin')).send({ doctor_id: 'MP-CLINIC', enabled: true }).expect(422);
  await request(app).put(path).set(headers('admin')).send({ doctor_id: 'MP-CLINIC', enabled: true }).expect(200);
  await request(app).get('/api/clinical/patients/12345678').set(headers('doctor')).expect(401);
  tokens.doctor = (await request(app).post('/api/user/login').send({ email: 'doctor@example.test', password: 'password-test-123' }).expect(200)).body.token;
});
test('clinical validation rejects empty notes, future dates and unknown patients', async () => {
  const path = '/api/clinical/patients/12345678/entries';
  await request(app).post(path).set(headers('doctor')).send({ ...note, reason: '   ' }).expect(422);
  await request(app).post(path).set(headers('doctor')).send({ ...note, occurred_at: '2999-01-01T12:00:00Z' }).expect(422);
  await request(app).post(path).set(headers('doctor')).send({ ...note, history: 'x'.repeat(3001) }).expect(422);
  await request(app).post('/api/clinical/patients/99999999/entries').set(headers('doctor')).send(note).expect(404);
});
test('notes persist with trusted authorship, replay is idempotent, reads are audited', async () => {
  const path = '/api/clinical/patients/12345678/entries';
  const created = await request(app).post(path).set(headers('doctor')).send({ ...note, author_id: 1, author_name: 'Forged', doctor_id: 'Forged' }).expect(201);
  assert.equal(created.body.entry.author_id, doctorUser);
  assert.equal(created.body.entry.author_name, 'Doctora Prueba');
  await request(app).post(path).set(headers('doctor')).send(note).expect(200);
  assert.equal(await db.ClinicalEntry.count(), 1);
  await request(app).post(path).set(headers('doctor')).send({ ...note, reason: 'Changed' }).expect(409);
  const result = await request(app).get('/api/clinical/patients/12345678').set(headers('doctor')).expect(200);
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.equal(result.body.entries[0].reason, note.reason);
  assert.equal(await db.ClinicalAudit.count({ where: { action: 'create_entry' } }), 1);
  assert.equal(await db.ClinicalAudit.count({ where: { action: 'read_history' } }), 1);
  await request(app).delete(`${path}/${created.body.entry.id}`).set(headers('doctor')).expect(404);
  await request(app).put(`${path}/${created.body.entry.id}`).set(headers('doctor')).send(note).expect(404);
});
test('history paginates without losing entries and disabled access is revoked', async () => {
  for (let i = 0; i < 21; i++) await db.ClinicalEntry.create({ ...note, request_id: require('crypto').randomUUID(), patient_id: '12345678', doctor_id: 'MP-CLINIC', author_id: doctorUser, author_name: 'Prueba', created_at: new Date() });
  const first = (await request(app).get('/api/clinical/patients/12345678').set(headers('doctor')).expect(200)).body;
  assert.equal(first.entries.length, 20);
  const second = (await request(app).get(`/api/clinical/patients/12345678?before=${first.next}`).set(headers('doctor')).expect(200)).body;
  assert.equal(second.entries.length, 2);
  assert.equal(second.next, null);
  await request(app).put(`/api/clinical/accounts/${doctorUser}`).set(headers('admin')).send({ doctor_id: 'MP-CLINIC', enabled: false }).expect(200);
  await request(app).get('/api/clinical/patients/12345678').set(headers('doctor')).expect(401);
  tokens.doctor = (await request(app).post('/api/user/login').send({ email: 'doctor@example.test', password: 'password-test-123' }).expect(200)).body.token;
  await request(app).get('/api/clinical/patients/12345678').set(headers('doctor')).expect(403);
});

test('admin creates individual professional accounts without public invitation', async () => {
  await db.Doctor.create({ tuition: 'MP-NEW', name: 'Nueva', lastname: 'Doctora', specialties_id: 1 });
  const value = { doctor_id: 'MP-NEW', email: 'new@example.test', password: 'individual-test-1234' };
  await request(app).post('/api/clinical/accounts').set(headers('staff')).send(value).expect(403);
  await request(app).post('/api/clinical/accounts').set(headers('admin')).send(value).expect(201);
  const user = await db.User.findOne({ where: { email: value.email } });
  assert.equal(user.role_id, 3);
  assert.notEqual(user.password, value.password);
  await request(app).post('/api/clinical/accounts').set(headers('admin')).send({ ...value, email: 'duplicate@example.test' }).expect(409);
  assert.equal(await db.User.count({ where: { email: 'duplicate@example.test' } }), 0);
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { body, param, query, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID, timingSafeEqual } = require("crypto");
const config = require("./config/env");
const authentication = require("./services/authentication");
const { Op } = require("sequelize");
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res
      .status(422)
      .json({
        message: "Revisá los datos ingresados.",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
  next();
};
const required = (key, max = 100) =>
  body(key)
    .isString()
    .trim()
    .isLength({ min: 1, max })
    .withMessage("Completá este campo.");
const positiveId = (key) => body(key).isInt({ min: 1 }).toInt();
const codeMatches = (value, expected) =>
  typeof value === "string" &&
  !!expected &&
  Buffer.byteLength(value) === Buffer.byteLength(expected) &&
  timingSafeEqual(Buffer.from(value), Buffer.from(expected));
function createApp(db = require("./db"), settings = config()) {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        cb(null, !origin || settings.origins.includes(origin));
      },
    }),
  );
  app.use(express.json({ limit: "64kb" }));
  const auth = authentication(db, settings.secret);
  const admin = (req, res, next) =>
    Number(req.user.role_id) === 1
      ? next()
      : res
          .status(403)
          .json({ message: "Esta acción requiere un administrador." });
  const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Demasiados intentos. Esperá unos minutos." },
  });
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.get(
    "/health/ready",
    wrap(async (req, res) => {
      try {
        await db.sequelize.authenticate();
        await db.Role.count();
        res.json({ status: "ready" });
      } catch {
        res.status(503).json({ status: "unavailable" });
      }
    }),
  );
  app.post(
    "/api/user/login",
    loginLimit,
    body("email").isEmail().trim().toLowerCase(),
    body("password").isString().isLength({ min: 1, max: 200 }),
    validate,
    wrap(async (req, res) => {
      const user = await db.User.findOne({ where: { email: req.body.email } });
      if (!user || !(await bcrypt.compare(req.body.password, user.password)))
        return res
          .status(401)
          .json({ message: "Correo o contraseña incorrectos." });
      const seconds = req.body.recordarme === true ? 7 * 86400 : 8 * 3600;
      const jti = randomUUID();
      await db.Session.destroy({
        where: { user_id: user.id, expires_at: { [Op.lt]: new Date() } },
      });
      await db.Session.create({
        id: jti,
        user_id: user.id,
        expires_at: new Date(Date.now() + seconds * 1000),
      });
      const token = jwt.sign({}, settings.secret, {
        algorithm: "HS256",
        subject: String(user.id),
        jwtid: jti,
        issuer: "sismed",
        audience: "sismed-web",
        expiresIn: seconds,
      });
      res.json({ id: user.id, token });
    }),
  );
  app.post(
    "/api/user/Registro-usuario",
    loginLimit,
    required("nombre"),
    required("apellido"),
    body("email").isEmail().trim().toLowerCase(),
    body("password")
      .isString()
      .isLength({ min: 12 })
      .custom((v) => Buffer.byteLength(v) <= 72),
    validate,
    wrap(async (req, res) => {
      if (!codeMatches(req.body.registrationCode, settings.registrationCode))
        return res
          .status(403)
          .json({
            message:
              "Necesitás un código de invitación válido del administrador.",
          });
      await db.User.create({
        name: req.body.nombre,
        lastname: req.body.apellido,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 12),
        role_id: 2,
      });
      res
        .status(201)
        .json({ message: "Cuenta creada. Ya podés iniciar sesión." });
    }),
  );
  app.use("/api", auth);
  require("./services/clinical")(app, db, { wrap, validate, admin });
  app.get("/api/user/profile", (req, res) => res.json({ user: req.user }));
  app.get(
    "/api/user/:userId",
    param("userId").isInt({ min: 1 }),
    validate,
    (req, res) => {
      if (Number(req.params.userId) !== Number(req.user.id))
        return res
          .status(403)
          .json({ message: "No podés consultar otra cuenta." });
      res.json({ user: req.user });
    },
  );
  app.post(
    "/api/user/logout",
    wrap(async (req, res) => {
      await db.Session.destroy({ where: { id: req.sessionId } });
      res.json({ message: "Sesión cerrada." });
    }),
  );
  app.get(
    "/api/doctor/specialties",
    wrap(async (req, res) =>
      res.json(await db.Specialty.findAll({ order: [["name", "ASC"]] })),
    ),
  );
  app.get(
    "/api/doctor/list",
    wrap(async (req, res) =>
      res.json(
        await db.Doctor.findAll({
          include: ["specialty"],
          order: [["lastname", "ASC"]],
        }),
      ),
    ),
  );
  app.post(
    "/api/patient/createPatient",
    body("dni")
      .isString()
      .matches(/^\d{6,12}$/),
    required("name"),
    required("lastname"),
    required("phone", 30),
    required("street", 200),
    required("location"),
    validate,
    wrap(async (req, res) => {
      const { dni, name, lastname, phone, street, location } = req.body;
      const patient = await db.Patient.create({
        DNI: dni,
        name,
        lastname,
        phone,
        street,
        location,
      });
      res.status(201).json({ message: "Paciente registrado.", patient });
    }),
  );
  app.get(
    "/api/patient/search",
    query("dni").matches(/^\d{6,12}$/),
    validate,
    wrap(async (req, res) => {
      const patient = await db.Patient.findByPk(req.query.dni);
      if (!patient)
        return res
          .status(404)
          .json({ message: "No encontramos un paciente con ese DNI." });
      res.json({ patient });
    }),
  );
  app.post(
    "/api/doctor/createDoctor",
    admin,
    body("tuition")
      .isString()
      .matches(/^[a-zA-Z0-9-]{1,20}$/),
    required("name"),
    required("lastname"),
    positiveId("specialty"),
    validate,
    wrap(async (req, res) => {
      if (!(await db.Specialty.findByPk(req.body.specialty)))
        return res.status(422).json({ message: "Especialidad inexistente." });
      const { tuition, name, lastname, specialty } = req.body;
      const doctor = await db.Doctor.create({
        tuition,
        name,
        lastname,
        specialties_id: specialty,
      });
      res.status(201).json({ message: "Médico registrado.", doctor });
    }),
  );
  app.get(
    "/api/doctor/search",
    query("tuition").isLength({ min: 1, max: 20 }),
    validate,
    wrap(async (req, res) => {
      const doctor = await db.Doctor.findByPk(req.query.tuition, {
        include: ["specialty"],
      });
      if (!doctor)
        return res.status(404).json({ message: "Médico no encontrado." });
      res.json({ doctor });
    }),
  );
  app.post(
    "/api/shift/create",
    body("paciente_id")
      .isString()
      .matches(/^\d{6,12}$/),
    required("doctor_id", 20),
    body("fecha").isISO8601().withMessage("Fecha inválida."),
    body("observaciones").optional().isString().isLength({ max: 500 }),
    validate,
    wrap(async (req, res) => {
      const fecha = new Date(req.body.fecha);
      if (fecha <= new Date() || !/(Z|[+-]\d{2}:\d{2})$/.test(req.body.fecha))
        return res
          .status(422)
          .json({ message: "Elegí una fecha futura con zona horaria." });
      if (
        fecha.getUTCMinutes() % 30 !== 0 ||
        fecha.getUTCSeconds() !== 0 ||
        fecha.getUTCMilliseconds() !== 0
      )
        return res
          .status(422)
          .json({
            message: "Los turnos comienzan a la hora en punto o a y media.",
          });
      const doctor = await db.Doctor.findByPk(req.body.doctor_id);
      if (!doctor || !(await db.Patient.findByPk(req.body.paciente_id)))
        return res
          .status(422)
          .json({ message: "Revisá el paciente y el médico seleccionados." });
      const shift = await db.Shift.create({
        paciente_id: req.body.paciente_id,
        doctor_id: doctor.tuition,
        especialidad: doctor.specialties_id,
        fecha,
        estado_turno: true,
        observaciones: req.body.observaciones || "",
        active_slot: `${doctor.tuition}:${fecha.toISOString()}`,
      });
      res.status(201).json({ message: "Turno reservado.", shift });
    }),
  );
  const includes = ["patient", "doctor", "specialty"];
  app.get(
    "/api/shift/estado-turnos",
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
    validate,
    wrap(async (req, res) => {
      const where = { estado_turno: true };
      if (req.query.from || req.query.to)
        where.fecha = {
          ...(req.query.from ? { [Op.gte]: new Date(req.query.from) } : {}),
          ...(req.query.to ? { [Op.lt]: new Date(req.query.to) } : {}),
        };
      res.json(
        await db.Shift.findAll({
          where,
          include: includes,
          order: [["fecha", "ASC"]],
        }),
      );
    }),
  );
  app.get(
    "/api/shift/patient/:paciente_id",
    param("paciente_id").matches(/^\d{6,12}$/),
    validate,
    wrap(async (req, res) =>
      res.json(
        await db.Shift.findAll({
          where: { paciente_id: req.params.paciente_id, estado_turno: true },
          include: includes,
          order: [["fecha", "ASC"]],
        }),
      ),
    ),
  );
  // Cancellation is explicit and idempotent: it preserves history and releases the unique slot.
  app.put(
    "/api/shift/cambiar-estado/:id",
    param("id").isInt({ min: 1 }),
    validate,
    wrap(async (req, res) => {
      const shift = await db.Shift.findByPk(req.params.id);
      if (!shift)
        return res.status(404).json({ message: "Turno no encontrado." });
      await shift.update({ estado_turno: false, active_slot: null });
      res.json({ message: "Turno cancelado.", shift });
    }),
  );
  app.use((req, res) => res.status(404).json({ message: "Ruta inexistente." }));
  app.use((error, req, res, next) => {
    if (error.name === "SequelizeUniqueConstraintError")
      return res
        .status(409)
        .json({
          message:
            req.path === "/api/shift/create"
              ? "Ese médico ya tiene un turno en ese horario."
              : "Ya existe un registro con esos datos.",
        });
    if (
      [
        "SequelizeValidationError",
        "SequelizeForeignKeyConstraintError",
      ].includes(error.name)
    )
      return res
        .status(422)
        .json({ message: "Revisá los datos y sus referencias." });
    if (error.type === "entity.parse.failed")
      return res.status(400).json({ message: "El cuerpo JSON es inválido." });
    if (error.type === "entity.too.large")
      return res
        .status(413)
        .json({ message: "La solicitud es demasiado grande." });
    console.error("API error:", error.name);
    res
      .status(503)
      .json({ message: "El servicio no está disponible. Intentá nuevamente." });
  });
  return app;
}
if (require.main === module) {
  const settings = config();
  const db = require("./db");
  db.sequelize
    .authenticate()
    .then(() => db.Role.count())
    .then(() => {
      const server = createApp(db, settings).listen(settings.port, () =>
        console.log(`Sismed API lista en puerto ${settings.port}`),
      );
      const stop = () =>
        server.close(() => db.sequelize.close().finally(() => process.exit(0)));
      process.on("SIGTERM", stop);
      process.on("SIGINT", stop);
    })
    .catch(() => {
      console.error(
        "No se pudo iniciar: revisá la conexión y ejecutá npm run db:migrate.",
      );
      process.exitCode = 1;
    });
}
module.exports = { createApp, codeMatches };

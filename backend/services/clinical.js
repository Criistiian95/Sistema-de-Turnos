const { body, param, query } = require('express-validator');
module.exports = (app, db, { wrap, validate, admin }) => {
  const fields = ['reason', 'history', 'assessment', 'diagnosis', 'plan'];
  const audit = (req, action, extra = {}, transaction) => db.ClinicalAudit.create({ actor_id: req.user.id, action, created_at: new Date(), ...extra }, { transaction });
  app.use('/api/clinical', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  const professional = wrap(async (req, res, next) => {
    const account = Number(req.user.role_id) === 3 && await db.ClinicalAccount.findByPk(req.user.id);
    if (!account || !account.enabled) return res.status(403).json({ message: 'Necesitás un acceso profesional habilitado por el administrador.' });
    req.clinicalAccount = account;
    next();
  });
  app.get('/api/clinical/accounts', admin, wrap(async (req, res) => {
    const users = await db.User.findAll({ attributes: ['id', 'name', 'lastname', 'email', 'role_id'], order: [['lastname', 'ASC']] });
    res.json({ users, accounts: await db.ClinicalAccount.findAll() });
  }));
  app.post('/api/clinical/accounts', admin, body('email').isEmail().trim().toLowerCase(), body('password').isString().isLength({ min: 12 }).custom(v => Buffer.byteLength(v) <= 72), body('doctor_id').isString().matches(/^[a-zA-Z0-9-]{1,20}$/), validate, wrap(async (req, res) => {
    const doctor = await db.Doctor.findByPk(req.body.doctor_id);
    if (!doctor) return res.status(422).json({ message: 'Primero registrá al profesional en Agregar médico.' });
    const password = await require('bcryptjs').hash(req.body.password, 12);
    await db.sequelize.transaction(async transaction => {
      const user = await db.User.create({ name: doctor.name, lastname: doctor.lastname, email: req.body.email, password, role_id: 3 }, { transaction });
      await db.ClinicalAccount.create({ user_id: user.id, doctor_id: doctor.tuition, enabled: true }, { transaction });
      await audit(req, 'enable_professional', { target_user_id: user.id }, transaction);
    });
    res.status(201).json({ message: 'Cuenta profesional creada. Ya puede iniciar sesión con su correo y contraseña.' });
  }));
  app.put('/api/clinical/accounts/:id', admin, param('id').isInt({ min: 1 }), body('doctor_id').isString().matches(/^[a-zA-Z0-9-]{1,20}$/), body('enabled').isBoolean({ strict: true }), validate, wrap(async (req, res) => {
    await db.sequelize.transaction(async transaction => {
      const user = await db.User.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
      const doctor = await db.Doctor.findByPk(req.body.doctor_id, { transaction });
      if (!user || !doctor || Number(user.role_id) === 1) { const e = new Error(); e.status = 422; throw e; }
      const current = await db.ClinicalAccount.findByPk(user.id, { transaction });
      if (current && current.doctor_id !== doctor.tuition) { const e = new Error(); e.status = 409; throw e; }
      if (current) await current.update({ enabled: req.body.enabled }, { transaction });
      else await db.ClinicalAccount.create({ user_id: user.id, doctor_id: doctor.tuition, enabled: req.body.enabled }, { transaction });
      await user.update({ role_id: req.body.enabled ? 3 : 2 }, { transaction });
      await db.Session.destroy({ where: { user_id: user.id }, transaction });
      await audit(req, req.body.enabled ? 'enable_professional' : 'disable_professional', { target_user_id: user.id }, transaction);
    });
    res.json({ message: 'Acceso actualizado. El profesional debe volver a iniciar sesión.' });
  }));
  app.get('/api/clinical/patients/:dni', professional, param('dni').matches(/^\d{6,12}$/), query('before').optional().isInt({ min: 1 }), validate, wrap(async (req, res) => {
    const patient = await db.Patient.findByPk(req.params.dni);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado. Primero registralo en el consultorio.' });
    const { Op } = require('sequelize');
    const entries = await db.sequelize.transaction(async transaction => {
      const list = await db.ClinicalEntry.findAll({ where: { patient_id: patient.DNI, ...(req.query.before ? { id: { [Op.lt]: Number(req.query.before) } } : {}) }, order: [['id', 'DESC']], limit: 21, transaction });
      await audit(req, 'read_history', { patient_id: patient.DNI }, transaction);
      return list;
    });
    res.json({ patient, entries: entries.slice(0, 20), next: entries.length > 20 ? entries[19].id : null });
  }));
  app.post('/api/clinical/patients/:dni/entries', professional, param('dni').matches(/^\d{6,12}$/), body('request_id').isUUID(4), body('occurred_at').isISO8601(), ...fields.map(f => body(f).isString().trim().isLength({ max: 3000 })), body('reason').isLength({ min: 1 }), validate, wrap(async (req, res) => {
    const occurred = new Date(req.body.occurred_at);
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(req.body.occurred_at) || occurred > new Date() || occurred.getUTCFullYear() < 1900) return res.status(422).json({ message: 'La fecha de atención debe ser válida y no puede estar en el futuro.' });
    const patient = await db.Patient.findByPk(req.params.dni);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado.' });
    const existing = await db.ClinicalEntry.findOne({ where: { request_id: req.body.request_id } });
    if (existing) {
      if (existing.author_id !== req.user.id || existing.patient_id !== patient.DNI || fields.some(f => existing[f] !== req.body[f]) || new Date(existing.occurred_at).getTime() !== occurred.getTime()) return res.status(409).json({ message: 'La solicitud ya se utilizó. Actualizá la historia antes de continuar.' });
      return res.json({ entry: existing, message: 'La atención ya estaba guardada.' });
    }
    const doctor = await db.Doctor.findByPk(req.clinicalAccount.doctor_id);
    const entry = await db.sequelize.transaction(async transaction => {
      const value = await db.ClinicalEntry.create({ ...Object.fromEntries(fields.map(f => [f, req.body[f]])), request_id: req.body.request_id, patient_id: patient.DNI, author_id: req.user.id, doctor_id: doctor.tuition, author_name: `${doctor.name} ${doctor.lastname}`, occurred_at: occurred, created_at: new Date() }, { transaction });
      await audit(req, 'create_entry', { patient_id: patient.DNI }, transaction);
      return value;
    });
    res.status(201).json({ entry, message: 'Atención guardada en la historia clínica.' });
  }));
  app.use('/api/clinical', (error, req, res, next) => {
    if (error.status) return res.status(error.status).json({ message: error.status === 409 ? 'Esta cuenta ya está vinculada a otro profesional.' : 'Revisá la cuenta y la matrícula. Usá una cuenta individual que no sea administradora.' });
    next(error);
  });
};

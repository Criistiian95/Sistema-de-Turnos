const { DataTypes: D } = require("sequelize");
module.exports = async function up(q) {
  const id = {
    type: D.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  };
  const text = (n = 100) => ({ type: D.STRING(n), allowNull: false });
  const ref = (table, key = "id", type = D.INTEGER.UNSIGNED) => ({
    type,
    allowNull: false,
    references: { model: table, key },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });
  await q.createTable("roles", { id, name: { ...text(40), unique: true } });
  await q.createTable("users", {
    id,
    name: text(),
    lastname: text(),
    email: { ...text(254), unique: true },
    password: text(255),
    role_id: ref("roles"),
  });
  await q.createTable("sessions", {
    id: { ...text(36), primaryKey: true },
    user_id: ref("users"),
    expires_at: { type: D.DATE, allowNull: false },
  });
  await q.createTable("specialties", { id, name: { ...text(), unique: true } });
  await q.createTable("patients", {
    DNI: { ...text(12), primaryKey: true },
    name: text(),
    lastname: text(),
    phone: text(30),
    street: text(200),
    location: text(),
  });
  await q.createTable("doctors", {
    tuition: { ...text(20), primaryKey: true },
    name: text(),
    lastname: text(),
    specialties_id: ref("specialties"),
  });
  await q.createTable("shifts", {
    id,
    paciente_id: ref("patients", "DNI", D.STRING(12)),
    doctor_id: ref("doctors", "tuition", D.STRING(20)),
    fecha: { type: D.DATE, allowNull: false },
    especialidad: ref("specialties"),
    estado_turno: { type: D.BOOLEAN, allowNull: false, defaultValue: true },
    observaciones: { ...text(500), defaultValue: "" },
    active_slot: { type: D.STRING(64), unique: true, allowNull: true },
  });
  await q.addIndex("shifts", ["fecha", "estado_turno"]);
  await q.addIndex("shifts", ["paciente_id", "fecha"]);
  await q.addIndex("sessions", ["expires_at"]);
  await q.bulkInsert("roles", [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Recepción" },
  ]);
  await q.bulkInsert(
    "specialties",
    [
      "Clínica médica",
      "Cardiología",
      "Obstetricia",
      "Pediatría",
      "Traumatología",
    ].map((name, i) => ({ id: i + 1, name })),
  );
};

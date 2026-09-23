const { DataTypes: D } = require("sequelize");
module.exports = function defineModels(sequelize) {
  const opts = (tableName) => ({ tableName, timestamps: false });
  const id = {
    type: D.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  };
  const text = (size = 100) => ({ type: D.STRING(size), allowNull: false });
  const Role = sequelize.define(
    "Role",
    { id, name: { ...text(40), unique: true } },
    opts("roles"),
  );
  const User = sequelize.define(
    "User",
    {
      id,
      name: text(),
      lastname: text(),
      email: { ...text(254), unique: true },
      password: text(255),
      role_id: { type: D.INTEGER.UNSIGNED, allowNull: false },
    },
    opts("users"),
  );
  const Session = sequelize.define(
    "Session",
    {
      id: { type: D.STRING(36), primaryKey: true },
      user_id: { type: D.INTEGER.UNSIGNED, allowNull: false },
      expires_at: { type: D.DATE, allowNull: false },
    },
    opts("sessions"),
  );
  const Specialty = sequelize.define(
    "Specialty",
    { id, name: { ...text(), unique: true } },
    opts("specialties"),
  );
  const Patient = sequelize.define(
    "Patient",
    {
      DNI: { ...text(12), primaryKey: true },
      name: text(),
      lastname: text(),
      phone: text(30),
      street: text(200),
      location: text(),
    },
    opts("patients"),
  );
  const Doctor = sequelize.define(
    "Doctor",
    {
      tuition: { ...text(20), primaryKey: true },
      name: text(),
      lastname: text(),
      specialties_id: { type: D.INTEGER.UNSIGNED, allowNull: false },
    },
    opts("doctors"),
  );
  const Shift = sequelize.define(
    "Shift",
    {
      id,
      paciente_id: text(12),
      doctor_id: text(20),
      fecha: { type: D.DATE, allowNull: false },
      especialidad: { type: D.INTEGER.UNSIGNED, allowNull: false },
      estado_turno: { type: D.BOOLEAN, allowNull: false, defaultValue: true },
      observaciones: {
        type: D.STRING(500),
        allowNull: false,
        defaultValue: "",
      },
      active_slot: { type: D.STRING(64), allowNull: true, unique: true },
    },
    opts("shifts"),
  );
  User.belongsTo(Role, { as: "role", foreignKey: "role_id" });
  Session.belongsTo(User, { foreignKey: "user_id" });
  Doctor.belongsTo(Specialty, {
    as: "specialty",
    foreignKey: "specialties_id",
  });
  Shift.belongsTo(Patient, { as: "patient", foreignKey: "paciente_id" });
  Shift.belongsTo(Doctor, { as: "doctor", foreignKey: "doctor_id" });
  Shift.belongsTo(Specialty, { as: "specialty", foreignKey: "especialidad" });
  return { sequelize, Role, User, Session, Specialty, Patient, Doctor, Shift };
};

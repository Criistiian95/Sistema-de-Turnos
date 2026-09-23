require("dotenv").config();
const bcrypt = require("bcryptjs");
const { User, sequelize } = require("../db");
async function create() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (
    !ADMIN_EMAIL ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL) ||
    !ADMIN_PASSWORD ||
    ADMIN_PASSWORD.length < 12 ||
    Buffer.byteLength(ADMIN_PASSWORD) > 72
  )
    throw new Error(
      "Configurá ADMIN_EMAIL y ADMIN_PASSWORD (12 caracteres mínimo, 72 bytes máximo).",
    );
  if (
    await User.findOne({ where: { email: ADMIN_EMAIL.trim().toLowerCase() } })
  )
    throw new Error("Ese correo ya existe. No se modificó su cuenta.");
  await User.create({
    name: process.env.ADMIN_NAME || "Administrador",
    lastname: process.env.ADMIN_LASTNAME || "Sismed",
    email: ADMIN_EMAIL.trim().toLowerCase(),
    password: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role_id: 1,
  });
  console.log("Administrador creado. Quitá ADMIN_PASSWORD de las variables.");
}
create()
  .catch((e) => {
    console.error(
      e.name === "Error"
        ? e.message
        : "No se pudo crear el administrador. Revisá conexión y migraciones.",
    );
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());

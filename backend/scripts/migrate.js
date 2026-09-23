const { sequelize } = require("../db");
async function migrate() {
  await sequelize.authenticate();
  const q = sequelize.getQueryInterface();
  const tables = await q.showAllTables();
  if (tables.includes("sismed_migrations")) {
    const [rows] = await sequelize.query(
      "SELECT name FROM sismed_migrations WHERE name = '001-initial'",
    );
    if (rows.length) {
      await require("../db/migrations/002-clinical")(sequelize);
      console.log("Base actualizada.");
      return;
    }
  }
  // New schema only: never change an unknown or partially initialized database.
  if (tables.length)
    throw new Error(
      "La base no está vacía o la migración quedó incompleta. No se modificó: usar una base nueva o planificar una migración con copia de seguridad.",
    );
  await require("../db/migrations/001-initial")(q);
  await sequelize.query(
    "CREATE TABLE sismed_migrations (name VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
  );
  await sequelize.query(
    "INSERT INTO sismed_migrations (name) VALUES ('001-initial')",
  );
  await require("../db/migrations/002-clinical")(sequelize);
  console.log("Tablas, índices y especialidades creados.");
}
if (require.main === module)
  migrate()
    .catch((error) => {
      console.error(
        error.message.includes("base")
          ? error.message
          : "No se pudo migrar. Verificá conexión, permisos y estado de la base.",
      );
      process.exitCode = 1;
    })
    .finally(() => sequelize.close());
module.exports = migrate;

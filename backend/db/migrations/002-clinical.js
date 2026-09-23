// Additive migration. Safe to resume after a failed MySQL DDL statement; never alters existing tables.
module.exports = async (sequelize) => {
  const [done] = await sequelize.query("SELECT name FROM sismed_migrations WHERE name = '002-clinical'");
  if (done.length) return;
  const { ClinicalAccount, ClinicalEntry, ClinicalAudit } = require('../clinical-models')(sequelize);
  await ClinicalAccount.sync();
  await ClinicalEntry.sync();
  await ClinicalAudit.sync();
  await sequelize.query("INSERT INTO roles (id, name) SELECT 3, 'Profesional' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 3)");
  const [roles] = await sequelize.query('SELECT name FROM roles WHERE id = 3');
  if (roles[0].name !== 'Profesional') throw new Error('El rol 3 ya está utilizado en esta base. Revisar antes de continuar.');
  await sequelize.query("INSERT INTO sismed_migrations (name) VALUES ('002-clinical')");
};

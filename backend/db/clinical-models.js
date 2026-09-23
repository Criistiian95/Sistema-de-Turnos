const { DataTypes: D } = require('sequelize');
module.exports = (sequelize) => {
  const id = { type: D.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true };
  const ref = (model, key, type) => ({ type, allowNull: false, references: { model, key }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  const user = () => ref('users', 'id', D.INTEGER.UNSIGNED);
  const patient = () => ref('patients', 'DNI', D.STRING(12));
  const date = { type: D.DATE(3), allowNull: false };
  const note = { type: D.TEXT, allowNull: false, defaultValue: '' };
  const ClinicalAccount = sequelize.define('ClinicalAccount', {
    user_id: { ...user(), primaryKey: true },
    doctor_id: { ...ref('doctors', 'tuition', D.STRING(20)), unique: true },
    enabled: { type: D.BOOLEAN, allowNull: false, defaultValue: true },
  }, { tableName: 'clinical_accounts', timestamps: false });
  const ClinicalEntry = sequelize.define('ClinicalEntry', {
    id, patient_id: patient(), author_id: user(),
    author_name: { type: D.STRING(220), allowNull: false },
    doctor_id: ref('doctors', 'tuition', D.STRING(20)),
    occurred_at: { ...date }, created_at: { ...date },
    reason: { ...note }, history: { ...note }, assessment: { ...note }, diagnosis: { ...note }, plan: { ...note },
    request_id: { type: D.STRING(36), allowNull: false, unique: true },
  }, { tableName: 'clinical_entries', timestamps: false, indexes: [{ fields: ['patient_id', 'id'] }] });
  const ClinicalAudit = sequelize.define('ClinicalAudit', {
    id, actor_id: user(), patient_id: { ...patient(), allowNull: true },
    action: { type: D.STRING(40), allowNull: false },
    target_user_id: { ...user(), allowNull: true },
    created_at: { ...date },
  }, { tableName: 'clinical_audit', timestamps: false });
  return { ClinicalAccount, ClinicalEntry, ClinicalAudit };
};

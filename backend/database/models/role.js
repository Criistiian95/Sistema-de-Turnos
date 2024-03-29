module.exports = (sequelize, dataTypes) => {
  let alias = 'Role'
  let cols = {
      id: {
          type: dataTypes.BIGINT(10).UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
      },
      name: {
          type: dataTypes.TEXT(20),
      }
  }
  let config = {
      timestamps: false
  }
  const Role = sequelize.define(alias, cols, config);
  
  return Role;
};
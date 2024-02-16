module.exports = (sequelize, dataTypes) => {
  let alias = 'Patient'
  let cols = {
    DNI: {
      type: dataTypes.BIGINT(10).UNSIGNED,
          primaryKey: true,
          autoIncrement: true, 
          allowNull: false
    },
    name: {
      type: dataTypes.TEXT(20),
      allowNull:false
    },
    lastname: {
      type: dataTypes.TEXT(20),
      allowNull:false
  },
  phone: {
    type: dataTypes.INTEGER,
      allowNull: false
  },
  street: {
    type: dataTypes.TEXT,
      allowNull: false
  },
  location: {
    type: dataTypes.TEXT,
      allowNull: false
  }
  }
  let config = {
      timestamps: false
  }
  const Patient = sequelize.define(alias, cols, config);
  
  return Patient;
};
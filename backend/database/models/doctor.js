module.exports = (sequelize, dataTypes) => {
  let alias = 'Doctor'
  let cols = {
      tuition: {
          type: dataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
      },
      name: {
          type: dataTypes.TEXT(20),
          allowNull: false
      },
      lastname: {
          type: dataTypes.TEXT(100),
          allowNull: false
      },
      specialties_id: {
        type: dataTypes.TEXT(100),
        unique: true,
        allowNull: false,
      }  
  }
  let config = {
      timestamps: false,  
  }
  const Doctor = sequelize.define(alias, cols, config);
  
 Doctor.associate = (models)=>{
      Doctor.belongsTo(models.Specialty, {
          as : 'specialty',
          foreignKey : 'specialties_id'
      })
  }
  return Doctor;
};
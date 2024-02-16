module.exports = (sequelize, dataTypes) => {
  let alias = 'Shift'
  let cols = {
      id: {
          type: dataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true
      },
      paciente_id: {
          type: dataTypes.INTEGER,
          allowNull: false
      },
      doctor_id: {
          type: dataTypes.INTEGER,
          allowNull: false
      },
      fecha: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      hora: {
          type: dataTypes.DATE,
          allowNull:null
      },
      especialidad: {
          type: dataTypes.STRING,
          allowNull: false
      },
      estado_turno: {
        type: dataTypes.BOOLEAN,
        allowNull: false
    },
    observaciones: {
      type: dataTypes.STRING
  }
  }
  let config = {
      tableName: "Shift",
      timestamps: false,  
  }
  const Shift = sequelize.define(alias, cols, config);
  
  Shift.associate = function (models) {
    Shift.belongsTo(models.Patient, { // models.Genre -> Genres es el valor de alias en genres.js
        as: "patient",
        foreignKey: "paciente_id"
    })

    Shift.belongsTo(models.Doctor, { // models.Actor -> Actors es el valor de alias en actor.js
        as: "doctor",
        foreignKey: 'doctor_id',
    })

    Shift.belongsTo(models.Specialty, { // models.Actor -> Actors es el valor de alias en actor.js
      as: "specialty",
      foreignKey: 'especialidad',
  })
}
  return Shift;
};
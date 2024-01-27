'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient_has_doctor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Patient_has_doctor.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Patient_has_doctor',
  });
  return Patient_has_doctor;
};
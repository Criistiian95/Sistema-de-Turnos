'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Patient_has_Doctor', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      patient_DNI: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patient',
          key: 'DNI'
        }
      },
      doctor_tuition: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Doctor',
          key: 'tuition'
        }
      }
    });

    // Agregar un índice único compuesto para evitar duplicados
    await queryInterface.addConstraint('Patient_has_Doctor', {
      fields: ['patient_DNI', 'doctor_tuition'],
      type: 'unique',
      name: 'unique_patient_doctor'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Patient_has_Doctor');
  }
};
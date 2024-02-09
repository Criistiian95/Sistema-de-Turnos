'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Shift', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      paciente_id:{
        allowNull:false,
        type:Sequelize.INTEGER,
        references:{
          model:'Patient',
          key:'DNI'
        }
      },
      doctor_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
          model:'Doctor',
          key:'tuition'
        }
      },
      fecha: {
        allowNull: false,
        type: Sequelize.DATE
      },
      hora:{
        allowNull: false,
        type: Sequelize.DATE
      },
      especialidad:{
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
          model:'Specialty',
          key:'id'
        }
      },
      estado_turno:{
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      observaciones:{
        allowNull: false,
        type: Sequelize.STRING
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Shift');
  }
};

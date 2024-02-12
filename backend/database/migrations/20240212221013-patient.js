'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Patient', {
      DNI: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull:false
    },
    phone: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    street: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    location: {
        type:Sequelize.INTEGER,
        allowNull: false
    }});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Patient');
  }
};
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      lastname:{
        allowNull:false,
        type: Sequelize.TEXT
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      password: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      role_id:{
        type:Sequelize.INTEGER,
        references:{
          model:"role",
          key:"id"
        }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user');
  }
};
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
    
      await queryInterface.bulkInsert('user', [{
        name: 'John Doe',
        lastnameA: "Fernandez",
        email:"nehuencf@hotmail.com",
        password: "Lunita97",
        role_id: 1
     }], {});
   
  },

  async down (queryInterface, Sequelize) {
    
     
      await queryInterface.bulkDelete('user', null, {});
     
  }
};

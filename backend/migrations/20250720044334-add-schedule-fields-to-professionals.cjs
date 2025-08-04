'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('professionals', 'working_hours', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('professionals', 'blocked_slots', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('professionals', 'working_hours');
    await queryInterface.removeColumn('professionals', 'blocked_slots');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendamentos', 'hora', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agendamentos', 'hora');
  }
};
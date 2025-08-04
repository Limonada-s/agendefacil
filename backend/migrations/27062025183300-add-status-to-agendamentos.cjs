// migrations/XXXX-add-status-to-agendamentos.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendamentos', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pendente'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agendamentos', 'status');
  }
};

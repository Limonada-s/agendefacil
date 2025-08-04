'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendamentos', 'professional_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'professionals',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Para não apagar o agendamento se o profissional for excluído
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('agendamentos', 'professional_id');
  }
};
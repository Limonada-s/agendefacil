'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendamentos', 'servico_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'servicos',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agendamentos', 'servico_id');
  }
};

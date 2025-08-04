'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historico_agendamentos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      agendamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'agendamentos',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      alterado_por: {
        type: Sequelize.STRING,
        allowNull: false
      },
      de_status: {
        type: Sequelize.STRING
      },
      para_status: {
        type: Sequelize.STRING
      },
      data_alteracao: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('historico_agendamentos');
  }
};

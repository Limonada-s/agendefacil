'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendamentos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cliente_id: { // 🔄 renomeado para padronizar
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'login',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      empresa_id: { // 🔄 renomeado para padronizar
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresas',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      servico_id: { // ✅ FK real do serviço
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'servicos',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      data: {
        type: Sequelize.DATEONLY, // 🔄 apenas data
        allowNull: false
      },
      hora: {
        type: Sequelize.STRING, // ✅ campo hora separado
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pendente', 'confirmado', 'concluido', 'cancelado'),
        defaultValue: 'pendente'
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('agendamentos');
  }
};

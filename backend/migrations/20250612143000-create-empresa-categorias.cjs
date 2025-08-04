'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresa_categorias', {
      empresa_id: {
        type: Sequelize.INTEGER,
        references: { model: 'empresas', key: 'id' },
        onDelete: 'CASCADE'
      },
      categoria_id: {
        type: Sequelize.STRING(50),
        references: { model: 'categorias', key: 'id' },
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('empresa_categorias');
  }
};
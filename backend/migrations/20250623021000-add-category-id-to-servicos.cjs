'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('servicos');
    
    // Verifica se a coluna já existe antes de adicionar
    if (!tableInfo['category_id']) {
      await queryInterface.addColumn('servicos', 'category_id', {
        type: Sequelize.STRING(50),
        allowNull: true,
        references: {
          model: 'categorias',
          key: 'id'
        },
        onDelete: 'CASCADE'
      });
    }
  },

  async down(queryInterface) {
    // Remove a coluna se ela existir
    const tableInfo = await queryInterface.describeTable('servicos');
    if (tableInfo['category_id']) {
      await queryInterface.removeColumn('servicos', 'category_id');
    }
  }
};

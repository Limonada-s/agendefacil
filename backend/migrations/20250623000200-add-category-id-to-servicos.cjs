'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('servicos', 'category_id', {
      type: Sequelize.STRING(50), // id da categoria é string mesmo
      allowNull: true, // <-- Isso permite salvar sem categoria
      references: {
        model: 'categorias',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('servicos', 'category_id');
  }
};

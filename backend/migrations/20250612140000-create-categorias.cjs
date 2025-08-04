'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categorias', {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('Masculino', 'Feminino', 'Infantil'),
        allowNull: false
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('categorias');
  }
};
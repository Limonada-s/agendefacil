'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Altera a coluna 'cpf' na tabela 'login' para permitir valores nulos.
    await queryInterface.changeColumn('login', 'cpf', {
      type: Sequelize.STRING(14),
      allowNull: true, // A mudança principal está aqui
      unique: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Opcional: reverte a mudança, tornando a coluna obrigatória novamente.
    await queryInterface.changeColumn('login', 'cpf', {
      type: Sequelize.STRING(14),
      allowNull: false,
      unique: true
    });
  }
};
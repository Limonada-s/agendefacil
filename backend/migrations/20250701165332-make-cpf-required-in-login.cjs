'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Altera a coluna 'cpf' para não permitir nulos
    return queryInterface.changeColumn('login', 'cpf', {
      type: Sequelize.STRING(14),
      allowNull: false, // << A MUDANÇA
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // O 'down' reverte, permitindo nulos novamente
    return queryInterface.changeColumn('login', 'cpf', {
      type: Sequelize.STRING(14),
      allowNull: true,
      unique: true
    });
  }
};
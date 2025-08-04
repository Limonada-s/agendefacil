'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // O nome 'enum_login_tipo' vem diretamente da sua mensagem de erro.
    // Este comando adiciona 'cliente' à lista de valores permitidos.
    await queryInterface.sequelize.query("ALTER TYPE enum_login_tipo ADD VALUE 'cliente';");
  },

  async down (queryInterface, Sequelize) {
    // Reverter um ENUM é um processo complexo e não é recomendado.
    console.log("Reverter a adição de um valor a um ENUM não é suportado por esta migration.");
  }
};
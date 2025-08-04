'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // O nome 'enum_login_tipo' vem diretamente da sua mensagem de erro.
    // Este comando adiciona 'professional' à lista de valores permitidos.
    await queryInterface.sequelize.query("ALTER TYPE enum_login_tipo ADD VALUE 'professional';");
  },

  async down (queryInterface, Sequelize) {
    // Reverter um ENUM é um processo complexo e destrutivo.
    // Para segurança, não implementaremos a reversão.
    // Se precisar reverter, terá que ser feito manualmente no banco de dados.
    console.log("Reverter a adição de um valor a um ENUM não é suportado por esta migration.");
  }
};

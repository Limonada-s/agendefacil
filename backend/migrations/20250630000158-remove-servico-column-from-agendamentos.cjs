'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Esta função 'up' é executada quando rodamos a migration.
     * Ela vai remover a coluna 'servico' da tabela 'agendamentos'.
     */
    await queryInterface.removeColumn('agendamentos', 'servico');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Esta função 'down' é para reverter a migration, se necessário.
     * Ela adiciona a coluna de volta, caso precisemos desfazer a alteração.
     */
    await queryInterface.addColumn('agendamentos', 'servico', {
      type: Sequelize.STRING,
      allowNull: false, // A regra que estava causando o erro
    });
  }
};

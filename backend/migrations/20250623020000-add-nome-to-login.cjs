'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('login', 'nome', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Nome Padrão' // pode remover se for cadastrar já com nome
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('login', 'nome');
  }
};


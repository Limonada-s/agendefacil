'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('enderecos', 'zip_code', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('enderecos', 'zip_code');
  }
};

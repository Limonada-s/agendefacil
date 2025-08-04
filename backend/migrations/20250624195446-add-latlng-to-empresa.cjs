'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('empresas', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.addColumn('empresas', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('empresas', 'latitude');
    await queryInterface.removeColumn('empresas', 'longitude');
  }
};

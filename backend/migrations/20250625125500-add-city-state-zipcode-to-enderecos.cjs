'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Já existe no banco. Comente ou delete para evitar erro
    // await queryInterface.addColumn('enderecos', 'city', {
    //   type: Sequelize.STRING(100),
    //   allowNull: true
    // });

    // Já existe no banco. Comente ou delete para evitar erro
    // await queryInterface.addColumn('enderecos', 'state', {
    //   type: Sequelize.STRING(2),
    //   allowNull: true
    // });

    // Já existe no banco. Comente ou delete para evitar erro
    // await queryInterface.addColumn('enderecos', 'zip_code', {
    //   type: Sequelize.STRING(10),
    //   allowNull: true
    // });
  },

  async down(queryInterface) {
    // Se desejar reverter, confira se não apagará colunas existentes
    // await queryInterface.removeColumn('enderecos', 'city');
    // await queryInterface.removeColumn('enderecos', 'state');
    // await queryInterface.removeColumn('enderecos', 'zip_code');
  }
};

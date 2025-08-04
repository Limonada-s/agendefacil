'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const statusEnum = {
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false,
    };

    await queryInterface.addColumn('empresas', 'status', statusEnum);
    await queryInterface.addColumn('professionals', 'status', statusEnum);
    await queryInterface.addColumn('login', 'status', statusEnum);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('empresas', 'status');
    await queryInterface.removeColumn('professionals', 'status');
    await queryInterface.removeColumn('login', 'status');
    // Se o ENUM foi criado com um nome específico, pode ser necessário um comando para removê-lo
    // await queryInterface.sequelize.query('DROP TYPE "enum_..._status";');
  }
};

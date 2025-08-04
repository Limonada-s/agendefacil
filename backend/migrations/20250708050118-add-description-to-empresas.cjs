'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('empresas', 'description', {
      type: Sequelize.TEXT, // Usamos TEXT para descrições mais longas
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('empresas', 'description');
  }
};
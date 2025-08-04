'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('servicos', 'company_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('servicos', 'company_id');
    await queryInterface.addColumn('servicos', 'company_id', {
      type: Sequelize.UUID,
      allowNull: false
    });
  }
};

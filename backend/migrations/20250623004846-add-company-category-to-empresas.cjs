'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('empresas', 'company_category', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'masculino' // ou outro valor padrão que fizer sentido
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('empresas', 'company_category');
  }
};

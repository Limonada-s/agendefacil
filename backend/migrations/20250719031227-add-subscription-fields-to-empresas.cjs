'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('empresas', 'plan', {
      type: Sequelize.STRING,
      defaultValue: 'trialing',
      allowNull: true,
    });
    await queryInterface.addColumn('empresas', 'subscription_status', {
      type: Sequelize.ENUM('active', 'inactive', 'trialing', 'past_due', 'canceled'),
      defaultValue: 'trialing',
      allowNull: true,
    });
    await queryInterface.addColumn('empresas', 'subscription_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('empresas', 'plan');
    await queryInterface.removeColumn('empresas', 'subscription_status');
    await queryInterface.removeColumn('empresas', 'subscription_end_date');
  }
};

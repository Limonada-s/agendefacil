'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      type: { type: Sequelize.ENUM('despesa', 'adiantamento'), allowNull: false },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      company_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'empresas', key: 'id' }, onDelete: 'CASCADE' },
      professional_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'professionals', key: 'id' }, onDelete: 'SET NULL' },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('expenses'); }
};
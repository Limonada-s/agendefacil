'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      // ===== CORREÇÃO APLICADA AQUI =====
      appointment_id: {
        type: Sequelize.INTEGER, // Alterado de UUID para INTEGER
        allowNull: false,
        unique: true,
        references: { model: 'agendamentos', key: 'id' },
        onDelete: 'CASCADE'
      },
      // ===================================
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'login', key: 'id' },
        onDelete: 'CASCADE'
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'empresas', key: 'id' },
        onDelete: 'CASCADE'
      },
      professional_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'professionals', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reviews');
  }
};

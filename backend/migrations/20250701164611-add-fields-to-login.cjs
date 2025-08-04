'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'login',
        'telefone',
        {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: '(00) 00000-0000' // Adicionamos um padrão para passar a migration
        }
      ),
      queryInterface.addColumn(
        'login',
        'cpf',
        {
          type: Sequelize.STRING(14),
          allowNull: true, // << IMPORTANTE: Começa como opcional
          unique: true,
        }
      ),
      queryInterface.addColumn(
        'login',
        'data_nascimento',
        {
          type: Sequelize.DATEONLY,
          allowNull: true, // Também opcional
        }
      ),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('login', 'telefone'),
      queryInterface.removeColumn('login', 'cpf'),
      queryInterface.removeColumn('login', 'data_nascimento'),
    ]);
  }
};
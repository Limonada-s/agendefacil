'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agendamentos', 'servico', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Serviço Padrão' // Temporário para migração
    });
    
    // Atualizar registros existentes se necessário
    await queryInterface.sequelize.query(`
      UPDATE agendamentos a
      SET servico = s.name
      FROM servicos s
      WHERE a.servico_id = s.id
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agendamentos', 'servico');
  }
};
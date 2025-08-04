'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome_empresa: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      cnpj: {
        type: Sequelize.STRING(18),
        allowNull: false,
        unique: true
      },
      nome_dono: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      cpf_dono: {
        type: Sequelize.STRING(14),
        allowNull: false,
        unique: true
      },
      email_admin: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      telefone: { 
        type: Sequelize.STRING(15), // Aumentado para 15 para suportar (XX) XXXXX-XXXX
        allowNull: false
      },
      senha: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      endereco_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'enderecos',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      plano: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'GRATUITO'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('empresas');
  }
};

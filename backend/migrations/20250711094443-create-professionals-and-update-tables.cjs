'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Cria a tabela 'professionals'
    await queryInterface.createTable('professionals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false
      },
      specialties: {
        type: Sequelize.JSON,
        allowNull: true
      },
      commission_rate: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      empresa_id: {
        // =====> A MUDANÇA ESTÁ AQUI <=====
        type: Sequelize.INTEGER, // Alterado de UUID para INTEGER
        allowNull: false,
        references: {
          model: 'empresas', // Tabela referenciada
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      login_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'login', // Tabela referenciada
          key: 'id'
        },
        onUpdate: 'CASCADE',
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

    // Cria a tabela de junção 'professional_services'
    await queryInterface.createTable('professional_services', {
      professional_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: 'professionals', key: 'id' },
        onDelete: 'CASCADE'
      },
      servico_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'servicos', key: 'id' },
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

  async down (queryInterface, Sequelize) {
    // Remove as tabelas na ordem inversa
    await queryInterface.dropTable('professional_services');
    await queryInterface.dropTable('professionals');
  }
};

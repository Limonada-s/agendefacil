'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Alterar a coluna para TEXT (remover dependência do ENUM antigo)
    await queryInterface.sequelize.query(`
      ALTER TABLE login ALTER COLUMN tipo DROP DEFAULT;
    `);
    await queryInterface.changeColumn('login', 'tipo', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    // 2. Dropar o ENUM antigo com segurança
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_login_tipo";
    `);

    // 3. Criar novo ENUM com os valores corretos
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_login_tipo" AS ENUM ('user', 'admin');
    `);

    // 4. Reatribuir a coluna ao novo ENUM
    await queryInterface.changeColumn('login', 'tipo', {
      type: Sequelize.ENUM('user', 'admin'),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverte para TEXT e remove o ENUM
    await queryInterface.changeColumn('login', 'tipo', {
      type: Sequelize.TEXT
    });

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_login_tipo";
    `);
  }
};

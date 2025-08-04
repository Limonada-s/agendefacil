// models/Login.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Login extends Model {
    static associate(models) {
      this.hasMany(models.Agendamento, {
        foreignKey: 'client_id',
        as: 'agendamentos'
      });

      this.hasOne(models.Professional, {
        foreignKey: 'login_id',
        as: 'professionalProfile'
      });

      this.hasMany(models.Review, {
        foreignKey: 'clientId',
        as: 'reviews'
      });

      // ===================================================================
      // 2. ASSOCIAÇÃO ADICIONADA AQUI
      // Dizemos que um Login (do tipo admin/professional) pertence a uma Empresa.
      // ===================================================================
      this.belongsTo(models.Empresa, {
        foreignKey: 'empresaId',
        as: 'empresa'
      });
    }
  }

  Login.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: true,
      unique: true
    },
    data_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    // ===================================================================
    // 1. COLUNA ADICIONADA AQUI
    // Esta é a chave estrangeira que liga o Login à Empresa.
    // ===================================================================
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permite nulo para logins de clientes
      references: {
        model: 'empresas', // Nome da tabela
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Login',
    tableName: 'login',
    underscored: true,
    timestamps: true
  });

  return Login;
};

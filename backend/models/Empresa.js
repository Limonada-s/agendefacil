// models/Empresa.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Empresa extends Model {
    static associate(models) {
      this.belongsTo(models.Endereco, {
        foreignKey: 'endereco_id',
        as: 'endereco'
      });

      this.belongsToMany(models.Categoria, {
        through: 'empresa_categorias',
        foreignKey: 'empresa_id',
        otherKey: 'categoria_id',
        as: 'categorias'
      });

      this.hasMany(models.Servico, {
        foreignKey: 'companyId', // Mantenha a consistência aqui
        as: 'servicos'
      });

      this.hasMany(models.Agendamento, {
        foreignKey: 'company_id',
        as: 'agendamentos'
      });

      this.hasMany(models.Professional, {
        foreignKey: 'empresa_id',
        as: 'profissionais'
      });
      this.hasMany(models.Expense, {
        foreignKey: 'companyId' 
      });
      this.hasMany(models.Review, {
        foreignKey: 'companyId',
        as: 'reviews' });
    }
  }

  Empresa.init({
    // O ID aqui é INTEGER, então não precisa definir o tipo se for auto-incremento padrão
    nome_empresa: DataTypes.STRING(50),
    cnpj: {
      type: DataTypes.STRING(18), // Aumentado para suportar formatação
      allowNull: false,
      unique: true,
    },
    nome_dono: DataTypes.STRING(100),
    cpf_dono: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true
    },
    email_admin: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    telefone: DataTypes.STRING(15),
    senha: {
      type: DataTypes.STRING,
      allowNull: false
    },
    endereco_id: DataTypes.INTEGER,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    description: DataTypes.TEXT,
    plano: {
      type: DataTypes.STRING, // Armazenará 'basic', 'plus', 'pro'
      defaultValue: 'trialing' // Começa como um período de teste
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'trialing', 'past_due', 'canceled'),
      defaultValue: 'trialing'
    },
    subscriptionEndDate: {
      type: DataTypes.DATEONLY // Armazena a data em que a assinatura expira
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Empresa',
    tableName: 'empresas',
    underscored: true,
    timestamps: true
  });

  return Empresa;
};

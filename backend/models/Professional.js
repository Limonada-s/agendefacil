// models/Professional.js

import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Professional extends Model {

    static associate(models) {
      Professional.belongsTo(models.Empresa, {
        foreignKey: 'empresa_id',
        as: 'empresa'
      });
      Professional.belongsTo(models.Login, {
        foreignKey: 'login_id',
        as: 'loginDetails' 
      });
      Professional.belongsToMany(models.Servico, {
        through: 'professional_services',
        as: 'servicos',
        foreignKey: 'professional_id',
        otherKey: 'servico_id'
      });
      Professional.hasMany(models.Agendamento, {
        foreignKey: 'professional_id',
        as: 'agendamentos'
      });
      Professional.hasMany(models.Expense, {
       foreignKey: 'professionalId' 
      });
      Professional.hasOne(models.Review, {
        foreignKey: 'appointmentId',
        as: 'review' });
    }
  }

  Professional.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specialties: { 
        type: DataTypes.JSON,
        allowNull: true
    },
    commissionRate: { 
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    workingHours: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Armazena os horários de trabalho padrão. Ex: {"seg": {"ativo": true, "inicio": "09:00", "fim": "18:00"}, ...}'
    },
    blockedSlots: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Armazena bloqueios específicos. Ex: [{"data": "2025-08-10", "hora": "14:00"}]'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id'
      }
    },
    login_id: { // Link para a conta de Login
      type: DataTypes.UUID,
      allowNull: false,
      unique: true // Garante que uma conta de login só tenha um perfil profissional
    }
  }, {
    sequelize,
    modelName: 'Professional',
    tableName: 'professionals',
    underscored: true,
    timestamps: true
  });

  return Professional;
};

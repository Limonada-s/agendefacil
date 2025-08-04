// Em: src/models/Review.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Review extends Model {
    static associate(models) {
      this.belongsTo(models.Agendamento, { foreignKey: 'appointmentId', as: 'appointment' });
      this.belongsTo(models.Login, { foreignKey: 'clientId', as: 'client' });
      this.belongsTo(models.Empresa, { foreignKey: 'companyId', as: 'company' });
      this.belongsTo(models.Professional, { foreignKey: 'professionalId', as: 'professional' });
    }
  }

  Review.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'appointment_id', // Nome da coluna no banco
      references: { model: 'agendamentos', key: 'id' }
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'client_id', // Nome da coluna no banco
      references: { model: 'login', key: 'id' }
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'company_id', // Nome da coluna no banco
      references: { model: 'empresas', key: 'id' }
    },
    professionalId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'professional_id', // Nome da coluna no banco
      references: { model: 'professionals', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    // Não precisamos mais do 'underscored: true' aqui, pois fomos explícitos com 'field'.
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Review;
};

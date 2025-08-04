import { Model, DataTypes } from 'sequelize'; // <-- ADICIONADO Model e DataTypes

export default (sequelize) => {
  class Expense extends Model {
    static associate(models) {
      this.belongsTo(models.Empresa, { foreignKey: 'companyId' });
      this.belongsTo(models.Professional, { foreignKey: 'professionalId', as: 'professional', allowNull: true });
    }
  }

  Expense.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    description: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    type: { type: DataTypes.ENUM('despesa', 'adiantamento'), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    companyId: { type: DataTypes.INTEGER, allowNull: false },
    professionalId: { type: DataTypes.UUID, allowNull: true }
  }, {
    sequelize,
    modelName: 'Expense',
    tableName: 'expenses',
    underscored: true,
    timestamps: true // Adicionado timestamps para consistência
  });

  return Expense;
};

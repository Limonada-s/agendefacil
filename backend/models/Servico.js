import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Servico extends Model {
    static associate(models) {
      this.belongsTo(models.Empresa, {
        foreignKey: 'companyId',
        as: 'empresa'
      });

      this.belongsTo(models.Categoria, {
        foreignKey: 'categoryId',
        as: 'categoria'
      });
      this.belongsToMany(models.Professional, {
        through: 'professional_services',
        as: 'profissionais',
        foreignKey: 'servico_id',
        otherKey: 'professional_id'
      });
    }
  }

  Servico.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    image: DataTypes.TEXT,
    companyId: DataTypes.INTEGER,
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categorias',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Servico',
    tableName: 'servicos',
    underscored: true,
    timestamps: true
  });

  return Servico;
};

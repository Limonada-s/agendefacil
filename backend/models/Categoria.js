import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Categoria extends Model {
    static associate(models) {
      Categoria.belongsToMany(models.Empresa, {
        through: 'empresa_categorias',
        foreignKey: 'categoria_id',
        otherKey: 'empresa_id',
        as: 'empresas'
      });
    }
  }

  Categoria.init({
    nome: DataTypes.STRING(100),
    tipo: DataTypes.ENUM('Masculino', 'Feminino', 'Infantil')
  }, {
    sequelize,
    modelName: 'Categoria',
    tableName: 'categorias',
    underscored: true,
    timestamps: false
  });

  return Categoria;
};
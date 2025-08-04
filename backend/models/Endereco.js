import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Endereco extends Model {
    static associate(models) {
      Endereco.hasOne(models.Empresa, {
        foreignKey: 'endereco_id',
        as: 'empresa'
      });
    }
  }

  Endereco.init({
    rua: DataTypes.STRING(100),
    numero: DataTypes.STRING(10),
    bairro: DataTypes.STRING(100),
    city: DataTypes.STRING(100),
    state: DataTypes.STRING(2),
    zip_code: DataTypes.STRING(10)
  }, {
    sequelize,
    modelName: 'Endereco',
    tableName: 'enderecos',
    underscored: true,
    timestamps: false
  });

  return Endereco;
};

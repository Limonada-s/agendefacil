// Em: src/models/Agendamento.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Agendamento extends Model {
    static associate(models) {
      this.belongsTo(models.Login, { foreignKey: 'clientId', as: 'client' });
      this.belongsTo(models.Empresa, { foreignKey: 'companyId', as: 'company' });
      this.belongsTo(models.Servico, { foreignKey: 'servicoId', as: 'servico' });
      this.belongsTo(models.Professional, { foreignKey: 'professionalId', as: 'professional' });
      
      // CORREÇÃO: A chave estrangeira está no modelo Review, então usamos 'sourceKey' aqui.
      this.hasOne(models.Review, {
        foreignKey: 'appointmentId',
        sourceKey: 'id', // O 'id' deste Agendamento
        as: 'review'
      });
    }
  }

  Agendamento.init({
    // ID é auto-incremento por padrão
    data: DataTypes.DATEONLY,
    hora: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pendente'
    },
    observacoes: DataTypes.TEXT,
    
    // ===================================================================
    // CORREÇÃO: Padronizando os nomes para camelCase no modelo.
    // O Sequelize vai converter para snake_case no banco de dados.
    // ===================================================================
    clientId: {
      type: DataTypes.UUID,
      field: 'client_id'
    },
    companyId: {
      type: DataTypes.INTEGER,
      field: 'company_id'
    },
    servicoId: {
      type: DataTypes.INTEGER,
      field: 'servico_id'
    },
    professionalId: {
        type: DataTypes.UUID,
        field: 'professional_id'
    }
  }, {
    sequelize,
    modelName: 'Agendamento',
    tableName: 'agendamentos',
    underscored: true, // Mantemos aqui para os campos padrão (createdAt, etc.)
    timestamps: true
  });

  return Agendamento;
};

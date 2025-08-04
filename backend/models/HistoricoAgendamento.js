import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const HistoricoAgendamento = sequelize.define('HistoricoAgendamento', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    agendamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    alterado_por: {
      type: DataTypes.STRING,
      allowNull: false
    },
    de_status: {
      type: DataTypes.STRING
    },
    para_status: {
      type: DataTypes.STRING
    },
    data_alteracao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'historico_agendamentos',
    timestamps: false
  });

  return HistoricoAgendamento;
};

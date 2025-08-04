import { DataTypes } from 'sequelize';

const defineAppLog = (sequelize) => {
  const AppLog = sequelize.define('AppLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    level: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    meta: {
      type: DataTypes.JSONB,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'app_logs', // Nome exato da tabela no banco
    timestamps: false, // Desativamos os campos createdAt e updatedAt automáticos
  });

  return AppLog;
};

export default defineAppLog;

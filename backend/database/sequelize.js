import { Sequelize } from "sequelize";
import dbConfig from "../config/database.js";
import logger from "../logger.js"

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: (msg) => logger.debug(msg),
  }
);




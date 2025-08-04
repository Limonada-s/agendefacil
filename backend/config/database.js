import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
};

export default dbConfig;

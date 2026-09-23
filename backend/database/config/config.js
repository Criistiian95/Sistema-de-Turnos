require("dotenv").config();
const common = {
  dialect: "mysql",
  logging: false,
  timezone: "+00:00",
  pool: { max: 10, min: 0, acquire: 15000, idle: 10000 },
  dialectOptions: { connectTimeout: 10000 },
};
if (process.env.DB_SSL === "true")
  common.dialectOptions.ssl = {
    rejectUnauthorized: true,
    ...(process.env.DB_SSL_CA
      ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") }
      : {}),
  };
const urlName = process.env.DATABASE_URL
  ? "DATABASE_URL"
  : process.env.MYSQL_URL
    ? "MYSQL_URL"
    : null;
const config = urlName
  ? { ...common, use_env_variable: urlName }
  : {
      ...common,
      host: process.env.DB_HOST || process.env.MYSQLHOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
      username: process.env.DB_USER || process.env.MYSQLUSER || "sismed",
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || "sismed",
    };
module.exports = { development: config, test: config, production: config };

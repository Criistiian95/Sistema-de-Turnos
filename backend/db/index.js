const { Sequelize, DataTypes: D } = require("sequelize");
const config = require("../database/config/config")[
  process.env.NODE_ENV || "development"
];
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);
module.exports = require("./models")(sequelize);

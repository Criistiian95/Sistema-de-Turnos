const { sequelize } = require("../db");
sequelize
  .authenticate()
  .then(() => console.log("Conexión MySQL correcta."))
  .catch(() => {
    console.error(
      "No se pudo conectar. Revisá las variables de base de datos y la red.",
    );
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
function configuration(env = process.env) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32)
    throw new Error(
      "Configurá JWT_SECRET con al menos 32 caracteres aleatorios.",
    );
  const origins = (env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  if (env.NODE_ENV === "production" && !env.FRONTEND_URL)
    throw new Error("Configurá FRONTEND_URL en producción.");
  return {
    secret: env.JWT_SECRET,
    origins,
    port: Number(env.PORT || 3003),
    registrationCode: env.REGISTRATION_CODE || "",
  };
}
module.exports = configuration;

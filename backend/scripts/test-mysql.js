if (!process.env.SISMED_TEST_MYSQL_URL) {
  console.error(
    "Definí SISMED_TEST_MYSQL_URL con una base vacía terminada en _test.",
  );
  process.exit(1);
}
const { spawnSync } = require("child_process");
const result = spawnSync(
  process.execPath,
  ["--test", "backend/test/api.test.js"],
  { stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);

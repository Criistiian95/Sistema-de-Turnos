// Test-only compatibility layer for Sequelize v6 and Node's built-in SQLite.
// Production always uses mysql2. This does not emulate MySQL's dialect.
const { DatabaseSync } = require("node:sqlite");
class Database {
  constructor(filename, flags, callback) {
    this.filename = filename;
    try {
      this.db = new DatabaseSync(filename);
      queueMicrotask(() => callback(null));
    } catch (error) {
      queueMicrotask(() => callback(error));
    }
  }
  serialize(callback) {
    callback();
  }
  run(sql, params, callback) {
    return this.execute("run", sql, params, callback);
  }
  all(sql, params, callback) {
    return this.execute("all", sql, params, callback);
  }
  execute(method, sql, params, callback) {
    if (typeof params === "function") {
      callback = params;
      params = [];
    }
    const bind = (value) =>
      typeof value === "boolean" ? Number(value) : value;
    const args = Array.isArray(params)
      ? params.map(bind)
      : params
        ? [
            Object.fromEntries(
              Object.entries(params).map(([key, value]) => [key, bind(value)]),
            ),
          ]
        : [];
    let result,
      meta = {};
    try {
      const statement = this.db.prepare(sql);
      if (method === "all" && statement.columns().length)
        result = statement.all(...args).map((row) => ({ ...row }));
      else {
        const info = statement.run(...args);
        meta = {
          lastID: Number(info.lastInsertRowid),
          changes: Number(info.changes),
        };
        result = [];
      }
    } catch (error) {
      if ((error.errcode & 255) === 19) error.code = "SQLITE_CONSTRAINT";
      queueMicrotask(() => callback?.call(meta, error));
      return this;
    }
    queueMicrotask(() => callback?.call(meta, null, result));
    return this;
  }
  close(callback) {
    this.db.close();
    callback?.();
  }
}
module.exports = { Database, OPEN_READWRITE: 2, OPEN_CREATE: 4 };

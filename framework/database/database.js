/**
 * Falcon OSINT Framework
 * SQLite Database Engine
 */

import initSqlJs from "sql.js";

let SQL = null;
let dbInstance = null;

class FalconDatabase {
  constructor(SQL, bytes = null) {
    this.SQL = SQL;
    this.db = bytes
      ? new SQL.Database(bytes)
      : new SQL.Database();
  }

  query(sql, params = []) {
    const stmt = this.db.prepare(sql);

    if (params.length) stmt.bind(params);

    const rows = [];

    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }

    stmt.free();

    return rows;
  }

  execute(sql, params = []) {
    if (params.length) {
      const stmt = this.db.prepare(sql);
      stmt.run(params);
      stmt.free();
    } else {
      this.db.run(sql);
    }
  }

  prepare(sql) {
    return this.db.prepare(sql);
  }

  count(table) {
    return this.query(`SELECT COUNT(*) AS total FROM ${table}`)[0].total;
  }

  export() {
    return this.db.export();
  }

  close() {
    this.db.close();
  }
}

export const Database = {

  async initialize() {

    if (dbInstance) return dbInstance;

    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: (file) => `/node_modules/sql.js/dist/${file}`
      });
    }

    console.log("📦 Descargando falcon.db...");

    const response = await fetch("/database/falcon.db");

    if (!response.ok) {
      throw new Error(`No se pudo descargar falcon.db (${response.status})`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    console.log("📦 Tamaño DB:", bytes.length);

    dbInstance = new FalconDatabase(SQL, bytes);

    console.log(
      "📦 Tablas:",
      dbInstance.query(`
        SELECT name
        FROM sqlite_master
        WHERE type='table';
      `)
    );

    return dbInstance;
  },

  async query(sql, params = []) {
    const db = await this.initialize();
    return db.query(sql, params);
  },

  async execute(sql, params = []) {
    const db = await this.initialize();
    return db.execute(sql, params);
  },

  async prepare(sql) {
    const db = await this.initialize();
    return db.prepare(sql);
  },

  async count(table) {
    const db = await this.initialize();
    return db.count(table);
  }

};
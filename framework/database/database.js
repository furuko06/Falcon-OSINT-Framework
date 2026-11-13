/**
 * Falcon OSINT Framework
 * SQLite Database Engine
 */

import initSqlJs from "sql.js";
import { getSchemaInfo, runMigrations } from "./migrations.js";

let SQL = null;
let dbInstance = null;
let schemaUpgrade = null;

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

/** Shares one in-flight open across every concurrent caller and retries after a failure. */
export function createLoader(open) {
  let opening = null;
  let ready = null;

  return {
    async get() {
      if (ready) return ready;

      if (!opening) {
        opening = Promise.resolve()
          .then(open)
          .then(value => {
            ready = value;
            return value;
          })
          .catch(error => {
            opening = null;
            throw error;
          });
      }

      return opening;
    },

    reset() {
      opening = null;
      ready = null;
    }
  };
}

async function openDatabase() {

    if (dbInstance) return dbInstance;

    globalThis.performance?.mark?.("falcon:db-start");

    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: (file) => new URL(`node_modules/sql.js/dist/${file}`, document.baseURI).href
      });
    }

    console.log("📦 Descargando falcon.db...");

    const response = await fetch(new URL("database/falcon.db", document.baseURI));

    if (!response.ok) {
      throw new Error(`No se pudo descargar falcon.db (${response.status})`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    console.log("📦 Tamaño DB:", bytes.length);

    dbInstance = new FalconDatabase(SQL, bytes);

    try {
      schemaUpgrade = runMigrations(dbInstance);
      console.info(
        `Esquema SQLite ${schemaUpgrade.from} → ${schemaUpgrade.to}` +
        (schemaUpgrade.applied.length ? ` (${schemaUpgrade.applied.map(m => m.name).join(", ")})` : "")
      );
    } catch (error) {
      dbInstance.close();
      dbInstance = null;
      throw new Error(`No se pudo migrar falcon.db: ${error.message}`);
    }

    console.log(
      "📦 Tablas:", dbInstance.query(`
        SELECT name
        FROM sqlite_master
        WHERE type='table';
      `)
    );

    if (globalThis.performance?.mark && globalThis.performance?.measure) {
      performance.mark("falcon:db-ready");
      try {
        performance.measure("falcon:db-open", "falcon:db-start", "falcon:db-ready");
      } catch {
        // Metrics are diagnostic only.
      }
    }

    return dbInstance;
}

const loader = createLoader(openDatabase);

export const Database = {

  async initialize() {
    return loader.get();
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
  },

  async getSchemaInfo() {
    const db = await this.initialize();
    return {
      ...getSchemaInfo(db),
      upgrade: schemaUpgrade
    };
  },

  async exportBytes() {
    const db = await this.initialize();
    return db.export();
  }

};
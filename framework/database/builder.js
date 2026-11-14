/**
 * Falcon Database Builder
 */

import fs from "node:fs";
import path from "node:path";

export function loadJSONDirectory(directory) {

  const files = fs.readdirSync(directory);

  return files
    .filter(file => file.endsWith(".json"))
    .map(file =>
      JSON.parse(
        fs.readFileSync(path.join(directory, file), "utf8")
      )
    );

}

export function compileDatabase() {

  console.info("Compiling Falcon database...");

}
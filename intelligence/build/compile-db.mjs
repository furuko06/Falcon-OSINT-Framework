import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("intelligence");

function readJSON(directory){

    const dir = path.join(ROOT,directory);

    if(!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir)
        .filter(file=>file.endsWith(".json"));

    return files.flatMap(file=>{
        const full = path.join(dir,file);
        return JSON.parse(fs.readFileSync(full,"utf8"));
    });

}

const categories = readJSON("categories");

console.log("Categories:",categories.length);

const argentina = readJSON("countries/ar");

console.log("Argentina:",argentina.length);

console.log("Falcon DB compilation finished.");
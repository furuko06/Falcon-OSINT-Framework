import fs from "node:fs";

const seed = {
    generated_at:new Date().toISOString(),
    version:"0.1.0-alpha",
    tools:0,
    categories:0
};

fs.writeFileSync(
    "intelligence/build/seed.json",
    JSON.stringify(seed,null,2)
);

console.log("Seed generated.");
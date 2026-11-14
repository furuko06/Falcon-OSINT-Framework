import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("intelligence");

let errors = 0;

function validateFolder(folder){

    const full = path.join(ROOT,folder);

    if(!fs.existsSync(full)) return;

    fs.readdirSync(full)
        .filter(file=>file.endsWith(".json"))
        .forEach(file=>{

            try{

                JSON.parse(
                    fs.readFileSync(path.join(full,file),"utf8").replace(/^\uFEFF/,"")
                );

            }catch(error){

                errors++;
                console.error(file,error.message);

            }

        });

}

validateFolder("categories");
for (const country of fs.existsSync(path.join(ROOT,"countries")) ? fs.readdirSync(path.join(ROOT,"countries")) : []) {
    validateFolder(path.join("countries", country));
}

if(errors===0){

    console.log("All JSON files are valid.");

}else{

    process.exit(1);

}
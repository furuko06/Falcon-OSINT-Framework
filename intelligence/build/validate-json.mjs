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
                    fs.readFileSync(path.join(full,file),"utf8")
                );

            }catch(error){

                errors++;
                console.error(file,error.message);

            }

        });

}

validateFolder("categories");
validateFolder("countries/ar");

if(errors===0){

    console.log("All JSON files are valid.");

}else{

    process.exit(1);

}
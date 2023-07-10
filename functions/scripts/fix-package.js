// fixes the package.json file in dist folder by setting type to commonjs.
import fs from "fs";

const packageJson = JSON.parse(fs.readFileSync("./dist/package.json", "utf8"));

packageJson.type = "commonjs";

fs.writeFileSync("./dist/package.json", JSON.stringify(packageJson, null, 2));

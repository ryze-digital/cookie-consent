import fs from "fs";

if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true });
}

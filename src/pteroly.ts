import Admin from "./application/index.js";
import Client from "./client/index.js";
import Updater from "./Updater.js";
import dotenv from "dotenv";
import * as fs from "fs";
// const pjson = require('../package.json');

dotenv.config()

type Cfg = {
  [key: string]: any;
};
function convertCfgToJson(cfgString: string) {
  const cfg: Cfg = {};
  const lines = cfgString.split("\n");
  let childTmp: Cfg = {};
    
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toString().replace("\r", "");

    if (line.startsWith("#")) continue;
    if (line.length == 0) continue;

    if (line.endsWith(":") && JSON.stringify(childTmp) == "{}") childTmp["PARENT"] = line.substring(0, line.length-1);
    if (line.endsWith(":") && JSON.stringify(childTmp) != "{}") {
      const parent = childTmp["PARENT"];
      delete childTmp["PARENT"];
      cfg[parent] = childTmp;
      childTmp = {};
      childTmp["PARENT"] = line.substring(0, line.length-1);
    }

    if (line.startsWith("  ")) childTmp[line.split("=")[0].trim()] = line.split("=")[1].trim();
  }
  const parent = childTmp["PARENT"];
  delete childTmp["PARENT"];
  cfg[parent] = childTmp;

  return cfg;
}

function convertJsonToCfg(cfg: Cfg) {
  let cfgString = `# DON'T TOUCH THE MAJORNOTIFY CONFIG. (Automatically generated)
# THIS CONFIG FILE IS SPACE, LINE AND NAME SENSITIVE, EDITING IT IN THE WRONG WAY POSSIBLY BREAKS IT.
`;
  for (const key in cfg) {
    if (cfg[key] == "[object Object]") {
      cfgString += "\n" + key + ":\n";
      for (const childKey in cfg[key]) {
        cfgString += "  " + childKey + "=" + cfg[key][childKey] + "\n";
      }
    }
  }
  return cfgString;
}

// (() => {
//     axios({
//         method: 'get',
//         url: 'https://registry.npmjs.com/pteroly',
//     }).then((res) => {
//         const version = parseInt(pjson.version.split(".").join(""));
//         const latest = parseInt(res.data["dist-tags"].latest.split(".").join(""));
//         if (latest > version) {
//             // Bug Codes
//             const bugCodeNew = parseInt(latest.toString()[2]);
//             const bugCodeOld = parseInt(version.toString()[2]);
            
//             // Update Codes
//             const updCodeNew = parseInt(latest.toString()[1]);
//             const updCodeOld = parseInt(version.toString()[1]);
            
//             // Release Codes
//             const relCodeNew = parseInt(latest.toString()[0]);
//             const relCodeOld = parseInt(version.toString()[0]);
            
//             // Info
//             let updateType = "update";
            
//             const cfgAsJson = convertCfgToJson(fs.readFileSync(__dirname + "\\config.cfg", "utf8"));

//             if (bugCodeNew > bugCodeOld) {
//                 if (cfgAsJson["VERSIONNOTIFY"]["notifyBugFixes"] == "no") return;
//                 updateType = "bug fix";
//             }
//             if (updCodeNew > updCodeOld) {
//                 if (cfgAsJson["VERSIONNOTIFY"]["notifyFeatureUpdates"] == "no") return;
//                 updateType = "feature update";
//             }
//             if (relCodeNew > relCodeOld) {
//                 if (cfgAsJson["VERSIONNOTIFY"]["notifyMajorUpdates"] == "no") return;
//                 if (cfgAsJson["MAJORNOTIFY"]["versionNumber"] == relCodeNew
//                 && cfgAsJson["MAJORNOTIFY"]["shown"] == "yes")
//                     return;
//                 updateType = "major update";
//             }

//             console.warn("!=== Pteroly ===!");
//             if (updateType !== "major update") console.warn("A new " + updateType + " for Pteroly is available!");
//             else console.warn("A new " + updateType + " for Pteroly is available (WARNING: UPDATING TO IT MIGHT BREAK CODE)!");
//             console.warn("You can install it using: npm i pteroly@" + res.data["dist-tags"].latest);
//             console.warn("");
//             console.warn("Current: " + pjson.version);
//             console.warn("Latest: " + res.data["dist-tags"].latest);
//             if (updateType === "major update") {
//                 console.warn("Note: This update message will only show up once.");
                
//                 cfgAsJson["MAJORNOTIFY"]["versionNumber"] = relCodeNew;
//                 cfgAsJson["MAJORNOTIFY"]["shown"] = "yes";
//                 const jsonAsCfg = convertJsonToCfg(cfgAsJson);
//                 fs.writeFileSync(`./config.cfg`, jsonAsCfg);
//             }
//             console.warn("!=== Pteroly ===!");   
//         }
//     }).catch(() => {
//         console.warn("!=== Pteroly ===!");
//         console.warn("Couldn't check for updates, are you offline?");
//         console.warn("!=== Pteroly ===!");
//     });
// })();

const functions = {
  Client,
  Admin,
}

export default functions;

(async () => {
  const updater = new Updater("../package.json", "https://registry.npmjs.com/pteroly");
  // const update = await updater.getLatest();
  // console.log(update);

  const admin = new Admin("https://ptero.fyreblitz.com/", process.env.ADMIN_KEY);
  const servers = await admin.getServers();
  // console.log(servers.data[0].attributes.relationships)

  const users = await admin.get("/users?filter[email]=engin@fyreblitz.com")
  console.log(users.data);
})()
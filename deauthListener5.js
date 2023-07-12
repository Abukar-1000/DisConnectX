const { parentPort, workerData } = require("worker_threads");
const { executeCMD } = require("./deuthTools");

// infinite deauth attack
let stdOut = null;
let type = "5 GHZ Listener";
executeCMD(workerData, type);

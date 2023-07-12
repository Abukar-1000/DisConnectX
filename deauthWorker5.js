const { parentPort, workerData } = require("worker_threads");
const { executeCMD } = require("./deuthTools");

// infinite deauth attack
let stdOut = null;
let type = "2.4 GHZ Deauth Worker";
while (true) {
    executeCMD(workerData, type);
} 
const { parentPort, workerData } = require("worker_threads");
const { executeCMD } = require("./deuthTools.js");

// infinite deauth attack
while (true) {
    executeCMD(workerData);
}
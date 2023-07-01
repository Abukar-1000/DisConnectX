const NetworkTypes = {
    N2_4GHZ: 1,
    N5GHZ: 2
};


function generateDeauthCMD(targets){
    // generates the deauth command to disconnect targets from 2.4 and 5 GHZ WI-FI
    const ROUTER_2_4_GHZ_MAC = "88:AD:43:45:EC:48";
    const ROUTER_5_GHZ_MAC = "88:AD:43:45:EC:50";
    const PACKET_AMT = 1_000_000_000;
    
    let command2_4GHZ = `${PACKET_AMT} -a ${ROUTER_2_4_GHZ_MAC} -c `;
    let command5GHZ = `${PACKET_AMT} -a ${ROUTER_5_GHZ_MAC} -c `;

    targets.forEach(device => {
        if (device.mac2_4) {
            command2_4GHZ += device.mac2_4;
        }
        if (device.mac5) {
            command5GHZ += device.mac5;
        }
    });

    return [
        command2_4GHZ,
        command5GHZ
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
        deauthenticates the user on 2.4 GHZ network
    */
    
    let targets = getTargets(allDevices);
    // no targets => do nothing
    if (targets.length < 1){
        return;
    }

    // create threads to execute
    const [ COMMAND_2_4_GHZ, COMMAND_5_GHZ ] = generateDeauthCMD(targets);
    console.log(`deauth\n${COMMAND_2_4_GHZ}\n${COMMAND_5_GHZ}\n\n`);
}


module.exports = {
    runParallelDeuth
}
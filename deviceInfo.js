
// creates an object representing a device on the network;
const deviceData = (name, mac2_4GHZ, mac5GHZ) => {
    
    this.name = name;
    this.mac2_4 = mac2_4GHZ;
    this.mac5 = mac5GHZ;

    return {
        name: name,
        mac2_4: mac2_4GHZ,
        mac5: mac5GHZ,
        connected:  true
    };
};

const networkData = (accessMac, networkType, channel) => {
    this.accessMac = accessMac;
    this.networkType = networkType;
    this.channel = channel;
    return {
        accessMac: accessMac,
        networkType: networkType,
        channel: channel
    }
}

// all crucial device info on local network
const DEVICE_DATA = {
    0: deviceData("test", null, "1E:17:3F:8D:E9:96"),
    1: deviceData("MacBook Air", "B4:FA:48:DF:AE:84", "B4:FA:48:DF:AE:84")
};

// network data for my local 2.4 or 5 GHZ network
const NETWORK_DATA = {
    0: networkData("88:AD:43:45:EC:48", "2.4 GHZ", 6),
    1: networkData("88:AD:43:45:EC:50", "5 GHZ", 149)
};

module.exports = {
    DEVICE_DATA,
    NETWORK_DATA
};



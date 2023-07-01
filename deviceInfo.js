
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


// all crucial device info on local network
const DEVICE_DATA = {
    test: deviceData("test", null, "1E:17:3F:8D:E9:96")
};

module.exports = {
    DEVICE_DATA
};
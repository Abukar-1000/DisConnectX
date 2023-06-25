
// creates an object representing a device on the network;
const deviceData = (name, mac2_5GHZ, mac5GHZ) => {
    
    this.name = name;
    this.mac2_5 = mac2_5GHZ;
    this.mac5 = mac5GHZ;
    
    this.generateDeuthCommand = () => {
        let command = "";
        let [mac2_5, mac5] = ["", ""];
        // if (this.mac2_5){
        //     mac2_5 = this.
        // }
    }
    return {
        name: name,
        mac2_5: mac2_5GHZ,
        mac5: mac5GHZ
    };
};


// all crucial device info on local network
const DEVICE_DATA = {
    testDevice: deviceData("test", null, "1E:17:3F:8D:E9:96")
};

module.exports = {
    DEVICE_DATA
};
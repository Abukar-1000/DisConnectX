const express = require("express");
const app = express();
const { DEVICE_DATA, NETWORK_DATA } = require("./deviceInfo.js")
const port = process.env.PORT || 3000
const socketServer = require("http").createServer(app);



// handles socket connection betweeen 2 players on the server
const socketConfig = {
    cors: {
        origin: "*"
    }
};
const io = require("socket.io")(socketServer, socketConfig);

const { runParallelDeuth, parallelWorkers, runParallelDeuthLite } = require("./deuthTools.js");

console.log(DEVICE_DATA, parallelWorkers);

// configure express app
let options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
    index: ['index.html'],
    maxAge: '1m',
    redirect: false
}

// keep track of network attacked when broadcasting to all users
let networkType = null;
app.use(express.static('public', options))

let ip; 
app.get("/",(req,res) => {
    // authenticate device here
    ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    res.sendFile("index.html");
})

app.get("/test",(req,res) => {
    // authenticate device here
    ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    ip = ip.slice(7, ip.length);
    // res.sendFile("index.html");
    res.write(`your ip is ${(ip.length > 0)? ip: "no value"}`);
    res.send();
})



io.on("connection", socket => {
    
    var address = socket.handshake.address;
    io.sockets.on("connection", soc => {
        console.log(`\n\nsocket field triggered \n\n`);
    })

    const INITIALIZATION_DATA = {
        devices: DEVICE_DATA,
        networkType: (networkType)? networkType: "2.4 GHZ"
    }

    // send over device data
    socket.emit("deviceDetails", INITIALIZATION_DATA);


    // respond to a deuth request
    socket.on("deauthenticate", data => {
        console.log(`recieved: `, data);
        
        // update network type
        networkType = data.networkType;
        // alter the connection state of the targeted device & broadcast changes to all admin devices
        let targetDevice = DEVICE_DATA[data.index];
        targetDevice.connected = data.connected;
        
        // check if client is attacking 2.4 GHZ network or 5 GHZ network
        const TARGET_NETWORK = (data.networkType === "2.4 GHZ")? NETWORK_DATA[0] : NETWORK_DATA[1];
        runParallelDeuthLite(DEVICE_DATA, TARGET_NETWORK);
        const DEAUTH_RESPONSE = {
            devices: DEVICE_DATA,
            networkType: networkType
        };
        
        io.emit("deviceDetails", DEAUTH_RESPONSE);
})

});



socketServer.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}\nsocket on ${port}\n`)
})

const express = require("express");
const app = express();
const { DEVICE_DATA } = require("./deviceInfo.js")
const port = process.env.PORT || 3000
const socketServer = require("http").createServer(app);



// handles socket connection betweeen 2 players on the server
const socketConfig = {
    cors: {
        origin: "*"
    }
};
const io = require("socket.io")(socketServer, socketConfig);

const { runParallelDeuth, parallelWorkers } = require("./deuthTools.js");

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

    // send over device data
    socket.emit("deviceDetails", DEVICE_DATA);


    // respond to a deuth request
    socket.on("deauthenticate", data => {
        console.log(`recieved: `, data);
        
        // alter the connection state of the targeted device & broadcast changes to all admin devices
        let targetDevice = DEVICE_DATA[data.index];
        targetDevice.connected = data.connected;

        runParallelDeuth(DEVICE_DATA);
        io.emit("deviceDetails", DEVICE_DATA);
})

});



socketServer.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}\nsocket on ${port}\n`)
})

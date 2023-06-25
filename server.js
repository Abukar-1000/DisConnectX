const express = require("express");
const app = express();
const { DEVICE_DATA } = require("./deviceInfo.js")
const port = process.env.PORT || 3000
const socketServer = require("http").createServer(app);

console.log(DEVICE_DATA);


// handles socket connection betweeen 2 players on the server
const socketConfig = {
    cors: {
        origin: "*"
    }
};
const io = require("socket.io")(socketServer, socketConfig);

const { exec } = require("child_process")

// exec("ls -la", (err, stdout, stderr) => {
//     if (err) {
//         console.log(stderr)
//     } else {
//         console.log(stdout)
//     }
// })

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
    ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    // res.sendFile("index.html");
    res.write(`your ip is ${(ip.length > 0)? ip: "no value"}`);
    res.send();
})


// io.on("connection", socket => {
//     console.log(`\n\n\n\n\n\n\n`);
//     console.log(`\n\n\n\n\n\n\n`);
//     console.log(socket.request.connection.remoteAddress);
//     console.log(`socket id: ${socket.id}\t\tip: ${0}`);

//     // socket.on("connection", soc => {
//     //     console.log(`socket id: ${socket.id}\t\tip: ${socket.conn.remoteAddress}`);
//     // })
//     // send over device data
//     socket.emit("deviceDetails", DEVICE_DATA);


//     socket.on("message", data => {
//         console.log(`recieved: `, data);
//     })

// });


io.on("connection", socket => {
    // console.log(`\n\n\n\n\n\n\n`);
    // console.log(`\n\n\n\n\n\n\n`);
    var address = socket.handshake.address;
    console.log(address);
    console.log(`socket id: ${socket.id}\t\tip: ${ip}`);

    // socket.on("connection", soc => {
    //     console.log(`socket id: ${socket.id}\t\tip: ${socket.conn.remoteAddress}`);
    // })
    
    // send over device data
    socket.emit("deviceDetails", DEVICE_DATA);


    socket.on("message", data => {
        console.log(`recieved: `, data);
    })

});



socketServer.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}\nsocket on ${port}\n sockets: ${io.sockets}`)
})

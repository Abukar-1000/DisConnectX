
const HOST_IP = "10.0.0.178";
const HOST_PORT = "3000";

const SOCKET = io(`http://${HOST_IP}:${HOST_PORT}/`);

function generateStateCss(isConnected) {
    let cssStyle = "";
    
    if (isConnected) {
        cssStyle = "btn btn-lg btn-success";
    } else {
        cssStyle = "btn btn-lg btn-danger";
    }

    return cssStyle;
}

function getConnectedState(event, devices){
    const INDEX = event.target.childNodes[3].innerText;
    let device = devices[INDEX];
    console.log("C device info:", event);
    console.log(devices, device);
    return device.connected;
}

// network type selector
function grabNetworkType(){
    /*
        common case is selecting 2.4 GHZ network, so it is selected by default.
        Otherwise, handles user selecting to attack a 5 GHZ network.
    */
    return document.querySelector(".form-select").value;
}

function createButtonElements(obj){
    // create html button elements using our objects
    // returns an array of buttons
    let buttons = [];
    let counter = 0;

    for (const key in obj){
        let deviceInfo = obj[key];
        console.log(deviceInfo);
        
        let button = document.createElement("button");
        button.innerText = deviceInfo.name;

        // create children to hold mac data
        let [mac2_4, mac5, index] = [document.createElement("p"), document.createElement("p"), document.createElement("p")];
        mac2_4.innerText = deviceInfo.mac2_4;
        mac5.innerText = deviceInfo.mac5;
        index.innerText = counter;


        mac2_4.style.display = 'none';
        mac5.style.display = 'none';
        index.style.display = 'none';

        // attach to button
        button.appendChild(mac2_4);
        button.appendChild(mac5);
        button.appendChild(index);

        button.type = "button";
        // console.log("device info:", deviceInfo);
        button.className = generateStateCss(deviceInfo.connected);
        // button.style.display = "block";
        // button.style.width = "100%";

        // store button
        buttons.push(button);
        counter++;
    }


    return buttons;
}


document.addEventListener("readystatechange", e => {

    // clear previous HTML
    const inputField = document.querySelector(".userInput");    
    inputField.innerHTML = "";

    // establish connection to server
    SOCKET.on("connection", data => {
        // essentially meant to trigger a connection
    })
    
    /*
        1) server sends all device information
        2) create HTML elements for user interaction
        3) user will be able to click on a device and request to deauthenticate will be sent to the server
    */
    SOCKET.on("deviceDetails", data => {
        let buttons = createButtonElements(data);

        inputField.innerHTML = "";
        buttons.forEach(button => {

            // attach event listener to send deauth request
            button.addEventListener("click", e => {
                const INV_CONNECTION = !getConnectedState(e, data);
                const NETWORK_TYPE = document.querySelector(".form-select").value;
                const REQUESTED_DATA = {
                    name: e.target.innerText,
                    mac2_4: e.target.childNodes[1].innerText,
                    mac5: e.target.childNodes[2].innerText,
                    index: e.target.childNodes[3].innerText,
                    networkType: NETWORK_TYPE,
                    connected: INV_CONNECTION
                };

                SOCKET.emit("deauthenticate", REQUESTED_DATA);
            });

            inputField.appendChild(button);
        })
    });


})
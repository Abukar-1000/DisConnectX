
const HOST_IP = "10.0.0.178";
const HOST_PORT = "3000";

const SOCKET = io(`http://${HOST_IP}:${HOST_PORT}/`);

function createButtonElements(obj){
    // create html button elements using our objects
    // returns an array of buttons
    let buttons = [];

    for (const key in obj){
        let deviceInfo = obj[key];
        console.log(deviceInfo);
        
        let button = document.createElement("button");
        button.innerText = deviceInfo.name;

        // create children to hold mac data
        let [mac2_5, mac5] = [document.createElement("p"), document.createElement("p")];
        mac2_5.innerText = deviceInfo.mac2_5;
        mac5.innerText = deviceInfo.mac5;

        mac2_5.style.display = 'none';
        mac5.style.display = 'none';

        // attach to button
        button.appendChild(mac2_5);
        button.appendChild(mac5);

        button.type = "button";
        button.className = "btn btn-lg btn-success";

        // store button
        buttons.push(button);
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
        buttons.forEach( button => {

            // attach event listener to send deauth request
            button.addEventListener("click", e => {
                const REQUESTED_DATA = {
                    name: e.target.innerText,
                    mac2_5: e.target.childNodes[1].innerText,
                    mac5: e.target.childNodes[2].innerText
                };

                SOCKET.emit("deauthenticate", REQUESTED_DATA);
            });

            inputField.appendChild(button);
        })
    })


})

const SOCKET = io("http://localhost:3000/")

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

        // button.addEventListener("click", e => {
        //     console.log(e.target.childNodes[2]);
        // });

        button.type = "button";
        button.className = "btn btn-success btn-lg"
        // store button
        buttons.push(button);
    }

    return buttons;
}


document.addEventListener("readystatechange", e => {

    const inputField = document.querySelector(".userInput");    
    
    // establish connection to server
    SOCKET.on("connection", data => {
        // console.log("client: ", data);
    })
    
    SOCKET.on("deviceDetails", data => {
        // console.log("client: ", data);
        let buttons = createButtonElements(data);
        buttons.forEach( button => {

            // attach listener
            button.addEventListener("click", e => {
                const REQUESTED_DATA = {
                    name: e.target.innerText,
                    mac2_5: e.target.childNodes[1].innerText,
                    mac5: e.target.childNodes[2].innerText
                };

                console.log(REQUESTED_DATA);
                SOCKET.emit("message", REQUESTED_DATA);
            })
            inputField.appendChild(button);
        })
    })


})
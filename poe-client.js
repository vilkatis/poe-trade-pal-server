let WebSocketClient = require('websocket').client;
const fetch = require("node-fetch");

// const SESSION_ID = 'bc0846ef40764df435ecee84046719a0';
// const ID = "wlk6znhb"; // 25c

module.exports = function setupClient(sessionID, queryID, messageCallback, errorCallback, call) {
    const HOST = 'www.pathofexile.com';
    const FETCH_URL = "https://" + HOST + "/api/trade/fetch/";
    const WS_URL = "ws://" + HOST + "/api/trade/live/Delirium/" + queryID;

    const client = new WebSocketClient();

    client.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
        errorCallback();
    });

    client.on('connect', function (connection) {
        console.log('WebSocket Client Connected');

        call.on('end', () => {
            console.log('Closing connection');
            connection.close(0);
        });

        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
            errorCallback();
        });
        connection.on('close', function () {
            console.log('echo-protocol Connection Closed');
            errorCallback();
        });
        connection.on('message', async (m) => {
            if (m.type === 'utf8') {
                let message = JSON.parse(m.utf8Data);
                if (message.auth) {
                    console.log('Auth, searching');
                } else if (message.new) {
                    const results = message.new;
                    for (let result of results) {
                        const response = await fetch(FETCH_URL + result + "?query=" + queryID);
                        const data = await response.json();
                        for (let item of data.result) {
                            messageCallback(item.listing.whisper);
                        }
                    }
                }
            }
        });
    });


    client.connect(WS_URL, [], 'https://' + HOST, {
        "Cookie": "POESESSID=" + sessionID
    });
    
    client.abort
}

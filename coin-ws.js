import WebSocket from 'ws';
const webSocket = new WebSocket ('https://stream.coindcx.com');

webSocket.onmessage = (ev) => {
    console.log (ev)
};

webSocket.onopen = (ev) => {
    console.log (ev)
}

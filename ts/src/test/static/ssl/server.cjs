// shared https + wss test server for the validateServerSsl tests of every language
// it serves cert.pem, a self-signed certificate for ccxt-test.invalid that expired in 2019,
// so connecting to 127.0.0.1 fails the default validation on trust, expiry and hostname
// usage: node server.cjs -> prints the listening port on the first stdout line, exits when stdin closes
// REST: any request returns {"ok":true}, WS: any upgrade is accepted and receives the text frame {"ok":true}
'use strict';

const https = require ('https');
const fs = require ('fs');
const path = require ('path');
const crypto = require ('crypto');

const options = {
    'key': fs.readFileSync (path.join (__dirname, 'key.pem')),
    'cert': fs.readFileSync (path.join (__dirname, 'cert.pem')),
};

const body = JSON.stringify ({ 'ok': true });

const server = https.createServer (options, (req, res) => {
    res.writeHead (200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength (body) });
    res.end (body);
});

server.on ('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key'];
    if (!key) {
        socket.destroy ();
        return;
    }
    const accept = crypto.createHash ('sha1').update (key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest ('base64');
    socket.write ('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
    const payload = Buffer.from (body);
    socket.write (Buffer.concat ([ Buffer.from ([ 0x81, payload.length ]), payload ]));
    socket.on ('data', (data) => {
        // answer a close frame with a close frame, ignore everything else
        if (data.length > 0 && (data[0] & 0x0f) === 0x08) {
            socket.end (Buffer.from ([ 0x88, 0x00 ]));
        }
    });
    socket.on ('error', () => {});
});

server.on ('tlsClientError', () => {});

server.listen (0, '127.0.0.1', () => {
    process.stdout.write (String (server.address ().port) + '\n');
});

process.stdin.on ('end', () => process.exit (0));
process.stdin.on ('close', () => process.exit (0));
process.stdin.resume ();

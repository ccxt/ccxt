const WebSocket = require('ws');

const CLIENT = 'ccxt-light-client';
const VERSION = '1.0';
const PROTOCOL = '7';

const url = `wss://ws.pusherapp.com/app/2ff981bb060680b5ce97?protocol=${PROTOCOL}&client=${CLIENT}&version=${VERSION}`

var _activityTimer = null;
var activityTimeout= 120 * 1000;
var pongTimeout= 30 * 1000;

function resetActivityCheck(ws) {
    if (_activityTimer) {
        clearTimeout(_activityTimer);
    }
    // Send ping after inactivity
    this._activityTimer = setTimeout(function() {
        console.log('send ping');
        ws.send(JSON.stringify({
            event: 'pusher:ping',
            data : {}
        }));
        // Wait for pong response
        _activityTimer = setTimeout(function() {
            console.log("pong not received");
            ws.close();
        }, pongTimeout)
    }, activityTimeout);
}

const ws = new WebSocket(url);
ws.on('open', async () => {
                
});

ws.on('error', (error) => {
    console.log(error);
});

ws.on('close', () => {
    console.log('closed');
});

ws.on('message', async (data) => {
    console.log(data);
    resetActivityCheck (ws);
    const msg = JSON.parse(data);
    if (msg.event === 'pusher:connection_established'){
        // starting
        const eventData = JSON.parse(msg.data);
        if (eventData.activity_timeout){
            activityTimeout = eventData.activity_timeout * 1000;
        }
        ws.send (JSON.stringify({
            event: 'pusher:subscribe',
            data: {
                channel: 'price_ladders_cash_btcusd_buy'
            }
        }));
        ws.send (JSON.stringify({
            event: 'pusher:subscribe',
            data: {
                channel: 'price_ladders_cash_btcusd_sell'
            }
        }));
    } else if (msg.event === 'pusher:ping'){
        ws.send(JSON.stringify({
            event: 'pusher:pong',
            data: {}
        }));
    } else if (msg.event === 'data'){
        console.log(msg);
    } else if (msg.event === 'pusher_internal:subscription_succeeded'){
        console.log('subscribed');
    } else if (msg.event === 'pusher:error'){
        console.log ('err', msg.data.message);
    } else {
        console.log(msg);
    }
});

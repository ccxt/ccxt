const WebSocket = require('ws');

//const url = "wss://api.upbit.com/websocket/v1";
const url = "wss://crix-ws.upbit.com/websocket";
//const url = "wss://crix-websocket-sg.upbit.com/sockjs/websocket";
const ws = new WebSocket(url);

let payload = [
    {
        "ticket":"ram macbook"
    },{
        //"format":"PRTBUF"
        "format":"DEFAULT"
    //},{
    //    "type":"crixOrderbook",
    //    "codes":[
    //        "CRIX.UPBIT.USDT-BTC"
    //    ]
    },{
        "type":"crixTrade",
        "codes":["CRIX.UPBIT.BTC-ETH"]
    }
];
let payload2 = [
    {
        "ticket":"ram macbook"
    },{
        //"format":"PRTBUF"
        "format":"DEFAULT"
    //},{
     //   "type":"crixOrderbook",
     //   "codes":[
     //       "CRIX.UPBIT.BTC-ETH",
     //       "CRIX.UPBIT.USDT-BTC"
     //   ]
    },{
        "type":"crixTrade",
        "codes":["CRIX.UPBIT.BTC-ETH"]
    }
];
/*
payload = [
    {
        "ticket":"UNIQUE_TICKET"
    },{
        
        "format":"DEFAULT"
    },{
        "type":"orderbook",
        "codes":["BTC-ETH"]
    }
];
*/
ws.on('open', async () => {
    console.log("opened");
    ws.send(JSON.stringify(payload));
    
});

ws.on('error', (error) => {
    console.log(error);
});

ws.on('close', () => {
    console.log('closed');
});
let sent = false;
ws.on('message', async (data) => {
    console.log(data);
    console.log(data.toString('hex'));
    console.log(data.toString('utf8'));
    if (!sent){
        ws.send(JSON.stringify(payload2));
        sent = true;
    }
});




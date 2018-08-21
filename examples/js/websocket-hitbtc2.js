/**
 * refer to https://api.hitbtc.com/#subscribe-to-orderbook
 * @author imhazige@gmail.com
 * it have not heartbeat?
 * it only support incremental update
 */
const WebSocket = require('ws');
const pako = require('pako');

const WS_URL = 'wss://api.hitbtc.com/api/2/ws';

var orderbook = {};

exports.OrderBook = orderbook;

function subscribe(ws) {
  const symbol = 'BTCUSD';
  const sendj = {
    method: 'subscribeOrderbook',
    params: {
      symbol: symbol
    },
    id: symbol
  };
  ws.send(JSON.stringify(sendj));
}

function unsubscribe(ws) {
  const symbol = 'BTCUSD';
  const sendj = {
    method: 'unsubscribeOrderbook',
    params: {
      symbol: symbol
    },
    id: symbol
  };
  ws.send(JSON.stringify(sendj));
}

function init() {
  //   var proxy = 'http://localhost:7070';
  //   console.log('using proxy server %j', proxy);

  //   var url = require('url');
  //   var WebSocket = require('ws');
  //   var HttpsProxyAgent = require('https-proxy-agent');
  //   var options = url.parse(proxy);

  //   var agent = new HttpsProxyAgent(options);
  var ws = new WebSocket(WS_URL);
  ws.on('open', () => {
    console.log('open');
    subscribe(ws);
  });
  ws.on('message', data => {
    console.log(data);
    const msg = JSON.parse(data);
    if (msg.error) {
      console.error('response error', msg.error);
    } else if (msg.method) {
      if ('snapshotOrderbook' == msg.method) {
        const orderbook = msg.params;
        console.log('orderbook>>>', orderbook);
      } else if ('updateOrderbook' == msg.method) {
        const orderbook = msg.params;
        console.log('update orderbook>>>', orderbook);
        unsubscribe(ws);
      }
    }
  });
  ws.on('close', () => {
    console.log('close');
    init();
  });
  ws.on('error', err => {
    console.log('error', err);
    init();
  });
}

init();

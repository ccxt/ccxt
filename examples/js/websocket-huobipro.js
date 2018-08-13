const WebSocket = require('ws');
const pako = require('pako');

const WS_URL = 'wss://api.huobi.pro/ws';

var orderbook = {};

exports.OrderBook = orderbook;

function handle(data) {
  // console.log('received', data.ch, 'data.ts', data.ts, 'crawler.ts', moment().format('x'));
  let symbol = data.ch.split('.')[1];
  let channel = data.ch.split('.')[2];
  switch (channel) {
    case 'depth':
      console.log('ob', data.tick);
      // orderbook[symbol] = data.tick;
      break;
    case 'kline':
      console.log('kline', data.tick);
      break;
  }
}

function subscribe(ws) {
  var symbols = ['btcusdt'];
  // 订阅深度
  // 谨慎选择合并的深度，ws每次推送全量的深度数据，若未能及时处理容易引起消息堆积并且引发行情延时
  for (let symbol of symbols) {
    ws.send(
      JSON.stringify({
        sub: `market.${symbol}.depth.step2`,
        id: `${symbol}`
      })
    );
  }
  // 订阅K线
  // for (let symbol of symbols) {
  //   ws.send(
  //     JSON.stringify({
  //       sub: `market.${symbol}.kline.1min`,
  //       id: `${symbol}`
  //     })
  //   );
  // }
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
    let text = pako.inflate(data, {
      to: 'string'
    });
    let msg = JSON.parse(text);
    if (msg.ping) {
      ws.send(
        JSON.stringify({
          pong: msg.ping
        })
      );
    } else if (msg.tick) {
      // console.log(msg);
      handle(msg);
    } else {
      console.log(text);
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

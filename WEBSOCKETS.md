# Websockets
```diff
- This file is a work in progress, guidelines are being developed right now!
```
## websocket connection types
Only two types of websocket connections are supported: 
- Connections that expects you send a subscribing command to receive data updates,
- connections that receive updates just after connected.
## definition
```javascript
...
'asyncconf': {
    'conx-tpls': {
        'default': {
            'type': 'ws',
            'baseurl': 'wss://api.zb.com:9999/websocket',
        },
    },
    'methodmap': {
        '_asyncTimeoutRemoveNonce': '_asyncTimeoutRemoveNonce',
    },
    'events': {
        'ob': {
            'conx-tpl': 'default',
            'generators': {
                'url': '{baseurl}',
                'id': '{id}',
            },
        },
    },
},
...
```
- conx-tpls: dictionary with exchange websocket connections. Most exchanges only have one connection. You can use any id for this connection, but 'default' is used for now. For each connection you mus define:
  - type: 'ws'|'ws-s' for connections that expect a subscribing command or connections with updates after connected, respectively.
  - baseurl: the baseurl for exchange websocket.
- methodmap: this is a hack to convert a method from 'camel' format to 'snake' format, used in php & python transpiled code. Is is usefull when you need to invoke a class method with a string.
- events: dictionary with events or update types received from exchange:
  - 'ob' for orderbook updates,
  - 'ticker' for ticker,
  - 'trade' for trades,
  - ...
  
For each event you must define the connection that provide it:
- conx-tpl: id of the websocket connection defined in 'conx-tpls'.
- generators: additional config for websocket:
  - url: url to connecto to
  - id: internl id for the connection

In each generator you can use variables between braces {}:
- {baseurl}: replace with baseurl value in 'conx-tpls' definitions,
- {id}: replace with key id in 'conx-tpls' dictionary.

## Websocket entry points
You must define some exchange methods in .js file:
- **_asyncOnMsg(data, conxid)**: required, this method is called when a message is received from websocket. *data* is the raw data received and *conexid* is the websocket internal id that receives the message.
- **_asyncSubscribe(event, symbol, nonce)**: required, called from Exchange.js when user invoke an event subscription. *event* must be 'ob'|'ticket'|'trade'|'ohlcv', *symbol* is the symbol, and *nonce* and internal and unique id . If this exchange does not support this event you must throw a NotSupported exception. If exchange websocket type is 'ws', you must send the subscription command for this exchange and save the *nonce* id and use it when you receive a subscription response from exchange. If the subscription succeeds then you must invoke emit method with *nonce* parameter: `this.emit(nonce, true)`. If the subscription fails you must invoke emit method with the error (optional): `this.emit(nonce, false, new ExchangeException('...'))`.
- **_asyncUnsubscribe(event, symbol, nonce)**: required, same as bellow but for unsubscription process. 
- **_asyncEventOnOpen(conexid, asyncConexConfig)**: optional, this is called from Exchange.js when websocket is opened and connected. *conexid* is the opened websocket internal id and *asyncConexConfig* the initialization config of this websocket. You can use this method in 'ws-s' websockets to set 'subscribed' status:
```javascript
...
for (let symbol in streams) {
    this.asyncContext['ob'][symbol]['subscribed'] = true;
    this.asyncContext['ob'][symbol]['subscribing'] = false;
}
...
```

## subscribing to ws type
Cex orderbook subscription command.
```javascript
    let [currencyBase, currencyQuote] = symbol.split ('/');
    this.asyncSendJson ({
        'e': 'order-book-subscribe',
        'data': {
            'pair': [currencyBase, currencyQuote],
            'subscribe': true,
            'depth': 0,
        },
        'oid': nonce,
    });

```
## asyncContext
In **asyncContext** instance variable you can store event status and any related daata you need to save temporaly (orderbooks, nonce ids, ...). Exchange.js initializes this variable to:
```javascript
    {
        '_': {},
    }
```
and for each event in asynconf/events with this content:
```javascript
    {
        'subscribed': false,
        'subscribing': false,
        'data': {},
        'conxid': websocketId,
    }
```
If you need to store any value related to an event you can use 'data' member: `this.asyncContext[event]['data']['orderbook'] = orderbookReceived;`
If you need to store values not related to an event you must use `this.asynContext['_']` dictionary to save/recover it.
'use strict';

//  ---------------------------------------------------------------------------

const kucoinFuturesRest = require ('../kucoinfutures');
const { createKucoinClient } = require ('./kucoin');

//  ---------------------------------------------------------------------------

module.exports = class kucoinfutures extends createKucoinClient (kucoinFuturesRest) {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchMyTrades': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchBalance': false, // on backend
            },
            'options': {
                'channelPrefix': 'contractMarket',
                'watchTicker': {
                    'topic': 'contractMarket/tickerV2',
                },
                'watchTrades': {
                    'topic': 'contractMarket/execution',
                },
                'watchOrderBook': {
                    'topic': 'contractMarket/level2',
                },

            },
        });
    }

    async negotiate (params = {}) {
        const client = this.client ('ws');
        const messageHash = 'negotiate';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            client.subscriptions[messageHash] = future;
            let response = undefined;
            const throwException = false;
            if (this.checkRequiredCredentials (throwException)) {
                response = await this.futuresPrivatePostBulletPrivate ();
                //
                //     {
                //         code: "200000",
                //         data: {
                //             instanceServers: [
                //                 {
                //                     pingInterval:  50000,
                //                     endpoint: "wss://push-private.kucoin.com/endpoint",
                //                     protocol: "websocket",
                //                     encrypt: true,
                //                     pingTimeout: 10000
                //                 }
                //             ],
                //             token: "2neAiuYvAU61ZDXANAGAsiL4-iAExhsBXZxftpOeh_55i3Ysy2q2LEsEWU64mdzUOPusi34M_wGoSf7iNyEWJ1UQy47YbpY4zVdzilNP-Bj3iXzrjjGlWtiYB9J6i9GjsxUuhPw3BlrzazF6ghq4Lzf7scStOz3KkxjwpsOBCH4=.WNQmhZQeUKIkh97KYgU0Lg=="
                //         }
                //     }
                //
            } else {
                response = await this.futuresPublicPostBulletPublic ();
            }
            client.resolve (response, messageHash);
            // const data = this.safeValue (response, 'data', {});
            // const instanceServers = this.safeValue (data, 'instanceServers', []);
            // const firstServer = this.safeValue (instanceServers, 0, {});
            // const endpoint = this.safeString (firstServer, 'endpoint');
            // const token = this.safeString (data, 'token');
        }
        return await future;
    }

    handleOrderBook (client, message) {
        // {
        //     "sequence": 1668015155477,
        //   "change": "0.514,buy,64874",
        //   "timestamp": 1668480414142
        // }
        const messageHash = this.safeString (message, 'topic');
        const marketId = messageHash.split (':')[1];
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const orderbook = this.orderbooks[symbol];
        if (orderbook['nonce'] === undefined) {
            const subscription = this.safeValue (client.subscriptions, messageHash);
            const fetchingOrderBookSnapshot = this.safeValue (subscription, 'fetchingOrderBookSnapshot');
            if (fetchingOrderBookSnapshot === undefined) {
                subscription['fetchingOrderBookSnapshot'] = true;
                client.subscriptions[messageHash] = subscription;
                const options = this.safeValue (this.options, 'fetchOrderBookSnapshot', {});
                const delay = this.safeInteger (options, 'delay', this.rateLimit);
                // fetch the snapshot in a separate async call after a warmup delay
                this.delay (delay, this.fetchOrderBookSnapshot, client, message, subscription);
            }
            // 1. After receiving the websocket Level 2 data flow, cache the data.
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        // {
        //   "sequence": 1668015155477,
        //   "change": "0.514,buy,64874",
        //   "timestamp": 1668480414142
        // }
        const data = this.safeValue (message, 'data', {});
        const sequence = this.safeInteger (data, 'sequence');
        // 4. Apply the new Level 2 data flow to the local snapshot to ensure that
        // the sequence of the new Level 2 update lines up with the sequence of
        // the previous Level 2 data. Discard all the message prior to that
        // sequence, and then playback the change to snapshot.
        if (sequence > orderbook['nonce']) {
            const changeStr = this.safeValue (data, 'change');
            const changeArr = changeStr.split (',');
            const side = changeArr[1];
            const change = [ changeArr[0], changeArr[2], sequence ];
            // 5. Update the level2 full data based on sequence according to the
            // size. If the price is 0, ignore the messages and update the sequence.
            // If the size=0, update the sequence and remove the price of which the
            // size is 0 out of level 2. For other cases, please update the price.
            if (side === 'buy') {
                this.handleDeltas (orderbook['bids'], [ change ], orderbook['nonce']);
            } else {
                this.handleDeltas (orderbook['asks'], [ change ], orderbook['nonce']);
            }
            orderbook['nonce'] = sequence;
            orderbook['timestamp'] = undefined;
            orderbook['datetime'] = undefined;
        }
        return orderbook;
    }

    handleSubject (client, message) {
        const subject = this.safeString (message, 'subject');
        const methods = {
            'level2': this.handleOrderBook,
            'tickerV2': this.handleTicker,
            'match': this.handleTrade,
            'trade.candles.update': this.handleOHLCV,
        };
        let method = this.safeValue (methods, subject);
        if (subject === 'orderChange') {
            const data = this.safeValue (message, 'data');
            const type = this.safeString (data, 'type');
            if (type === 'match') {
                method = this.handleMyTrade;
            } else {
                method = this.handleOrder;
            }
        }
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }

    handleErrorMessage (client, message) {
        return message;
    }

    handleMessage (client, message) {
        // console.log(message);
        if (this.handleErrorMessage (client, message)) {
            const type = this.safeString (message, 'type');
            const methods = {
                // 'heartbeat': this.handleHeartbeat,
                'welcome': this.handleSystemStatus,
                'ack': this.handleSubscriptionStatus,
                'message': this.handleSubject,
                'pong': this.handlePong,
            };
            const method = this.safeValue (methods, type);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        }
    }
};

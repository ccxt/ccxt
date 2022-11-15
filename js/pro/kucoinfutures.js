'use strict';

//  ---------------------------------------------------------------------------

const { mixin } = require ('../base/functions/tealstreetUtils');
const kucoinFuturesRest = require ('../kucoinfutures');
const kucoin = require ('./kucoin');

//  ---------------------------------------------------------------------------

class kucoinfutures extends mixin (kucoin, kucoinFuturesRest) {
    constructor (options = {}) {
        super (options);
    }

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
                    'topic': 'contractMarket/tickerV2',
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
}

module.exports = kucoinfutures;

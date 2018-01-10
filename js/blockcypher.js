"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')

//  ---------------------------------------------------------------------------

/*
Currently doesn't include the following APIs:
    * Microtransaction
    * Confidence Factor
    * Metadata
    * Analytics
    * Asset
    * Payment Forwarding
    * Events and Hooks
*/
module.exports = class blockcypher extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'blockcypher',
            'name': 'Blockcypher',
            'countries': 'US',
            'version': 'v1',
            'rateLimit': 300,
            'hasAlreadyAuthenticatedSuccessfully': false,
            'hasCORS': false,
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.blockcypher.com/',
                },
                'www': 'https://live.blockcypher.com/',
                'doc': [
                    'https://www.blockcypher.com/dev',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{currency}/{network}/',  // Blockchain information
                        '{currency}/{network}/blocks/{block}', // Block information by block hash or height
                        '{currency}/{network}/feature/{feature}', // Information about adoption of an upgrade feature
                        '{currency}/{network}/addrs/{address}/balance', // Address balance information
                        '{currency}/{network}/addrs/{address}', // Address information
                        '{currency}/{network}/addrs/{address}/full', // Address full information
                        '{currency}/{network}/txs/{transaction}', // Transaction information
                        '{currency}/{network}/txs', // Unconfirmed transactions
                    ],
                    'post': [
                        '{currency}/{network}/addrs', // Generate address public/private keypair or multisig address
                        '{currency}/{network}/txs/new', // Create transaction
                        '{currency}/{network}/txs/send', // Send transaction
                    ],
                },
                'private': {
                    'get': [
                        '{currency}/{network}/wallets', // List wallet information
                        '{currency}/{network}/wallets/{wallet}', // Wallet information
                        '{currency}/{network}/wallets/hd/{wallet}', // HD Wallet information
                        '{currency}/{network}/wallets/{wallet}/addresses', // Wallet addresses
                        '{currency}/{network}/wallets/hd/{wallet}/addresses', // HD wallet addresses
                        '{currency}/{network}/txs/{transaction}/propagation', // Transaction propagation information
                        // Also websocket: wss://socket.blockcypher.com/v1/btc/main/txs/propagation
                    ],
                    'post': [
                        '{currency}/{network}/wallets', // Create wallet
                        '{currency}/{network}/wallets/hd', // Create HD wallet
                        '{currency}/{network}/wallets/{wallet}/addresses', // Add addresses to wallet
                        '{currency}/{network}/wallets/{wallet}/addresses/generate', // Generate and add addresses to wallet
                        '{currency}/{network}/wallets/hd/{wallet}/addresses/derive', // Derive and add addresses to HD wallet
                        '{currency}/{network}/txs/push', // Push raw transaction
                        '{currency}/{network}/txs/decode', // Decode raw transaction
                        '{currency}/{network}/txs/data', // Embed data onto blockchain (not supported for BTC)
                    ],
                    'delete': [
                        '{currency}/{network}/wallets/{wallet}/addresses', // Delete addresses from wallet
                        '{currency}/{network}/wallets/{wallet}', // Delete wallet
                        '{currency}/{network}/wallets/hd/{wallet}', // Delete HD wallet
                    ],
                },
            },
        });
    }
}

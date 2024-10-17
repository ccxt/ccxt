//  ---------------------------------------------------------------------------
import Exchange from './abstract/fswap.js';
import { Precise } from './base/Precise.js';
import { BadRequest, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidAddress, InvalidOrder } from './base/errors.js';
//  ---------------------------------------------------------------------------
//
// @class fswap
// @augments Exchange
//
export default class fswap extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'fswap',
            'name': 'fswap',
            'rateLimit': 100,
            'certified': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelOrder': false,
                'createOrder': true,
                'deposit': true,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchMarkets': true,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://mixin-images.zeromesh.net/A2jrSrBJzt0QA4uxeLVlgt67uaXKt8NvBhGzNeLOxxZfwRMz2FjlcMfmM5ZFoXXiynj_6vzsxZiLVloxW478pIdBnLWBJJ8SJu8y=s256',
                'api': {
                    'fswapPublic': 'https://api.4swap.org/api',
                    'fswapPrivate': 'https://api.4swap.org/api',
                    'mixinPublic': 'https://api.mixin.one',
                    'mixinPrivate': 'https://api.mixin.one',
                    'ccxtProxy': 'http://127.0.0.1:8080',
                },
                'doc': 'https://developers.pando.im/references/4swap/api.html',
            },
            'api': {
                'fswapPublic': {
                    'get': {
                        'info': 1,
                        'assets': 1,
                        'pairs': 1,
                        'cmc/pairs': 1,
                        'stats/markets': 1,
                        'stats/markets/{base}/{quote}': 1,
                        'stats/markets/{base}/{quote}/kline/v2': 1,
                        'transactions/{base}/{quote}': 1,
                    },
                },
                'mixinPublic': {
                    'get': {
                        'network/asset/{asset_id}': 1,
                    },
                },
                'fswapPrivate': {
                    'get': {
                        'orders/{follow_id}': 1,
                        'transactions/{base}/{quote}/mine': 1,
                    },
                    'post': {
                        'actions': 1,
                    },
                },
                'mixinPrivate': {
                    'get': {
                        'safe/snapshots': 1,
                        'safe/deposit/entries': 1,
                    },
                    'post': {
                        'safe/keys': 1,
                        'safe/transaction/requests': 1,
                        'safe/transactions': 1,
                        'safe/deposit/entries': 1,
                    },
                },
                'ccxtProxy': {
                    'post': {
                        '4swap/preorder': 1,
                        'mixin/encodetx': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'taker': this.parseNumber('0.0030'),
                    'maker': this.parseNumber('0.0030'),
                },
                'swap': {
                    'taker': this.parseNumber('0.0030'),
                    'maker': this.parseNumber('0.0030'),
                },
            },
            'requiredCredentials': {
                'uid': true,
                'login': true,
                'apiKey': true,
                'password': true,
                'privateKey': true,
                'secret': true, // oauth_client_secret
            },
            'exceptions': {
                'exact': {
                    '10002': BadRequest,
                    '10006': ExchangeError,
                    '20116': ExchangeError,
                    '20117': InsufficientFunds,
                    '20120': InvalidOrder,
                    '20123': ExchangeError,
                    '20124': InsufficientFunds,
                    '20125': InvalidOrder,
                    '20127': InvalidOrder,
                    '20131': InvalidAddress,
                    '20133': ExchangeError,
                    '20134': InvalidOrder,
                    '20135': InvalidOrder,
                    '20150': InvalidAddress,
                },
                'broad': {
                    'Internal Server Error': ExchangeNotAvailable,
                },
            },
            'options': {
                // Fswap
                'ProtocolVersion': 2,
                'ActionAdd': 1,
                'ActionRemove': 2,
                'ActionSwap': 3,
                'FswapAppId': '05c5ac01-31f9-4a69-aa8a-ab796de1d041',
                'MTGMember0': 'a753e0eb-3010-4c4a-a7b2-a7bda4063f62',
                'MTGMember1': '099627f8-4031-42e3-a846-006ee598c56e',
                'MTGMember2': 'aefbfd62-727d-4424-89db-ae41f75d2e04',
                'MTGMember3': 'd68ca71f-0e2c-458a-bb9c-1d6c2eed2497',
                'MTGMember4': 'e4bc0740-f8fe-418c-ae1b-32d9926f5863',
                'MTGThrehold': 3,
                'MaxRouteDepth': 4,
                'METHOD_UNI': 'uni',
                'METHOD_CURVE': 'curve',
                'CURVE_N_COINS': 2,
                'CURVE_A': 200,
                'ONE': 1,
                'TWO': 2,
                // Mixin
                'MainAddressPrefix': 'XIN',
                'MixAddressPrefix': 'MIX',
                'MixAddressVersion': 2,
                'TxVersionHashSignature': 0x05,
                'OutputTypeScript': 0x00,
                'OutputTypeWithdrawalSubmit': 0xa1,
                'Precision': 8,
                'AssetMap': {
                    'c94ac88f-4671-3976-b60a-09064f1811e8': 'XIN',
                    'f5ef6b5d-cc5a-3d90-b2c0-a2fd386e7a3c': 'BOX',
                    'b34633de-4012-38e3-88a9-1f41eafdf45a': 'sXIN-BOX',
                    '4d8c508b-91c5-375b-92b0-ee702ed2dac5': 'USDT',
                    '9c0e17c2-2997-35d3-9cc5-ca9e63d26167': 'sUSDT-BOX',
                    'c6d0c728-2624-429b-8e0d-d9d19b6592fa': 'BTC',
                    '132bc08d-40d0-3000-bb6b-0890ee394bab': 'sBTC-XIN',
                    'a83cc367-72c5-3418-a2b0-b800d5c65e21': 'sBTC-BOX',
                    '00608a54-c563-3e67-8312-80f4471219be': 'sUSDT-XIN',
                    '43d61dcd-e413-450d-80b8-101d5e903357': 'ETH',
                    '5af5eab5-ff6c-32c8-b555-32671e05f017': 'sETH-XIN',
                    'd5e9440c-9aaf-3d2e-8eb8-63b3fc648bc3': 'sETH-BTC',
                    '3edb734c-6d6f-32ff-ab03-4eb43640c758': 'PRS',
                    '550ad4e2-e9fb-3cb4-92bd-934d75d49556': 'sPRS-XIN',
                    '6cfe566e-4aad-470b-8c9a-2fd35b49c68d': 'EOS',
                    'a9eafeea-d398-3bc7-8390-29479f438c8a': 'sEOS-XIN',
                    'cb29bff4-90a3-3ab1-bff3-8bae433b735c': 'sEOS-BOX',
                    '3c0805b2-fdaf-35c6-95af-d7a3f222f910': 'sUSDT-BTC',
                    '6eece248-09db-3417-8f70-767896cf5217': 'WGT',
                    '06bbb4b9-9006-3439-8d72-ef4b0bdde81e': 'sWGT-XIN',
                    '9e0a6c12-f9c0-32b1-a190-8e7b82dd41bf': 'sETH-EOS',
                    'b7647205-a04b-3ad3-aaa1-a8f5e8e66894': 'sEOS-BTC',
                    'd0e65cba-3507-3b11-82fb-15cfad67a382': 'sPRS-EOS',
                    '336d5d97-329c-330d-8e62-2b7c9ba40ea0': 'IQ',
                    '6a927361-72da-36e8-939a-f1149e9a6286': 'sIQ-XIN',
                    '2566bf58-c4de-3479-8c55-c137bb7fe2ae': 'ONE',
                    'f5c24d3c-f0b2-3e3a-aea6-83f9e92335f2': 'sONE-XIN',
                    'ef25abf1-72c0-3191-bccd-4532cb8557a4': 'sUSDT-EOS',
                    '0d8b8f42-a958-3e66-961f-b59c25b67cc1': 'sIQ-EOS',
                    '4c0a42a3-356b-3ae3-a17c-9377646efb04': 'sONE-EOS',
                    '758d159f-1727-37f6-95a9-9ad72d5e1ba6': 'sONE-PRS',
                    '31d2ea9c-95eb-3355-b65b-ba096853bc18': 'pUSD',
                    'fffab09c-180e-3d19-9d49-47d4c4e40878': 'sUSDT-pUSD',
                    'b3c2ae8e-c872-30cf-be73-b53494eda708': 'sBOX-pUSD',
                    '1195a517-5314-3075-8d96-d6bc88a63e46': 'sBTC-pUSD',
                    '5a19cf8e-29c6-3a24-bf4b-da64c458c323': 'sXIN-pUSD',
                    'b1ab7bad-67f1-3613-bcbb-e8eb12fe5582': 'sEOS-pUSD',
                    'b91e18ff-a9ae-3dc7-8679-e935d9a4b34b': 'USDT@TRC20',
                    '38710440-7157-36cd-b14a-143a00687074': 'sUSDT@TRON-pUSD',
                    '05c5ac01-31f9-4a69-aa8a-ab796de1d041': 'XMR',
                    '6d204394-23d6-3786-af12-46ac1b1d9679': 'sXMR-BTC',
                    'eea900a8-b327-488c-8d8d-1428702fe240': 'MOB',
                    'f39749aa-c03f-31bb-917a-0c8af5ef4d4f': 'sMOB-BTC',
                    '34e78f06-d77a-3300-9a0e-f5b6d4e5821e': 'sXMR-pUSD',
                    '002fa713-04f0-3642-b66e-e60a6a1aea41': 'sMOB-pUSD',
                    '8549b4ad-917c-3461-a646-481adc5d7f7f': 'DAI',
                    'f56a522f-016c-340f-a074-6e0dae8262de': 'sDAI-pUSD',
                    '9b180ab6-6abe-3dc0-a13f-04169eb34bfa': 'USDC',
                    'b2c3f05a-2d39-33c4-95ab-01b5accac832': 'sUSDC-pUSD',
                    '8f8abf64-c368-3f5f-a663-8a41d2877ece': 'sPRS-USDT',
                    'a31e847e-ca87-3162-b4d1-322bc552e831': 'UNI',
                    '2f17c93b-ea12-312e-b3da-2aef628af07d': 'sUNI-BTC',
                    '54c61a72-b982-4034-a556-0d99e3c21e39': 'DOT',
                    'a4d01987-a350-3756-9255-98ce17faaa93': 'sDOT-BTC',
                    '6770a1e5-6086-44d5-b60f-545f9d9e8ffd': 'DOGE',
                    'f9cf0db4-30c9-356f-9264-e6ade1a1f021': 'sDOGE-BTC',
                    'e1882f66-8fd4-37b3-a763-0ca9667e87c4': 'sDOGE-pUSD',
                    '91166b9d-e545-3c6f-89e1-7f1c8bc22fe3': 'sUNI-pUSD',
                    '965e5c6e-434c-3fa9-b780-c50f43cd955c': 'CNB',
                    '882c5b24-732e-3408-8fae-46a8c9ea73f7': 'sDOGE-CNB',
                    'c8772688-c252-3619-8529-9a63fea856bd': 'sCNB-XIN',
                    '17f78d7c-ed96-40ff-980c-5dc62fecbc85': 'BNB',
                    'bacb5ac8-2dd0-3d0f-aa12-006120cc5d43': 'sBNB-BTC',
                    '8e4117c0-5e43-3c2f-81d3-15e3d3ac1b46': 'sBNB-pUSD',
                    '83c8bfca-78ee-3845-9e6c-e3d69e7b381c': 'WBTC',
                    '159648dc-eba7-3d0e-82ea-06995bee0537': 'sBTC-wBTC',
                    'bc129ce0-6231-3a88-94bb-c9353abc24ae': 'sXIN-MOB',
                    '4763c636-1d6b-3c74-8cba-17634f0fcad2': 'sETH-pUSD',
                    'c996abc9-d94e-4494-b1cf-2a3fd3ac5714': 'ZEC',
                    '7708398c-38e3-3aa7-8432-c1af36671f08': 'sXMR-ZEC',
                    '1deb43dc-859a-39cf-8d3b-64b6ae479b5f': 'sXMR-XIN',
                    '76d340c6-24c2-3111-8d55-90e358b5e02e': 'UQn',
                    'b71d3e61-21bd-3a47-9c66-3db7bd1f58a8': 'sUSDT-UQn',
                    '990c4c29-57e9-48f6-9819-7d986ea44985': 'SC',
                    '6cd674b6-b761-3523-a90b-db3132e8ed7d': 'sSC-XIN',
                    'bc5317f4-0dc1-3f19-b6f0-efa45cd6e247': 'sDOGE-UQn',
                    '64692c23-8971-4cf4-84a7-4dd1271dd887': 'SOL',
                    'e36f8fbb-9da2-327e-a110-7c190e6fa5c9': 'sSOL-EOS',
                    '02e808ce-9e22-3dbb-80c7-614bccf039c9': 'sETH-SOL',
                    'dcde18b9-f015-326f-b8b1-5b820a060e44': 'SHIB',
                    '2c5eaec9-1ed3-3df0-94b1-f8c4a74262b2': 'sDOGE-SHIB',
                    'd08f4f8c-f70d-32dc-a491-bd526b7237cb': 'sETH-USDT',
                    'bdec3118-656a-3ec7-a397-6e2637a1d7bf': 'AMITUO',
                    '1e7e5ac3-5c61-3938-826a-5ec1b6822c5a': 'sXIN-AMITUO',
                    '156c76ae-c0a5-397c-aeee-d9fcbedb08bd': 'sMOB-USDT',
                    'b80af5fd-85b8-3f00-b7c2-68d2c9f1137a': 'AAVE',
                    '842086e5-4a1d-3c2f-85d7-5ae9f424482b': 'sAAVE-pUSD',
                    'cb0775b5-76f9-34b5-95ce-d56b61d70b8f': 'sAAVE-BTC',
                    'aa189c4c-99ca-39eb-8d96-71a8f6f7218a': 'AKITA',
                    '6837adb8-36a2-3172-8f2a-83f9f40e8cf2': 'sDOGE-AKITA',
                    '882eb041-64ea-465f-a4da-817bd3020f52': 'AR',
                    '7d6faca2-3365-3b7a-b4eb-4b4ab0eab0cf': 'sAR-BTC',
                    '9682b8e9-6f16-3729-b07b-bc3bc56e5d79': 'MATIC',
                    '967244ab-9c1b-3274-9c06-2d268c225fe8': 'sMATIC-BTC',
                    '8b79271e-b8b1-3782-8b4b-b8cf6cf10881': 'SIM',
                    'a561ea99-0b1f-3aa9-a8c7-69bbece1609c': 'sSIM-USDT',
                    '4f2ec12c-22f4-3a9e-b757-c84b6415ea8f': 'RUM',
                    '2a0f4a37-dff2-3a30-89a0-0f4a6a34f5c7': 'sRUM-USDT',
                    'a53872c5-b1a3-32da-bbc4-230a7ced69cb': 'sRUM-XIN',
                    '76c802a2-7c88-447f-a93e-c29c9e5dd9c8': 'LTC',
                    'e5f72de8-a796-35c8-8b7c-1b4b52cd0c8f': 'sLTC-pUSD',
                    'fd11b6e3-0b87-41f1-a41f-f0e9b49e5bf0': 'BCH',
                    'e448f361-cbbb-3e86-bef6-652f125d55ce': 'sBCH-pUSD',
                    'ffc82f24-fb5f-3716-9650-6a835b3cf1b3': 'sBTC-BCH',
                    '7e6644cd-fe58-3d50-a94a-e331ea4af49c': 'sLTC-BTC',
                    'a2c5d22b-62a2-4c13-b3f0-013290dbac60': 'ZEN',
                    '171c1a9a-e837-35da-9962-6a2bbe085ff0': 'sZEN-BTC',
                    'd8c280b3-8f54-3294-a444-a033234168b1': 'sZEN-XIN',
                    'c3b9153a-7fab-4138-a3a4-99849cadc073': 'VCASH',
                    '152ae670-5312-3b14-85c6-30b6307c6be7': 'sVCASH-pUSD',
                    '8f5caf2a-283d-4c85-832a-91e83bbf290b': 'DCR',
                    'e9091f17-a427-324f-afe7-e32b3a27bcce': 'sDCR-pUSD',
                    '08285081-e1d8-4be6-9edc-e203afa932da': 'FIL',
                    'c2ba61dd-d953-3a21-b2f8-dfc69b67bd15': 'sFIL-pUSD',
                    '872204c9-6618-3237-be39-b1004b6392b7': 'sDCR-BTC',
                    '3d2a6082-7545-335b-884e-76afdb09122c': 'LUNA',
                    '536cc195-4c34-3e29-8ad4-5879402ac244': 'MUSD',
                    '19560aed-9563-32e4-bac9-dba27b1054a0': 'sLUNA-MUSD',
                    '7397e9f1-4e42-4dc8-8a3b-171daaadd436': 'ATOM',
                    '3a1840ff-f490-398c-8f73-a6916b89f5d5': 'sATOM-pUSD',
                    '736fb79f-dd38-3726-b302-2db320b06677': 'sATOM-BTC',
                    '30e340a7-3284-3f04-8594-fbdd8f2da79f': 'HMT',
                    'fc53d3be-f553-30c1-bc8b-c1880bf5bffb': 'sHMT-BTC',
                    '97855cb3-24ca-36e0-881b-3e121a91e17e': 'sHMT-ETH',
                    '8030d66b-7640-3ef5-bb72-be9070ae2441': 'sZEC-pUSD',
                    '73af99da-2bac-3fbb-9666-806be96ecd5c': 'sBTC-ZEC',
                    '13036886-6b83-4ced-8d44-9f69151587bf': 'HNS',
                    'fb636866-305c-31ba-adea-d564037ed78e': 'sHNS-pUSD',
                    '9ef1dd61-4d24-31c5-af10-6075429ee499': 'sHNS-BTC',
                    '910f860f-5bc3-34fa-94be-245fc328d735': 'sMOB-ETH',
                    '9c612618-ca59-4583-af34-be9482f5002d': 'AKT',
                    '09e23109-cb0e-3bbe-bf92-3f7b995a4154': 'sAKT-USDT',
                    '3407ab35-eb3d-38f0-8b9f-03ad421de202': 'sAKT-BTC',
                    '02aad415-fb9b-37e2-8770-3e03fcf8e67b': 'sSIM-MUSD',
                    'f4ef6e60-218b-392a-a91f-8040ed561668': 'sUNI-ETH',
                    '0ff3f325-4f34-334d-b6c0-a3bd8850fc06': 'JPYC-D',
                    '29f34a02-61a3-3350-a2f3-60f3edfe088c': 'sJPYC-USDC',
                    'c3dc19ae-d087-3279-ac51-dc655940256a': 'MANA',
                    '0c4db6a6-b9f5-34dd-8154-50d3a1b718e0': 'sMANA-ETH',
                    'e59fcc32-c7e1-335a-976d-a6f6aa61d91e': 'sMANA-pUSD',
                    '2ac62e03-b74c-3f98-b605-5018fae8b5e3': 'DFS',
                    '5033c85a-a64b-39e3-b232-ff441526fb02': 'sDFS-XIN',
                    '2f5bef0e-d41a-3cf3-b6fa-b8dd0d8a3327': 'EURT',
                    '26a8cf17-298f-343c-9b7a-00632986bb28': 'sEURT-pUSD',
                    '8e8d677c-e9f1-3201-b1b3-4e46193df4f1': 'XAUt',
                    '68123c75-c242-311d-ae55-bb9a38065f75': 'sXAUt-pUSD',
                    '369ec0df-6f1c-33d4-b72a-82a3eeebbfde': 'LGB',
                    'bbefa345-0709-3224-9834-54ac23f6f283': 'sLGB-ETH',
                    '14693c1a-d835-3572-b9b4-e0cbb62099e5': 'PINK',
                    'fe0ee086-197f-33c7-a06b-089018c51aa3': 'sPINK-USDT',
                    'cbc77539-0a20-4666-8c8a-4ded62b36f0a': 'AVAX',
                    '5b1eac47-4ab9-3ca1-8486-fb138e4c9f05': 'sAVAX-USDT',
                    '8db4d679-d379-3128-b1a1-153a83157244': 'sATOM-XIN',
                    '5e79fbf2-7f08-39c6-9852-b060133f3bcd': 'sDOT-EOS',
                    '6cd12bd0-317e-3165-9553-a47cdb1aae2a': 'sBNB-BOX',
                    '62e6e25d-47a2-3dc9-b481-6d993ebdb5e2': 'sDOT-pUSD',
                    '56e63c06-b506-4ec5-885a-4a5ac17b83c1': 'XLM',
                    'a2679cc7-9734-356b-87b2-7f1baf813fa6': 'sXLM-BTC',
                    'd6ac94f7-c932-4e11-97dd-617867f0669e': 'NEAR',
                    '0e2e5496-a939-3138-861a-aa9558b25acb': 'sNEAR-BTC',
                    '9d8b0ed2-25c3-3bab-ac33-d0d56ebcfef3': 'sNEAR-pUSD',
                    '25dabac5-056a-48ff-b9f9-f67395dc407c': 'TRX',
                    '8a9898a6-4bd8-300e-b612-a92354928d72': 'sTRX-BTC',
                    '7cf8553a-f6f5-36c8-9bd6-7efc4ac2d9e8': 'sTRX-pUSD',
                    '1654d870-42ca-3bfd-8143-2662cf30eaa6': 'sAVAX-BTC',
                    '82f988ca-bcad-32a4-be82-ae5161966076': 'sAVAX-pUSD',
                    '706b6f84-3333-4e55-8e89-275e71ce9803': 'ALGO',
                    'd7a5a7db-b147-3436-8b0f-ed87b76925ee': 'sALGO-BTC',
                    '0474f9e1-4865-34e4-ad36-8bec6183f2f4': 'sALGO-pUSD',
                    '0d114ae4-e530-3333-b445-bc574427e0bd': 'sXLM-pUSD',
                    '99e81647-eb1b-3bdb-b49f-4c432a32e2ed': 'sSHIB-BTC',
                    'ac734f13-75d7-3356-bb6f-25053e0d524a': 'sSHIB-pUSD',
                    '994a488e-0ba6-3212-aba5-33d7f63d6546': 'sFIL-BTC',
                    'f6f1c01c-8489-3346-b127-dc0dc09b9ce7': 'LINK',
                    '47848290-7016-3502-b62f-57d0bc3b81d0': 'sBTC-LINK',
                    'ff07a1c8-975f-356d-b1ae-10caa51738dd': 'sLINK-pUSD',
                    '23dfb5a5-5d7b-48b6-905f-3970e3176e27': 'XRP',
                    '21219f16-93eb-30cf-bb99-af66a35ed7f0': 'sXRP-BTC',
                    '7313694e-156d-3d63-b21b-e12660520a08': 'sXRP-pUSD',
                    'edc5cf24-bae8-3ed5-a8fc-fde92e8ac80f': 'sMATIC-pUSD',
                    '0a1db494-3d41-3391-ae53-16836b0df38b': 'sSOL-BTC',
                    'be77e925-a9af-30d8-ae76-bf0f302d3dae': 'sSOL-pUSD',
                    '574388fd-b93f-4034-a682-01c2bc095d17': 'BSV',
                    '56a1f18b-3c1e-3b2f-bc23-bcbbfa6cb894': 'sBSV-BTC',
                    '54b7a534-bdbe-3fa3-9414-e2fcc6d8c852': 'sBSV-pUSD',
                    '6472e7e3-75fd-48b6-b1dc-28d294ee1476': 'DASH',
                    '1010fe35-c9b9-35ea-ab4a-b53756d7fd53': 'sDASH-BTC',
                    'd8be3196-bce2-3a94-aecb-df1175f780df': 'sDASH-pUSD',
                    '6877d485-6b64-4225-8d7e-7333393cb243': 'RVN',
                    'b88117dc-e6aa-32fc-848c-01bd2eb2f530': 'sRVN-BTC',
                    'f7876e73-1139-3a6e-98b4-4c81490caee0': 'sRVN-pUSD',
                    '5649ca42-eb5f-4c0e-ae28-d9a4e77eded3': 'XTZ',
                    '0eb758d6-5466-31cc-a994-5550038b2115': 'sXTZ-BTC',
                    '337f9d45-3951-399e-b983-5ca0b65ce5b4': 'sXTZ-pUSD',
                    '9d29e4f6-d67c-4c4b-9525-604b04afbe9f': 'KSM',
                    '1f97917c-73ab-3a08-b48d-50e132812af0': 'sKSM-BTC',
                    'c74e77b1-3afe-3e7a-b9f2-fd9562c98881': 'sKSM-pUSD',
                    '2204c1ee-0ea2-4add-bb9a-b3719cfff93a': 'ETC',
                    '63383884-195b-3ec7-b4ef-d19aaa6c12ea': 'sETC-pUSD',
                    'd1b5a372-0c1e-380a-9299-2ed46bbe24a4': 'sETC-BTC',
                    '0e9dc642-a84c-3a0e-992b-0646130bca59': 'sUSDC-USDT',
                    'c9d54a52-e8fe-3711-81bf-74a4d48bc2f4': 'sUSDT@TRON-USDT',
                    '75e0414b-b190-3783-995a-e6064d30c55d': 'TYC',
                    '61254794-4625-30bc-8141-41d7a3ab9a9f': 'sTYC-pUSD',
                    'c06b0228-cc1d-3f7f-aa56-8de1ddab0602': 'sTYC-BTC',
                    '5c5d9bf9-8744-3a51-a5d3-c07bcf7b271c': 'YYD',
                    '312beac2-0115-30de-a255-e7f26bb6845c': 'sYYD-MUSD',
                    '0c79a53f-9caf-3e7c-a3ce-1edcba33301f': 'FTX Token',
                    '068e555c-829b-3d7e-9fba-6ba209fd1730': 'sFTT-BTC',
                    'ba2bce62-a46f-3d6d-b568-6a64dc2d9d07': 'sFTT-pUSD',
                    'f312d6a7-1b4d-34c0-bf84-75e657a3fcf3': 'BUSD@Binance',
                    '77c0b1f6-eea5-309a-bfe7-c4e1c0f32408': 'sMOB-BUSD',
                    'afb1f1ba-9742-307f-b771-024121f07b73': 'sUSDC-BUSD',
                    '0ff78889-282e-3f18-81b6-602d54e19af1': 'sHMT-USDT',
                    'b12bb04a-1cea-401c-a086-0be61f544889': 'XDC',
                    '37e5e7f8-7067-3ce6-bb51-88f6e0e40fae': 'sUSDT-XDC',
                    'e4692b8f-5e4e-3c37-924c-b5b5f4ce3323': 'sUSDT-PLI',
                    '635b0402-a87a-3e2d-b019-5b1316f5c05e': 'PLI',
                    'a3b84192-d319-3719-9d43-31fabbbccee7': 'CGO',
                    'fffefbab-6b94-3326-93e8-d06157a0ff94': 'sUSDT-CGO',
                    '34570682-2156-3812-bddb-7f2881f041ec': 'SRX',
                    '47ed4523-47fa-3bc2-ae3a-c720ead46a48': 'sUSDT-SRX',
                    'ad7ea4ed-5469-3f2a-b5a3-c61521df08c6': 'sUSDC-eUSD',
                    '659c407a-0489-30bf-9e6f-84ef25c971c9': 'eUSD',
                    'c733ee2e-30fc-327a-ad29-54bdf09154a7': 'sMOB-eUSD',
                    '3e3152d4-6eee-36b3-9685-e8ba54db4a22': 'JPYC',
                    'b829c292-855a-30ce-850b-1f24418a6f64': 'sPUSD-JPYC',
                    '57afad18-f20b-306b-914e-7ef159413b35': 'sUSDT-TRC-TWBTC',
                    '5f363928-dcee-3708-838d-b5d3852d1569': 'TWBTC',
                    '384fa667-397f-3d05-a60c-70d1f61c1159': 'MVP',
                    'd671f175-63cb-367d-a933-73dafe3fb9d0': 'sTWBTC-MVP',
                    '519dc4c9-f182-3319-aa86-bc44377ba0b5': 'sMOB-BUSD@BEP20',
                    'cfcd55cd-9f76-3941-81d6-9e7616cc1b83': 'BUSD@BEP20',
                    '889febfe-d092-3096-bd63-3791c93f48ee': 'sUSDT-USDC',
                    '80b65786-7c75-3523-bc03-fb25378eae41': 'USDC@POLYGON',
                    '01c19815-a280-3adb-8b2a-97a8794b5d41': 'sUSDC-BUSD',
                    'b8b31258-71fc-38d0-a3c2-1694a3a8d432': 'sUSDC-USDC',
                    '66049fae-1823-3019-9f01-8c9652de3213': 'sMATIC-MATIC',
                    'b7938396-3f94-4e0a-9179-d3440718156f': 'MATIC@POLYGON',
                    '89910ef6-2a0a-3674-9bdc-e1ac992e6a33': 'sBTC-TWBTC',
                    'e0567fa0-4922-312f-ad53-23f51d7f29b8': 'sMVP-CNBTC',
                    'e533b919-d043-3afd-9ced-b906d1e2fef6': 'CNBTC',
                    '44adc71b-0c37-3b42-aa19-fe2d59dae5fd': 'EPC',
                    '7972ba2f-2bb9-346d-ab62-1ba16974ee24': 'sUSDT-EPC',
                    'c80b9332-0122-305c-9b2e-69668d3b6600': 'sUSDC-HMT',
                    'db1a68dd-f40b-37ed-b21b-46143d2905e2': 'sPUSD-HMT',
                    '964d1751-5d1b-33ea-b6c5-321fa1be30b1': 'sHMT-HMT',
                    '235d8ced-3d41-3c2f-8368-7dba52cb9868': 'HMT@POLYGON',
                    '218bc6f4-7927-3f8e-8568-3a3725b74361': 'USDT@POLYGON',
                    'e78edb5c-36b0-39ce-930d-b681213c4b09': 'sUSDT@MATIC-USDT@ETH',
                    'a45217b9-5a83-3da1-950a-50217baa6dc1': 's3056.HK-pUSD',
                    '5c392265-1e05-3520-a25b-2fe9e36510d7': '3056.HK',
                    '22bd6062-e0d8-3d1f-af70-051caa8af902': 'sEUSD-USDT',
                },
            },
        });
    }
    async fetchMarkets(params = {}) {
        //
        // @method
        // @name fswap#fetchMarkets
        // @description retrieves data on all markets for fswap
        // @see https://developers.pando.im/references/4swap/api.html#read-pairs
        // @param {object} [params] extra parameters specific to the exchange API endpoint
        // @returns {object[]} an array of objects representing market data
        //
        const response = await this.fswapPublicGetCmcPairs(params);
        const data = this.safeValue(response, 'data', {});
        const markets = Object.values(data);
        return this.parseMarkets(markets);
    }
    parseMarket(market) {
        // {
        //   "05c5ac01-31f9-4a69-aa8a-ab796de1d041_31d2ea9c-95eb-3355-b65b-ba096853bc18": {
        //     "base_id": "05c5ac01-31f9-4a69-aa8a-ab796de1d041",
        //     "base_name": "Monero",
        //     "base_symbol": "XMR",
        //     "quote_id": "31d2ea9c-95eb-3355-b65b-ba096853bc18",
        //     "quote_name": "Pando USD",
        //     "quote_symbol": "pUSD",
        //     "last_price": "148.2384060238058983",
        //     "base_volume": "0",
        //     "quote_volume": "0",
        //     "base_value": "924.95",
        //     "quote_value": "970.01",
        //     "volume_24h": "0",
        //     "fee_24h": "0",
        //     "depth_up_2": "9.65",
        //     "depth_down_2": "9.11"
        //   }
        // }
        const baseId = this.safeString(market, 'base_id');
        const quoteId = this.safeString(market, 'quote_id');
        const baseSymbol = this.parseSpecialSymbol(baseId, this.safeString(market, 'base_symbol'));
        const quoteSymbol = this.parseSpecialSymbol(quoteId, this.safeString(market, 'quote_symbol'));
        return {
            'id': baseId + '-' + quoteId,
            'symbol': baseSymbol + '/' + quoteSymbol,
            'base': baseSymbol,
            'quote': quoteSymbol,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': true,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'settle': undefined,
            'settleId': undefined,
            'contractSize': undefined,
            'linear': undefined,
            'inverse': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': this.parseNumber('0.0000001'),
                    'max': undefined,
                },
                'price': {
                    'min': this.parseNumber('0.0000001'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }
    parseSpecialSymbol(tokenId, tokenSymbol) {
        // Any asset on Mixin has an unique asset id which is an UUID
        // For different version of stablecoin like USDT, they have the same symbol (USDT)
        // we need this function to parse the symbol to respective version
        if (tokenId === '4d8c508b-91c5-375b-92b0-ee702ed2dac5') {
            return 'USDT';
        }
        if (tokenId === '218bc6f4-7927-3f8e-8568-3a3725b74361') {
            return 'USDT@POLYGON';
        }
        if (tokenId === 'b91e18ff-a9ae-3dc7-8679-e935d9a4b34b') {
            return 'USDT@TRC20';
        }
        if (tokenId === '9b180ab6-6abe-3dc0-a13f-04169eb34bfa') {
            return 'USDC';
        }
        if (tokenId === '80b65786-7c75-3523-bc03-fb25378eae41') {
            return 'USDC@POLYGON';
        }
        if (tokenId === '30e340a7-3284-3f04-8594-fbdd8f2da79f') {
            return 'HMT';
        }
        if (tokenId === '235d8ced-3d41-3c2f-8368-7dba52cb9868') {
            return 'HMT@POLYGON';
        }
        if (tokenId === '3e3152d4-6eee-36b3-9685-e8ba54db4a22') {
            return 'JPYC';
        }
        if (tokenId === '0ff3f325-4f34-334d-b6c0-a3bd8850fc06') {
            return 'JPYC-D';
        }
        if (tokenId === 'b7938396-3f94-4e0a-9179-d3440718156f') {
            return 'MATIC@POLYGON';
        }
        if (tokenId === '9682b8e9-6f16-3729-b07b-bc3bc56e5d79') {
            return 'MATIC';
        }
        if (tokenId === 'f312d6a7-1b4d-34c0-bf84-75e657a3fcf3') {
            return 'BUSD@Binance';
        }
        if (tokenId === 'cfcd55cd-9f76-3941-81d6-9e7616cc1b83') {
            return 'BUSD@BEP20';
        }
        return this.safeSymbol(tokenSymbol);
    }
    mapAssetIdToSymbol(assetId) {
        const symbol = this.safeString(this.options.AssetMap, assetId);
        const finalSymbol = this.parseSpecialSymbol(assetId, symbol);
        return finalSymbol;
    }
    mapSymbolToAssetId(symbol) {
        const assetMap = this.options.AssetMap;
        const assetIds = Object.keys(assetMap);
        for (let i = 0; i < assetIds.length; i++) {
            const assetId = assetIds[i];
            if (assetMap[assetId] === symbol) {
                return assetId;
            }
        }
        return '';
    }
    async fetchCurrencies(params = {}) {
        //
        // @method
        // @name fswap#fetchCurrencies
        // @description retrieves data on all supported currencies for fswap
        // @see https://developers.pando.im/references/4swap/api.html#read-assets
        // @param {object} [params] extra parameters specific to the exchange API endpoint
        // @returns {object} an associative dictionary of currencies
        //
        const response = await this.fswapPublicGetAssets(params);
        const data = this.safeValue(response, 'data', {});
        const assets = Object.values(data);
        return this.parseCurrencies(assets);
    }
    parseCurrencies(assets) {
        // [
        //   {
        //     "id": "c94ac88f-4671-3976-b60a-09064f1811e8",
        //     "name": "Mixin",
        //     "symbol": "XIN",
        //     "logo": "https://mixin-images.zeromesh.net/UasWtBZO0TZyLTLCFQjvE_UYekjC7eHCuT_9_52ZpzmCC-X-NPioVegng7Hfx0XmIUavZgz5UL-HIgPCBECc-Ws=s128",
        //     "chain_id": "43d61dcd-e413-450d-80b8-101d5e903357",
        //     "chain": {
        //       "id": "43d61dcd-e413-450d-80b8-101d5e903357",
        //       "name": "Ether",
        //       "symbol": "ETH",
        //       "logo": "https://mixin-images.zeromesh.net/zVDjOxNTQvVsA8h2B4ZVxuHoCF3DJszufYKWpd9duXUSbSapoZadC7_13cnWBqg0EmwmRcKGbJaUpA8wFfpgZA=s128",
        //       "chain_id": "43d61dcd-e413-450d-80b8-101d5e903357",
        //       "price": "3468.02",
        //       "tag": "unknown"
        //     },
        //     "price": "165.356218633992",
        //     "display_symbol": "XIN",
        //     "extra": "{\"name\":\"Mixin\",\"explorer\":\"https://mixin.one/snapshots\",\"intro\":{\"en\":[\"Mixin (XIN) is a smart-contract network designed to facilitate peer-to-peer (P2P) transactions with digital assets across blockchains.  Leveraging Directed Acyclic Graph (DAG) and Byzantine Fault-Tolerant protocols, Mixin aspires to help other blockchains achieve trillions of TPS, sub-second final confirmations, zero transaction fees, enhanced privacy, and unlimited extensibility. Mixin Messenger, the first dApp created on Mixin Network, combines Facebook Messenger-like features with a multi-currency mobile wallet. XIN is the native cryptocurrency of the Mixin Network, which also supports BTC, ETH, BCH, ETC, and more.\",\"The Mixin Kernel  now supports 24 blockchains, over 50,000 cryptocurrencies, and all manners of bots.\"],\"zh\":[\"XIN是Mixin平台的唯一代币，总量恒定为1,000,000。Mixin 是一个免费、快速的点对点跨链数字资产交易网络，可帮助其他区块链分布式账本获得超高TPS、亚秒级确认、零手续费、加强隐私、无限扩展的能力。Mixin网络使用PoS + Asynchronous BFT 共识机制，DAG数据储存，通过带惩罚机制的 PoS 去中心化网络，TEE 硬件加固，数万轻节点监督全节点防止作恶。\"]},\"website\":\"https://mixin.one\",\"issue\":\"2017/11/25\",\"total\":\"1000000\",\"circulation\":\"537721\"}",
        //     "tag": "unknown",
        //     "price_change": "0"
        //   }
        // ]
        const result = {};
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const id = this.safeString(asset, 'id');
            if (!id) {
                continue;
            }
            const code = this.parseSpecialSymbol(id, this.safeString(asset, 'symbol'));
            const name = this.safeString(asset, 'name');
            const logo = this.safeString(asset, 'logo');
            const chain = this.safeValue(asset, 'chain', {});
            const chainId = this.safeString(chain, 'chain_id');
            const chainName = this.safeString(chain, 'name');
            const chainSymbol = this.safeString(chain, 'symbol');
            const chainLogo = this.safeString(chain, 'logo');
            const chainPrice = this.safeNumber(chain, 'price');
            const chainTag = this.safeString(chain, 'tag');
            const price = this.safeNumber(asset, 'price');
            const extra = this.safeValue(asset, 'extra');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': true,
                'precision': 8,
                'logo': logo,
                'chain': {
                    'id': chainId,
                    'name': chainName,
                    'symbol': chainSymbol,
                    'logo': chainLogo,
                    'price': chainPrice,
                    'tag': chainTag,
                },
                'price': price,
                'extra': extra,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdrawal': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': asset,
            };
        }
        return result;
    }
    async fetchBalance(params = {}) {
        //
        // @method
        // @name fswap#fetchBalance
        // @description retrieves the balance for a specific account on fswap
        // @see https://developers.mixin.one/docs/api/safe-apis#get-utxo-list
        // @param {object} [params] extra parameters specific to the exchange API endpoint
        // @returns {object} a balance structure
        //
        const response = await this.mixinPrivateGetSafeSnapshots(params);
        const outputs = this.safeValue(response, 'data', []);
        return this.parseBalance(outputs);
    }
    parseBalance(outputs) {
        // {
        //   "type": "kernel_output",
        //   "output_id": "bfdec3d3-b269-3266-8d2e-8b51a660ceb4",
        //   "transaction_hash": "1865f9419622328cff1edaef3a6c9dfbb27991de6fc006ac1d484d28bee523b4",
        //   "output_index": 0,
        //   "amount": "0.00000001",
        //   "mask": "dcdd4988c7acd966d7ca81ce45343afc7831f6471de976f0334e2276ab9bc0bd",
        //   "keys": [
        //     "6944914904afc40d189cf5848ff9620193ac1a001b6e5ff10e202dd4497c4cd9"
        //   ],
        //   "senders_hash": "a8c4d19a7c921820b7d06674d3c6309dda518fd15547ccb5b7b953e3e99149e3",
        //   "senders_threshold": 1,
        //   "senders": [
        //     "44d9717d-8cae-4004-98a1-f9ad544dcfb1"
        //   ],
        //   "receivers_hash": "774cd40bc68f867ccb7f79f702fcfbb8f2bd83ce7c781cbae0ef517b20771c0a",
        //   "receivers_threshold": 1,
        //   "receivers": [
        //     "73179ddc-3e29-485b-bb13-03f514d4318e"
        //   ],
        //   "extra": "51564936513149364d4451364d444936576a6448517a6f325a545a6c597a5935596930304e474e694c5451774d575974595755304e4330785957513559545a694f5468694d5459",
        //   "state": "spent",
        //   "sequence": 8257839,
        //   "created_at": "2024-04-15T13:18:24.996154Z",
        //   "updated_at": "2024-05-15T10:48:57.894339Z",
        //   "signed_by": "0b1caaea515cc30b4df555a97b07f51c46bd4e61baa80dd730ec8c3da27a9bed",
        //   "signed_at": "2024-05-15T10:48:57.040218385Z",
        //   "spent_at": "2024-05-15T10:48:57.887095292Z",
        //   "asset_id": "c6d0c728-2624-429b-8e0d-d9d19b6592fa",
        //   "signers": [
        //     "73179ddc-3e29-485b-bb13-03f514d4318e"
        //   ],
        //   "request_id": "73b938d9-358f-431a-9818-31a2f8029ce3",
        //   "kernel_asset_id": "fe6b7788944d328778f98e3e81588215b5a07de4f9a4a7de4db4535b404e65db",
        //   "asset": "fe6b7788944d328778f98e3e81588215b5a07de4f9a4a7de4db4535b404e65db"
        // }
        const result = { 'info': outputs };
        for (let i = 0; i < outputs.length; i++) {
            const output = outputs[i];
            const state = this.safeString(output, 'state');
            if (state === 'spent') {
                continue;
            }
            const assetId = this.safeString(output, 'asset_id');
            const amount = this.safeString(output, 'amount');
            const symbol = this.mapAssetIdToSymbol(assetId);
            if (!result[symbol]) {
                result[symbol] = {
                    'free': 0,
                    'used': 0,
                    'total': 0,
                };
            }
            result[symbol].free = Precise.stringAdd(result[symbol].free, amount);
            result[symbol].total = Precise.stringAdd(result[symbol].total, amount);
        }
        return this.safeBalance(result);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        // @method
        // @name fswap#fetchOrder
        // @description retrieves the details of an order by its ID
        // @see https://developers.pando.im/references/4swap/api.html#get-orders-follow-id
        // @param {string} id the order ID to fetch
        // @param {object} [params] extra parameters specific to the exchange API endpoint
        // @returns {object} an order structure
        //
        const response = await this.fswapPrivateGetOrdersFollowId(this.extend({
            'follow_id': id,
        }, params));
        const order = this.safeValue(response, 'data', {});
        return this.parseOrder(order);
    }
    parseOrder(order) {
        // {
        //   "id": "87ae5014-d20f-4cf1-b530-8771137e4e0e",
        //   "created_at": "2020-09-15T03:35:34Z",
        //   "user_id": "8017d200-7870-4b82-b53f-74bae1d2dad7",
        //   "state": "Done", // order status Trading/Rejected/Done
        //   "pay_asset_id": "6cfe566e-4aad-470b-8c9a-2fd35b49c68d",
        //   "fill_asset_id": "c6d0c728-2624-429b-8e0d-d9d19b6592fa",
        //   "pay_amount": "1",
        //   "fill_amount": "00025725",
        //   "min_amount": "0.0002521",
        //   "routes": "1bv",
        //   "route_assets": [
        //     "6cfe566e-4aad-470b-8c9a-2fd35b49c68d",
        //     "c6d0c728-2624-429b-8e0d-d9d19b6592fa"
        //   ],
        //   "transactions": [
        //     {
        //       "id": "87ae5014-d20f-4cf1-b530-8771137e4e0e",
        //       "created_at": "2020-09-15T03:35:34Z",
        //       "user_id": "8017d200-7870-4b82-b53f-74bae1d2dad7",
        //       "type": "Swap",
        //       "base_asset_id": "6cfe566e-4aad-470b-8c9a-2fd35b49c68d",
        //       "quote_asset_id": "c6d0c728-2624-429b-8e0d-d9d19b6592fa",
        //       "base_amount": "1",
        //       "quote_amount": "-0.00025725",
        //       "fee_asset_id": "6cfe566e-4aad-470b-8c9a-2fd35b49c68d",
        //       "fee_amount": "0.003",
        //       "pay_asset_id": "6cfe566e-4aad-470b-8c9a-2fd35b49c68d",
        //       "filled_asset_id": "c6d0c728-2624-429b-8e0d-d9d19b6592fa",
        //       "funds": "1",
        //       "amount": "0.00025725"
        //     }
        //   ]
        // }
        const id = this.safeString(order, 'id');
        const timestamp = this.parse8601(this.safeString(order, 'created_at'));
        const datetime = this.iso8601(timestamp);
        const status = this.parseOrderStatus(this.safeString(order, 'state'));
        const payAssetId = this.safeString(order, 'pay_asset_id');
        const fillAssetId = this.safeString(order, 'fill_asset_id');
        const paySymbol = this.mapAssetIdToSymbol(payAssetId);
        const fillSymbol = this.mapAssetIdToSymbol(fillAssetId);
        const symbol = paySymbol + '/' + fillSymbol;
        const amount = this.safeString(order, 'pay_amount');
        const filled = this.safeString(order, 'fill_amount');
        const remaining = Precise.stringSub(amount, filled);
        const transactions = this.safeValue(order, 'transactions', []);
        const firstTx = this.safeValue(transactions, 0, {});
        const price = this.safeString(firstTx, 'quote_amount');
        const cost = Precise.stringMul(amount, price);
        const fee = {
            'cost': this.safeNumber(firstTx, 'fee_amount'),
            'currency': this.mapAssetIdToSymbol(this.safeString(firstTx, 'fee_asset_id')),
        };
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': datetime,
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'market',
            'timeInForce': undefined,
            'side': Precise.stringGt(amount, '0') ? 'buy' : 'sell',
            'price': this.parseNumber(price),
            'average': undefined,
            'amount': this.parseNumber(amount),
            'filled': this.parseNumber(filled),
            'remaining': this.parseNumber(remaining),
            'cost': this.parseNumber(cost),
            'trades': [],
            'fee': fee,
            'info': order,
            'reduceOnly': false,
            'postOnly': false,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
        };
    }
    parseOrderStatus(status) {
        const statuses = {
            'Trading': 'open',
            'Done': 'closed',
            'Rejected': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    findSymbol(payAssetId, fillAssetId) {
        const paySymbol = this.mapAssetIdToSymbol(payAssetId);
        const fillSymbol = this.mapAssetIdToSymbol(fillAssetId);
        return paySymbol + '/' + fillSymbol;
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        // Prepare request parameters
        const request = {
            'base': market['baseId'],
            'quote': market['quoteId'],
            'limit': limit,
        };
        // Fetch the trades
        const response = await this.fswapPrivateGetTransactionsBaseQuoteMine(this.extend(request, params));
        const data = this.safeValue(response, 'data', {});
        const trades = this.safeValue(data, 'transactions', []);
        const result = this.parseTrades(trades, market, since, limit);
        return result;
    }
    parseTrade(trade, market) {
        const timestamp = this.parse8601(this.safeString(trade, 'created_at'));
        const baseAmount = this.safeString(trade, 'base_amount');
        const quoteAmount = this.safeString(trade, 'quote_amount');
        const price = Precise.stringDiv(quoteAmount, baseAmount);
        const id = this.safeString(trade, 'id');
        return {
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': undefined,
            'price': this.parseNumber(price),
            'amount': this.parseNumber(baseAmount),
            'cost': this.parseNumber(quoteAmount),
            'fee': {
                'cost': this.safeNumber(trade, 'fee_amount'),
                'currency': market['quote'],
            },
            'takerOrMaker': 'taker',
            'info': trade,
        };
    }
    async verifySafeTx(raw) {
        const request_id = this.uuid();
        // Verify tx
        const verifyResp = await this.mixinPrivatePostSafeTransactionRequests([{
                raw,
                request_id,
            }]);
        const verifiedTx = this.safeValue(verifyResp, 'data', {});
        return {
            verifiedTx,
            request_id,
        };
    }
    async sendSafeTx(signedRaw, request_id) {
        const resp = await this.mixinPrivatePostSafeTransactions({
            'raw': signedRaw,
            'request_id': request_id,
        });
        const sendedTx = this.safeValue(resp, 'data', {});
        return sendedTx;
    }
    async getSafeTx(asset_id, amount, memo) {
        const members = [this.options.MTGMember0, this.options.MTGMember1, this.options.MTGMember2, this.options.MTGMember3, this.options.MTGMember4];
        const recipients = [this.mixinBuildSafeTransactionRecipient(members, this.options.MTGThrehold, amount)];
        const resp = await this.mixinPrivateGetSafeSnapshots({
            'asset': asset_id,
            'state': 'unspent',
        });
        const outputs = this.safeValue(resp, 'data', []);
        const { utxos, change } = this.mixinGetUnspentOutputsForRecipients(outputs, recipients);
        if (!change.isZero() && !change.isNegative()) {
            recipients.push(this.mixinBuildSafeTransactionRecipient(outputs[0].receivers, outputs[0].receivers_threshold, change.toString()));
        }
        const recipientDetails = [];
        for (let i = 0; i < recipients.length; i++) {
            const r = recipients[i];
            const members = this.safeValue(r, 'members');
            recipientDetails.push({
                'hint': this.uuid(),
                'receivers': members,
                'index': i,
            });
        }
        const ghosts = await this.mixinPrivatePostSafeKeys(recipientDetails);
        console.log('utxos', utxos);
        console.log('ghosts', ghosts);
        const tx = this.mixinBuildSafeTransaction(utxos, recipients, ghosts, memo);
        console.log('tx', tx);
        const encodedTx = this.mixinEncodeSafeTransaction(tx);
        return encodedTx;
    }
    async safeTransfer(asset_id, amount, memo) {
        const raw = await this.getSafeTx(asset_id, amount, memo);
        const { verifiedTx, request_id } = await this.verifySafeTx(raw);
        const views = this.safeValue(verifiedTx[0], 'views');
        const signedTx = await this.mixinSignSafeTransaction(verifiedTx, views, this.privateKey);
        const resp = this.sendSafeTx(signedTx, request_id);
        return resp;
    }
    async createOrder(symbol, type, side, amount, price, params) {
        await this.loadMarkets();
        // 0. Convert params to 4swap compatible params
        // 0.1 Determin payAssetId and fillAssetId based on symbol and side
        const [baseSymbol, quoteSymbol] = symbol.split('/');
        let payAssetId = '';
        let fillAssetId = '';
        if (side === 'buy') {
            payAssetId = this.mapSymbolToAssetId(baseSymbol);
            fillAssetId = this.mapSymbolToAssetId(quoteSymbol);
        }
        if (side === 'sell') {
            payAssetId = this.mapSymbolToAssetId(quoteSymbol);
            fillAssetId = this.mapSymbolToAssetId(baseSymbol);
        }
        if (!payAssetId) {
            throw new Error('Unable to find asset id for payAsset');
        }
        if (!fillAssetId) {
            throw new Error('Unable to find asset id for fillAsset');
        }
        // 1. Pre order and get memo
        const followID = this.uuid();
        const preOrderResp = this.ccxtProxyPost4swapPreorder({
            payAssetId,
            fillAssetId,
            'payAmount': amount.toString(),
            followID,
        });
        console.log('preOrderResp:', preOrderResp);
        const memo = this.safeString(preOrderResp, 'memo');
        console.log('memo:', memo);
        // 3. Init safe tx
        const resp = await this.safeTransfer(payAssetId, amount.toString(), memo);
        console.log('safeTransfer:', resp);
        return resp;
    }
    async deposit(symbol, amount) {
        const asset_id = this.mapSymbolToAssetId(symbol);
        return 'deposit';
    }
    sign(path, api = 'fswapPublic', method = 'GET', params = {}, headers = undefined, body = undefined) {
        //
        // @method
        // @name fswap#sign
        // @description signs the request using the exchange credentials
        // @param {string} path the endpoint path
        // @param {string} [api] the API type ('public' or 'private')
        // @param {string} [method] the HTTP method (default is 'GET')
        // @param {object} [params] extra parameters specific to the exchange API endpoint
        // @param {object} [headers] additional headers for the request
        // @param {string} [body] the body of the request
        // @returns {object} an object containing the signed request data (url, method, body, headers)
        //
        let url = this.urls['api'][api] + '/' + this.implodeParams(path, params);
        if (api === 'mixinPrivate' || api === 'fswapPrivate' || api === 'ccxtProxy') {
            this.checkRequiredCredentials();
            const requestID = this.uuid();
            let actualPath = '/' + path;
            if (api === 'fswapPrivate' || api === 'ccxtProxy') {
                actualPath = '/me';
            }
            const jwtToken = this.mixinSignAuthenticationToken(method, actualPath, params, requestID, {
                app_id: this.uid,
                session_id: this.login,
                session_private_key: this.password,
            });
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken,
                'X-Request-Id': requestID,
            };
            if (method === 'GET') {
                url += '?' + this.urlencode(params);
            }
            else {
                body = this.json(params);
            }
        }
        else {
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        return { url, method, body, headers };
    }
}

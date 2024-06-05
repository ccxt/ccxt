{
    "exchange": "oxfun",
    "options": {},
    "methods": {
        "createOrder": [
            {
                "description": "spot limit buy",
                "method": "createOrder",
                "input": [
                    "ETH/USDT",
                    "limit",
                    "buy",
                    0.01,
                    10
                ],
                "httpResponse": {
                    "success": true,
                    "data": [
                        {
                            "notice": "OrderOpened",
                            "accountId": "106464",
                            "orderId": "1000117918630",
                            "submitted": true,
                            "clientOrderId": "0",
                            "marketCode": "ETH-USDT",
                            "status": "OPEN",
                            "side": "BUY",
                            "price": "10.0",
                            "isTriggered": false,
                            "quantity": "0.01",
                            "amount": "0.0",
                            "orderType": "LIMIT",
                            "timeInForce": "GTC",
                            "createdAt": "1717083208567",
                            "source": "11",
                            "displayQuantity": "0.01"
                        }
                    ]
                },
                "parsedResponse": {
                    "id": "1000117918630",
                    "clientOrderId": "0",
                    "timestamp": 1717083208567,
                    "datetime": "2024-05-30T15:33:28.567Z",
                    "lastTradeTimestamp": null,
                    "lastUpdateTimestamp": null,
                    "status": "open",
                    "symbol": "ETH/USDT",
                    "type": "limit",
                    "timeInForce": "GTC",
                    "side": "buy",
                    "price": 10,
                    "average": null,
                    "amount": 0.01,
                    "filled": null,
                    "remaining": null,
                    "triggerPrice": null,
                    "stopLossPrice": null,
                    "cost": null,
                    "trades": [],
                    "fee": null,
                    "info": {
                        "notice": "OrderOpened",
                        "accountId": "106464",
                        "orderId": "1000117918630",
                        "submitted": true,
                        "clientOrderId": "0",
                        "marketCode": "ETH-USDT",
                        "status": "OPEN",
                        "side": "BUY",
                        "price": "10.0",
                        "isTriggered": false,
                        "quantity": "0.01",
                        "amount": "0.0",
                        "orderType": "LIMIT",
                        "timeInForce": "GTC",
                        "createdAt": "1717083208567",
                        "source": "11",
                        "displayQuantity": "0.01"
                    },
                    "fees": [],
                    "postOnly": false,
                    "reduceOnly": null,
                    "stopPrice": null,
                    "takeProfitPrice": null
                }
            }
        ],
        "fetchOrderBook": [
            {
                "description": "Fill this with a description of the method call",
                "method": "fetchOrderBook",
                "input": [
                    "ETH/USDT",
                    3
                ],
                "httpResponse": {
                    "success": true,
                    "level": "3",
                    "data": {
                        "marketCode": "ETH-USDT",
                        "lastUpdatedAt": "1717084636971",
                        "asks": [],
                        "bids": [
                            [
                                99,
                                0.01
                            ],
                            [
                                10,
                                0.01
                            ]
                        ]
                    }
                },
                "parsedResponse": {
                    "symbol": "ETH/USDT",
                    "bids": [
                        [
                            99,
                            0.01
                        ],
                        [
                            10,
                            0.01
                        ]
                    ],
                    "asks": [],
                    "timestamp": 1717084636971,
                    "datetime": "2024-05-30T15:57:16.971Z",
                    "nonce": null
                }
            }
        ],
        "fetchOrder": [
            {
                "description": "fetch spot order by id",
                "method": "fetchOrder",
                "input": [
                    1000117918630,
                    "ETH/USDT"
                ],
                "httpResponse": {
                    "success": true,
                    "data": {
                    "orderId": "1000117918630",
                    "clientOrderId": "0",
                    "marketCode": "ETH-USDT",
                    "status": "OPEN",
                    "side": "BUY",
                    "price": "10.0",
                    "isTriggered": false,
                    "remainQuantity": "0.01",
                    "totalQuantity": "0.01",
                    "amount": "0",
                    "displayQuantity": "0.01",
                    "cumulativeMatchedQuantity": "0",
                    "orderType": "LIMIT",
                    "timeInForce": "GTC",
                    "source": "11",
                    "createdAt": "1717083208542"
                    }
                },
                "parsedResponse": {
                    "id": "1000117918630",
                    "clientOrderId": "0",
                    "timestamp": 1717083208542,
                    "datetime": "2024-05-30T15:33:28.542Z",
                    "lastTradeTimestamp": null,
                    "lastUpdateTimestamp": null,
                    "status": "open",
                    "symbol": "ETH/USDT",
                    "type": "limit",
                    "timeInForce": "GTC",
                    "side": "buy",
                    "price": 10,
                    "average": null,
                    "amount": 0.01,
                    "filled": 0,
                    "remaining": 0.01,
                    "triggerPrice": null,
                    "stopLossPrice": null,
                    "cost": 0,
                    "trades": [],
                    "fee": null,
                    "info": {
                    "orderId": "1000117918630",
                    "clientOrderId": "0",
                    "marketCode": "ETH-USDT",
                    "status": "OPEN",
                    "side": "BUY",
                    "price": "10.0",
                    "isTriggered": false,
                    "remainQuantity": "0.01",
                    "totalQuantity": "0.01",
                    "amount": "0",
                    "displayQuantity": "0.01",
                    "cumulativeMatchedQuantity": "0",
                    "orderType": "LIMIT",
                    "timeInForce": "GTC",
                    "source": "11",
                    "createdAt": "1717083208542"
                    },
                    "fees": [],
                    "postOnly": false,
                    "reduceOnly": null,
                    "stopPrice": null,
                    "takeProfitPrice": null
                }
            }
        ],
        "cancelAllOrders": [
            {
                "description": "Fill this with a description of the method call",
                "method": "cancelAllOrders",
                "input": [],
                "httpResponse": {
                    "success": true,
                    "data": {
                        "notice": "Orders queued for cancelation"
                    }
                },
                "parsedResponse": {
                    "success": true,
                    "data": {
                        "notice": "Orders queued for cancelation"
                    }
                }
            }
        ],
        "fetchMyTrades": [
            {
                "description": "Fill this with a description of the method call",
                "method": "fetchMyTrades",
                "input": [
                    "ETH/USD:OX",
                    1716966000000
                ],
                "httpResponse": {
                    "success": true,
                    "data": [
                        {
                            "orderId": "1000117638529",
                            "clientOrderId": "1717024731867",
                            "matchId": "400017157974541552",
                            "marketCode": "ETH-USD-SWAP-LIN",
                            "side": "SELL",
                            "matchedQuantity": "0.01",
                            "matchPrice": "3794.7",
                            "total": "3794.7",
                            "orderMatchType": "TAKER",
                            "feeAsset": "OX",
                            "fee": "2.65629",
                            "source": "0",
                            "matchedAt": "1717024733539"
                        }
                    ]
                },
                "parsedResponse": [
                    {
                        "id": "400017157974541552",
                        "timestamp": 1717024733539,
                        "datetime": "2024-05-29T23:18:53.539Z",
                        "symbol": "ETH/USD:OX",
                        "type": null,
                        "order": "1000117638529",
                        "side": "sell",
                        "takerOrMaker": "taker",
                        "price": 3794.7,
                        "amount": 0.01,
                        "cost": 37.947,
                        "fee": {
                            "cost": 2.65629,
                            "currency": "OX"
                        },
                        "info": {
                            "orderId": "1000117638529",
                            "clientOrderId": "1717024731867",
                            "matchId": "400017157974541552",
                            "marketCode": "ETH-USD-SWAP-LIN",
                            "side": "SELL",
                            "matchedQuantity": "0.01",
                            "matchPrice": "3794.7",
                            "total": "3794.7",
                            "orderMatchType": "TAKER",
                            "feeAsset": "OX",
                            "fee": "2.65629",
                            "source": "0",
                            "matchedAt": "1717024733539"
                        },
                        "fees": [
                            {
                            "cost": 2.65629,
                            "currency": "OX"
                            }
                        ]
                    }
                ]
            }
        ],
        "fetchTicker": [
            {
                "description": "Fetch ticker for ETH/USDT",
                "method": "fetchTicker",
                "input": [
                    "ETH/USDT"
                ],
                "httpResponse": {
                    "success": true,
                    "data": [
                        {
                            "marketCode": "ETH-USDT",
                            "markPrice": "3775.4",
                            "open24h": "3764.4",
                            "high24h": "3801.6",
                            "low24h": "3703.1",
                            "volume24h": "0",
                            "currencyVolume24h": "0",
                            "openInterest": "0",
                            "lastTradedPrice": "0",
                            "lastTradedQuantity": "0",
                            "lastUpdatedAt": "1717085734197"
                        }
                    ]
                },
                "parsedResponse": {
                    "symbol": "ETH/USDT",
                    "timestamp": 1717085734197,
                    "datetime": "2024-05-30T16:15:34.197Z",
                    "high": 3801.6,
                    "low": 3703.1,
                    "bid": null,
                    "bidVolume": null,
                    "ask": null,
                    "askVolume": null,
                    "vwap": null,
                    "open": 3764.4,
                    "close": null,
                    "last": null,
                    "previousClose": null,
                    "change": null,
                    "percentage": null,
                    "average": null,
                    "baseVolume": 0,
                    "quoteVolume": null,
                    "info": {
                    "marketCode": "ETH-USDT",
                    "markPrice": "3775.4",
                    "open24h": "3764.4",
                    "high24h": "3801.6",
                    "low24h": "3703.1",
                    "volume24h": "0",
                    "currencyVolume24h": "0",
                    "openInterest": "0",
                    "lastTradedPrice": "0",
                    "lastTradedQuantity": "0",
                    "lastUpdatedAt": "1717085734197"
                    }
                }
            }
        ],
        "fetchOHLCV": [
            {
                "description": "Fetch OHLCV for ETH/USDT",
                "method": "fetchOHLCV",
                "input": [
                    "ETH/USDT",
                    "1m",
                    1717085760000
                ],
                "httpResponse": {
                    "success": true,
                    "timeframe": "60s",
                    "data": [
                        {
                            "open": "3776.80000000",
                            "high": "3777.90000000",
                            "low": "3775.90000000",
                            "close": "3776.80000000",
                            "volume": "0",
                            "currencyVolume": "0",
                            "openedAt": "1717085880000"
                        },
                        {
                            "open": "3775.00000000",
                            "high": "3777.30000000",
                            "low": "3775.00000000",
                            "close": "3776.80000000",
                            "volume": "0",
                            "currencyVolume": "0",
                            "openedAt": "1717085820000"
                        },
                        {
                            "open": "3775.00000000",
                            "high": "3775.90000000",
                            "low": "3773.70000000",
                            "close": "3775.00000000",
                            "volume": "0",
                            "currencyVolume": "0",
                            "openedAt": "1717085760000"
                        }
                    ]
                },
                "parsedResponse": [
                    [
                        1717085760000,
                        3775,
                        3775.9,
                        3773.7,
                        3775,
                        0
                    ],
                    [
                        1717085820000,
                        3775,
                        3777.3,
                        3775,
                        3776.8,
                        0
                    ],
                    [
                        1717085880000,
                        3776.8,
                        3777.9,
                        3775.9,
                        3776.8,
                        0
                    ]
                ]
            }
        ],
        "fetchFundingRateHistory": [
            {
                "description": "Fetch funding rate history for ETH/USD:OX",
                "method": "fetchFundingRateHistory",
                "input": [
                    "ETH/USD:OX",
                    1717581601006
                ],
                "httpResponse": {
                    "success": true,
                    "data": [
                        {
                            "marketCode": "ETH-USD-SWAP-LIN",
                            "fundingRate": "0.000131000",
                            "createdAt": "1717581601006"
                        }
                    ]
                },
                "parsedResponse": [
                    {
                        "info": {
                            "marketCode": "ETH-USD-SWAP-LIN",
                            "fundingRate": "0.000131000",
                            "createdAt": "1717581601006"
                        },
                            "symbol": "ETH/USD:OX",
                            "fundingRate": 0.000131,
                            "timestamp": 1717581601006,
                            "datetime": "2024-06-05T10:00:01.006Z"
                    }
                ]
            }
        ],
        "fetchFundingHistory": [
            {
                "description": "Fetch funding history",
                "method": "fetchFundingHistory",
                "input": [
                    "ETH/USD:OX",
                    1715083251516,
                    2,
                    {
                        "until": 1715086852890
                    }
                ],
                "httpResponse": {
                  "success": true,
                  "data": [
                        {
                            "id": "966698111997509637",
                            "marketCode": "ETH-USD-SWAP-LIN",
                            "payment": "-0.0067419",
                            "fundingRate": "0.000022",
                            "position": "0.001",
                            "indexPrice": "3064.5",
                            "createdAt": "1715083251516"
                        }
                    ]
                },
                "parsedResponse": [
                    {
                        "info": {
                            "id": "966698111997509637",
                            "marketCode": "ETH-USD-SWAP-LIN",
                            "payment": "-0.0067419",
                            "fundingRate": "0.000022",
                            "position": "0.001",
                            "indexPrice": "3064.5",
                            "createdAt": "1715083251516"
                        },
                        "symbol": "ETH/USD:OX",
                        "code": "OX",
                        "timestamp": 1715083251516000,
                        "datetime": "+056318-10-29T14:18:36.000Z",
                        "id": "966698111997509637",
                        "amount": -0.0067419,
                        "rate": 0.000022
                    }
                ]
            }
        ],
        "fetchTrades": [
            {
                "description": "Fetch trades with a since timestamp argument",
                "method": "fetchTrades",
                "input": [
                    "ETH/USD:OX",
                    1715686562085,
                    2,
                    {
                        "until": 1715687562085
                    }
                ],
                "httpResponse": {
                    "success": true,
                    "data": [
                        {
                            "marketCode": "ETH-USD-SWAP-LIN",
                            "matchPrice": "2911",
                            "matchQuantity": "0.07",
                            "side": "BUY",
                            "matchType": "TAKER",
                            "matchedAt": "1715686562085"
                        }
                    ]
                },
                "parsedResponse": [
                    {
                        "id": null,
                        "timestamp": 1715686562085,
                        "datetime": "2024-05-14T11:36:02.085Z",
                        "symbol": "ETH/USD:OX",
                        "type": null,
                        "order": null,
                        "side": "buy",
                        "takerOrMaker": "taker",
                        "price": 2911,
                        "amount": 0.07,
                        "cost": 203.77,
                        "fee": {
                            "cost": null,
                            "currency": null
                        },
                        "info": {
                            "marketCode": "ETH-USD-SWAP-LIN",
                            "matchPrice": "2911",
                            "matchQuantity": "0.07",
                            "side": "BUY",
                            "matchType": "TAKER",
                            "matchedAt": "1715686562085"
                        },
                        "fees": [
                            {
                                "cost": null,
                                "currency": null
                            }
                        ]
                    }
                ]
            }
        ],
        "transfer": [
            {
                "description": "Transfet OX from main account to sub account",
                "method": "transfer",
                "input": [
                    "OX",
                    10,
                    106464,
                    106570
                ],
                "httpResponse": {
                    "success": true,
                    "data": {
                        "asset": "OX",
                        "quantity": "10",
                        "fromAccount": "106464",
                        "toAccount": "106570",
                        "transferredAt": "1717584816626"
                    }
                },
                "parsedResponse": {
                    "id": null,
                    "timestamp": 1717584816626,
                    "datetime": "2024-06-05T10:53:36.626Z",
                    "currency": "OX",
                    "amount": 10,
                    "fromAccount": "106464",
                    "toAccount": "106570",
                    "status": null,
                    "info": {
                        "asset": "OX",
                        "quantity": "10",
                        "fromAccount": "106464",
                        "toAccount": "106570",
                        "transferredAt": "1717584816626"
                    }
                }
            }
        ],
        "fetchTransfers": [
            {
                "description": "Fill this with a description of the method call",
                "method": "fetchTransfers",
                "input": [],
                "httpResponse": {
                    "success": true,
                    "data": [
                        {
                            "asset": "OX",
                            "quantity": "10",
                            "fromAccount": "106464",
                            "toAccount": "106570",
                            "id": "974895240428093443",
                            "status": "COMPLETED",
                            "transferredAt": "1717584816624"
                        }
                    ]
                },
                "parsedResponse": [
                    {
                        "id": "974895240428093443",
                        "timestamp": 1717584816624,
                        "datetime": "2024-06-05T10:53:36.624Z",
                        "currency": "OX",
                        "amount": 10,
                        "fromAccount": "106464",
                        "toAccount": "106570",
                        "status": "ok",
                        "info": {
                            "asset": "OX",
                            "quantity": "10",
                            "fromAccount": "106464",
                            "toAccount": "106570",
                            "id": "974895240428093443",
                            "status": "COMPLETED",
                            "transferredAt": "1717584816624"
                        }
                    }
                ]
            }
        ],
        "fetchWithdrawals": [
            {
                "description": "Fetch withdrawals",
                "method": "fetchWithdrawals",
                "input": [
                    "OX",
                    1715530365450,
                    2,
                    {
                        "until": 1715530527000
                    }
                ],
                "httpResponse": {
                    "success": true,
                    "data": [
                        {
                            "id": "968163212989431811",
                            "asset": "OX",
                            "network": "Arbitrum",
                            "address": "0x90fc1fB49a4ED8f485dd02A2a1Cf576897f6Bfc9",
                            "quantity": "11.7444",
                            "fee": "1.744400000",
                            "status": "COMPLETED",
                            "txId": "0xe96b2d128b737fdbca927edf355cff42202e65b0fb960e64ffb9bd68c121f69f",
                            "requestedAt": "1715530365450",
                            "completedAt": "1715530527000",
                            "type": "withdrawal"
                        }
                    ]
                },
                "parsedResponse": [
                    {
                        "info": {
                            "id": "968163212989431811",
                            "asset": "OX",
                            "network": "Arbitrum",
                            "address": "0x90fc1fB49a4ED8f485dd02A2a1Cf576897f6Bfc9",
                            "quantity": "11.7444",
                            "fee": "1.744400000",
                            "status": "COMPLETED",
                            "txId": "0xe96b2d128b737fdbca927edf355cff42202e65b0fb960e64ffb9bd68c121f69f",
                            "requestedAt": "1715530365450",
                            "completedAt": "1715530527000"
                        },
                        "id": "968163212989431811",
                        "txid": "0xe96b2d128b737fdbca927edf355cff42202e65b0fb960e64ffb9bd68c121f69f",
                        "timestamp": 1715530365450,
                        "datetime": "2024-05-12T16:12:45.450Z",
                        "network": "ARB",
                        "address": null,
                        "addressTo": "0x90fc1fB49a4ED8f485dd02A2a1Cf576897f6Bfc9",
                        "addressFrom": null,
                        "tag": null,
                        "tagTo": null,
                        "tagFrom": null,
                        "type": "withdrawal",
                        "amount": 11.7444,
                        "currency": "OX",
                        "status": "ok",
                        "updated": null,
                        "internal": null,
                        "comment": null,
                        "fee": {
                            "cost": 1.7444,
                            "currency": "OX"
                        }
                    }
                ]
            }
        ]
    }
}

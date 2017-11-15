<?php

namespace ccxt;

include_once ('base/Exchange.php');

class independentreserve extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'independentreserve',
            'name' => 'Independent Reserve',
            'countries' => array ( 'AU', 'NZ' ), // Australia, New Zealand
            'rateLimit' => 1000,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg',
                'api' => array (
                    'public' => 'https://api.independentreserve.com/Public',
                    'private' => 'https://api.independentreserve.com/Private',
                ),
                'www' => 'https://www.independentreserve.com',
                'doc' => 'https://www.independentreserve.com/API',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'GetValidPrimaryCurrencyCodes',
                        'GetValidSecondaryCurrencyCodes',
                        'GetValidLimitOrderTypes',
                        'GetValidMarketOrderTypes',
                        'GetValidOrderTypes',
                        'GetValidTransactionTypes',
                        'GetMarketSummary',
                        'GetOrderBook',
                        'GetTradeHistorySummary',
                        'GetRecentTrades',
                        'GetFxRates',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'PlaceLimitOrder',
                        'PlaceMarketOrder',
                        'CancelOrder',
                        'GetOpenOrders',
                        'GetClosedOrders',
                        'GetClosedFilledOrders',
                        'GetOrderDetails',
                        'GetAccounts',
                        'GetTransactions',
                        'GetDigitalCurrencyDepositAddress',
                        'GetDigitalCurrencyDepositAddresses',
                        'SynchDigitalCurrencyDepositAddressWithBlockchain',
                        'WithdrawDigitalCurrency',
                        'RequestFiatWithdrawal',
                        'GetTrades',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $baseCurrencies = $this->publicGetValidPrimaryCurrencyCodes ();
        $quoteCurrencies = $this->publicGetValidSecondaryCurrencyCodes ();
        $result = array ();
        for ($i = 0; $i < count ($baseCurrencies); $i++) {
            $baseId = $baseCurrencies[$i];
            $baseIdUppercase = strtoupper ($baseId);
            $base = $this->common_currency_code($baseIdUppercase);
            for ($j = 0; $j < count ($quoteCurrencies); $j++) {
                $quoteId = $quoteCurrencies[$j];
                $quoteIdUppercase = strtoupper ($quoteId);
                $quote = $this->common_currency_code($quoteIdUppercase);
                $id = $baseId . '/' . $quoteId;
                $symbol = $base . '/' . $quote;
                $taker = 0.5 / 100;
                $maker = 0.5 / 100;
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'baseId' => $baseId,
                    'quoteId' => $quoteId,
                    'taker' => $taker,
                    'maker' => $maker,
                    'info' => $id,
                );
            }
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privatePostGetAccounts ();
        $result = array ( 'info' => $balances );
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $currencyCode = $balance['CurrencyCode'];
            $uppercase = strtoupper ($currencyCode);
            $currency = $this->common_currency_code($uppercase);
            $account = $this->account ();
            $account['free'] = $balance['AvailableBalance'];
            $account['total'] = $balance['TotalBalance'];
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetOrderBook (array_merge (array (
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
        ), $params));
        $timestamp = $this->parse8601 ($response['CreatedTimestampUtc']);
        return $this->parse_order_book($response, $timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->parse8601 ($ticker['CreatedTimestampUtc']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['DayHighestPrice'],
            'low' => $ticker['DayLowestPrice'],
            'bid' => $ticker['CurrentHighestBidPrice'],
            'ask' => $ticker['CurrentLowestOfferPrice'],
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $ticker['LastPrice'],
            'change' => null,
            'percentage' => null,
            'average' => $ticker['DayAvgPrice'],
            'baseVolume' => $ticker['DayVolumeXbtInSecondaryCurrrency'],
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketSummary (array_merge (array (
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
        ), $params));
        return $this->parse_ticker($response, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['TradeTimestampUtc']);
        return array (
            'id' => null,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => null,
            'price' => $trade['SecondaryCurrencyTradePrice'],
            'amount' => $trade['PrimaryCurrencyAmount'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetRecentTrades (array_merge (array (
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
            'numberOfRecentTradesToRetrieve' => 50, // max = 50
        ), $params));
        return $this->parse_trades($response['Trades'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $capitalizedOrderType = $this->capitalize ($type);
        $method = 'Place' . $capitalizedOrderType . 'Order';
        $orderType = $capitalizedOrderType;
        $orderType .= ($side == 'sell') ?  'Offer' : 'Bid';
        $order = $this->ordered (array (
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
            'orderType' => $orderType,
        ));
        if ($type == 'limit')
            $order['price'] = $price;
        $order['volume'] = $amount;
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['OrderGuid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostCancelOrder (array ( 'orderGuid' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $auth = array (
                $url,
                'apiKey=' . $this->apiKey,
                'nonce=' . (string) $nonce,
            );
            $keysorted = $this->keysort ($params);
            $keys = array_keys ($keysorted);
            for ($i = 0; $i < count ($keys); $i++) {
                $key = $keys[$i];
                $auth[] = $key . '=' . $params[$key];
            }
            $message = implode (',', $auth);
            $signature = $this->hmac ($this->encode ($message), $this->encode ($this->secret));
            $query = $this->keysort (array_merge (array (
                'apiKey' => $this->apiKey,
                'nonce' => $nonce,
                'signature' => $signature,
            ), $params));
            $body = $this->json ($query);
            $headers = array ( 'Content-Type' => 'application/json' );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        // todo error handling
        return $response;
    }
}

?>
<?php

namespace ccxt;

include_once ('base/Exchange.php');

class bitmarket extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bitmarket',
            'name' => 'BitMarket',
            'countries' => array ( 'PL', 'EU' ),
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'timeframes' => array (
                '90m' => '90m',
                '6h' => '6h',
                '1d' => '1d',
                '1w' => '7d',
                '1M' => '1m',
                '3M' => '3m',
                '6M' => '6m',
                '1y' => '1y',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg',
                'api' => array (
                    'public' => 'https://www.bitmarket.net',
                    'private' => 'https://www.bitmarket.pl/api2/', // last slash is critical
                ),
                'www' => array (
                    'https://www.bitmarket.pl',
                    'https://www.bitmarket.net',
                ),
                'doc' => array (
                    'https://www.bitmarket.net/docs.php?file=api_public.html',
                    'https://www.bitmarket.net/docs.php?file=api_private.html',
                    'https://github.com/bitmarket-net/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'json/{market}/ticker',
                        'json/{market}/orderbook',
                        'json/{market}/trades',
                        'json/ctransfer',
                        'graphs/{market}/90m',
                        'graphs/{market}/6h',
                        'graphs/{market}/1d',
                        'graphs/{market}/7d',
                        'graphs/{market}/1m',
                        'graphs/{market}/3m',
                        'graphs/{market}/6m',
                        'graphs/{market}/1y',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'info',
                        'trade',
                        'cancel',
                        'orders',
                        'trades',
                        'history',
                        'withdrawals',
                        'tradingdesk',
                        'tradingdeskStatus',
                        'tradingdeskConfirm',
                        'cryptotradingdesk',
                        'cryptotradingdeskStatus',
                        'cryptotradingdeskConfirm',
                        'withdraw',
                        'withdrawFiat',
                        'withdrawPLNPP',
                        'withdrawFiatFast',
                        'deposit',
                        'transfer',
                        'transfers',
                        'marginList',
                        'marginOpen',
                        'marginClose',
                        'marginCancel',
                        'marginModify',
                        'marginBalanceAdd',
                        'marginBalanceRemove',
                        'swapList',
                        'swapOpen',
                        'swapClose',
                    ),
                ),
            ),
            'markets' => array (                'BTC/PLN' => array ( 'id' => 'BTCPLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN'),
                'BTC/EUR' => array ('id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR'),
                'LTC/PLN' => array ('id' => 'LTCPLN', 'symbol' => 'LTC/PLN', 'base' => 'LTC', 'quote' => 'PLN'),
                'LTC/BTC' => array ('id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC'),
                'LiteMineX/BTC' => array ('id' => 'LiteMineXBTC', 'symbol' => 'LiteMineX/BTC', 'base' => 'LiteMineX', 'quote' => 'BTC'),
                'PlnX/BTC' => array ('id' => 'PlnxBTC', 'symbol' => 'PlnX/BTC', 'base' => 'PlnX', 'quote' => 'BTC'),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostInfo ();
        $data = $response['data'];
        $balance = $data['balances'];
        $result = array ('info' => $data);
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balance['available']))
                $account['free'] = $balance['available'][$currency];
            if (array_key_exists ($currency, $balance['blocked']))
                $account['used'] = $balance['blocked'][$currency];
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetJsonMarketOrderbook (array_merge (array (
            'market' => $this->market_id($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetJsonMarketTicker (array_merge (array (
            'market' => $this->market_id($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $side = ($trade['type'] == 'bid') ? 'buy' : 'sell';
        $timestamp = $trade['date'] * 1000;
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetJsonMarketTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '90m', $since = null, $limit = null) {
        return [
            $ohlcv['time'] * 1000,
            floatval ($ohlcv['open']),
            floatval ($ohlcv['high']),
            floatval ($ohlcv['low']),
            floatval ($ohlcv['close']),
            floatval ($ohlcv['vol']),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '90m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $method = 'publicGetGraphsMarket' . $this->timeframes[$timeframe];
        $market = $this->market ($symbol);
        $response = $this->$method (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $response = $this->privatePostTrade (array_merge (array (
            'market' => $this->market_id($symbol),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
        $result = array (
            'info' => $response,
        );
        if (array_key_exists ('id', $response['order']))
            $result['id'] = $response['id'];
        return $result;
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancel (array ('id' => $id));
    }

    public function is_fiat ($currency) {
        if ($currency == 'EUR')
            return true;
        if ($currency == 'PLN')
            return true;
        return false;
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $method = null;
        $request = array (
            'currency' => $currency,
            'quantity' => $amount,
        );
        if ($this->isFiat ($currency)) {
            $method = 'privatePostWithdrawFiat';
            if (array_key_exists ('account', $params)) {
                $request['account'] = $params['account']; // bank account code for withdrawal
            } else {
                throw new ExchangeError ($this->id . ' requires account parameter to withdraw fiat currency');
            }
            if (array_key_exists ('account2', $params)) {
                $request['account2'] = $params['account2']; // bank SWIFT code (EUR only)
            } else {
                if ($currency == 'EUR')
                    throw new ExchangeError ($this->id . ' requires account2 parameter to withdraw EUR');
            }
            if (array_key_exists ('withdrawal_note', $params)) {
                $request['withdrawal_note'] = $params['withdrawal_note']; // a 10-character user-specified withdrawal note (PLN only)
            } else {
                if ($currency == 'PLN')
                    throw new ExchangeError ($this->id . ' requires withdrawal_note parameter to withdraw PLN');
            }
        } else {
            $method = 'privatePostWithdraw';
            $request['address'] = $address;
        }
        $response = $this->$method (array_merge ($request, $params));
        return array (
            'info' => $response,
            'id' => $response,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'public') {
            $url .= '/' . $this->implode_params($path . '.json', $params);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'tonce' => $nonce,
                'method' => $path,
            ), $params);
            $body = $this->urlencode ($query);
            $headers = array (
                'API-Key' => $this->apiKey,
                'API-Hash' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ('url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers);
    }
}

?>
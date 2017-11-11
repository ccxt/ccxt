<?php

namespace ccxt;

include_once ('liqui.php');

class yobit extends liqui {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'yobit',
            'name' => 'YoBit',
            'countries' => 'RU',
            'rateLimit' => 3000, // responses are cached every 2 seconds
            'version' => '3',
            'hasCORS' => false,
            'hasWithdraw' => true,
            'hasFetchTickers' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
                'api' => array (
                    'public' => 'https://yobit.net/api',
                    'private' => 'https://yobit.net/tapi',
                ),
                'www' => 'https://www.yobit.net',
                'doc' => 'https://www.yobit.net/en/api/',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth/{pair}',
                        'info',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'ActiveOrders',
                        'CancelOrder',
                        'GetDepositAddress',
                        'getInfo',
                        'OrderInfo',
                        'Trade',
                        'TradeHistory',
                        'WithdrawCoinsToAddress',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.002,
                    'taker' => 0.002,
                ),
                'funding' => 0.0,
            ),
        ));
    }

    public function common_currency_code ($currency) {
        $substitutions = array (
            'AIR' => 'AirCoin',
            'ANI' => 'ANICoin',
            'ANT' => 'AntsCoin',
            'ATM' => 'Autumncoin',
            'BCC' => 'BCH',
            'BTS' => 'Bitshares2',
            'DCT' => 'Discount',
            'DGD' => 'DarkGoldCoin',
            'ICN' => 'iCoin',
            'LIZI' => 'LiZi',
            'LUN' => 'LunarCoin',
            'NAV' => 'NavajoCoin',
            'OMG' => 'OMGame',
            'PAY' => 'EPAY',
            'REP' => 'Republicoin',
        );
        if (array_key_exists ($currency, $substitutions))
            return $substitutions[$currency];
        return $currency;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostGetInfo ();
        $balances = $response['return'];
        $result = array ( 'info' => $balances );
        $sides = array ( 'free' => 'funds', 'total' => 'funds_incl_orders' );
        $keys = array_keys ($sides);
        for ($i = 0; $i < count ($keys); $i++) {
            $key = $keys[$i];
            $side = $sides[$key];
            if (array_key_exists ($side, $balances)) {
                $currencies = array_keys ($balances[$side]);
                for ($j = 0; $j < count ($currencies); $j++) {
                    $lowercase = $currencies[$j];
                    $uppercase = strtoupper ($lowercase);
                    $currency = $this->common_currency_code($uppercase);
                    $account = null;
                    if (array_key_exists ($currency, $result)) {
                        $account = $result[$currency];
                    } else {
                        $account = $this->account ();
                    }
                    $account[$key] = $balances[$side][$lowercase];
                    if ($account['total'] && $account['free'])
                        $account['used'] = $account['total'] - $account['free'];
                    $result[$currency] = $account;
                }
            }
        }
        return $this->parse_balance($result);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostWithdrawCoinsToAddress (array_merge (array (
            'coinName' => $currency,
            'amount' => $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }
}

?>
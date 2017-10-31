<?php

namespace ccxt;

include_once ('btcbox.php');

class jubi extends btcbox {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'jubi',
            'name' => 'jubi.com',
            'countries' => 'CN',
            'rateLimit' => 1500,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
                'api' => 'https://www.jubi.com/api',
                'www' => 'https://www.jubi.com',
                'doc' => 'https://www.jubi.com/help/api.html',
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetAllticker ();
        $keys = array_keys ($markets);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $base = strtoupper ($id);
            $quote = 'CNY'; // todo
            $symbol = $base . '/' . $quote;
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $id,
            );
        }
        return $result;
    }
}

?>
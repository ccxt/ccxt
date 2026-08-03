<?php

use function React\Async\async;
use function React\Async\await;
use function React\Promise\all;

include dirname(dirname(dirname(__FILE__))) . '/ccxt.php';
date_default_timezone_set('UTC');

function loadMarkets($exchange) {
    return async(function () use ($exchange) {
        try {
            echo "Querying " . $exchange->id . "...\n";
            $markets = await($exchange->load_markets());
            $msg = count(array_values($markets)) . " markets: " .
                implode(', ', array_slice($exchange->symbols, 0, 5)) . "...\n";
        } catch (\ccxt\RequestTimeout $e) {
            $msg = '[Timeout Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
        } catch (\ccxt\DDoSProtection $e) {
            $msg = '[DDoS Protection Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
        } catch (\ccxt\AuthenticationError $e) {
            $msg = '[Authentication Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
        } catch (\ccxt\ExchangeNotAvailable $e) {
            $msg = '[Exchange Not Available] ' . $e->getMessage() . ' (ignoring)' . "\n";
        } catch (\ccxt\NotSupported $e) {
            $msg = '[Not Supported] ' . $e->getMessage() . ' (ignoring)' . "\n";
        } catch (\ccxt\NetworkError $e) {
            $msg = '[Network Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
        } catch (\ccxt\ExchangeError $e) {
            $msg = '[Exchange Error] ' . $e->getMessage() . "\n";
        } catch (Exception $e) {
            $msg = '[Error] ' . $e->getMessage() . "\n";
        }
        echo "--------------------------------------------\n";
        echo $exchange->id . "\n";
        echo $msg;
        echo "\n";
    });
}

$exchanges = \ccxt\Exchange::$exchanges;

$promises = [];

foreach ($exchanges as $exchange) {
    $id = "\\ccxt\\async\\" . $exchange;
    $exchange = new $id([]);

    $promises[] = loadMarkets($exchange);
}

await(all($promises));

<?php

use Recoil\React\ReactKernel;

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt_async.php';

date_default_timezone_set ('UTC');

$loop = \React\EventLoop\Factory::create();
$kernel = ReactKernel::create($loop);

$exchange = new \ccxt_async\binance ($loop, array (
    //'verbose' => true,
    'timeout' => 30000,
));

$loop->addPeriodicTimer(3, function () use ($exchange, $kernel) {
    $kernel->execute(function () use ($exchange) {
        try {

            $symbol = 'ETH/BTC';
            $result = yield $exchange->fetch_ticker ($symbol);

            echo $result['datetime'] . ': Bid: ' . $result['bid'] . '; Ask: ' . $result['ask'] . "\n";

        } catch (\ccxt\NetworkError $e) {
            echo '[Network Error] ' . $e->getMessage () . "\n";
        } catch (\ccxt\ExchangeError $e) {
            echo '[Exchange Error] ' . $e->getMessage () . "\n";
        } catch (Exception $e) {
            echo '[Error] ' . $e->getMessage () . "\n";
        }
    });
});

$kernel->run();

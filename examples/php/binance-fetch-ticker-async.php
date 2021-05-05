<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$loop = \React\EventLoop\Factory::create();
$kernel = \Recoil\React\ReactKernel::create($loop);

$exchange = new \ccxt_async\binance (array (
    'loop' => $loop,
    'kernel' => $kernel,
    //'verbose' => true,
    'timeout' => 30000,
));

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

$kernel->run();

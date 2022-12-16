<?php

use Recoil\React\ReactKernel;
use Recoil\Recoil;

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

function loadMarkets($exchange) {
    try {
        echo "Querying " . $exchange->id . "...\n";
        $markets = yield $exchange->load_markets ();
        $msg = count (array_values ($markets)) . " markets: " .
            implode (', ', array_slice ($exchange->symbols, 0, 5)) . "...\n";
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
        $msg = '[Exchange Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
    } catch (Exception $e) {
        $msg = '[Error] ' . $e->getMessage() . "\n";
    }
    echo "--------------------------------------------\n";
    echo $exchange->id . "\n";
    echo $msg;
    echo "\n";
}

$loop = \React\EventLoop\Factory::create();
$kernel = \Recoil\React\ReactKernel::create($loop);

$kernel->execute(function() use ($loop, $kernel) {
    $exchanges = \ccxt\Exchange::$exchanges;

    $yields = [];

    foreach ($exchanges as $exchange) {
        $id = "\\ccxt_async\\".$exchange;
        $exchange = new $id(array('loop' => $loop, 'kernel' => $kernel));

        $yields[] = loadMarkets($exchange);
    }
    yield $yields;

}, $loop);

$kernel->run();
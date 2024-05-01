<?php
use Ratchet\Client\WebSocket;
use React\Promise\Deferred;

    require __DIR__ . '/../../vendor/autoload.php';

    define('AGENT', 'Pawl/0.4');

    $connFactory = function() {
        $connector = new Ratchet\Client\Connector();

        return function($url) use ($connector) {
            return $connector('ws://127.0.0.1:9001' . $url);
        };
    };

    $connector = $connFactory();

    $connector('/getCaseCount')
        ->then(function(WebSocket $conn) {
            $futureNum = new Deferred;

            $conn->on('message', function($msg) use ($futureNum) {
                $futureNum->resolve($msg);
            });

            return $futureNum->promise();
        }, function($e) {
            echo "Could not connect to test server: {$e->getMessage()}\n";
        })->then(function($numOfCases) use ($connector) {
            echo "Running {$numOfCases} test cases\n\n";

            $allCases = new Deferred;

            $i = 0;

            $runNextCase = function() use (&$runNextCase, &$i, $numOfCases, $allCases, $connector) {
                $i++;

                if ($i > (int)$numOfCases->getPayload()) {
                    $allCases->resolve();

                    return;
                }

                echo ".";

                $connector("/runCase?case={$i}&agent=" . AGENT)->then(function(WebSocket $conn) use ($runNextCase) {
                    $conn->on('message', function($msg, $conn) {
                        $conn->send($msg);
                    });

                    $conn->on('close', $runNextCase);
                });
            };

            $runNextCase();

            return $allCases->promise();
        })->then(function() use ($connector) {
            $connector('/updateReports?agent=' . AGENT)->then(function(WebSocket $conn) {
                echo "\nDone!\n";
                $conn->on('close', function () {
                    \React\EventLoop\Loop::stop();
                });
            });
        });

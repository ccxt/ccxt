<?php

date_default_timezone_set ('UTC');

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/ccxtpro.php';

$loop = \React\EventLoop\Factory::create();

print_r(\ccxtpro\Exchange::$exchanges);

// ...

?>
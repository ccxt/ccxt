<?php
	$root = dirname(dirname(dirname(__FILE__)));
	include $root . '/ccxt.php';
	
	date_default_timezone_set('UTC');
	
	$exchange = new \ccxt\tokenomy(array(
		'apiKey' => 'your-key-here',
		'secret' => 'your-secret-here',
		'enableRateLimit' => true
	));
	
	$balance = $exchange->fetch_balance();
	echo "<pre>";
	print_r($balance);
	exit();
?>
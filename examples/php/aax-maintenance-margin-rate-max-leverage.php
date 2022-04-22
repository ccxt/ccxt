<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

public function get_max_leverage($market, $leverage, $positionSize, $orderType, $entryPrice = null, $bid = null, $ask = null) {
    /**
     * Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
     * @param {dict} $market CCXT $market
     * @param {float} $leverage
     * @param {float} $positionSize The number of contracts
     * @param {str} $orderType 'limit' or 'market'
     * @param {float|null} $entryPrice The average entry $price for the position, required when $orderType === 'limit', default is null
     * @param {float|null} $bid The highest buying $price on the order book, required when $orderType === 'market', default is null
     * @param {float|null} $ask The lowest selling $price on the order book, required when $orderType === 'market', default is null
     * @return {float} The maximum $leverage available for the $market for the given position size
     */
    $isLimit = $orderType === 'limit';
    if ($isLimit && $entryPrice === null) { // limit order
        throw new \Exception('getMaxLeverage argument $entryPrice required when $orderType === limit');
    } else if (!$isLimit && ($bid === null || $ask === null)) { // $market order
        throw new \Exception('getMaxLeverage arguments $bid and $ask required when $orderType === market');
    }
    $info = $market['info'];
    $multiplier = floatval ($info['multiplier']);
    $price = $isLimit ? $entryPrice : (($bid . $ask) / 2);
    $price = $market['inverse'] ? $price : ($price * $multiplier);
    return $positionSize / $price / $leverage;
}

public function get_maintenance_margin_rate($market, $leverage, $positionSize, $entryPrice, $takerOrMaker = 'taker') {
    /**
     * Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
     * @param {dict} $market CCXT $market
     * @param {float} $leverage
     * @param {float} $positionSize The number of contracts
     * @param {float} $entryPrice The average entry $price for the position
     * @param {str} $takerOrMaker Not required $market is inverse, default 'taker'
     * @return {float} The maintenanceMargin rate as a percentage for the $market with the given position size
     */
    $info = $market['info'];
    $multiplier = floatval ($info['multiplier']);
    if ($market['inverse']) {
        return $positionSize / $entryPrice / $leverage;
    } else {
        $price = ($entryPrice * $multiplier);
        $positionValue = $price * $positionSize;
        $commissionFees = $positionValue * $market[$takerOrMaker];
        return ($positionSize / $price / $leverage) . $commissionFees;
    }
}

public function get_margin_when_adjusting_leverage($market, $leverage, $positionSize, $entryPrice, $takerOrMaker, $unrealizedPnl) {
    /**
     * Equation taken from https://support.aax.com/en/articles/5295653-what-is-margin
     * @param {dict} $market CCXT $market
     * @param {float} $leverage
     * @param {float} $positionSize The number of contracts
     * @param {float} $entryPrice The average entry $price for the position
     * @param {str} $takerOrMaker default 'taker'
     * @param {float} $unrealizedPnl Unrealized profit/loss for the position
     * @return {float} The maintenanceMargin rate as a percentage for the $market with the given position size
     */
    $info = $market['info'];
    $multiplier = floatval ($info['multiplier']);
    $price = $market['inverse'] ? $entryPrice : ($entryPrice * $multiplier);
    $positionValue = $price * $positionSize;
    $commissionFees = $positionValue * $market[$takerOrMaker];
    if ($market['inverse']) {
        return ($positionValue * ((1 / $leverage) . $commissionFees)) - min (0, $unrealizedPnl);
    } else {
        return ($positionValue * ((1 / $leverage) . $commissionFees)) - min (0, $unrealizedPnl);
    }
}

public function main_function() {
    
    $exchange = '\\ccxt\\aax';
    $exchange = new $exchange (array (
        'enableRateLimit' => true,
        'rateLimit' => 12000,
    ));

    $exchange->load_markets();
    
    $leverage = 10;
    $positionSize = 10;
    $bid = 1.0000;
    $ask = 1.0001;
    $unrealizedPnl = 0.1;
    
    // Linear markets
    $symbol = 'ADA/USDT:USDT';
    $market = $exchange->market ($symbol);
    
    $maxLeverage = $this->get_max_leverage($market, $leverage, $positionSize, 'limit', $bid); // Max $leverage for linear limit position, entryPrice=$bid
    $maintenanceMarginRate = $this->get_maintenance_margin_rate($market, $leverage, $positionSize, $bid, 'maker'); // Maintenance margin rate for linear maker position, entryPrice=$bid
    $marginWhenAdjustingLeverage = $this->get_margin_when_adjusting_leverage($market, $leverage, $positionSize, $bid, 'maker', $unrealizedPnl); // Margin when adjusting $leverage for linear maker position, entryPrice=$bid
    var_dump ($maxLeverage, $maintenanceMarginRate, $marginWhenAdjustingLeverage);
    
    $maxLeverage = $this->get_max_leverage($market, $leverage, $positionSize, 'market', null, $bid, $ask); // Max $leverage for linear $market position
    $maintenanceMarginRate = $this->get_maintenance_margin_rate($market, $leverage, $positionSize, $ask, 'taker'); // Maintenance margin rate for linear taker position, entryPrice=$ask
    $marginWhenAdjustingLeverage = $this->get_margin_when_adjusting_leverage($market, $leverage, $positionSize, $ask, 'taker', $unrealizedPnl); // Margin when adjusting $leverage for linear taker position, entryPrice=$ask
    var_dump ($maxLeverage, $maintenanceMarginRate, $marginWhenAdjustingLeverage);
    
    // Inverse markets
    $symbol = 'BTC/USD:BTC';
    $market = $exchange->market ($symbol);
    
    $maxLeverage = $this->get_max_leverage($market, $leverage, $positionSize, 'limit', $bid); // Max $leverage for inverse limit position, entryPrice=$bid
    $maintenanceMarginRate = $this->get_maintenance_margin_rate($market, $leverage, $positionSize, $bid, 'maker'); // Maintenance margin rate for inverse maker position, entryPrice=$bid
    $marginWhenAdjustingLeverage = $this->get_margin_when_adjusting_leverage($market, $leverage, $positionSize, $bid, 'maker', $unrealizedPnl); // Margin when adjusting $leverage for inverse maker position, entryPrice=$bid
    var_dump ($maxLeverage, $maintenanceMarginRate, $marginWhenAdjustingLeverage);
    
    $maxLeverage = $this->get_max_leverage($market, $leverage, $positionSize, 'market', null, $bid, $ask); // Max $leverage for inverse $market position
    $maintenanceMarginRate = $this->get_maintenance_margin_rate($market, $leverage, $positionSize, $ask, 'taker'); // Maintenance margin rate for inverse taker position, entryPrice=$ask
    $marginWhenAdjustingLeverage = $this->get_margin_when_adjusting_leverage($market, $leverage, $positionSize, $ask, 'taker', $unrealizedPnl); // Margin when adjusting $leverage for inverse taker position, entryPrice=$ask
    var_dump ($maxLeverage, $maintenanceMarginRate, $marginWhenAdjustingLeverage);
}

?>
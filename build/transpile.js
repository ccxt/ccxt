// ---------------------------------------------------------------------------
// Usage: npm run transpile
// ---------------------------------------------------------------------------

import fs from 'fs'
import log from 'ololog'
import ansi from 'ansicolor'
import { promisify } from 'util'
import errors from "../js/src/base/errors.js"
import {unCamelCase, precisionConstants, safeString, unique} from "../js/src/base/functions.js"
import Exchange from '../js/src/base/Exchange.js'
import { basename, join, resolve } from 'path'
import { createFolderRecursively, replaceInFile, overwriteFile } from './fsLocal.js'
import { pathToFileURL } from 'url'
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import { platform } from 'process'
import os from 'os'
import { fork } from 'child_process'
import * as url from 'node:url';
import Piscina from 'piscina';
ansi.nice

import { Transpiler as astTranspiler } from 'ast-transpiler';

const pythonCodingUtf8 = '# -*- coding: utf-8 -*-'
const baseExchangeJsFile = './ts/src/base/Exchange.ts'

const exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds = exchanges.ids

let __dirname = new URL('.', import.meta.url).pathname;

// this is necessary because for some reason
// pathname keeps the first '/' for windows paths
// making them invalid
// example: /C:Users/user/Desktop/
if (platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring(1)
    }
}
class Transpiler {

    getCommonRegexes () {
        return [

            [ /(?<!assert|equals)(\s\(?)(rsa|ecdsa|eddsa|jwt|totp|inflate)\s/g, '$1this.$2' ],
            [ /\.deepExtend\s/g, '.deep_extend'],
            [ /\.safeFloat2\s/g, '.safe_float_2'],
            [ /\.safeInteger2\s/g, '.safe_integer_2'],
            [ /\.safeIntegerProduct2\s/g, '.safe_integer_product_2'],
            [ /\.safeTimestamp2\s/g, '.safe_timestamp_2'],
            [ /\.safeString2\s/g, '.safe_string_2'],
            [ /\.safeNumber2\s/g, '.safe_number_2'],
            [ /\.safeStringLower2\s/g, '.safe_string_lower_2'],
            [ /\.safeStringUpper2\s/g, '.safe_string_upper_2'],
            [ /\.safeValue2\s/g, '.safe_value_2'],
            [ /\.safeNumber\s/g, '.safe_number'],
            [ /\.safeFloat\s/g, '.safe_float'],
            [ /\.safeInteger\s/g, '.safe_integer'],
            [ /\.safeIntegerProduct\s/g, '.safe_integer_product'],
            [ /\.safeTimestamp\s/g, '.safe_timestamp'],
            [ /\.safeString\s/g, '.safe_string'],
            [ /\.safeStringLower\s/g, '.safe_string_lower'],
            [ /\.safeStringUpper\s/g, '.safe_string_upper'],
            [ /\.safeValue\s/g, '.safe_value'],
            [ /\.safeFloatN\s/g, '.safe_float_n'],
            [ /\.safeIntegerN\s/g, '.safe_integer_n'],
            [ /\.safeIntegerProductN\s/g, '.safe_integer_product_n'],
            [ /\.safeTimestampN\s/g, '.safe_timestamp_n'],
            [ /\.safeStringN\s/g, '.safe_string_n'],
            [ /\.safeNumberN\s/g, '.safe_number_n'],
            [ /\.safeStringLowerN\s/g, '.safe_string_lower_n'],
            [ /\.safeStringUpperN\s/g, '.safe_string_upper_n'],
            [ /\.safeValueN\s/g, '.safe_value_n'],
            [ /\.inArray\s/g, '.in_array'],
            [ /\.toArray\s/g, '.to_array'],
            [ /\.isEmpty\s/g, '.is_empty'],
            [ /\.arrayConcat\s/g, '.array_concat'],
            [ /\.binaryConcat\s/g, '.binary_concat'],
            [ /\.binaryConcatArray\s/g, '.binary_concat_array'],
            [ /\.binaryToString\s/g, '.binary_to_string' ],
            [ /\.precisionFromString\s/g, '.precision_from_string'],
            [ /\.parsePrecision\s/g, '.parse_precision'],
            [ /\.parseNumber\s/g, '.parse_number'],
            [ /\.implodeHostname\s/g, '.implode_hostname'],
            [ /\.implodeParams\s/g, '.implode_params'],
            [ /\.extractParams\s/g, '.extract_params'],
            [ /\.safeBalance\s/g, '.safe_balance'],
            [ /\.parseAccounts\s/g, '.parse_accounts' ],
            [ /\.parseAccount\s/g, '.parse_account' ],
            [ /\.parseBalance\s/g, '.parse_balance'],
            [ /\.parseBorrowInterest\s/g, '.parse_borrow_interest'],
            [ /\.parseFundingRateHistories\s/g, '.parse_funding_rate_histories'],
            [ /\.parseFundingRateHistory\s/g, '.parse_funding_rate_history'],
            [ /\.parseOHLCVs\s/g, '.parse_ohlcvs'],
            [ /\.parseOHLCV\s/g, '.parse_ohlcv'],
            [ /\.parseDate\s/g, '.parse_date'],
            [ /\.parseDepositAddresses\s/g, '.parse_deposit_addresses'],
            [ /\.parseDepositAddress\s/g, '.parse_deposit_address'],
            [ /\.parseMarketLeverageTiers\s/g, '.parse_market_leverage_tiers'],
            [ /\.parseLeverageTiers\s/g, '.parse_leverage_tiers'],
            [ /\.parseLedgerEntry\s/g, '.parse_ledger_entry'],
            [ /\.parseLedger\s/g, '.parse_ledger'],
            [ /\.parseTickers\s/g, '.parse_tickers'],
            [ /\.parseTicker\s/g, '.parse_ticker'],
            [ /\.parseTimeframe\s/g, '.parse_timeframe'],
            [ /\.parseTradesData\s/g, '.parse_trades_data'],
            [ /\.parseTrades\s/g, '.parse_trades'],
            [ /\.parseTrade\s/g, '.parse_trade'],
            [ /\.parseTradingFees\s/g, '.parse_trading_fees'],
            [ /\.parseTradingFee\s/g, '.parse_trading_fee'],
            [ /\.parseTradingViewOHLCV\s/g, '.parse_trading_view_ohlcv'],
            [ /\.convertTradingViewToOHLCV\s/g, '.convert_trading_view_to_ohlcv'],
            [ /\.parseTransactions\s/g, '.parse_transactions'],
            [ /\.parseTransaction\s/g, '.parse_transaction'],
            [ /\.parseTransfers\s/g, '.parse_transfers'],
            [ /\.parseTransfer\s/g, '.parse_transfer'],
            [ /\.parseOrderBook\s/g, '.parse_order_book'],
            [ /\.parseBidsAsks\s/g, '.parse_bids_asks'],
            [ /\.parseBidAsk\s/g, '.parse_bid_ask'],
            [ /\.parseOpenInterests\s/g, '.parse_open_interests'],
            [ /\.parseOpenInterest\s/g, '.parse_open_interest'],
            [ /\.parseBidAsk\s/g, '.parse_bid_ask'],
            [ /\.parseOrders\s/g, '.parse_orders'],
            [ /\.parseOrderStatus\s/g, '.parse_order_status'],
            [ /\.parseOrder\s/g, '.parse_order'],
            [ /\.parseJson\s/g, '.parse_json'],
            [ /\.parseAccountPosition\s/g, '.parse_account_position' ],
            [ /\.parsePositionRisk\s/g, '.parse_position_risk' ],
            [ /\.parsePositions\s/g, '.parse_positions' ],
            [ /\.parsePosition\s/g, '.parse_position' ],
            [ /\.parseIncome\s/g, '.parse_income' ],
            [ /\.parseIncomes\s/g, '.parse_incomes' ],
            [ /\.parseFundingRates\s/g, '.parse_funding_rates' ],
            [ /\.parseFundingRate\s/g, '.parse_funding_rate' ],
            [ /\.parseMarginModification\s/g, '.parse_margin_modification' ],
            [ /\.filterByArray\s/g, '.filter_by_array'],
            [ /\.filterByValueSinceLimit\s/g, '.filter_by_value_since_limit'],
            [ /\.filterBySymbolSinceLimit\s/g, '.filter_by_symbol_since_limit'],
            [ /\.filterByCurrencySinceLimit\s/g, '.filter_by_currency_since_limit'],
            [ /\.filterBySinceLimit\s/g, '.filter_by_since_limit'],
            [ /\.filterBySymbol\s/g, '.filter_by_symbol'],
            [ /\.getVersionString\s/g, '.get_version_string'],
            [ /\.checkRequiredArgument\s/g, '.check_required_argument'],
            [ /\.indexBy\s/g, '.index_by'],
            [ /\.sortBy\s/g, '.sort_by'],
            [ /\.sortBy2\s/g, '.sort_by_2'],
            [ /\.filterBy\s/g, '.filter_by'],
            [ /\.groupBy\s/g, '.group_by'],
            [ /\.marketSymbols\s/g, '.market_symbols'],
            [ /\.marketIds\s/g, '.market_ids'],
            [ /\.marketId\s/g, '.market_id'],
            [ /\.fetchFundingFee\s/g, '.fetch_funding_fee'],
            [ /\.fetchFundingFees\s/g, '.fetch_funding_fees'],
            [ /\.fetchTradingLimits\s/g, '.fetch_trading_limits'],
            [ /\.fetchTransactionFee\s/g, '.fetch_transaction_fee'],
            [ /\.fetchTransactionFees\s/g, '.fetch_transaction_fees'],
            [ /\.fetchTradingFees\s/g, '.fetch_trading_fees'],
            [ /\.fetchTradingFee\s/g, '.fetch_trading_fee'],
            [ /\.fetchFees\s/g, '.fetch_fees'],
            [ /\.fetchOHLCVC\s/g, '.fetch_ohlcvc'],
            [ /\.fetchOHLCV\s/g, '.fetch_ohlcv'],
            [ /\.buildOHLCVC\s/g, '.build_ohlcvc'],
            [ /\.fetchL2OrderBook\s/g, '.fetch_l2_order_book'],
            [ /\.fetchOrderBook\s/g, '.fetch_order_book'],
            [ /\.fetchMyTrades\s/g, '.fetch_my_trades'],
            [ /\.fetchOrderStatus\s/g, '.fetch_order_status'],
            [ /\.fetchOpenOrders\s/g, '.fetch_open_orders'],
            [ /\.fetchOpenOrder\s/g, '.fetch_open_order'],
            [ /\.fetchOrders\s/g, '.fetch_orders'],
            [ /\.fetchOrderTrades\s/g, '.fetch_order_trades'],
            [ /\.fetchOrder\s/g, '.fetch_order'],
            [ /\.fetchBalance\s/g, '.fetch_balance'],
            [ /\.fetchTotalBalance\s/g, '.fetch_total_balance'],
            [ /\.fetchUsedBalance\s/g, '.fetch_used_balance'],
            [ /\.fetchFreeBalance\s/g, '.fetch_free_balance'],
            [ /\.fetchPartialBalance\s/g, '.fetch_partial_balance'],
            [ /\.fetchPermissions\s/g, '.fetch_permissions'],
            [ /\.fetchBidsAsks\s/g, '.fetch_bids_asks'],
            [ /\.fetchTickers\s/g, '.fetch_tickers'],
            [ /\.fetchTicker\s/g, '.fetch_ticker'],
            [ /\.fetchCurrencies\s/g, '.fetch_currencies'],
            [ /\.fetchStatus\s/g, '.fetch_status'],
            [ /\.numberToString\s/g, '.number_to_string' ],
            [ /\.decimalToPrecision\s/g, '.decimal_to_precision'],
            [ /\.priceToPrecision\s/g, '.price_to_precision'],
            [ /\.amountToPrecision\s/g, '.amount_to_precision'],
            [ /\.amountToLots\s/g, '.amount_to_lots'],
            [ /\.feeToPrecision\s/g, '.fee_to_precision'],
            [ /\.currencyToPrecision\s/g, '.currency_to_precision'],
            [ /\.costToPrecision\s/g, '.cost_to_precision'],
            [ /\.commonCurrencyCode\s/g, '.common_currency_code'],
            [ /\.getDefaultOptions\s/g, '.get_default_options'],
            [ /\.loadAccounts\s/g, '.load_accounts'],
            [ /\.fetchAccounts\s/g, '.fetch_accounts'],
            [ /\.loadFees\s/g, '.load_fees'],
            [ /\.loadMarkets\s/g, '.load_markets'],
            [ /\.loadTimeDifference\s/g, '.load_time_difference'],
            [ /\.fetchMarkets\s/g, '.fetch_markets'],
            [ /\.fetchMarketLeverageTiers\s/g, '.fetch_market_leverage_tiers'],
            [ /\.fetchLeverageTiers\s/g, '.fetch_leverage_tiers'],
            [ /\.appendInactiveMarkets\s/g, '.append_inactive_markets'],
            [ /\.fetchCategories\s/g, '.fetch_categories'],
            [ /\.calculateFee\s/g, '.calculate_fee'],
            [ /\.createOrder\s/g, '.create_order'],
            [ /\.createPostOnlyOrder\s/g, '.create_post_only_order'],
            [ /\.createStopOrder\s/g, '.create_stop_order'],
            [ /\.createStopLimitOrder\s/g, '.create_stop_limit_order'],
            [ /\.createStopMarketOrder\s/g, '.create_stop_market_order'],
            [ /\.editLimitBuyOrder\s/g, '.edit_limit_buy_order'],
            [ /\.editLimitSellOrder\s/g, '.edit_limit_sell_order'],
            [ /\.editLimitOrder\s/g, '.edit_limit_order'],
            [ /\.editOrder\s/g, '.edit_order'],
            [ /\.encodeURIComponent\s/g, '.encode_uri_component'],
            [ /\.throwExceptionOnError\s/g, '.throw_exception_on_error'],
            [ /\.handleErrors\s/g, '.handle_errors'],
            [ /\.handleWithdrawTagAndParams\s/g, '.handle_withdraw_tag_and_params'],
            [ /\.checkRequiredCredentials\s/g, '.check_required_credentials'],
            [ /\.checkRequiredDependencies\s/g, '.check_required_dependencies'],
            [ /\.checkAddress\s/g, '.check_address'],
            [ /\.convertTradingViewToOHLCV\s/g, '.convert_trading_view_to_ohlcv'],
            [ /\.convertOHLCVToTradingView\s/g, '.convert_ohlcv_to_trading_view'],
            [ /\.signBodyWithSecret\s/g, '.sign_body_with_secret'],
            [ /\.isJsonEncodedObject\s/g, '.is_json_encoded_object'],
            [ /\.setSandboxMode\s/g, '.set_sandbox_mode'],
            [ /\.safeCurrencyCode\s/g, '.safe_currency_code'],
            [ /\.safeCurrency\s/g, '.safe_currency'],
            [ /\.safeSymbol\s/g, '.safe_symbol'],
            [ /\.safeMarket\s/g, '.safe_market'],
            [ /\.safeOrder\s/g, '.safe_order'],
            [ /\.safeTicker\s/g, '.safe_ticker'],
            [ /\.roundTimeframe\s/g, '.round_timeframe'],
            [ /\.calculateRateLimiterCost\s/g, '.calculate_rate_limiter_cost' ],
            [ /\.findBroadlyMatchedKey\s/g, '.find_broadly_matched_key' ],
            [ /\.throwBroadlyMatchedException\s/g, '.throw_broadly_matched_exception' ],
            [ /\.throwExactlyMatchedException\s/g, '.throw_exactly_matched_exception' ],
            [ /\.getNetwork\s/g, '.get_network' ],
            [ /\.findTimeframe\s/g, '.find_timeframe'],
            [ /errorHierarchy/g, 'error_hierarchy'],
            [ /\.base16ToBinary/g, '.base16_to_binary'],
            [ /\'use strict\';?\s+/g, '' ],
            [ /\.urlencodeNested\s/g, '.urlencode_nested' ],
            [ /\.urlencodeWithArrayRepeat\s/g, '.urlencode_with_array_repeat' ],
            [ /\.call\s*\(this, /g, '(' ],
            [ /\.getSupportedMapping\s/g, '.get_supported_mapping'],
            [ /\.fetchBorrowRates\s/g, '.fetch_borrow_rates'],
            [ /\.fetchBorrowRate\s/g, '.fetch_borrow_rate'],
            [ /\.handleMarketTypeAndParams\s/g, '.handle_market_type_and_params'],
            [ /\.checkOrderArguments\s/g, '.check_order_arguments'],
            [ /\.isPostOnly\s/g, '.is_post_only'],
            [ /\.reduceFeesByCurrency\s/g, '.reduce_fees_by_currency'],
            [ /\.omitZero\s/g, '.omit_zero'],
            [ /\.safeCurrencyStructure\s/g, '.safe_currency_structure'],
            [ /\.isTickPrecision\s/g, '.is_tick_precision'],
            [ /\.isDecimalPrecision\s/g, '.is_decimal_precision'],
            [ /\.isSignificantPrecision\s/g, '.is_significant_precision'],
            [ /\.filterByLimit\s/g, '.filter_by_limit'],
            [ /\ssha(1|256|384|512)([,)])/g, ' \'sha$1\'$2'], // from js imports to this
            [ /\s(md5|secp256k1|ed25519|keccak)([,)])/g, ' \'$1\'$2'], // from js imports to this

        ].concat(this.getTypescriptRemovalRegexes())
    }

    getPythonRegexes () {

        return [
            [ /Array\.isArray\s*\(([^\)]+)\)/g, 'isinstance($1, list)' ],
            [ /Number\.isInteger\s*\(([^\)]+)\)/g, 'isinstance($1, int)' ],
            [ /([^\(\s]+)\s+instanceof\s+String/g, 'isinstance($1, str)' ],
            [ /([^\(\s]+)\s+instanceof\s+([^\)\s]+)/g, 'isinstance($1, $2)' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'undefined\'/g, '$1[$2] is None' ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'undefined\'/g, '$1[$2] is not None' ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'undefined\'/g, '$1 is None' ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'undefined\'/g, '$1 is not None' ],
            [ /typeof\s+(.+?)\s+\=\=\=?\s+\'undefined\'/g, '$1 is None' ],
            [ /typeof\s+(.+?)\s+\!\=\=?\s+\'undefined\'/g, '$1 is not None' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'number\'/g, "isinstance($1[$2], numbers.Real)" ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'number\'/g, "(not isinstance($1[$2], numbers.Real))" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'number\'/g, "isinstance($1, numbers.Real)" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'number\'/g, "(not isinstance($1, numbers.Real))" ],

            [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+undefined/g, '$1[$2] is None' ],
            [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+undefined/g, '$1[$2] is not None' ],
            [ /([^\s]+)\s+\=\=\=?\s+undefined/g, '$1 is None' ],
            [ /([^\s]+)\s+\!\=\=?\s+undefined/g, '$1 is not None' ],
            [ /(.+?)\s+\=\=\=?\s+undefined/g, '$1 is None' ],
            [ /(.+?)\s+\!\=\=?\s+undefined/g, '$1 is not None' ],
            //
            // too broad, have to rewrite these cause they don't work
            //
            // [ /([^\s]+)\s+\=\=\=?\s+true/g, 'isinstance($1, bool) and ($1 is True)' ],
            // [ /([^\s]+)\s+\!\=\=?\s+true/g, 'isinstance($1, bool) and ($1 is not True)' ],
            // [ /([^\s]+)\s+\=\=\=?\s+false/g, 'isinstance($1, bool) and ($1 is False)' ],
            // [ /([^\s]+)\s+\!\=\=?\s+false/g, 'isinstance($1, bool) and ($1 is not False)' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'string\'/g, 'isinstance($1[$2], str)' ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'string\'/g, 'not isinstance($1[$2], str)' ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'string\'/g, 'isinstance($1, str)' ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'string\'/g, 'not isinstance($1, str)' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'object\'/g, 'isinstance($1[$2], dict)' ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'object\'/g, 'not isinstance($1[$2], dict)' ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'object\'/g, 'isinstance($1, dict)' ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'object\'/g, 'not isinstance($1, dict)' ],

            [ /undefined/g, 'None' ],
            [ /\=\=\=?/g, '==' ],
            [ /\!\=\=?/g, '!=' ],
            [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
            [ /\.shift\s*\(\)/g, '.pop(0)' ],
            [ /Number\.MAX_SAFE_INTEGER/g, 'float(\'inf\')'],
            [ /function\s*(\w+\s*\([^)]+\))\s*{/g, 'def $1:'],
            // [ /\.replaceAll\s*\(([^)]+)\)/g, '.replace($1)' ], // still not a part of the standard
            [ /assert\s*\((.+)\);/g, 'assert $1'],
            [ /Promise\.all\s*\(([^\)]+)\)/g, 'asyncio.gather(*$1)' ],
            [ /Precise\.stringAdd\s/g, 'Precise.string_add' ],
            [ /Precise\.stringMul\s/g, 'Precise.string_mul' ],
            [ /Precise\.stringDiv\s/g, 'Precise.string_div' ],
            [ /Precise\.stringSub\s/g, 'Precise.string_sub' ],
            [ /Precise\.stringAbs\s/g, 'Precise.string_abs' ],
            [ /Precise\.stringNeg\s/g, 'Precise.string_neg' ],
            [ /Precise\.stringMod\s/g, 'Precise.string_mod' ],
            [ /Precise\.stringEquals\s/g, 'Precise.string_equals' ],
            [ /Precise\.stringEq\s/g, 'Precise.string_eq' ],
            [ /Precise\.stringMin\s/g, 'Precise.string_min' ],
            [ /Precise\.stringMax\s/g, 'Precise.string_max' ],
            [ /Precise\.stringGt\s/g, 'Precise.string_gt' ],
            [ /Precise\.stringGe\s/g, 'Precise.string_ge' ],
            [ /Precise\.stringLt\s/g, 'Precise.string_lt' ],
            [ /Precise\.stringLe\s/g, 'Precise.string_le' ],
            [ /\.padEnd\s/g, '.ljust'],
            [ /\.padStart\s/g, '.rjust' ],

        // insert common regexes in the middle (critical)
        ].concat (this.getCommonRegexes ()).concat ([

            // [ /this\.urlencode\s/g, '_urlencode.urlencode ' ], // use self.urlencode instead
            [ /this\./g, 'self.' ],
            [ /([^a-zA-Z\'])this([^a-zA-Z])/g, '$1self$2' ],
            [ /\[\s*([^\]]+)\s\]\s=/g, '$1 =' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\[\s*([^\]]+)\s\]/g, '$1$2' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\{\s*([^\}]+)\s\}\s\=\s([^\;]+)/g, '$1$2 = (lambda $2: ($2))(**$3)' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)/g, 'list($1.keys())' ],
            [ /Object\.values\s*\((.*)\)/g, 'list($1.values())' ],
            [ /\[([^\]]+)\]\.join\s*\(([^\)]+)\)/g, "$2.join([$1])" ],
            [ /hash \(([^,]+)\, \'(sha[0-9])\'/g, "hash($1, '$2'" ],
            [ /hmac \(([^,]+)\, ([^,]+)\, \'(md5)\'/g, 'hmac($1, $2, hashlib.$3' ],
            [ /hmac \(([^,]+)\, ([^,]+)\, \'(sha[0-9]+)\'/g, 'hmac($1, $2, hashlib.$3' ],
            [ /throw new ([\S]+) \((.*)\)/g, 'raise $1($2)'],
            [ /throw ([\S]+)/g, 'raise $1'],
            [ /try {/g, 'try:'],
            [ /\}\s+catch \(([\S]+)\) {/g, 'except Exception as $1:'],
            [ /([\s\(])extend(\s)/g, '$1self.extend$2' ],
            [ /\} else if/g, 'elif' ],
            [ /else if/g, 'elif' ],
            [ /if\s+\((.*)\)\s+\{/g, 'if $1:' ],
            [ /if\s+\((.*)\)\s*[\n]/g, "if $1:\n" ],
            [ /\}\s*else\s*\{/g, 'else:' ],
            [ /else\s*[\n]/g, "else:\n" ],
            [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(?:\<=|\>=|<|>)\s*(.*)\.length\s*\;[^\)]+\)\s*{/g, 'for $1 in range($2, len($3)):'],
            [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(?:\<=|\>=|<|>)\s*(.*)\s*\;[^\)]+\)\s*{/g, 'for $1 in range($2, $3):'],
            [ /\s\|\|\s/g, ' or ' ],
            [ /\s\&\&\s/g, ' and ' ],
            [ /\!([^\s\='"])/g, 'not $1'],
            [ /\.push\s*\(([\s\S]+?)\);/g, '.append($1);' ],
            [ /^(\s*}\s*$)+/gm, '' ],
            [ /\;(\s+?\/\/.+?)/g, '$1' ],
            [ /\;$/gm, '' ],
            [ /\.toUpperCase\s*/g, '.upper' ],
            [ /\.toLowerCase\s*/g, '.lower' ],
            [ /(\b)String(\b)/g, '$1str$2'],
            [ /JSON\.stringify\s*/g, 'json.dumps' ],
            [ /JSON\.parse\s*/g, "json.loads" ],
            // [ /([^\(\s]+)\.includes\s+\(([^\)]+)\)/g, '$2 in $1' ],
            // [ /\'%([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "'{:$1}'.format($2)" ],
            [ /([^\s]+)\.toFixed\s*\(([0-9]+)\)/g, "format($1, '.$2f')" ],
            [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "format($1, '.' + str($2) + 'f')" ],
            [ /parseFloat\s*/g, 'float'],
            [ /parseInt\s*/g, 'int'],
            [ /self\[([^\]+]+)\]/g, 'getattr(self, $1)' ],
            [ /Math\.floor\s*\(([^\)]+)\)/g, 'int(math.floor($1))' ],
            [ /Math\.abs\s*\(([^\)]+)\)/g, 'abs($1)' ],
            [ /Math\.pow\s*\(([^\)]+)\)/g, 'math.pow($1)' ],
            [ /Math\.round\s*\(([^\)]+)\)/g, 'int(round($1))' ],
            [ /Math\.ceil\s*\(([^\)]+)\)/g, 'int(math.ceil($1))' ],
            [ /Math\.log/g, 'math.log' ],
            [ /([a-zA-Z0-9_\.]*\([^\)]+\)|[^\s]+)\s+\?\s*([^\:]+)\s+\:\s*([^\n]+)/g, '$2 if $1 else $3'],
            [ /([^\s]+)\.slice \(([^\,\)]+)\,\s?([^\)]+)\)/g, '$1[$2:$3]' ],
            [ /([^\s]+)\.slice \(([^\)\:]+)\)/g, '$1[$2:]' ],
            [ /([^\s(:]+)\.length/g, 'len($1)' ],
            [ /(^|\s)\/\//g, '$1#' ],
            [ /([^\n\s]) #/g, '$1  #' ],   // PEP8 E261
            [ /\.indexOf/g, '.find'],
            [ /(\s|\()true/g, '$1True'],
            [ /(\s|\()false/g, '$1False'],
            [ /([^\s]+\s*\(\))\.toString\s+\(\)/g, 'str($1)' ],
            [ /([^\s]+)\.toString \(\)/g, 'str($1)' ],
            [ /([^\s]+)\.join\s*\(\s*([^\)\[\]]+?)\s*\)/g, '$2.join($1)' ],
            [ /Math\.(max|min)\s/g, '$1' ],
            [ / = new /g, ' = ' ], // python does not have a 'new' keyword
            [ /console\.log\s/g, 'print' ],
            [ /process\.exit\s+/g, 'sys.exit' ],
            [ /(while \(.*\)) {/, '$1\:' ], // While loops replace bracket with :
            [ /([^:+=\/\*\s-]+) \(/g, '$1(' ], // PEP8 E225 remove whitespaces before left ( round bracket
            [ /\sand\(/g, ' and (' ],
            [ /\sor\(/g, ' or (' ],
            [ /\snot\(/g, ' not (' ],
            [ /\[ /g, '[' ],              // PEP8 E201 remove whitespaces after left [ square bracket
            [ /\{ /g, '{' ],              // PEP8 E201 remove whitespaces after left { bracket
            [ /(?<=[^\s#]) \]/g, ']' ],    // PEP8 E202 remove whitespaces before right ] square bracket
            [ /(?<=[^\s#]) \}/g, '}' ],    // PEP8 E202 remove whitespaces before right } bracket
            [ /([^a-z])(elif|if|or|else)\(/g, '$1$2 \(' ], // a correction for PEP8 E225 side-effect for compound and ternary conditionals
            [ /\!\=\sTrue/g, 'is not True' ], // a correction for PEP8 E712, it likes "is not True", not "!= True"
            [ /\=\=\sTrue/g, 'is True' ], // a correction for PEP8 E712, it likes "is True", not "== True"
            [ /\sdelete\s/g, ' del ' ],
            [ /(?<!#.+)null/, 'None' ],
            [ /\/\*\*/, '\"\"\"' ], // Doc strings
            [ / \*\//, '\"\"\"' ], // Doc strings
            [ /\[([^\[\]]*)\]\{@link (.*)\}/g, '`$1 <$2>`' ], // docstring item with link
            [ /\s+\* @method/g, '' ], // docstring @method
            [ /(\s+) \* @description (.*)/g, '$1$2' ], // docstring description
            [ /\s+\* @name .*/g, '' ], // docstring @name
            [ /(\s+) \* @see( .*)/g, '$1see$2' ], // docstring @see
            [ /(\s+ \* @(param|returns) {[^}]*)string([^}]*}.*)/g, '$1str$3' ], // docstring type conversion
            [ /(\s+ \* @(param|returns) {[^}]*)object([^}]*}.*)/g, '$1dict$3' ], // doctstrubg type conversion
            [ /(\s+) \* @returns ([^\{])/g, '$1:returns: $2' ], // docstring return
            [ /(\s+) \* @returns \{(.+)\}/g, '$1:returns $2:' ], // docstring return
            [ /(\s+ \* @param \{[\]\[\|a-zA-Z]+\} )([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+) (.*)/g, '$1$2[\'$3\'] $4' ], // docstring params.anything
            [ /(\s+) \* @([a-z]+) \{([\]\[a-zA-Z\|]+)\} ([a-zA-Z0-9_\-\.\[\]\']+)/g, '$1:$2 $3 $4:' ], // docstring param
        ])
    }

    getPython2Regexes () {
        return [
            [ /await\s+asyncio\.gather\(\*(.+)\)/g, '$1' ], // remove line entirely
            [ /(\s)await(\s)/g, '$1' ]
        ]
    }

    getPHPSyncRegexes () {
        return [
            [ /Async\\await\(Promise\\all\((.+)\)\)/g, '$1' ], // remove line entirely
            // delete await, the following regex does not pick up multiline await calls
            [ /\bAsync\\await\((.+)\);/g, '$1;' ],
            // hence the following regex is added with a dotAll modifier 's'
            // and a non greedy match for the calls not picked up by the previous regex
            [ /\bAsync\\await\((.+?)\);/gs, '$1;' ],
            [ /\byield(?: from)?\s+/g, '' ], // delete yield from
        ]
    }

    getPHPRegexes () {
        return [
            //
            // Curly-braces are used for both dictionaries in the code as well as for the url-imploded params.
            // For example: https://docs.ccxt.com/#/?id=implicit-api-methods
            //
            // There's a conflict between the curly braces that have to be converted from dictionaries to PHP-arrays and
            // the curly braces used for url-imploded params that should not be touched.
            //
            // The transpiler takes all non-spaced strings in curly braces {likeThis} and converts them to ~likeThis~.
            // That is done to avoid changing the curly braces into the array() in PHP.
            // This way we protect the url-imploded params from being touched by the regexes that will follow.
            // That conversion is done first-thing, at the very early stage of transpilation.
            // The regexes are applied in the order they're listed, top-down.
            //
            // A dictionary in curly braces will never have those curly braces attached to the contents of the dictionary.
            // There will always be a space like { 'a': b, 'c': d }.
            // Hence, the remaining non-converted curly-brace dictionaries will have to be converted to arrays in PHP.
            // That is done in the middle of the transpilation process.
            //
            // The last step is to convert those "saved embedded/imploded url-params substitutions" from ~likeThis~ back to {likeThis}.
            // That is done at the very last regex steps.
            // All of that is a workaround for PHP-arrays vs dictionaries vs url-imploded params in other langs.
            //
            [ /\{([\]\[\|a-zA-Z0-9_-]+?)\}/g, '~$1~' ], // resolve the "arrays vs url params" conflict (both are in {}-brackets)
            [ /\[([^\]\[]*)\]\{(@link .*)\}/g, '~$2 $1~' ], // docstring item with link
            [ /\s+\* @method/g, '' ], // docstring @method
            [ /(\s+)\* @description (.*)/g, '$1\* $2' ], // docstring description
            [ /\s+\* @name .*/g, '' ], // docstring @name
            [ /(\s+)\* @returns/g, '$1\* @return' ], // docstring return
            [ /\!Array\.isArray\s*\(([^\)]+)\)/g, "gettype($1) !== 'array' || array_keys($1) !== array_keys(array_keys($1))" ],
            [ /Array\.isArray\s*\(([^\)]+)\)/g, "gettype($1) === 'array' && array_keys($1) === array_keys(array_keys($1))" ],
            [ /Number\.isInteger\s*\(([^\)]+)\)/g, "is_int($1)" ],
            [ /([^\(\s]+)\s+instanceof\s+String/g, 'is_string($1)' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'undefined\'/g, '$1[$2] === null' ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'undefined\'/g, '$1[$2] !== null' ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'undefined\'/g, '$1 === null' ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'undefined\'/g, '$1 !== null' ],
            [ /typeof\s+(.+?)\s+\=\=\=?\s+\'undefined\'/g, '$1 === null' ],
            [ /typeof\s+(.+?)\s+\!\=\=?\s+\'undefined\'/g, '$1 !== null' ],

            [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+undefined/g, '$1[$2] === null' ],
            [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+undefined/g, '$1[$2] !== null' ],
            [ /([^\s]+)\s+\=\=\=?\s+undefined/g, '$1 === null' ],
            [ /([^\s]+)\s+\!\=\=?\s+undefined/g, '$1 !== null' ],
            [ /(.+?)\s+\=\=\=?\s+undefined/g, '$1 === null' ],
            [ /(.+?)\s+\!\=\=?\s+undefined/g, '$1 !== null' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'string\'/g, "gettype($1[$2]) === 'string'" ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'string\'/g, "gettype($1[$2]) !== 'string'" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'string\'/g, "gettype($1) === 'string'" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'string\'/g, "gettype($1) !== 'string'" ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'object\'/g, "gettype($1[$2]) === 'array'" ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'object\'/g, "gettype($1[$2]) !== 'array'" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'object\'/g, "gettype($1) === 'array'" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'object\'/g, "gettype($1) !== 'array'" ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'number\'/g, "(is_float($1[$2]) || is_int($1[$2]))" ], // same as above but for number
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'number\'/g, "!(is_float($1[$2]) || is_int($1[$2]))" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'number\'/g, "(is_float($1) || is_int($1))" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'number\'/g, "!(is_float($1) || is_int($1))" ],

            [ /undefined/g, 'null' ],
            [ /\} else if/g, '} elseif' ],
            [ /this\.extend\s/g, 'array_merge' ],
            [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
            [ /this\.stringToBase64\s/g, 'base64_encode' ],
            [ /this\.binaryToBase16\s/g, 'bin2hex' ],
            [ /this\.base64ToBinary\s/g, 'base64_decode' ],
            [ /this\.base64ToString\s/g, 'base64_decode' ],
            [ /Promise\.all\s*\(([^\)]+)\)/g, 'Promise\\all($1)' ],
            // deepExtend is commented for PHP because it does not overwrite linear arrays
            // a proper \ccxt\Exchange::deep_extend() base method is implemented instead
            // [ /this\.deepExtend\s/g, 'array_replace_recursive'],
            [ /(\w+)\.shift\s*\(\)/g, 'array_shift($1)' ],
            [ /(\w+)\.pop\s*\(\)/g, 'array_pop($1)' ],
            [ /Number\.MAX_SAFE_INTEGER/g, 'PHP_INT_MAX' ],
            [ /Precise\.stringAdd\s/g, 'Precise::string_add' ],
            [ /Precise\.stringDiv\s/g, 'Precise::string_div' ],
            [ /Precise\.stringMul\s/g, 'Precise::string_mul' ],
            [ /Precise\.stringSub\s/g, 'Precise::string_sub' ],
            [ /Precise\.stringAbs\s/g, 'Precise::string_abs' ],
            [ /Precise\.stringNeg\s/g, 'Precise::string_neg' ],
            [ /Precise\.stringMod\s/g, 'Precise::string_mod' ],
            [ /Precise\.stringEquals\s/g, 'Precise::string_equals' ],
            [ /Precise\.stringEq\s/g, 'Precise::string_eq' ],
            [ /Precise\.stringMin\s/g, 'Precise::string_min' ],
            [ /Precise\.stringMax\s/g, 'Precise::string_max' ],
            [ /Precise\.stringGt\s/g, 'Precise::string_gt' ],
            [ /Precise\.stringGe\s/g, 'Precise::string_ge' ],
            [ /Precise\.stringLt\s/g, 'Precise::string_lt' ],
            [ /Precise\.stringLe\s/g, 'Precise::string_le' ],
            [ /(\w+)\.padEnd\s*\(([^,]+),\s*([^)]+)\)/g, 'str_pad($1, $2, $3, STR_PAD_RIGHT)' ],
            [ /(\w+)\.padStart\s*\(([^,]+),\s*([^)]+)\)/g, 'str_pad($1, $2, $3, STR_PAD_LEFT)' ],

        // insert common regexes in the middle (critical)
        ].concat (this.getCommonRegexes ()).concat ([

            [ /this\./g, '$this->' ],
            [ / this;/g, ' $this;' ],
            [ /([^'])this_\./g, '$1$this_->' ],
            [ /([^'])\{\}/g, '$1array()' ],
            [ /([^'])\[\]/g, '$1array()' ],

        // add {}-array syntax conversions up to 20 levels deep on the same line
        ]).concat ([ ... Array (20) ].map (x => [ /\{([^\n\}]+)\}/g, 'array($1)' ] )).concat ([
            [ /\[\s*([^\]]+)\s\]\s=/g, 'list($1) =' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\[\s*([^\]]+)\s\]/g, '$1list($2)' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\{\s*([^\}]+)\s\}/g, '$1array_values(list($2))' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)/g, 'is_array($1) ? array_keys($1) : array()' ],
            [ /Object\.values\s*\((.*)\)/g, 'is_array($1) ? array_values($1) : array()' ],
            [ /([^\s]+\s*\(\))\.toString \(\)/g, '(string) $1' ],
            [ /([^\s]+)\.toString \(\)/g, '(string) $1' ],
            [ /throw new Error \((.*)\)/g, 'throw new \\Exception($1)' ],
            [ /throw new ([\S]+) \((.*)\)/g, 'throw new $1($2)' ],
            [ /throw ([\S]+)\;/g, 'throw $$$1;' ],
            [ '([^a-z]+) (' + Object.keys (errors).join ('|') + ')([^\\s])', "$1 '\\\\ccxt\\\\$2'$3" ],
            [ /\}\s+catch \(([\S]+)\) {/g, '} catch (Exception $$$1) {' ],
            [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\.length\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 count($4);$5) {' ],
            [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 $4;$5) {' ],
            [ /([^\s]+)\.length\;/g, 'count($1);' ],
            [ /\.push\s*\(([\s\S]+?)\)\;/g, '[] = $1;' ],
            [ /\sawait\s+([^;]+);/g, ' Async\\await($1);' ],
            [ /([\S])\: /g, '$1 => ' ],
            [/\$this->ws\./g, '$this->ws->'], // ws method fix


        // add {}-array syntax conversions up to 20 levels deep
        ]).concat ([ ... Array (20) ].map (x => [ /\{([^\{]+?)\}([^\s])/g, 'array($1)$2' ])).concat ([

            [ /\[\s*([^\]]+?)\s*\]\.join\s*\(\s*([^\)]+?)\s*\)/g, "implode($2, array($1))" ],

        // add []-array syntax conversions up to 20 levels deep
        ]).concat ([ ... Array (20) ].map (x => [ /\[(\s[^\]]+?\s)\]/g, 'array($1)' ])).concat ([

            [ /(\b)String(\b)/g, "$1'strval'$2"],
            [ /JSON\.stringify/g, 'json_encode' ],
            [ /JSON\.parse\s+\(([^\)]+)\)/g, 'json_decode($1, $$as_associative_array = true)' ],
            // [ /\'([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "sprintf ('$1', $2)" ],
            [ /([^\s]+)\.toFixed\s*\(([0-9]+)\)/g, "sprintf('%.$2f', $1)" ],
            [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "sprintf('%.' . $2 . 'f', $1)" ],
            [ /parseFloat\s/g, 'floatval'],
            [ /parseInt\s/g, 'intval'],
            [ / \+ (?!\d)/g, ' . ' ],
            [ / \+\= (?!\d)/g, ' .= ' ],
            [ /([^\s\(]+(?:\s*\(.+\))?)\.toUpperCase\s*\(\)/g, 'strtoupper($1)' ],
            [ /([^\s\(]+(?:\s*\(.+\))?)\.toLowerCase\s*\(\)/g, 'strtolower($1)' ],
            // [ /([^\s\(]+(?:\s*\(.+\))?)\.replaceAll\s*\(([^)]+)\)/g, 'str_replace($2, $1)' ], // still not a part of the standard in Node.js 13
            [ /([^\s\(]+(?:\s*\(.+\))?)\.replace\s*\(([^)]+)\)/g, 'str_replace($2, $1)' ],
            [ /this\[([^\]+]+)\]/g, '$$this->$$$1' ],
            [ /([^\s\(]+).slice \(([^\)\:,]+)\)/g, 'mb_substr($1, $2)' ],
            [ /([^\s\(]+).slice \(([^\,\)]+)\,\s*([^\)]+)\)/g, 'mb_substr($1, $2, $3 - $2)' ],
            [ /([^\s\(]+).split \(('[^']*'|[^\,]+?)\)/g, 'explode($2, $1)' ],
            [ /([^\s\(]+)\.length/g, 'strlen($1)' ],
            [ /Math\.floor\s*\(([^\)]+)\)/g, '(int) floor($1)' ],
            [ /Math\.abs\s*\(([^\)]+)\)/g, 'abs($1)' ],
            [ /Math\.round\s*\(([^\)]+)\)/g, '(int) round($1)' ],
            [ /Math\.ceil\s*\(([^\)]+)\)/g, '(int) ceil($1)' ],
            [ /Math\.pow\s*\(([^\)]+)\)/g, 'pow($1)' ],
            [ /Math\.log/g, 'log' ],
            [ /([^\(\s]+)\s+%\s+([^\s\,\;\)]+)/g, 'fmod($1, $2)' ],
            [ /\(([^\s\(]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0\)/g, '(mb_strpos($1, $2) !== false)' ],
            [ /([^\s\(]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0/g, 'mb_strpos($1, $2) !== false' ],
            [ /([^\s\(]+)\.indexOf\s*\(([^\)]+)\)\s*\<\s*0/g, 'mb_strpos($1, $2) === false' ],
            [ /([^\s\(]+)\.indexOf\s*\(([^\)]+)\)/g, 'mb_strpos($1, $2)' ],
            [ /\(([^\s\(]+)\sin\s([^\)]+)\)/g, '(is_array($2) && array_key_exists($1, $2))' ],
            [ /([^\s]+)\.join\s*\(\s*([^\)]+?)\s*\)/g, 'implode($2, $1)' ],
            [ 'new ccxt\\.', 'new \\ccxt\\' ], // a special case for test_exchange_datetime_functions.php (and for other files, maybe)
            [ /Math\.(max|min)/g, '$1' ],
            [ /console\.log/g, 'var_dump'],
            [ /process\.exit/g, 'exit'],
            [ /super\./g, 'parent::'],
            [ /\sdelete\s([^\n]+)\;/g, ' unset($1);' ],
            [ /\~([\]\[\|@\.\s+\:\/#\-a-zA-Z0-9_-]+?)\~/g, '{$1}' ], // resolve the "arrays vs url params" conflict (both are in {}-brackets)
            [ /(\s+ \* @(param|return) {[^}]*)object([^}]*}.*)/g, '$1array$3' ], // docstring type conversion
        ])
    }

    getTypescriptRemovalRegexes() {
        return [
            [ /\((\w+)\sas\s\w+\)/g, '$1'], // remove (this as any) or (x as number) paren included
            [ /\sas \w+(\[])?/g, ''], // remove any "as any" or "as number" or "as trade[]"
            [ /([let|const][^:]+):([^=]+)(\s+=.*$)/g, '$1$3'], // remove variable type
        ]
    }

    getTypescripSignaturetRemovalRegexes() {
        // currently they can't be mixin with the ones above
        return [
            [ /(\s*(?:async\s)?\w+\s\([^)]+\)):[^{]+({)/, "$1 $2" ], // remove return type
            // remove param types
            // Currently supported: single name (object, number, mytype, etc)
            // optional params (string | number)
            // [ /:\s\w+(\s*\|\s*\w+)?(?=\s|,|\))/g, ""], // remove parameters type
            // array types: string[] or (string|number)[]
            // [ /:\s\(?\w+(\s*\|\s*\w+)?\)?\[]/g, ""], // remove parameters type
        ]
    }

    getBaseClass () {
        return new Exchange ()
    }

    getBaseMethods () {
        const baseExchange = this.getBaseClass ()
        let object = baseExchange
        let properties = []
        while (object !== Object.prototype) {
            properties = properties.concat (Object.getOwnPropertyNames (object))
            object = Object.getPrototypeOf (object)
        }
        return properties.filter (x => typeof baseExchange[x] === 'function')
    }

    getPythonBaseMethods () {
        return this.getBaseMethods ()
    }

    getPHPBaseMethods () {
        return this.getBaseMethods ()
    }

    //-------------------------------------------------------------------------
    // the following common headers are used for transpiled tests

    getJsPreamble () {
        return [
            "// ----------------------------------------------------------------------------",
            "",
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "// EDIT THE CORRESPONDENT .ts FILE INSTEAD",
            "",
        ].join ("\n")
    }

    getPythonPreamble (level = 3) {
        return [
            "import os",
            "import sys",
            "",
            `root = ${'os.path.dirname('.repeat(level)}os.path.abspath(__file__)${')'.repeat(level)}`,
            "sys.path.append(root)",
            "",
            "# ----------------------------------------------------------------------------",
            "",
            "# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "",
            "# ----------------------------------------------------------------------------",
            "",
        ].join ("\n")
    }

    getPHPPreamble (include = true, level = 2) {
        return [
            "<?php",
            "namespace ccxt;",
            include ? `include_once (__DIR__.'/${'../'.repeat(level)}ccxt.php');` : "",
            "// ----------------------------------------------------------------------------",
            "",
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "",
            "// -----------------------------------------------------------------------------",
            "",
        ].join ("\n")
    }

    getPythonGenerated() {
        return [
            "# ----------------------------------------------------------------------------",
            "# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "# -----------------------------------------------------------------------------",
            "",
        ].join ("\n");
    }

    // ------------------------------------------------------------------------
    // a helper to apply an array of regexes and substitutions to text
    // accepts an array like [ [ regex, substitution ], ... ]

    regexAll (text, array) {
        for (const i in array) {
            let regex = array[i][0]
            const flags = (typeof regex === 'string') ? 'g' : undefined
            regex = new RegExp (regex, flags)
            text = text.replace (regex, array[i][1])
        }
        return text
    }

    // ========================================================================
    // one-time helpers

    createPythonClassDeclaration (className, baseClass) {
        const mixin = (className === 'testMainClass') ? '' : ', ImplicitAPI'
        return 'class ' + className + '(' + baseClass + mixin + '):'
    }

    createPythonHeader () {
        return [
            pythonCodingUtf8,
            "",
            "# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "",
        ]
    }

    createPythonClassHeader (imports, bodyAsString) {
        const header = this.createPythonHeader ()
        return header.concat (imports);
    }

    createPythonClassImports (baseClass, className, async = false) {
        const baseClasses = {
            'Exchange': 'base.exchange',
        }
        async = (async ? '.async_support' : '')

        const imports = [
            (baseClass.indexOf ('ccxt.') === 0) ?
                ('import ccxt' + async + ' as ccxt') :
                ('from ccxt' + async + '.' + safeString (baseClasses, baseClass, baseClass) + ' import ' + baseClass),
        ]
        if (className !== 'testMainClass') {
            imports.push ('from ccxt.abstract.' + className + ' import ImplicitAPI')
        }
        return imports
    }

    createPythonClass (className, baseClass, body, methods, async = false) {

        let bodyAsString = body.join ("\n")

        const {
            imports,
            asyncioImports,
            libraries,
            errorImports,
            precisionImports
        } = this.createPythonImports(baseClass, bodyAsString, className, async)

        let header = this.createPythonClassHeader (imports, bodyAsString)

        header = header.concat (asyncioImports, libraries, errorImports, precisionImports)

        // transpile camelCase base method names to underscore base method names
        const baseMethods = this.getPythonBaseMethods ()
        methods = methods.concat (baseMethods)
        for (let method of methods) {
            const regex = new RegExp ('(self|super\\([^)]+\\))\\.(' + method + ')([^a-zA-Z0-9_])', 'g')
            bodyAsString = bodyAsString.replace (regex, (match, p1, p2, p3) => (p1 + '.' + unCamelCase (p2) + p3))
        }

        header.push ("\n\n" + this.createPythonClassDeclaration (className, baseClass))

        const footer = [
            '', // footer (last empty line)
        ]

        const result = header.join ("\n") + "\n" + bodyAsString + "\n" + footer.join ('\n')
        return result
    }

    createPythonImports (baseClass, bodyAsString, className, async = false) {

        async = (async ? '.async_support' : '')


        const pythonStandardLibraries = {
            'hashlib': 'hashlib',
            'math': 'math',
            'json.loads': 'json',
            'json.dumps': 'json',
            'sys': 'sys',
        }

        const imports = this.createPythonClassImports (baseClass, className, async)

        const libraries = []

        for (let library in pythonStandardLibraries) {
            const regex = new RegExp ("[^\\'\\\"a-zA-Z]" + library + "[^\\'\\\"a-zA-Z]")
            if (bodyAsString.match (regex)){
                const importStatement = 'import ' + pythonStandardLibraries[library];
                if (!libraries.includes(importStatement)) {
                    libraries.push (importStatement)
                }
            }
        }

        if (bodyAsString.match (/numbers\.(Real|Integral)/)) {
            libraries.push ('import numbers')
        }
        if (bodyAsString.match (/: OrderSide/)) {
            libraries.push ('from ccxt.base.types import OrderSide')
        }
        if (bodyAsString.match (/: OrderType/)) {
            libraries.push ('from ccxt.base.types import OrderType')
        }
        if (bodyAsString.match (/: IndexType/)) {
            libraries.push ('from ccxt.base.types import IndexType')
        }
        if (bodyAsString.match (/: Client/)) {
            libraries.push ('from ccxt.async_support.base.ws.client import Client')
        }
        if (bodyAsString.match (/[\s(]Optional\[/)) {
            libraries.push ('from typing import Optional')
        }
        if (bodyAsString.match (/[\s\[(]List\[/)) {
            libraries.push ('from typing import List')
        }

        const errorImports = []

        for (let error in errors) {
            const regex = new RegExp ("[^\\'\"]" + error + "[^\\'\"]")
            if (bodyAsString.match (regex)) {
                errorImports.push ('from ccxt.base.errors import ' + error)
            }
        }

        const precisionImports = []

        for (let constant in precisionConstants) {
            if (bodyAsString.indexOf (constant) >= 0) {
                precisionImports.push ('from ccxt.base.decimal_to_precision import ' + constant)
            }
        }
        if (bodyAsString.match (/[\s(]Precise/)) {
            precisionImports.push ('from ccxt.base.precise import Precise')
        }
        const asyncioImports = []
        if (bodyAsString.match (/asyncio/)) {
            asyncioImports.push ('import asyncio')
        }

        return {
            imports,
            asyncioImports,
            libraries,
            errorImports,
            precisionImports
        }
    }

    // ========================================================================
    // exchange capabilities ordering

    sortExchangeCapabilities (code) {
        const lineBreak = '\n';
        const capabilitiesObjectRegex = /(?<='has': {[\n])([^|})]*)(?=\n(\s+}))/;
        const found = capabilitiesObjectRegex.exec (code);
        if (found === null) {
            return false // capabilities not found
        }
        let capabilities = found[0].split (lineBreak);
        const sortingOrder = {
            'CORS': 'undefined,',
            'spot': 'true,',
            'margin': 'undefined,',
            'swap': 'undefined,',
            'future': 'undefined,',
            'option': 'undefined,',
            // then everything else
        }
        const features = {}
        let indentation = '                ' // 16 spaces
        for (let i = 0; i < capabilities.length; i++) {
            const capability = capabilities[i]
            const match = capability.match (/(\s+)\'(.+)\': (.+)$/)
            if (match) {
                indentation = match[1]
                const feature = match[2]
                const value = match[3]
                features[feature] = value
            }
        }
        let keys = Object.keys (features)
        keys.sort ((a, b) => a.localeCompare (b))
        const allKeys = Object.keys (sortingOrder).concat (keys)
        for (let i = 0; i < allKeys.length; i++) {
            const key = allKeys[i]
            sortingOrder[key] = (key in features) ? features[key] : sortingOrder[key]
        }
        const result = Object.entries (sortingOrder).map (([ key, value ]) => indentation + "'" + key + "': " + value).join (lineBreak)
        if (result === found[0]) {
            return false
        }
        return code.replace (capabilitiesObjectRegex, result)
    }

    // ------------------------------------------------------------------------

    createPHPClassDeclaration (className, baseClass) {
        return 'class ' + className + ' extends ' + baseClass + ' {'
    }

    createPHPClassHeader (className, baseClass, bodyAsString, namespace) {
        return [
            "<?php",
            "",
            "namespace " + namespace + ";",
            "",
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "",
            "use Exception; // a common import",
            "use " + namespace + "\\abstract\\" + className + " as " + baseClass + ';',
        ]
    }

    createPHPClass (className, baseClass, body, methods, async = false) {

        let bodyAsString = body.join ("\n")

        let header = this.createPHPClassHeader (className, baseClass, bodyAsString, async ? 'ccxt\\async' : 'ccxt')

        const errorImports = []

        if (async) {
            for (let error in errors) {
                const regex = new RegExp ("[^'\"]" + error + "[^'\"]")
                if (bodyAsString.match (regex)) {
                    errorImports.push ('use ccxt\\' + error + ';')
                }
            }
        }

        const precisionImports = []
        const libraryImports = []

        if (async) {
            if (bodyAsString.match (/[\s(]Precise/)) {
                precisionImports.push ('use ccxt\\Precise;')
            }
            if (bodyAsString.match (/Async\\await/)) {
                libraryImports.push ('use React\\Async;')
            }
            if (bodyAsString.match (/Promise\\all/)) {
                libraryImports.push ('use React\\Promise;')
            }
        }

        header = header.concat (errorImports).concat (precisionImports).concat (libraryImports)

        // transpile camelCase base method names to underscore base method names
        const baseMethods = this.getPHPBaseMethods ()
        methods = methods.concat (baseMethods)

        for (let method of methods) {
            let regex = new RegExp ('\\$this->(' + method + ')\\s?(\\(|[^a-zA-Z0-9_])', 'g')
            bodyAsString = bodyAsString.replace (regex,
                (match, p1, p2) => {
                    return ((p2 === '(') ?
                        ('$this->' + unCamelCase (p1) + p2) : // support direct php calls
                        ("array($this, '" + unCamelCase (p1) + "')" + p2)) // as well as passing instance methods as callables
                })

            regex = new RegExp ('parent::(' + method + ')\\s?(\\(|[^a-zA-Z0-9_])', 'g')
            bodyAsString = bodyAsString.replace (regex,
                (match, p1, p2) => {
                    return ((p2 === '(') ?
                        ('parent::' + unCamelCase (p1) + p2) : // support direct php calls
                        ("array($this, '" + unCamelCase (p1) + "')" + p2)) // as well as passing instance methods as callables
                })
        }

        header.push ("\n" + this.createPHPClassDeclaration (className, baseClass))

        const footer = [
            "}\n",
        ]

        const result = header.join ("\n") + "\n" + bodyAsString + "\n" + footer.join ('\n')
        return result
    }

    // ========================================================================

    transpileJavaScriptToPython3 ({ js, className, removeEmptyLines }) {

        // transpile JS → Python 3
        let python3Body = this.regexAll (js, this.getPythonRegexes ())

        if (removeEmptyLines) {
            python3Body = python3Body.replace (/$\s*$/gm, '')
        }

        const strippedPython3BodyWithoutComments = python3Body.replace (/^[\s]+#.+$/gm, '')

        if (!strippedPython3BodyWithoutComments.match(/[^\s]/)) {
            python3Body += '\n        pass'
        }

        python3Body = python3Body.replace (/\'([абвгдеёжзийклмнопрстуфхцчшщъыьэюя服务端忙碌]+)\'/gm, "u'$1'")

        // special case for Python OrderedDicts
        let orderedDictRegex = /\.ordered\s+\(\{([^\}]+)\}\)/g
        let orderedDictMatches = undefined
        while (orderedDictMatches = orderedDictRegex.exec (python3Body)) {
            let replaced = orderedDictMatches[1].replace (/^(\s+)([^\:]+)\:\s*([^\,]+)\,$/gm, '$1($2, $3),')
            python3Body = python3Body.replace (orderedDictRegex, '\.ordered([' + replaced + '])')
        }

        // snake case function names
        python3Body = python3Body.replace (/def (\w+)/g, (match, group1) => 'def ' + unCamelCase (group1))

        // special case for Python super
        if (className) {
            python3Body = python3Body.replace (/super\./g, 'super(' + className + ', self).')
        }

        return python3Body
    }

    // ------------------------------------------------------------------------

    transpilePython3ToPython2 (py) {

        // remove await from Python sync body (transpile Python async → Python sync)
        let python2Body = this.regexAll (py, this.getPython2Regexes ())

        return python2Body
    }

    // ------------------------------------------------------------------------

    transpileAsyncPHPToSyncPHP (php) {

        // remove yield from php body
        return this.regexAll (php, this.getPHPSyncRegexes ())
    }

    // ------------------------------------------------------------------------


    transpileJavaScriptToPHP ({ js, variables }, async = false) {

        // match all local variables (let, const or var)
        let localVariablesRegex = /(?:^|[^a-zA-Z0-9_])(?:let|const|var)\s+(?:\[([^\]]+)\]|([a-zA-Z0-9_]+))/g // local variables

        let allVariables = (variables || []).map (x => x); // clone the array
        // process the variables created in destructuring assignments as well
        let localVariablesMatches
        while (localVariablesMatches = localVariablesRegex.exec (js)) {
            if (localVariablesMatches[1]) {
                // this is a destructuring assignment like
                // let [ a, b, c ] = 'a-b-c'.split ('-')
                let matches = localVariablesMatches[1].trim ().split (', ') // split the destructuring assignment by comma
                matches.forEach (x => allVariables.push (x.trim ())) // trim each variable name
            } else {
                // this is a single variable assignment
                allVariables.push (localVariablesMatches[2].trim ()) // add it to the list of local variables
            }
        }

        // match all variables instantiated in the catch()-block of a try-catch clause
        let catchClauseRegex = /catch \(([^)]+)\)/g
        let catchClauseMatches
        while (catchClauseMatches = catchClauseRegex.exec (js)) {
            allVariables.push (catchClauseMatches[1])
        }

        // match all variables instantiated as function parameters
        let functionParamRegex = /function\s*(\w+)\s*\(([^)]+)\)/g
        js = js.replace (functionParamRegex, (match, group1, group2) => 'function ' + unCamelCase (group1) + '(' + group2 + ')')
        let functionParamVariables
        while (functionParamVariables = functionParamRegex.exec (js)) {
            const match = functionParamVariables[2]
            const tokens = match.split (', ')
            allVariables = allVariables.concat (tokens)
        }

        allVariables = allVariables.map (error => this.regexAll (error, this.getCommonRegexes ()))

        // append $ to all variables in the method (PHP syntax demands $ at the beginning of a variable name)
        let phpVariablesRegexes = allVariables.map (x => [ "(^|[^$$a-zA-Z0-9\\.\\>'\"_/])" + x + "([^a-zA-Z0-9'_/])", '$1$$' + x + '$2' ])

        // support for php syntax for object-pointer dereference
        // convert all $variable.property to $variable->property
        let variablePropertiesRegexes = allVariables.map (x => [ "(^|[^a-zA-Z0-9\\.\\>'\"_])" + x + '\\.', '$1' + x + '->' ])

        // transpile JS → PHP
        const phpRegexes = this.getPHPRegexes ()
        let phpBody = this.regexAll (js, phpRegexes.concat (phpVariablesRegexes).concat (variablePropertiesRegexes))
        // indent async php
        if (async && js.indexOf (' await ') > -1) {
            const closure = variables && variables.length ? 'use (' + variables.map (x => '$' + x).join (', ') + ')': '';
            phpBody = '        return Async\\async(function () ' + closure + ' {\n    ' +  phpBody.replace (/\n/g, '\n    ') + '\n        }) ();'
        }

        return phpBody
    }

    // ------------------------------------------------------------------------

    transpileJavaScriptToPythonAndPHP (args) {

        // transpile JS → Python 3
        let python3Body = this.transpileJavaScriptToPython3 (args)

        // remove await from Python sync body (transpile Python async → Python sync)
        let python2Body = this.transpilePython3ToPython2 (python3Body)

        // transpile JS → Async PHP
        let phpAsyncBody = this.transpileJavaScriptToPHP (args, true)

        // transpile JS -> Sync PHP
        let phpBody = this.transpileAsyncPHPToSyncPHP (this.transpileJavaScriptToPHP (args, false))

        return { python3Body, python2Body, phpBody, phpAsyncBody }
    }

    //-----------------------------------------------------------------------------

    transpilePythonAsyncToSync (asyncFilePath, syncFilePath) {

        const async = asyncFilePath
        const sync = syncFilePath
        log.magenta ('Transpiling ' + async.yellow + ' → ' + sync.yellow)
        const fileContents = fs.readFileSync (async, 'utf8')
        let lines = fileContents.split ("\n")

        lines = lines.filter (line => ![ 'import asyncio' ].includes (line))
            .map (line => {
                return (
                    line.replace ('asyncio.get_event_loop().run_until_complete(main())', 'main()')
                        .replace ('asyncio.run(main())', 'main()')
                        .replace ('import ccxt.async_support as ccxt', 'import ccxt')
                        .replace (/.*token\_bucket.*/g, '')
                        .replace ('await asyncio.sleep', 'time.sleep')
                        .replace ('async ', '')
                        .replace ('await ', ''))
                        .replace ('asyncio.gather\(\*', '(') // needed for async -> sync
                        .replace ('asyncio.run', '') // needed for async -> sync
            })

        // lines.forEach (line => log (line))

        function deleteFunction (f, from) {
            // the following regexes make a technical error
            // since it won't cut away a single function
            // it will delete everything up to the beginning of the next comment
            const re1 = new RegExp ('def ' + f + '[^\#]+', 'g')
            const re2 = new RegExp ('[\\s]+' + f + '\\(exchange\\)', 'g')
            return from.replace (re1, '').replace (re2, '')
        }

        let newContents = lines.join ('\n')

        newContents = deleteFunction ('test_tickers_async', newContents)
        newContents = deleteFunction ('test_l2_order_books_async', newContents)
        if (fs.existsSync (sync)) {
            fs.truncateSync (sync)
        }
        fs.writeFileSync (sync, newContents)
    }

    //-----------------------------------------------------------------------------

    transpilePhpAsyncToSync (asyncFilePath, syncFilePath) {

        const async = asyncFilePath
        const sync = syncFilePath
        log.magenta ('Transpiling ' + async .yellow + ' → ' + sync.yellow)
        const fileContents = fs.readFileSync (async, 'utf8')
        const syncBody = this.transpileAsyncPHPToSyncPHP (fileContents)

        const phpTestRegexes = [
            [ /Async\\coroutine\(\$main\)/, '\$main()' ],
            [ /ccxt\\\\async/, 'ccxt' ],
        ]

        const newContents = this.regexAll (syncBody, this.getPHPSyncRegexes ().concat (phpTestRegexes));
        if (fs.existsSync (sync)) {
            fs.truncateSync (sync)
        }
        fs.writeFileSync (sync, newContents)
    }

    // ------------------------------------------------------------------------

    getExchangeClassDeclarationMatches (contents) {
        return contents.match (/^export default\s*class\s+([\S]+)\s+extends\s+([\S]+)\s+{([\s\S]+?)^};*/m)
    }

    getClassDeclarationMatches (contents) {
        return contents.match (/^export \s*(?:default)?\s*class\s+([\S]+)(?:\s+extends\s+([\S]+))?\s+{([\s\S]+?)^};*/m)
    }

    // ------------------------------------------------------------------------

    transpileClass (contents) {
        const [ _, className, baseClass, classBody ] = this.getClassDeclarationMatches (contents)
        const methods = classBody.trim ().split (/\n\s*\n/)
        const {
            python2,
            python3,
            php,
            phpAsync,
            methodNames
        } = this.transpileMethodsToAllLanguages (className, methods)
        // altogether in PHP, async PHP, Python sync and async
        const sync = false
        const async = true
        return {
            python2:      this.createPythonClass (className, baseClass, python2,  methodNames, sync),
            python3:      this.createPythonClass (className, baseClass, python3,  methodNames, async),
            php:          this.createPHPClass    (className, baseClass, php,      methodNames, sync),
            phpAsync:     this.createPHPClass    (className, baseClass, phpAsync, methodNames, async),
            className,
            baseClass,
        }
    }

    // ========================================================================

    transpileDerivedExchangeFile (tsFolder, filename, options, force = false) {

        // todo normalize jsFolder and other arguments

        try {

            const { python2Folder, python3Folder, phpFolder, phpAsyncFolder } = options
            const pythonFilename = filename.replace ('.ts', '.py')
            const phpFilename = filename.replace ('.ts', '.php')

            const tsPath = tsFolder + filename

            let contents = fs.readFileSync (tsPath, 'utf8')
            const sortedExchangeCapabilities = this.sortExchangeCapabilities (contents)
            if (sortedExchangeCapabilities) {
                contents = sortedExchangeCapabilities
                overwriteFile (tsPath, contents)
            }

            const tsMtime = fs.statSync (tsPath).mtime.getTime ()

            const python2Path  = python2Folder  ? (python2Folder  + pythonFilename) : undefined
            const python3Path  = python3Folder  ? (python3Folder  + pythonFilename) : undefined
            const phpPath      = phpFolder      ? (phpFolder      + phpFilename)    : undefined
            const phpAsyncPath = phpAsyncFolder ? (phpAsyncFolder + phpFilename)    : undefined

            const python2Mtime  = python2Folder  ? (fs.existsSync (python2Path)  ? fs.statSync (python2Path).mtime.getTime ()  : 0) : undefined
            const python3Mtime  = python3Path    ? (fs.existsSync (python3Path)  ? fs.statSync (python3Path).mtime.getTime ()  : 0) : undefined
            const phpAsyncMtime = phpAsyncFolder ? (fs.existsSync (phpAsyncPath) ? fs.statSync (phpAsyncPath).mtime.getTime () : 0) : undefined
            const phpMtime      = phpPath        ? (fs.existsSync (phpPath)      ? fs.statSync (phpPath).mtime.getTime ()      : 0) : undefined

            if (force ||
                (python3Folder  && (tsMtime > python3Mtime))  ||
                (phpFolder      && (tsMtime > phpMtime))      ||
                (phpAsyncFolder && (tsMtime > phpAsyncMtime)) ||
                (python2Folder  && (tsMtime > python2Mtime))) {
                const { python2, python3, php, phpAsync, className, baseClass } = this.transpileClass (contents)
                log.cyan ('Transpiling from', filename.yellow)

                ;[
                    [ python2Folder, pythonFilename, python2 ],
                    [ python3Folder, pythonFilename, python3 ],
                    [ phpFolder, phpFilename, php ],
                    [ phpAsyncFolder, phpFilename, phpAsync ],
                ].forEach (([ folder, filename, code ]) => {
                    if (folder) {
                        overwriteFile (folder + filename, code)
                        fs.utimesSync (folder + filename, new Date (), new Date (tsMtime))
                    }
                })

                return { className, baseClass }

            } else {

                const [ _, className, baseClass ] = this.getClassDeclarationMatches (contents)
                log.green ('Already transpiled', filename.yellow)
                return { className, baseClass }
            }

        } catch (e) {

            log.red ('\nFailed to transpile source code from', filename.yellow)
            log.red ('See https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md on how to build this library properly\n')
            throw e // rethrow it
        }
    }

    //-------------------------------------------------------------------------

    transpileDerivedExchangeFiles (jsFolder, options, pattern = '.ts', force = false, child = false) {

        // todo normalize jsFolder and other arguments

        const { python2Folder, python3Folder, phpFolder, phpAsyncFolder } = options

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids = undefined
        try {
            ids = exchanges.ids
        } catch (e) {
        }

        const regex = new RegExp (pattern.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'))

        let exchanges
        if (options.exchanges && options.exchanges.length) {
            exchanges = options.exchanges.map (x => x + pattern)
        } else {
            exchanges = fs.readdirSync (jsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.js'))))
        }

        const classNames = exchanges.map (file => this.transpileDerivedExchangeFile (jsFolder, file, options, force))

        const classes = {}

        if (classNames.length === 0) {
            return null
        }

        classNames.forEach (({ className, baseClass }) => {
            classes[className] = baseClass
        })

        if (!child && classNames.length > 1) {

            function deleteOldTranspiledFiles (folder, pattern) {
                fs.readdirSync (folder)
                    .filter (file =>
                        !fs.lstatSync (folder + file).isDirectory () &&
                        !(file.replace (pattern, '') in classes) &&
                        !file.match (/^[A-Z_]/))
                    .map (file => folder + file)
                    .forEach (file => log.red ('Deleting ' + file.yellow) && fs.unlinkSync (file))
            }

            [
                [ python2Folder, /\.pyc?$/ ],
                [ python3Folder, /\.pyc?$/ ],
                [ phpFolder, /\.php$/ ],
                [ phpAsyncFolder, /\.php$/ ],
            ].forEach (([ folder, pattern ]) => {
                if (folder) {
                    deleteOldTranspiledFiles (folder, pattern)
                }
            })

        }

        return classes
    }

    // ========================================================================

    transpileMethodsToAllLanguages (className, methods) {

        let python2 = []
        let python3 = []
        let php = []
        let phpAsync = []
        let methodNames = []

        for (let i = 0; i < methods.length; i++) {
            // parse the method signature
            let part = methods[i].trim ()
            let lines = part.split ("\n")
            let signature = lines[0].trim ()
            signature = signature.replace('function ', '')

            // Typescript types trim from signature
            // will be improved in the future
            // Here we will be removing return type:
            // example: async fetchTickers(): Promise<any> { ---> async fetchTickers() {
            // and remove parameters types
            // example: myFunc (name: string | number = undefined) ---> myFunc(name = undefined)
            signature = this.regexAll(signature, this.getTypescripSignaturetRemovalRegexes())

            let methodSignatureRegex = /(async |)(\S+)\s\(([^)]*)\)\s*(?::\s+(\S+))?\s*{/ // signature line
            let matches = methodSignatureRegex.exec (signature)

            if (!matches) {
                log.red (methods[i])
                log.yellow.bright ("\nMake sure your methods don't have empty lines!\n")
            }

            // async or not
            let keyword = matches[1]

            // method name
            let method = matches[2]

            methodNames.push (method)

            method = unCamelCase (method)

            // method arguments
            let args = matches[3].trim ()

            // return type
            let returnType = matches[4]

            // extract argument names and local variables
            args = args.length ? args.split (',').map (x => x.trim ()) : []

            // get names of all method arguments for later substitutions
            let variables = args.map (arg => arg.split ('=').map (x => x.split (':')[0].trim ().replace (/\?$/, '')) [0])

            // add $ to each argument name in PHP method signature
            const phpTypes = {
                'any': 'mixed',
                'string': 'string',
                'number': 'float',
                'boolean': 'bool',
                'Promise<any>': 'mixed',
                'Balance': 'array',
                'IndexType': 'int|string',
                'Int': 'int',
                'object': 'array',
                'object[]': 'mixed',
                'OrderType': 'string',
                'OrderSide': 'string',
            }
            let phpArgs = args.map (x => {
                const parts = x.split (':')
                if (parts.length === 1) {
                    return '$' + x
                } else {
                    let variable = parts[0]
                    const secondPart = parts[1].split ('=')
                    let nullable = false
                    let endpart = ''
                    if (secondPart.length === 2) {
                        const trimmed = secondPart[1].trim ()
                        nullable = trimmed === 'undefined'
                        endpart = ' = ' + trimmed
                    }
                    nullable = nullable || variable.slice (-1) === '?'
                    variable = variable.replace (/\?$/, '')
                    const type = secondPart[0].trim ()
                    const phpType = phpTypes[type] ?? type
                    const resolveType = phpType.slice (-2) === '[]' ? 'array' : phpType
                    return (nullable && (resolveType !== 'mixed') ? '?' : '') + resolveType + ' $' + variable + endpart
                }
            }).join (', ').trim ()
                .replace (/undefined/g, 'null')
                .replace (/\{\}/g, 'array ()')
            phpArgs = phpArgs.length ? (phpArgs) : ''
            const phpReturnType = returnType ? ': ' + (phpTypes[returnType] ?? returnType) : ''
            const phpSignature = '    ' + 'public function ' + method + '(' + phpArgs + ')' + phpReturnType + ' {'

            // remove excessive spacing from argument defaults in Python method signature
            const pythonTypes = {
                'string': 'str',
                'number': 'float',
                'any': 'Any',
                'boolean': 'bool',
                'Int': 'int',
            }
            let pythonArgs = args.map (x => {
                if (x.includes (':')) {
                    const parts = x.split(':')
                    let typeParts = parts[1].trim ().split (' ')
                    const type = typeParts[0]
                    typeParts[0] = ''
                    let variable = parts[0]
                    const nullable = typeParts[typeParts.length - 1] === 'undefined' || variable.slice (-1) === '?'
                    variable = variable.replace (/\?$/, '')
                    const isList = type.slice (-2) === '[]'
                    const searchType = isList ? type.slice (0, -2) : type
                    let rawType = pythonTypes[searchType] ?? searchType
                    rawType = isList ? 'List[' + rawType + ']' : rawType
                    let resolvedType
                    if (nullable) {
                        resolvedType = 'Optional[' + rawType + ']'
                    } else {
                        resolvedType = rawType
                    }
                    return variable + ': ' + resolvedType + typeParts.join (' ')
                } else {
                    return x.replace (' = ', '=')
                }
            })
            .join (', ')
            .replace (/undefined/g, 'None')
            .replace (/false/g, 'False')
            .replace (/true/g, 'True')
            // method body without the signature (first line)
            // and without the closing bracket (last line)
            let js = lines.slice (1, -1).join ("\n")

            // transpile everything
            let { python3Body, python2Body, phpBody, phpAsyncBody } = this.transpileJavaScriptToPythonAndPHP ({ js, className, variables, removeEmptyLines: true })

            // compile the final Python code for the method signature
            const pythonReturnType = returnType ? ' -> ' + (pythonTypes[returnType] ?? returnType) : ''
            let pythonString = 'def ' + method + '(self' + (pythonArgs.length ? ', ' + pythonArgs : '') + ')' + pythonReturnType + ':'

            // compile signature + body for Python sync
            python2.push ('');
            python2.push ('    ' + pythonString);
            python2.push (python2Body);

            // compile signature + body for Python async
            python3.push ('');
            python3.push ('    ' + keyword + pythonString);
            python3.push (python3Body);

            // compile signature + body for PHP
            php.push ('');
            php.push (phpSignature);
            php.push (phpBody);
            php.push ('    ' + '}')

            phpAsync.push ('');
            phpAsync.push (phpSignature);
            phpAsync.push (phpAsyncBody);
            phpAsync.push ('    ' + '}')
        }

        return {
            // altogether in PHP, async PHP, Python sync and async
            python2,
            python3,
            php,
            phpAsync,
            methodNames
        }
    }

    // ========================================================================

    transpileBaseMethods () {
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM JAVASCRIPT TO PYTHON AND PHP'
        const contents = fs.readFileSync (baseExchangeJsFile, 'utf8')
        const [ _, className, baseClass, classBody ] = this.getClassDeclarationMatches (contents)
        const jsDelimiter = '// ' + delimiter
        const parts = classBody.split (jsDelimiter)
        if (parts.length > 1) {
            log.magenta ('Transpiling from', baseExchangeJsFile.yellow)
            const secondPart = parts[1]
            const methods = secondPart.trim ().split (/\n\s*\n/)
            const {
                python2,
                python3,
                php,
                phpAsync,
            } = this.transpileMethodsToAllLanguages (className, methods)
            const pythonDelimiter = '# ' + delimiter + '\n'
            const phpDelimiter = '// ' + delimiter + '\n'
            const restOfFile = '([^\n]*\n)+'
            const python2File = './python/ccxt/base/exchange.py'
            const python3File = './python/ccxt/async_support/base/exchange.py'
            const phpFile = './php/Exchange.php'
            const phpAsyncFile = './php/async/Exchange.php'
            log.magenta ('→', python2File.yellow)
            replaceInFile (python2File,  new RegExp (pythonDelimiter + restOfFile), pythonDelimiter + python2.join ('\n') + '\n')
            log.magenta ('→', python3File.yellow)
            replaceInFile (python3File,  new RegExp (pythonDelimiter + restOfFile), pythonDelimiter + python3.join ('\n') + '\n')
            log.magenta ('→', phpFile.yellow)
            replaceInFile (phpFile,      new RegExp (phpDelimiter + restOfFile),    phpDelimiter + php.join ('\n') + '\n}\n')
            log.magenta ('→', phpAsyncFile.yellow)
            replaceInFile (phpAsyncFile, new RegExp (phpDelimiter + restOfFile),    phpDelimiter + phpAsync.join ('\n') + '\n}\n')
        }
    }

    // ========================================================================

    async getTSClassDeclarationsAllFiles (ids, folder, extension = '.js')  {
        const files = fs.readdirSync (folder).filter (file => ids.includes (basename (file, extension)))
        const promiseReadFile = promisify (fs.readFile);
        const fileArray = await Promise.all (files.map (file => promiseReadFile (folder + file, 'utf8')));
        const classComponents = await Promise.all (fileArray.map (file => this.getClassDeclarationMatches (file)));

        const classes = {}
        classComponents.forEach ( elem => classes[elem[1]] = elem[2] );

        return classes
    }

    // ========================================================================

    exportTypeScriptClassNames (file, classes) {

        log.bright.cyan ('Exporting TypeScript class names →', file.yellow)

        const regex = /\/[\n]{2}(?:    export class [^\s]+ extends [^\s]+ \{\}[\r]?[\n])+/
        const replacement = "/\n\n" + Object.keys (classes).map (className => {
            const baseClass = classes[className].replace (/ccxt\.[a-z0-9_]+/, 'Exchange')
            return '    export class ' + className + ' extends ' + baseClass + " {}"
        }).join ("\n") + "\n"

        replaceInFile (file, regex, replacement)
    }

    exportTypeScriptExchangeIds (file, classes) {

        log.bright.cyan ('Exporting TypeScript exchange ids →', file.yellow)

        const regex = /\/[\n]{2}    export type ExchangeId =\n(?:        \| \'[a-z0-9_]+\'[\r]?[\n])+/
        const replacement = "/\n\n    export type ExchangeId =\n" + Object.keys (classes).map (className => {
            return "        | '" + className + "'"
        }).join ("\n") + "\n"

        replaceInFile (file, regex, replacement)
    }

    // ========================================================================

    transpileErrorHierarchy () {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js'
        const errorHierarchyPath = __dirname + '/.' + errorHierarchyFilename

        let js = fs.readFileSync (errorHierarchyPath, 'utf8')

        js = this.regexAll (js, [
            // [ /export { [^\;]+\s*\}\n/s, '' ], // new esm
            [ /\s*export default(.*?);/g, '' ],
            // [ /module\.exports = [^\;]+\;\n/s, '' ], // old commonjs
        ]).trim ()

        const message = 'Transpiling error hierachy →'
        const root = errorHierarchy['BaseError']

        const { python3Body } = this.transpileJavaScriptToPythonAndPHP ({ js })

        // a helper to generate a list of exception class declarations
        // properly derived from corresponding parent classes according
        // to the error hierarchy

        function intellisense (map, parent, generate, classes) {
            function* generator(map, parent, generate, classes) {
                for (const key in map) {
                    yield generate (key, parent, classes)
                    yield* generator (map[key], key, generate, classes)
                }
            }
            return Array.from (generator (map, parent, generate, classes))
        }

        // Python -------------------------------------------------------------

        function pythonDeclareErrorClass (name, parent, classes) {
            classes.push (name)
            return [
                'class ' + name + '(' + parent + '):',
                '    pass',
                '',
                '',
            ].join ('\n');
        }

        const pythonBaseError = [
            'class BaseError(Exception):',
            '    pass',
            '',
            '',
        ].join ('\n');

        const quote = (s) => "'" + s + "'" // helper to add quotes around class names
        const pythonExports = [ 'error_hierarchy', 'BaseError' ]
        const pythonErrors = intellisense (root, 'BaseError', pythonDeclareErrorClass, pythonExports)
        const pythonAll = '__all__ = [\n    ' + pythonExports.map (quote).join (',\n    ') + '\n]'
        const python3BodyIntellisense = python3Body + '\n\n\n' + pythonBaseError + '\n' + pythonErrors.join ('\n') + '\n' + pythonAll + '\n'

        const pythonFilename = './python/ccxt/base/errors.py'
        if (fs.existsSync (pythonFilename)) {
            log.bright.cyan (message, pythonFilename.yellow)
            fs.writeFileSync (pythonFilename, python3BodyIntellisense)
        }

        // PHP ----------------------------------------------------------------

        function phpMakeErrorClassFile (name, parent) {

            const useClause = "\nuse " + parent + ";\n"
            const requireClause = "\nrequire_once PATH_TO_CCXT . '" + parent + ".php';\n"

            const phpBody = [
                '<?php',
                '',
                'namespace ccxt;',
                (parent === 'Exception') ? useClause : requireClause,
                'class ' + name + ' extends ' + parent + ' {};',
                '',
            ].join ("\n")
            const phpFilename = './php/' + name + '.php'
            log.bright.cyan (message, phpFilename.yellow)
            fs.writeFileSync (phpFilename, phpBody)
            return "require_once PATH_TO_CCXT . '" + name + ".php';"
        }

        const phpFilename ='./ccxt.php'

        if (fs.existsSync (phpFilename)) {
            const phpErrors = intellisense (errorHierarchy, 'Exception', phpMakeErrorClassFile)
            const phpBodyIntellisense = phpErrors.join ("\n") + "\n\n"
            log.bright.cyan (message, phpFilename.yellow)
            const phpRegex = /require_once PATH_TO_CCXT \. \'BaseError\.php\'\;\n(?:require_once PATH_TO_CCXT[^\n]+\n)+\n/m
            replaceInFile (phpFilename, phpRegex, phpBodyIntellisense)
        }
    }

    //-----------------------------------------------------------------------------

    transpileDateTimeTests () {
        const jsFile = './ts/src/test/base/functions/test.datetime.ts'
        const pyFile = './python/ccxt/test/base/test_datetime.py'
        const phpFile = './php/test/base/test_datetime.php'

        log.magenta ('Transpiling from', jsFile.yellow)

        let js = fs.readFileSync (jsFile).toString ()

        js = this.regexAll (js, [
            [ /[^\n]+from[^\n]+\n/g, '' ],
            [ /^export default[^\n]+\n/g, '' ],
            [/^\/\*.*\s+/mg, ''],
            [/^const\s+{.*}\s+=.*$/gm, ''],
        ])

        let { python2Body, phpBody } = this.transpileJavaScriptToPythonAndPHP ({ js, removeEmptyLines: false })

        // phpBody = phpBody.replace (/exchange\./g, 'Exchange::')

        const pythonHeader = [
            "",
            "import ccxt  # noqa: F402",
            "from ccxt.base.decimal_to_precision import ROUND_UP, ROUND_DOWN  # noqa F401",
            "",
            "# ----------------------------------------------------------------------------",
            "",
            "",
        ].join ("\n")

        const python = this.getPythonPreamble (4) + pythonHeader + python2Body + "\n"
        const php = this.getPHPPreamble (true, 3) + phpBody

        log.magenta ('→', pyFile.yellow)
        log.magenta ('→', phpFile.yellow)

        overwriteFile (pyFile, python)
        overwriteFile (phpFile, php)
    }

    //-------------------------------------------------------------------------

    transpilePrecisionTests () {

        const jsFile = './ts/src/test/base/functions/test.number.ts'
        const pyFile = './python/ccxt/test/base/test_number.py'
        const phpFile = './php/test/base/test_number.php'

        log.magenta ('Transpiling from', jsFile.yellow)

        let js = fs.readFileSync (jsFile).toString ()

        js = this.regexAll (js, [
            [ /\'use strict\';?\s+/g, '' ],
            [ /[^\n]+from[^\n]+\n/g, '' ],
            [ /^export default[^\n]+\n/g, '' ],
            [/^const\s+{.*}\s+=.*$/gm, ''],
            [ /decimalToPrecision/g, 'decimal_to_precision' ],
            [ /numberToString/g, 'number_to_string' ],
        ])

        let { python3Body, python2Body, phpBody, phpAsyncBody } = this.transpileJavaScriptToPythonAndPHP ({ js, removeEmptyLines: false })

        const pythonHeader = [
            "",
            "from ccxt.base.decimal_to_precision import decimal_to_precision  # noqa F401",
            "from ccxt.base.decimal_to_precision import TRUNCATE              # noqa F401",
            "from ccxt.base.decimal_to_precision import ROUND                 # noqa F401",
            "from ccxt.base.decimal_to_precision import DECIMAL_PLACES        # noqa F401",
            "from ccxt.base.decimal_to_precision import SIGNIFICANT_DIGITS    # noqa F401",
            "from ccxt.base.decimal_to_precision import TICK_SIZE             # noqa F401",
            "from ccxt.base.decimal_to_precision import PAD_WITH_ZERO         # noqa F401",
            "from ccxt.base.decimal_to_precision import NO_PADDING            # noqa F401",
            "from ccxt.base.decimal_to_precision import number_to_string      # noqa F401",
            "from ccxt.base.exchange import Exchange                          # noqa F401",
            "from ccxt.base.precise import Precise                            # noqa F401",
            "",
            "",
        ].join ("\n")

        const phpHeader = [
            "",
            "include_once (__DIR__.'/../fail_on_all_errors.php');",
            "",
            "// testDecimalToPrecisionErrorHandling",
            "//",
            "// $this->expectException ('ccxt\\\\BaseError');",
            "// $this->expectExceptionMessageRegExp ('/Negative precision is not yet supported/');",
            "// Exchange::decimalToPrecision ('123456.789', TRUNCATE, -2, DECIMAL_PLACES);",
            "//",
            "// $this->expectException ('ccxt\\\\BaseError');",
            "// $this->expectExceptionMessageRegExp ('/Invalid number/');",
            "// Exchange::decimalToPrecision ('foo');",
            "",
            "// ----------------------------------------------------------------------------",
            "",
            "function decimal_to_precision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {",
            "    return Exchange::decimal_to_precision ($x, $roundingMode, $numPrecisionDigits, $countingMode, $paddingMode);",
            "}",
            "function number_to_string ($x) {",
            "    return Exchange::number_to_string ($x);",
            "}",
            "",
        ].join ("\n")

        const python = this.getPythonPreamble (4) + pythonHeader + python2Body + "\n"
        const php = this.getPHPPreamble (true, 3) + phpHeader + phpBody

        log.magenta ('→', pyFile.yellow)
        log.magenta ('→', phpFile.yellow)

        overwriteFile (pyFile, python)
        overwriteFile (phpFile, php)
    }

    //-------------------------------------------------------------------------

    transpileCryptoTests () {
        const jsFile = './ts/src/test/base/functions/test.crypto.ts' // using ts version to avoid formatting issues
        const pyFile = './python/ccxt/test/base/test_crypto.py'
        const phpFile = './php/test/base/test_crypto.php'

        log.magenta ('Transpiling from', jsFile.yellow)
        let js = fs.readFileSync (jsFile).toString ()

        js = this.regexAll (js, [
            [ /\'use strict\';?\s+/g, '' ],
            [ /[^\n]+from[^\n]+\n/g, '' ],
            [ /^export default[^\n]+\n/g, '' ],
            [/^const\s+{.*}\s+=.*$/gm, ''],
            [ /function equals \([\S\s]+?return true\n}\n/g, '' ],
        ])

        let { python2Body, phpBody } = this.transpileJavaScriptToPythonAndPHP ({ js, removeEmptyLines: false })

        const pythonHeader = [
            "",
            "import ccxt  # noqa: F402",
            "import hashlib  # noqa: F402",
            "",
            "Exchange = ccxt.Exchange",
            "hash = Exchange.hash",
            "hmac = Exchange.hmac",
            "ecdsa = Exchange.ecdsa",
            "eddsa = Exchange.eddsa",
            "jwt = Exchange.jwt",
            "crc32 = Exchange.crc32",
            "rsa = Exchange.rsa",
            "encode = Exchange.encode",
            "",
            "",
            "def equals(a, b):",
            "    return a == b",
            "",
        ].join ("\n")

        const phpHeader = [
            "",
            "function hash(...$args) {",
            "    return Exchange::hash(...$args);",
            "}",
            "",
            "function hmac(...$args) {",
            "    return Exchange::hmac(...$args);",
            "}",
            "",
            "function encode(...$args) {",
            "    return Exchange::encode(...$args);",
            "}",
            "",
            "function ecdsa(...$args) {",
            "    return Exchange::ecdsa(...$args);",
            "}",
            "",
            "function eddsa(...$args) {",
            "    return Exchange::eddsa(...$args);",
            "}",
            "",
            "function jwt(...$args) {",
            "    return Exchange::jwt(...$args);",
            "}",
            "",
            "function crc32(...$arg) {",
            "    return Exchange::crc32(...$arg);",
            "}",
            "",
            "function rsa(...$arg) {",
            "    return Exchange::rsa(...$arg);",
            "}",
            "",
            "function equals($a, $b) {",
            "    return $a === $b;",
            "}",
        ].join ("\n")

        const python = this.getPythonPreamble (4) + pythonHeader + python2Body + "\n"
        const php = this.getPHPPreamble (true, 3) + phpHeader + phpBody

        log.magenta ('→', pyFile.yellow)
        log.magenta ('→', phpFile.yellow)

        overwriteFile (pyFile, python)
        overwriteFile (phpFile, php)
    }

    // ============================================================================

    async readFilesAsync(files) {
        const promiseReadFile = promisify(fs.readFile);
        const fileArray = await Promise.all(files.map(file => promiseReadFile(file)));
        return fileArray.map( file => file.toString() );
    }

    // ============================================================================

    uncamelcaseName (name) {
        return unCamelCase (name).replace (/\./g, '_');
    }

    // ============================================================================

    transpileExchangeTests () {

        this.transpileMainTests ({
            'tsFile': './ts/src/test/test.ts',
            'pyFileAsync': './python/ccxt/test/test_async.py',
            'phpFileAsync': './php/test/test_async.php',
            'pyFileSync': './python/ccxt/test/test_sync.py',
            'phpFileSync': './php/test/test_sync.php',
            'jsFile': './js/test/test.js',
        });

        const baseFolders = {
            ts: './ts/src/test/Exchange/',
            tsBase: './ts/src/test/Exchange/base/',
            py: './python/ccxt/test/',
            pyBase: './python/ccxt/test/base/',
            php: './php/test/',
            phpBase: './php/test/base/',
        };

        let baseTests = fs.readdirSync (baseFolders.tsBase).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        const exchangeTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // ignore throttle test for now
        baseTests = baseTests.filter (filename => filename !== 'test.throttle');

        const tests = [];
        for (const testName of baseTests) {
            const unCamelCasedFileName = this.uncamelcaseName(testName);
            const test = {
                base: true,
                name: testName,
                tsFile: baseFolders.tsBase + testName + '.ts',
                pyFile: baseFolders.pyBase + unCamelCasedFileName + '.py',
                phpFile: baseFolders.phpBase + unCamelCasedFileName + '.php',
            };
            tests.push(test);
        }
        for (const testName of exchangeTests) {
            const unCamelCasedFileName = this.uncamelcaseName(testName);
            const test = {
                base: false,
                name: testName,
                tsFile: baseFolders.ts + testName + '.ts',
                pyFile: baseFolders.py + 'sync/' + unCamelCasedFileName + '.py',
                pyFileAsync: baseFolders.py + 'async/' + unCamelCasedFileName + '.py',
                phpFile: baseFolders.php + 'sync/' + unCamelCasedFileName + '.php',
                phpFileAsync: baseFolders.php + 'async/' + unCamelCasedFileName + '.php',
            };
            tests.push(test);
        }
        this.transpileAndSaveExchangeTests (tests);
        this.createBaseInitFile(baseFolders.pyBase, baseTests)
    }

    createBaseInitFile (pyPath, tests) {
        const finalPath = pyPath + '__init__.py';
        const fileNames = tests.filter(t => t !== 'test.sharedMethods').map(test => this.uncamelcaseName(test));
        const importNames = fileNames.map(testName => `from ccxt.test.base.${testName} import ${testName} # noqa E402`)
        const baseContent = [
            '',
            this.getPythonGenerated(),
            ...importNames
        ].join('\n');

        log.magenta ('→', finalPath)
        overwriteFile (finalPath, baseContent)
    }

    transpileMainTests (files) {
        log.magenta ('Transpiling from', files.tsFile.yellow)
        let ts = fs.readFileSync (files.tsFile).toString ()

        ts = this.regexAll (ts, [
            [ /\'use strict\';?\s+/g, '' ],
            [ /[^\n]+require[^\n]+\n/g, '' ],
        ])

        const allDefinedFunctions = [ ...ts.matchAll (/function (.*?) \(/g)].map(m => m[1]);
        const snakeCaseFunctions = (cont) => {
            return this.regexAll (cont, allDefinedFunctions.map( fName => {
                return [ new RegExp ('\\b' + fName + '\\b', 'g'), unCamelCase (fName)];
            }));
        };

        const commentStartLine = '***** AUTO-TRANSPILER-START *****';
        const commentEndLine = '***** AUTO-TRANSPILER-END *****';

        const mainContent = ts.split (commentStartLine)[1].split (commentEndLine)[0];
        let { python2, python3, php, phpAsync, className, baseClass } = this.transpileClass (mainContent);

        // ########### PYTHON ###########
        python3 = python3.
            // remove async ccxt import
            replace (/from ccxt\.async_support(.*)/g, '').
            // add one more newline before function
            replace (/^(async def|def) (\w)/gs, '\n$1 $2')
        const existinPythonBody = fs.readFileSync (files.pyFileAsync).toString ();
        let newPython = existinPythonBody.split(commentStartLine)[0] + commentStartLine + '\n' + python3 + '\n# ' + commentEndLine + existinPythonBody.split(commentEndLine)[1];
        newPython = snakeCaseFunctions (newPython);
        overwriteFile (files.pyFileAsync, newPython);
        this.transpilePythonAsyncToSync (files.pyFileAsync, files.pyFileSync);
        // remove 4 extra newlines
        let existingPythonWN = fs.readFileSync (files.pyFileSync).toString ();
        existingPythonWN = existingPythonWN.replace (/(\n){4}/g, '\n\n');
        overwriteFile (files.pyFileSync, existingPythonWN);


        // ########### PHP ###########
        phpAsync = phpAsync.replace (/\<\?php(.*?)namespace ccxt\\async;/sg, '');
        phpAsync = phpAsync.replace ('\nuse React\\Async;','').replace ('\nuse React\\Promise;', ''); // no longer needed, as hardcoded in top lines of test_async.php
        phpAsync = phpAsync.replace ('(this,','($this,');
        const existinPhpBody = fs.readFileSync (files.phpFileAsync).toString ();
        const phpReform = (cont) => {
            let newContent = existinPhpBody.split(commentStartLine)[0] + commentStartLine + '\n' + cont + '\n' + '// ' + commentEndLine + existinPhpBody.split(commentEndLine)[1];
            newContent = newContent.replace (/use ccxt\\(async\\|)abstract\\testMainClass as baseMainTestClass;/g, '');
            newContent = snakeCaseFunctions (newContent);
            return newContent;
        }
        let bodyPhpAsync = phpReform (phpAsync);
        overwriteFile (files.phpFileAsync, bodyPhpAsync);
        //doesnt work: this.transpilePhpAsyncToSync (files.phpFileAsync, files.phpFileSync);
        const phpRemovedStart = php.replace (/\<\?php(.*?)(?:namespace ccxt)/gs, '');
        let bodyPhpSync = phpReform (phpRemovedStart);
        bodyPhpSync = bodyPhpSync.replace (/ccxt(\\)+async/g, 'ccxt');
        bodyPhpSync = bodyPhpSync.replace ('(this,','($this,');
        bodyPhpSync = bodyPhpSync.replace (/Async\\await\((.*?)\);/g, '$1;');
        overwriteFile (files.phpFileSync, bodyPhpSync);
    }

    // ============================================================================

    async webworkerTranspile (allFiles, fileConfig, parserConfig) {
        // create worker config
        const workerConfigArray = allFiles.map( file => {
            return {
                content: file,
                config: fileConfig
            }
        });

        // create worker
        const piscina = new Piscina({
            filename: resolve(__dirname, './ast-transpiler-worker.js')
        });

        const chunkSize = 10;
        const promises = [];
        const now = Date.now();
        for (let i = 0; i < workerConfigArray.length; i += chunkSize) {
            const chunk = workerConfigArray.slice(i, i + chunkSize);
            promises.push(piscina.run({transpilerConfig:parserConfig, filesConfig:chunk}));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green ('[ast-transpiler] Transpiled', workerResult.length, 'tests in', elapsed, 'ms');
        const flatResult = workerResult.flat();
        return flatResult;
    }
    // ============================================================================

    async transpileAndSaveExchangeTests (tests) {
        const parser = {
            'LINES_BETWEEN_FILE_MEMBERS': 2
        }
        let fileConfig = [
            {
                language: "php",
                async: true
            },
            {
                language: "php",
                async: false
            },
            {
                language: "python",
                async: false
            },
            {
                language: "python",
                async: true
            },
        ]
        if (tests.base) {
            fileConfig = [{ language: "php", async: false}, { language: "python", async: false}]
        }
        const parserConfig = {
            'verbose': false,
            'python':{
                'uncamelcaseIdentifiers': true,
                'parser': parser
            },
            'php':{
                'uncamelcaseIdentifiers': true,
                'parser': parser
            }
        };

        let allFiles = await this.readFilesAsync (tests.map(t => t.tsFile));

        // apply regex to every file
        allFiles = allFiles.map( file => this.regexAll (file, [
            [ /\'use strict\';?\s+/g, '' ],
        ]));

        const flatResult = await this.webworkerTranspile (allFiles, fileConfig, parserConfig);

        const exchangeCamelCaseProps = (str) => {
            // replace all snake_case exchange props to camelCase
            return str.
                replace (/precision_mode/g, 'precisionMode');
        };

        const pyFixes = (str) => {
            str = str.replace (/assert\((.*)\)(?!$)/g, 'assert $1');
            str = str.replace (/ == True/g, ' is True');
            str = str.replace (/ == False/g, ' is False');
            return exchangeCamelCaseProps(str);
        }

        const phpFixes = (str) => {
            str = str.
                replace (/\$exchange\[\$method\]/g, '$exchange->$method').
                replace (/\$test_shared_methods\->/g, '').
                replace (/TICK_SIZE/g, '\\ccxt\\TICK_SIZE').
                replace (/Precise\->/g, 'Precise::');
            return exchangeCamelCaseProps(str);
        }

        for (let i = 0; i < flatResult.length; i++) {
            const result = flatResult[i];
            const test = tests[i];
            let phpAsync = phpFixes(result[0].content);
            let phpSync = phpFixes(result[1].content);
            let pythonSync = pyFixes (result[2].content);
            let pythonAsync = pyFixes (result[3].content);
            if (tests.base) {
                phpAsync = '';
                pythonAsync = '';
            }

            const imports = result[0].imports;

            const usesPrecise = imports.find(x => x.name.includes('Precise'));
            const usesNumber = pythonAsync.indexOf ('numbers.') >= 0;
            const usesTickSize = pythonAsync.indexOf ('TICK_SIZE') >= 0;
            const requiredSubTests  = imports.filter(x => x.name.includes('test')).map(x => x.name);

            let pythonHeaderSync = []
            let pythonHeaderAsync = []
            let phpHeaderSync = []
            let phpHeaderAsync = []

            if (usesTickSize) {
                pythonHeaderSync.push ('from ccxt.base.decimal_to_precision import TICK_SIZE  # noqa E402')
                pythonHeaderAsync.push ('from ccxt.base.decimal_to_precision import TICK_SIZE  # noqa E402')
            }
            if (usesNumber) {
                pythonHeaderSync.push ('import numbers  # noqa E402')
                pythonHeaderAsync.push ('import numbers  # noqa E402')
            }
            if (usesPrecise) {
                pythonHeaderAsync.push ('from ccxt.base.precise import Precise  # noqa E402')
                pythonHeaderSync.push ('from ccxt.base.precise import Precise  # noqa E402')
            }

            for (const subTestName of requiredSubTests) {
                const snake_case = unCamelCase(subTestName);
                const isSharedMethodsImport = subTestName.includes ('SharedMethods');
                const isSameDirImport = tests.find(t => t.name === subTestName);
                const phpPrefix = isSameDirImport ? '/' : '/../base/';
                let pySuffix = isSameDirImport ? '' : '.base';

                if (isSharedMethodsImport) {
                    pythonHeaderAsync.push (`from ccxt.test.base import test_shared_methods  # noqa E402`)
                    pythonHeaderSync.push (`from ccxt.test.base import test_shared_methods  # noqa E402`)

                    // php
                    if (!test.base) {
                        phpHeaderAsync.push (`include_once __DIR__ . '/../base/test_shared_methods.php';`)
                    } else {
                        phpHeaderSync.push (`include_once __DIR__ . '/test_shared_methods.php';`)
                    }
                }

                if (!isSharedMethodsImport) {
                    if (test.base) {
                        phpHeaderSync.push (`include_once __DIR__ . '/${snake_case}.php';`)
                        pythonHeaderSync.push (`from ccxt.test.base.${snake_case} import ${snake_case}  # noqa E402`)
                    } else {
                        phpHeaderSync.push (`include_once __DIR__ . '${phpPrefix}${snake_case}.php';`)
                        phpHeaderAsync.push (`include_once __DIR__ . '${phpPrefix}${snake_case}.php';`)
                        pySuffix = (pySuffix === '') ? snake_case : pySuffix;
                        pythonHeaderSync.push (`from ccxt.test${pySuffix} import ${snake_case}  # noqa E402`)
                        pythonHeaderAsync.push (`from ccxt.test${pySuffix} import ${snake_case}  # noqa E402`)
                    }
                }
            }

            if (pythonHeaderAsync.length > 0) {
                pythonHeaderAsync = ['', ...pythonHeaderAsync, '', '']
                pythonHeaderSync = ['', ...pythonHeaderSync, '', '']
            }
            const pythonPreambleSync = this.getPythonPreamble(4) + pythonCodingUtf8 + '\n\n' + pythonHeaderSync.join ('\n') + '\n';
            const phpPreamble = this.getPHPPreamble (false)
            let phpPreambleSync = phpPreamble + phpHeaderSync.join ('\n') + "\n\n";
            phpPreambleSync = phpPreambleSync.replace (/namespace ccxt;/, 'namespace ccxt;\nuse \\ccxt\\Precise;');

            if (!test.base) {
                let phpPreambleAsync = phpPreamble + phpHeaderAsync.join ('\n') + "\n\n";
                phpPreambleAsync = phpPreambleAsync.replace (/namespace ccxt;/, 'namespace ccxt;\nuse \\ccxt\\Precise;\nuse React\\\Async;\nuse React\\\Promise;');
                const pythonPreambleAsync = this.getPythonPreamble(4) + pythonCodingUtf8 + '\n\n' + pythonHeaderAsync.join ('\n') + '\n';
                const finalPhpContentAsync = phpPreambleAsync + phpAsync;
                const finalPyContentAsync = pythonPreambleAsync + pythonAsync;
                log.magenta ('→', test.pyFileAsync.yellow)
                overwriteFile (test.pyFileAsync, finalPyContentAsync)
                log.magenta ('→', test.phpFileAsync.yellow)
                overwriteFile (test.phpFileAsync, finalPhpContentAsync)
            }

            const finalPhpContentSync = phpPreambleSync + phpSync;
            const finalPyContentSync = pythonPreambleSync + pythonSync;

            log.magenta ('→', test.phpFile.yellow)
            overwriteFile (test.phpFile, finalPhpContentSync)
            log.magenta ('→', test.pyFile.yellow)
            overwriteFile (test.pyFile, finalPyContentSync)
        }
    }

    // ============================================================================

    transpileTests () {

        this.transpilePrecisionTests ()
        this.transpileDateTimeTests ()
        this.transpileCryptoTests ()

        this.transpileExchangeTests ()
    }

    // ============================================================================
    transpileExamples () {
        const parser = {
            'LINES_BETWEEN_FILE_MEMBERS': 2
        }
        const fileConfig = [
            {
                language: "php",
                async: true
            },
            {
                language: "python",
                async: true
            },
        ]
        const parserConfig = {
            'verbose': false,
            'python':{
                'uncamelcaseIdentifiers': true,
                'parser': parser
            },
            'php':{
                'uncamelcaseIdentifiers': true,
                'parser': parser
            },
        };
        const transpiler = new astTranspiler(parserConfig);

        const examplesBaseFolder = __dirname + '/../examples/'
        const examplesFolders = {
            ts: examplesBaseFolder +'ts/',
            js: examplesBaseFolder +'js/',
            py: examplesBaseFolder +'py/',
            php: examplesBaseFolder +'php/',
        }
        const transpileFlagPhrase = '// AUTO-TRANSPILE //'

        const pythonPreamble = this.getPythonPreamble ().replace ('sys.path.append(root)', 'sys.path.append(root + \'/python\')'); // as main preamble is meant for derived exchange classes, the path needs to be changed
        const phpPreamble = this.getPHPPreamble ();

        const preambles = {
            phpAsync: phpPreamble,
            pyAsync: pythonPreamble,
        };

        const fileHeaders = {
            pyAsync: [
                "import asyncio",
                "import ccxt.async_support as ccxt  # noqa: E402",
                "",
                "",
                "",
            ],
            phpAsync: [
                "",
                "error_reporting(E_ALL | E_STRICT);",
                "date_default_timezone_set('UTC');",
                "",
                "use ccxt\\Precise;",
                "use React\\Async;",
                "use React\\Promise;",
                "",
                "",
                "",
            ]
        }
        // join header arrays into strings
        for (const [key, value] of Object.entries (fileHeaders)) {
            fileHeaders[key] = value.join ('\n')
        }

        // start iteration through examples folder
        const allTsExamplesFiles = fs.readdirSync (examplesFolders.ts).filter((f) => f.endsWith('.ts'));
        for (const filenameWithExtenstion of allTsExamplesFiles) {
            const tsFile = examplesFolders.ts + filenameWithExtenstion
            let tsContent = fs.readFileSync (tsFile).toString ()
            if (tsContent.indexOf (transpileFlagPhrase) > -1) {
                log.magenta ('Transpiling from', tsFile.yellow)
                const fileName = filenameWithExtenstion.replace ('.ts', '')
                // temporary: avoid console.log with + (plos) because it may break in python.
                if (tsContent.match ('console\.log \((.*?)\\+(.*?)\);')){
                    throw new Error ('console.log with +(plus) detected in ' + tsFile + '. Please use commas or string interpolation.');
                }

                // detect all function declarations in JS, e.g. `async function Xyz (...)`)
                const allDetectedFunctionNames = [...tsContent.matchAll(/\bfunction (.*?)\(/g)].map (match => match[1].trim());

                // exec the main transpile function
                const transpiled = transpiler.transpileDifferentLanguages(fileConfig, tsContent);
                let [ phpAsyncBody, pythonAsyncBody ] = [ transpiled[0].content, transpiled[1].content  ];
                // ###### replace common (synchronity agnostic) syntaxes ######
                const fixPython = (body, isAsync)=> {
                    return this.regexAll (body, [
                        [ /console\.log/g, 'print' ],
                        // cases like: exchange = new ccxt.binance ()
                        //[ / ccxt\.(.?)\(/g, 'ccxt.' + '$2\(' ],
                        // cases like: exchange = new ccxt['name' or name] ()
                        [ /ccxt\[(.*?)\]/g, 'getattr(ccxt, $1)'],
                    ]);
                };
                const fixPhp = (body, isAsync)=> {
                    let asyncSub = isAsync ? 'async\\' : '';
                    const regexes = [
                        [ /\$console\->log/g, 'var_dump' ],
                        // cases like: exchange = new ccxt.huobi ()
                        [ /new \$ccxt->/g, 'new \\ccxt\\' + asyncSub ],
                        // cases like: exchange = new ccxt['huobi' or varname] ()
                        [ /new \$ccxt\[(?:['"]|)(.*?)(?:['"]|)\]\(/g, 'new (\'\\\\ccxt\\\\' + asyncSub + '$1\')(' ],
                    ];
                    return this.regexAll (body, regexes);
                };

                const finalBodies = {};
                finalBodies.pyAsync = fixPython (pythonAsyncBody, true);
                finalBodies.phpAsync = fixPhp (phpAsyncBody, true);

                // specifically in python (not needed in other langs), we need add `await .close()` inside matching methods
                for (const funcName of allDetectedFunctionNames) {
                    // match function bodies
                    const funcBodyRegex = new RegExp ('(?=def ' + funcName + '\\()(.*?)(?=\\n\\w)', 'gs');
                    // inside functions, find exchange initiations
                    finalBodies.pyAsync = finalBodies.pyAsync.replace (funcBodyRegex, function (wholeMatch, innerMatch){
                        // find inited exchanges
                        // case 1: inited with getattr
                        let matches = [ ... innerMatch.matchAll(/(\w*?) \= getattr\(ccxt,\s*(.*?)\)/g)];
                        if (matches.length === 0) {
                            // case 2: inited with direct call
                            matches = [ ... innerMatch.matchAll(/(\w*?) \= ccxt\.(.*?)\(/g)];
                        }
                        let matchedBody = innerMatch;
                        // add `await exchange.close()` to instantiated variables
                        for (const exchLineMatches of matches) {
                            // we presume all methods to be in main scope, so adding just 4 spaces
                            matchedBody = matchedBody + '    await ' + exchLineMatches[1] + '.close()\n'
                        }
                        return matchedBody;
                    });
                    // place main-scope await function calls within asyncio
                    finalBodies.pyAsync = finalBodies.pyAsync.replace (new RegExp ('await ' + funcName + '\\((.*?)\\)', 'g'), function(wholeMatch, innerMatch){ return '\nasyncio.run(' + wholeMatch.replace('await ','').trim() + ')';})
                }

                // write files
                overwriteFile (examplesFolders.py  + fileName + '.py', preambles.pyAsync + fileHeaders.pyAsync + finalBodies.pyAsync)
                overwriteFile (examplesFolders.php + fileName + '.php', preambles.phpAsync + fileHeaders.phpAsync + finalBodies.phpAsync)
            }
        }
    }

    // ============================================================================
    transpilePhpBaseClassMethods () {
        const baseMethods = this.getPHPBaseMethods ()
        const indent = 4
        const space = ' '.repeat (indent)
        const result = [
            'public static $camelcase_methods = array(',
        ]
        for (const method of baseMethods) {
            const underscoreCase = unCamelCase (method)
            if (underscoreCase !== method) {
                result.push (space.repeat (2) + '\'' + method + '\' => ' + '\'' + underscoreCase + '\',')
            }
        }
        result.push (space + ');')
        const string = result.join ('\n')

        const phpBaseClass = './php/Exchange.php';
        const phpBody = fs.readFileSync (phpBaseClass, 'utf8')
        const regex = /public static \$camelcase_methods = array\([\s\S]+?\);/g
        const bodyArray = phpBody.split (regex)

        const newBody = bodyArray[0] + string + bodyArray[1]

        log.magenta ('Transpiling from ', phpBaseClass.yellow, '→', phpBaseClass.yellow)
        overwriteFile (phpBaseClass, newBody)
    }

    // ============================================================================

    getAllFilesRecursively(folder, jsFiles) {
        fs.readdirSync(folder).forEach(File => {
            const absolute = join(folder, File);
            if (fs.statSync(absolute).isDirectory()) return this.getAllFilesRecursively(absolute, jsFiles);
            else return jsFiles.push(absolute);
        });
    }

    addGeneratedHeaderToJs (jsFolder, force = false) {

        // add it to every .js file inside the folder
        let jsFiles = [];
        this.getAllFilesRecursively(jsFolder, jsFiles);

        jsFiles.filter(f => !f.includes(".d.ts")).map (jsFilePath => {
            const content = fs.readFileSync (jsFilePath, 'utf8');
            if (content.indexOf (this.getJsPreamble()) === -1) {
                let contents = [
                    this.getJsPreamble(),
                    content
                ].join ("\n")
                overwriteFile (jsFilePath, contents)
            }
        })
        log.bright.yellow ('Added JS preamble to all ', jsFiles.length + ' files.')
    }

    // ============================================================================


    async transpileEverything (force = false, child = false) {

        // default pattern is '.js'
        const exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
            , python2Folder  = './python/ccxt/'
            , python3Folder  = './python/ccxt/async_support/'
            , phpFolder      = './php/'
            , phpAsyncFolder = './php/async/'
            , tsFolder = './ts/src/'
            , jsFolder = './js/src/'
            // , options = { python2Folder, python3Folder, phpFolder, phpAsyncFolder }
            , options = { python2Folder, python3Folder, phpFolder, phpAsyncFolder, exchanges }

        if (!child) {
            createFolderRecursively (python2Folder)
            createFolderRecursively (python3Folder)
            createFolderRecursively (phpFolder)
            createFolderRecursively (phpAsyncFolder)
        }

        // const classes = this.transpileDerivedExchangeFiles (tsFolder, options, pattern, force)
        const classes = this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, child || exchanges.length)

        if (classes === null) {
            log.bright.yellow ('0 files transpiled.')
            return;
        }
        if (child) {
            return
        }

        this.transpileBaseMethods ()

        //*/

        this.transpileErrorHierarchy ()

        this.transpileTests ()

        // this.transpilePhpBaseClassMethods ()

        this.transpileExamples ()

        this.addGeneratedHeaderToJs ('./js/')

        log.bright.green ('Transpiled successfully.')
    }
}

function parallelizeTranspiling (exchanges, processes = undefined) {
    const processesNum = processes || os.cpus ().length
    log.bright.green ('starting ' + processesNum + ' new processes...')
    let isFirst = true
    for (let i = 0; i < processesNum; i ++) {
        const toProcess = exchanges.filter ((_, index) => index % processesNum === i)
        const args = isFirst ? [ '--force' ] : [ '--child', '--force' ]
        isFirst = false
        fork (process.argv[1], toProcess.concat (args))
    }
}

function isMainEntry(metaUrl) {
    // https://exploringjs.com/nodejs-shell-scripting/ch_nodejs-path.html#detecting-if-module-is-main
    if (import.meta.url.startsWith('file:')) {
        const modulePath = url.fileURLToPath(metaUrl);
        if (process.argv[1] === modulePath) {
            return true;
        }
        // when called without .js extension
        if (process.argv[1] === modulePath.replace('.js','')) {
            return true;
        }
    }
    return false;
}

// ============================================================================
if (isMainEntry(import.meta.url)) {
    const transpiler = new Transpiler ()
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests')
    const errors = process.argv.includes ('--error') || process.argv.includes ('--errors')
    const child = process.argv.includes ('--child')
    const force = process.argv.includes ('--force')
    const multiprocess = process.argv.includes ('--multiprocess') || process.argv.includes ('--multi')
    if (!child && !multiprocess) {
        log.bright.green ({ force })
    }
    if (test) {
        transpiler.transpileTests ()
    } else if (errors) {
        transpiler.transpileErrorHierarchy ({ tsFilename })
    } else if (multiprocess) {
        parallelizeTranspiling (exchangeIds)
    } else {
        (async () => {
            await transpiler.transpileEverything (force, child)
        })()
    }

} else { // if required as a module

    // do nothing
}

// ============================================================================

export {
    Transpiler,
    parallelizeTranspiling,
    isMainEntry
}

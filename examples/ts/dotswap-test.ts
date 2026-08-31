// @ts-nocheck
import http from 'http';
import https from 'https';
import dotswap from '../../ts/src/dotswap.js';

// ============================================
// HTTP 支持补丁（仅用于测试环境）
// ============================================
function createHttpFetch () {
    return async function customFetch (url, method = 'GET', headers = {}, body = undefined) {
        // ✅ 输出请求详情
        console.log ('\n🔍 [HTTP REQUEST]');
        console.log (`   URL:     ${url}`);
        console.log (`   Method:  ${method}`);
        console.log (`   Headers: ${JSON.stringify (headers, null, 2)}`);
        if (body) {
            console.log (`   Body:    ${body}`);
        }
        console.log ('-'.repeat (60));

        const urlObj = new URL (url);
        const isHttps = urlObj.protocol === 'https:';
        const httpModule = isHttps ? https : http;
        // ✅ 正确的方式：将 URL 和 options 合并
        const requestOptions = {
            'hostname': urlObj.hostname,
            'port': urlObj.port,
            'path': urlObj.pathname + urlObj.search,
            'method': method,
            'headers': headers,
            'timeout': 30000,
        };
        return new Promise ((resolve, reject) => {
            const req = httpModule.request (requestOptions, (res) => {
                let data = '';
                res.on ('data', (chunk) => {
                    data += chunk;
                });
                res.on ('end', () => {
                    // ✅ 输出响应详情
                    console.log ('✓ [HTTP RESPONSE]');
                    console.log (`   Status:  ${res.statusCode} ${res.statusMessage}`);
                    console.log (`   Headers: ${JSON.stringify (res.headers, null, 2)}`);
                    console.log (`   Body:    ${data.substring (0, 200)}${data.length > 200 ? '...' : ''}`);
                    console.log ('-'.repeat (60));

                    try {
                        const jsonData = JSON.parse (data);
                        resolve (jsonData);  // ← 关键修改
                    } catch (e) {
                        reject (new Error ('Failed to parse JSON: ' + e.message));
                    }

                    resolve ({
                        'ok': res.statusCode >= 200 && res.statusCode < 300,
                        'status': res.statusCode,
                        'statusText': res.statusMessage,
                        'headers': res.headers,
                        'text': async () => data,
                        'json': async () => JSON.parse (data),
                    });
                });
            });
            req.on ('error', (err) => {
                // ✅ 输出错误详情
                console.error ('✗ [HTTP ERROR]');
                console.error (`   Error: ${err.message}`);
                console.error (`   Code:  ${err.code || 'N/A'}`);
                console.error ('-'.repeat (60));
                reject (err);
            });
            req.on ('timeout', () => {
                console.error ('✗ [HTTP TIMEOUT]');
                console.error (`   URL: ${url}`);
                console.error ('-'.repeat (60));
                reject (new Error ('Request timeout'));
            });
            if (body) {
                req.write (body);
            }
            req.end ();
        });
    };
}

// ============================================
// 配置区域
// ============================================
const CONFIG = {
    'apiKey': 'your-user-id',
    'secret': 'your-authorization',
    // 'testSymbol': 'DOTSWAP•DOTSWAP/BTC',
    'testSymbol': 'BTC/DOTSWAP•DOTSWAP',
    'testAmount': 1000,
    'enablePrivateTests': true,
    'urls': {
        'publicApi': 'https://test-api-proxy.ddpurse.com',
        'privateApi': 'http://test-dex.ddpurse.com:18617',
    },
};

// ============================================
// 辅助函数：创建 Exchange 实例
// ============================================
function createExchange (apiUrl, privateUrl = null) {
    const exchange = new dotswap ({
        'apiKey': CONFIG.apiKey,
        'secret': CONFIG.secret,
        'enableRateLimit': true,
        'sandbox': true,
    });
    // 设置 API URLs
    exchange.urls.api.public = apiUrl;
    exchange.urls.api.private = privateUrl || apiUrl;
    // 覆盖 fetch 方法以支持 HTTP
    exchange.fetch = createHttpFetch ();
    return exchange;
}

// ============================================
// 主测试函数
// ============================================
async function main () {
    console.log ('='.repeat (60));
    console.log ('DotSwap CCXT Integration Test');
    console.log ('⚠️  Using HTTP with custom fetch (Test environment only)');
    console.log ('='.repeat (60));
    console.log ();
    console.log (`📡 Public API URL:  ${CONFIG.urls.publicApi}`);
    console.log (`📡 Private API URL: ${CONFIG.urls.privateApi}`);
    console.log ();
    try {
        // ============================================
        // 测试 1: 获取市场列表（使用 Public API）
        // ============================================
        await testFetchMarkets (CONFIG.urls.publicApi);
        // ============================================
        // 测试 2: 获取行情数据（使用 Public API）
        // ============================================
        await testFetchTicker (CONFIG.urls.publicApi, CONFIG.testSymbol);
        // 测试 3: 获取币种列表（使用 Public API）
        // ============================================
        await testFetchCurrencies (CONFIG.urls.publicApi);
        // ============================================
        // 测试 4: 创建市价买单（使用 Private API）
        // ============================================
        if (CONFIG.enablePrivateTests) {
            await testCreateMarketBuyOrder (CONFIG.urls.privateApi, CONFIG.testSymbol, CONFIG.testAmount);
        }
        // ============================================
        // 测试 5: 创建市价卖单（使用 Private API）
        // ============================================
        if (CONFIG.enablePrivateTests) {
            await testCreateMarketSellOrder (CONFIG.urls.privateApi, CONFIG.testSymbol, 100);
        }
        console.log ('\n' + '='.repeat (60));
        console.log ('✅ All tests completed successfully!');
        console.log ('='.repeat (60));
    } catch (error) {
        console.error ('\n' + '='.repeat (60));
        console.error ('❌ Test suite failed:');
        console.error ('='.repeat (60));
        console.error ('Error:', error.message);
        if (error.stack) {
            console.error ('Stack:', error.stack);
        }
    }
}

// ============================================
// 测试 1: 获取市场列表
// ============================================
async function testFetchMarkets (apiUrl) {
    console.log ('📊 Test 1: Fetching markets...');
    console.log ('-'.repeat (60));
    console.log (`   Using API: ${apiUrl}`);
    // ✅ 独立创建 exchange 实例
    const exchange = createExchange (apiUrl);
    try {
        const startTime = Date.now ();
        const markets = await exchange.fetchMarkets ();
        console.log ('marketsmarketsmarketsmarkets', markets);
        const duration = Date.now () - startTime;
        console.log (`✅ Fetched ${markets.length} markets in ${duration}ms`);
        if (markets.length > 0) {
            const firstMarket = markets[0];
            console.log ('\n📝 First market details:');
            console.log (`   ID:        ${firstMarket.id}`);
            console.log (`   Symbol:    ${firstMarket.symbol}`);
            console.log (`   Base:      ${firstMarket.base}`);
            console.log (`   Quote:     ${firstMarket.quote}`);
            console.log (`   Type:      ${firstMarket.type}`);
            console.log (`   Active:    ${firstMarket.active}`);
            console.log (`   Precision: amount=${firstMarket.precision.amount}, price=${firstMarket.precision.price}`);
            console.log ('\n📋 All available markets:');
            markets.forEach ((m, i) => {
                console.log (`   ${i + 1}. ${m.symbol} (${m.id})`);
            });
        } else {
            console.log ('⚠️  No markets returned!');
        }
    } finally {
        await exchange.close ();
    }
    console.log ();
}

// ============================================
// 测试 2: 获取行情数据
// ============================================
async function testFetchTicker (apiUrl, symbol) {
    console.log (`📈 Test 2: Fetching ticker for ${symbol}...`);
    console.log ('-'.repeat (60));
    console.log (`   Using API: ${apiUrl}`);
    // ✅ 独立创建 exchange 实例
    const exchange = createExchange (apiUrl);
    try {
        const startTime = Date.now ();
        const ticker = await exchange.fetchTicker (symbol);
        const duration = Date.now () - startTime;
        console.log (`✅ Fetched ticker in ${duration}ms`);
        console.log ('\n📊 Ticker details:');
        console.log (`   Symbol:     ${ticker.symbol}`);
        console.log (`   Timestamp:  ${ticker.datetime}`);
        console.log (`   Last:       ${ticker.last}`);
        console.log (`   Open:       ${ticker.open}`);
        console.log (`   High:       ${ticker.high}`);
        console.log (`   Low:        ${ticker.low}`);
        console.log (`   Close:      ${ticker.close}`);
        console.log (`   Change:     ${ticker.change}`);
        console.log (`   Average:    ${ticker.average}`);
        if (ticker.open && ticker.close) {
            const changePercent = ((ticker.close - ticker.open) / ticker.open * 100).toFixed (2);
            console.log (`   Change %:   ${changePercent}%`);
        }
    } catch (error) {
        console.error (`❌ Failed to fetch ticker: ${error.message}`);
    } finally {
        await exchange.close ();
    }
    console.log ();
}

// ============================================
// 测试 3: 获取币种列表
// ============================================
async function testFetchCurrencies (apiUrl) {
    console.log ('💰 Test 3: Fetching currencies...');
    console.log ('-'.repeat (60));
    console.log (`   Using API: ${apiUrl}`);
    // ✅ 独立创建 exchange 实例
    const exchange = createExchange (apiUrl);
    try {
        const startTime = Date.now ();
        const currencies = await exchange.fetchCurrencies ();
        const duration = Date.now () - startTime;
        const currencyList = Object.keys (currencies);
        console.log (`✅ Fetched ${currencyList.length} currencies in ${duration}ms`);

        if (currencyList.length > 0) {
            const firstCurrency = currencies[currencyList[0]];
            console.log ('\n📝 First currency details:');
            console.log (`   Code:      ${firstCurrency.code}`);
            console.log (`   ID:        ${firstCurrency.id}`);
            console.log (`   Name:      ${firstCurrency.name}`);
            console.log (`   Active:    ${firstCurrency.active}`);
            console.log (`   Deposit:   ${firstCurrency.deposit}`);
            console.log (`   Withdraw:  ${firstCurrency.withdraw}`);
            console.log (`   Fee:       ${firstCurrency.fee}`);
            console.log (`   Precision: ${firstCurrency.precision}`);

            console.log ('\n📋 All available currencies:');
            currencyList.forEach ((code, i) => {
                const curr = currencies[code];
                console.log (`   ${i + 1}. ${code} - ${curr.name || 'N/A'} (Active: ${curr.active})`);
            });
        } else {
            console.log ('⚠️  No currencies returned!');
        }
    } catch (error) {
        console.error (`❌ Failed to fetch currencies: ${error.message}`);
        if (error.stack) {
            console.error ('Stack trace:', error.stack);
        }
    } finally {
        await exchange.close ();
    }
    console.log ();
}

// ============================================
// 测试 4: 创建市价买单
// ============================================
async function testCreateMarketBuyOrder (apiUrl, symbol, amount) {
    console.log ('💰 Test 4: Creating MARKET BUY order...');
    console.log ('-'.repeat (60));
    console.log (`   Using API: ${apiUrl}`);
    console.log ('⚠️  WARNING: This will execute a REAL order!');
    console.log (`   Symbol: ${symbol}`);
    console.log ('   Side:   BUY');
    console.log (`   Amount: ${amount}`);
    console.log ();
    // ✅ 独立创建 exchange 实例（Private API）
    const exchange = createExchange (apiUrl, apiUrl);
    try {
        const startTime = Date.now ();
        const order = await exchange.createOrder (
            symbol,
            'market',
            'buy',
            amount,
            undefined,
            {
                'slippage': '12',
                'fee_rate': 2,
                'enable_channel': false,
            }
        );
        const duration = Date.now () - startTime;
        console.log (`✅ Order created in ${duration}ms`);
        console.log ('\n📝 Order details:');
        console.log (JSON.stringify (order, null, 2));
    } catch (error) {
        console.error (`❌ Failed to create order: ${error.message}`);
        if (error.constructor.name) {
            console.error (`   Error type: ${error.constructor.name}`);
        }
    } finally {
        await exchange.close ();
    }
    console.log ();
}

// ============================================
// 测试 5: 创建市价卖单
// ============================================
async function testCreateMarketSellOrder (apiUrl, symbol, amount) {
    console.log ('💸 Test 5: Creating MARKET SELL order...');
    console.log ('-'.repeat (60));
    console.log (`   Using API: ${apiUrl}`);
    console.log ('⚠️  WARNING: This will execute a REAL order!');
    console.log (`   Symbol: ${symbol}`);
    console.log ('   Side:   SELL');
    console.log (`   Amount: ${amount}`);
    console.log ();
    // ✅ 独立创建 exchange 实例（Private API）
    const exchange = createExchange (apiUrl, apiUrl);
    try {
        const startTime = Date.now ();
        const order = await exchange.createOrder (
            symbol,
            'market',
            'sell',
            amount,
            undefined,
            {
                'slippage': '12',
                'fee_rate': 2,
                'enable_channel': false,
            }
        );
        const duration = Date.now () - startTime;
        console.log (`✅ Order created in ${duration}ms`);
        console.log ('\n📝 Order details:');
        console.log (JSON.stringify (order, null, 2));
    } catch (error) {
        console.error (`❌ Failed to create order: ${error.message}`);
    } finally {
        await exchange.close ();
    }
    console.log ();
}

// ============================================
// 辅助函数：格式化对象输出
// ============================================
function prettyPrint (obj, indent = 2) {
    return JSON.stringify (obj, null, indent);
}

// ============================================
// 启动测试
// ============================================
console.log ('\n⚠️  IMPORTANT NOTICE:');
console.log ('='.repeat (60));
console.log ('Private API tests are DISABLED by default.');
console.log ('To enable order creation tests:');
console.log ('1. Set CONFIG.enablePrivateTests = true');
console.log ('2. Set CONFIG.apiKey and CONFIG.secret');
console.log ('3. ⚠️  BE AWARE: This will execute REAL orders!');
console.log ('='.repeat (60));
console.log ();

main ();

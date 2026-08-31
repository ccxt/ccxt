// @ts-nocheck
import http from 'http';
import https from 'https';
import dotswap from '../../ts/src/pro/dotswap.js';

// ============================================
// HTTP 支持补丁（仅用于测试环境）
// ============================================
function createHttpFetch () {
    return async function customFetch (url, method = 'GET', headers = {}, body = undefined) {
        const urlObj = new URL (url);
        const isHttps = urlObj.protocol === 'https:';
        const httpModule = isHttps ? https : http;
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
                    try {
                        const jsonData = JSON.parse (data);
                        resolve (jsonData);
                    } catch (e) {
                        reject (new Error ('Failed to parse JSON: ' + e.message));
                    }
                });
            });
            req.on ('error', (err) => {
                reject (err);
            });
            req.on ('timeout', () => {
                reject (new Error ('Request timeout'));
            });
            if (body) {
                req.write (body);
            }
            req.end ();
        });
    };
}

async function main () {
    const exchange = new dotswap ();
    // ✅ 设置正确的 REST API URL
    exchange.urls.api.public = 'https://test-api-proxy.ddpurse.com';
    exchange.urls.api.private = 'http://test-dex.ddpurse.com:18617';
    // ✅ 覆盖 fetch 方法以支持 HTTP
    exchange.fetch = createHttpFetch ();
    // 为非SSL WebSocket连接加载HTTP代理
    await exchange.loadHttpProxyAgent ();
    // Verify WS URL
    console.log ('WS URL:', exchange.urls['api']['ws']);
    console.log ('REST API URL:', exchange.urls['api']['public']);
    try {
        console.log ('Loading markets...');
        await exchange.loadMarkets ();
        const symbols = exchange.symbols;
        console.log (`Loaded ${symbols.length} symbols.`);
        if (symbols.length === 0) {
            console.log ('No symbols found. Exiting.');
            return;
        }
        // Use the first symbol or a specific one if known
        const symbol = symbols[0];
        console.log (`Watching trades for ${symbol}...`);
        while (true) {
            try {
                const trades = await exchange.watchTrades (symbol);
                console.log (`Received ${trades.length} trades for ${symbol}`);
                if (trades.length > 0) {
                    console.log ('Latest trade:', trades[trades.length - 1]);
                }
            } catch (e) {
                console.error ('Watch loop error:', e);
                break;
            }
        }
    } catch (e) {
        console.error ('Main error:', e);
    }
}

main ();

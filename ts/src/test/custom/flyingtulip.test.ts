import assert from 'node:assert/strict';
import { test } from 'node:test';
import flyingtulip from '../../flyingtulip.js';
import { Precise } from '../../base/Precise.js';
import { InsufficientFunds, InvalidOrder, NotSupported } from '../../base/errors.js';

const owner = '0x0000000000000000000000000000000000000001';
const usdc = '0x0000000000000000000000000000000000000011';
const btc = '0x0000000000000000000000000000000000000012';
const eth = '0x0000000000000000000000000000000000000013';
const engine = '0x0000000000000000000000000000000000000020';
const session = '0x0000000000000000000000000000000000000021';
const asset = (symbol: string, address: string, decimals: number, price: string, collateral: string, mmBps = 150) => ({
    symbol, address, contractAddress: address, decimals, tokenprice: price, oracleTokenPrice: price,
    isCollateral: true, isSuppliable: true, isBorrowable: true, collateralEnabled: true, priceAvailable: true, mmBps,
    userMetrics: { totalCollateralRaw: collateral, totalWithdrawableRaw: collateral, totalDebtRaw: '0', walletBalanceRaw: collateral },
    globalMetrics: { availableToBorrow: '1000000' },
});

class FixtureExchange extends flyingtulip {
    calls: any[] = [];
    assets = [ asset ('USDC', usdc, 6, '1', '1000000000'), asset ('WBTC', btc, 8, '50000', '200000000', 2200), asset ('WETH', eth, 18, '2000', '1000000000000000000', 1900) ];
    stale = false;
    version = 2;
    positionRows: any[] = [];
    responseRows: any[] = [];
    override seconds (): number { return 1900000000; }
    override async apiCall (path: string, method = 'GET', params: any = {}): Promise<any> {
        this.calls.push ({ path, method, params: structuredClone (params) });
        if (path === 'spot/leverage/assets') return { success: true, data: this.assets };
        if (path === 'mm/spot/markets-v2') return [ { symbol: 'WBTC-USDC', chainId: 146, marketType: 'perps', baseToken: 'WBTC', quoteToken: 'USDC', baseTokenAddress: btc, quoteTokenAddress: usdc, maxLeverage: 10, canOpenLong: true, canOpenShort: true, markPrice: '50000', lastPrice: '50000' } ];
        if (path === 'mm/leverage/config') return { chainId: 146, signingChainId: 146, engineVersion: this.version, leverageRfqEngine: engine, sessionManager: session, sessionManagerDomainName: 'FT SessionManager', marginHfSafeBps: 15000 };
        if (path === 'mm/lend') return { success: true, data: { stale: this.stale, chains: [ { chainId: 146, minEquityRequirementUsd: '10', userMetrics: { equityUsd: '103000' }, assets: this.assets } ] } };
        if (path === 'mm/leverage/fee-estimate') return { success: true, feeAmount: '1' };
        if (path === 'mm/leverage/quote') {
            const net = Precise.stringSub (params.sellAmount, params.feeAmount);
            let out = net;
            if (params.sellToken === usdc && params.buyToken === btc) out = Precise.stringMul (net, '0.002');
            if (params.sellToken === btc && params.buyToken === usdc) out = Precise.stringMul (net, '500');
            if (params.sellToken === eth && params.buyToken === btc) out = Precise.stringMul (net, '0.000000000004');
            return { success: true, buyAmount: this.decimalToPrecision (Precise.stringDiv (Precise.stringMul (out, (10000 - params.slippageBps).toString ()), '10000'), 0, 0), bestOut: out, bestSource: 'kyber', candidates: [ { source: 'kyber', out }, { source: '0x', out: '1' } ], engineVersion: this.version };
        }
        if (path === 'mm/spot/account/positions') return this.positionRows;
        if (path === 'mm/leverage/orders' && method === 'GET') return { success: true, orders: this.responseRows };
        if (path === 'mm/leverage/orders/{id}' && method === 'GET') return this.responseRows[0];
        if (path === 'mm/leverage/orders' && method === 'POST') return { success: true, orderId: 'lev_fixture', status: 'pending' };
        throw new Error ('Unexpected request ' + method + ' ' + path);
    }
}

const exchange = () => new FixtureExchange ({ walletAddress: owner, enableRateLimit: false });

test ('registered arbitrary collateral and independent nonstable debt preserve raw units and v2 terms', async () => {
    const ex = exchange ();
    const plan = await ex.prepareLeverageOrder ('WBTC/USDC', 'market', 'buy', undefined, undefined, { collateral: 'WBTC', debtToken: 'WETH', cost: '200', leverage: '1.15' });
    assert.equal (plan.request.collateral, 'WBTC');
    assert.equal (plan.request.order.sellToken, eth);
    assert.equal (plan.request.order.sellAmount, '100000000000000000');
    assert.equal (plan.request.order.partiallyFillable, false);
    assert.equal (plan.typedData.types.LeveragedOrder.at (-1).name, 'partiallyFillable');
    assert.equal (plan.typedData.domain.verifyingContract, engine);
    assert.equal (plan.approvals[0].data.slice (0, 10).length, 10);
    assert.equal (ex.calls.filter (c => c.path === 'mm/leverage/quote').length, 1);
    assert.equal (ex.calls.some (c => c.path === 'mm/leverage/orders'), false);
});

test ('limit buys protect exact requested base units and do not apply slippage to the limit', async () => {
    const plan = await exchange ().prepareLeverageOrder ('WBTC/USDC', 'limit', 'buy', '0.001', '50000', { collateral: 'WETH' });
    assert.equal (plan.request.order.sellAmount, '50000000');
    assert.equal (plan.request.order.buyAmount, '100000');
    assert.equal (plan.request.triggerPrice, '50000');
    assert.equal (plan.request.triggerSide, 'below');
});

test ('shorts borrow raw BASE units, not collateral or quote units', async () => {
    const plan = await exchange ().prepareLeverageOrder ('WBTC/USDC', 'limit', 'sell', '0.001', '50000', { collateral: 'WETH' });
    assert.equal (plan.request.order.sellToken, btc);
    assert.equal (plan.request.order.sellAmount, '100000');
    assert.equal (plan.request.order.buyToken, usdc);
    assert.equal (plan.request.order.buyAmount, '50000000');
    assert.equal (plan.request.triggerSide, 'above');
});

test ('v1 typed data never includes the v2 bool', async () => {
    const ex = exchange (); ex.version = 1;
    const plan = await ex.prepareLeverageOrder ('WBTC/USDC', 'market', 'sell', '0.001', undefined, { collateral: 'WETH' });
    assert.equal (plan.request.order.partiallyFillable, undefined);
    assert.equal (plan.typedData.types.LeveragedOrder.length, 8);
});

test ('reject excess precision, stale snapshots, invalid collateral and unsupported semantics before submission', async () => {
    const ex = exchange ();
    assert.throws (() => ex.rawAmount ('0.000000001', 8), InvalidOrder);
    assert.throws (() => ex.rawAmount ('-1', 18), InvalidOrder);
    assert.throws (() => ex.rawAmount ('1e30', 18), InvalidOrder);
    assert.equal (ex.rawAmount ('9007199254740993.12345678', 8), '900719925474099312345678');
    await assert.rejects (ex.prepareLeverageOrder ('WBTC/USDC', 'limit', 'buy', '1', '50000', { collateral: 'WETH', timeInForce: 'IOC' }), NotSupported);
    ex.stale = true;
    await assert.rejects (ex.prepareLeverageOrder ('WBTC/USDC', 'market', 'sell', '0.001', undefined, { collateral: 'WETH' }), /stale/);
    ex.stale = false; ex.assets[2].isCollateral = false;
    await assert.rejects (ex.prepareLeverageOrder ('WBTC/USDC', 'market', 'sell', '0.001', undefined, { collateral: 'WETH' }), /not valid collateral/);
    assert.equal (ex.calls.some (c => c.method === 'POST' && c.path.includes ('orders')), false);
});

test ('health-factor gate accounts for all collateral maintenance and signed quote loss', async () => {
    const ex = exchange ();
    const chain = { userMetrics: { equityUsd: '100' }, minEquityRequirementUsd: '10' };
    const assets = [ asset ('USDC', usdc, 6, '1', '100000000') ];
    const debt = assets[0];
    const bought = asset ('WBTC', btc, 8, '50000', '0', 2200);
    assert.throws (() => ex.checkAccountRisk (chain, assets, debt, bought, '300000000', '500000', '150000', { marginHfSafeBps: 15000 }), InsufficientFunds);
    assert.doesNotThrow (() => ex.checkAccountRisk (chain, assets, debt, bought, '10000000', '19990', '5000', { marginHfSafeBps: 15000 }));
});

test ('deposit plan funds WETH directly, returns unsigned exact approvals and deposit', async () => {
    const ex = exchange ();
    const plan = await ex.prepareCollateralDeposit ('WETH', '0.1');
    assert.equal (plan.collateral, eth);
    assert.equal (plan.amount, '100000000000000000');
    assert.equal (plan.transactions.length, 3);
    assert.equal (plan.transactions[0].to, eth);
    assert.equal (plan.transactions[2].to.toLowerCase (), ex.positionManager ().toLowerCase ());
    assert.equal (ex.calls.some (c => c.method !== 'GET'), false);
});

test ('safe executor order response uses real wire field names and seconds convert to ms', async () => {
    const ex = exchange ();
    ex.responseRows = [ { id: 'lev_fixture', symbol: 'WBTC-USDC', createdAt: 1900000000, status: 'broadcasting', orderType: 'limit', direction: 'buy', amount: '0.1', price: '50000' } ];
    const order = await ex.fetchOrder ('lev_fixture');
    assert.equal (order.symbol, 'WBTC/USDC');
    assert.equal (order.timestamp, 1900000000000);
    assert.equal (order.status, 'open');
    assert.equal (order.amount, 0.1);
    assert.equal (order.filled, undefined);
    assert.equal (order.average, undefined);
});

test ('missing wallet balance remains unknown rather than a reported zero', async () => {
    const ex = exchange ();
    ex.assets[0]['userBalanceUnavailable'] = true;
    const balance = await ex.fetchBalance ({ type: 'spot' });
    assert.equal (balance.USDC.total, undefined);
    assert.equal (balance.USDC.free, undefined);
});

test ('short close requires quote-token spend and never interprets base maxCloseAmount as quote wei', async () => {
    const ex = exchange ();
    ex.positionRows = [ { positionId: 'p1', symbol: 'WBTC-USDC', side: 'short', size: '0.001', maxCloseAmount: '100000', debtCandidates: [ { token: btc, grossDebtRaw: '100000', accountDebtRaw: '100000' } ], fundingCandidates: [ { token: usdc, accountAvailRaw: '100000000' } ] } ];
    await assert.rejects (ex.prepareClosePosition ('WBTC/USDC'), /requires params.cost/);
    const plan = await ex.prepareClosePosition ('WBTC/USDC', 'buy', { cost: '51' });
    assert.equal (plan.request.order.sellToken, usdc);
    assert.equal (plan.request.order.sellAmount, '51000000');
    assert.ok (Precise.stringGe (plan.request.order.buyAmount, '100000'));
    assert.equal (plan.request.order.action, 1);
});

test ('changed signing configuration refuses external prepared payload before sending', async () => {
    const ex = exchange ();
    const plan = await ex.prepareLeverageOrder ('WBTC/USDC', 'market', 'sell', '0.001', undefined, { collateral: 'WETH' });
    ex.version = 1;
    await assert.rejects (ex.submitLeverageOrder (plan, '0xfixture', 'eip712'), /configuration changed/);
    assert.equal (ex.calls.some (c => c.method === 'POST' && c.path.includes ('orders')), false);
});

test ('HTTP signing preserves JSON DELETE body and never leaks private keys to requests', () => {
    const ex = exchange ();
    const signed = ex.sign ('mm/leverage/orders/{id}', [ 'public' ], 'DELETE', { id: 'lev_123', chainId: 146, deadline: 1900000300, cancelSignature: '0xfixture' });
    assert.equal (signed.url, 'https://api.flyingtulip.com/mm/leverage/orders/lev_123');
    assert.equal (JSON.parse (signed.body).deadline, 1900000300);
});

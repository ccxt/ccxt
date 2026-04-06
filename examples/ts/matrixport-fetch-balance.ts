import ccxt, { type Balances } from '../../js/ccxt.js';

const metaKeys = ['info', 'free', 'used', 'total', 'timestamp', 'datetime'];
const W = 90;

function line(ch = '-') { console.log(ch.repeat(W)); }

function header(title: string) {
    console.log('');
    line('=');
    console.log('  ' + title);
    line('=');
    console.log('');
}

function section(title: string) {
    console.log('');
    console.log('  ' + title);
    line('-');
}

function balanceCodes(balance: Balances): string[] {
    return Object.keys(balance).filter((k) => !metaKeys.includes(k));
}

function safe(val: string | number | undefined | null, fallback = '—'): string {
    return (val === undefined || val === null) ? fallback : String(val);
}

const numFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 });

function fmt(val: string | number | undefined | null): string {
    if (val === undefined || val === null) return '—';
    const n = typeof val === 'string' ? Number(val) : val;
    if (isNaN(n)) return String(val);
    return numFmt.format(n);
}

function pad(val: string | number | undefined | null, w = 16): string {
    return fmt(val).padStart(w);
}

// Accumulator for per-currency totals across all asset types
const grandTotals: Record<string, Record<string, number>> = {};

function addToGrand(category: string, currency: string, amount: number) {
    if (amount === 0) return;
    if (!grandTotals[currency]) grandTotals[currency] = {};
    grandTotals[currency][category] = (grandTotals[currency][category] ?? 0) + amount;
}

// Accumulator for USD-denominated position totals
const usdPositions: Record<string, string> = {};

async function main() {
    const exchange = new ccxt.matrixport({
        'apiKey': '',
        'secret': '',
    });

    try {
        header('MatrixPort — Comprehensive Asset Overview');

        // ── 1. Wallet Balance ─────────────────────────────────────────
        const walletBalance = await exchange.fetchBalance();
        const walletCodes = balanceCodes(walletBalance).filter((c) => Number(walletBalance[c].total) > 0);

        section('1. Wallet (Spot)');
        if (walletCodes.length > 0) {
            console.log('  ' + 'Currency'.padEnd(8) + pad('Free') + pad('Used') + pad('Total'));
            line('-');
            for (const code of walletCodes) {
                const b = walletBalance[code];
                const total = Number(b.total);
                console.log('  ' + code.padEnd(8) + pad(b.free) + pad(b.used) + pad(b.total));
                addToGrand('Wallet', code, total);
            }
        } else {
            console.log('  (empty)');
        }

        // ── 2. Balance+ (Flexible Savings) ────────────────────────────
        try {
            const [savingsBalance, summaryRaw] = await Promise.all([
                exchange.fetchBalance({ 'type': 'savings' }),
                exchange.balancePlusGetUserAssetSummary(),
            ]);
            const summaryData = summaryRaw?.data ?? {};
            const savingsCodes = balanceCodes(savingsBalance).filter((c) => Number(savingsBalance[c].total) > 0);

            section('2. Balance+ (Flexible Savings)');
            console.log(`  Total asset (USD): ${fmt(summaryData.total_asset)}   Total profit (USD): ${fmt(summaryData.total_profit)}`);
            if (savingsCodes.length > 0) {
                console.log('');
                for (const code of savingsCodes) {
                    const total = Number(savingsBalance[code].total);
                    console.log(`  ${code.padEnd(8)} ${pad(total)}`);
                    addToGrand('Savings', code, total);
                }
            }
            if (summaryData.total_asset) {
                usdPositions['Balance+'] = summaryData.total_asset;
            }
        } catch (e) {
            section('2. Balance+ (Flexible Savings)');
            console.log('  Skipped:', e instanceof Error ? e.message : String(e));
        }

        // ── 3. Fixed Staking ──────────────────────────────────────────
        try {
            const stakingRaw = await exchange.stakingGetOrders({
                'status_category': 2,
                'offset': 0,
                'limit': 100,
            });
            const stakingData = stakingRaw?.data ?? {};
            const stakingItems = stakingData.items ?? [];

            section('3. Fixed Staking (holding)');
            console.log(`  Active positions: ${fmt(stakingData.count)}`);
            if (stakingItems.length > 0) {
                console.log('');
                console.log('  ' + 'Currency'.padEnd(8) + pad('Staked') + pad('Profit') + pad('RoR'));
                line('-');
                for (const o of stakingItems) {
                    const ccy = String(o.currency ?? '');
                    const amount = Number(o.amount_dec ?? 0);
                    console.log('  ' + ccy.padEnd(8) + pad(o.amount_dec) + pad(o.hold_profit) + pad(o.hold_ror));
                    addToGrand('Staking', ccy, amount);
                }
            }
        } catch (e) {
            section('3. Fixed Staking');
            console.log('  Skipped:', e instanceof Error ? e.message : String(e));
        }

        // ── 4. Fixed Income ───────────────────────────────────────────
        section('4. Fixed Income');
        try {
            const fiStatsRaw = await exchange.fixedIncomeV3GetUserAssetStatisticsUsd();
            const fiStats = fiStatsRaw?.data ?? {};
            console.log(`  Total asset (USD): ${fmt(fiStats.total_asset)}   Yesterday interest: ${fmt(fiStats.yesterday_interest)}   Accumulated: ${fmt(fiStats.accumulated_interest)}`);
            if (fiStats.total_asset) {
                usdPositions['Fixed Income'] = fiStats.total_asset;
            }
        } catch {
            console.log('  USD stats: not available');
        }
        try {
            const fiOrdersRaw = await exchange.fixedIncomeGetOrders({});
            const fiOrders = fiOrdersRaw?.data?.items ?? [];
            // status 4 = holding (active), 7 = settled/redeemed
            const activeStatuses = [1, 2, 3, 4, 5];
            const activeOrders = fiOrders.filter((o: Record<string, unknown>) => activeStatuses.includes(Number(o.order_status)));
            const settledOrders = fiOrders.filter((o: Record<string, unknown>) => !activeStatuses.includes(Number(o.order_status)));
            if (activeOrders.length > 0) {
                console.log(`\n  Active positions (${activeOrders.length}):`);
                console.log('  ' + 'Currency'.padEnd(8) + pad('Invested') + pad('Remaining') + pad('Profit') + pad('APY'));
                line('-');
                for (const o of activeOrders) {
                    const ccy = String(o.currency ?? '');
                    // share_dec is the actual remaining amount (after partial redemptions)
                    // amount_dec is the original investment
                    const sharePrice = Number(o.share_price_dec ?? 1);
                    const remaining = Number(o.share_dec ?? o.amount_dec ?? 0) * sharePrice;
                    console.log('  ' + ccy.padEnd(8) + pad(o.amount_dec) + pad(remaining) + pad(o.invest_profit) + pad(o.estimate_apy));
                    addToGrand('FixedIncome', ccy, remaining);
                }
            } else {
                console.log('  No active fixed income positions.');
            }
            if (settledOrders.length > 0) {
                const cW = 20;
                console.log(`\n  Settled / redeemed (${settledOrders.length}):`);
                console.log('  ' + 'Currency'.padEnd(8) + pad('Invested', cW) + pad('Payback', cW) + pad('Profit', cW));
                line('-');
                for (const o of settledOrders) {
                    const ccy = String(o.currency ?? '');
                    console.log('  ' + ccy.padEnd(8) + pad(o.amount_dec, cW) + pad(o.payback_dec, cW) + pad(o.invest_profit, cW));
                }
            }
        } catch (e) {
            console.log('  Orders: ' + (e instanceof Error ? e.message : String(e)));
        }

        // ── 5. DCP (Dual Currency Products) ───────────────────────────
        try {
            const [dcpPosRaw, dcpOrdersRaw] = await Promise.all([
                exchange.dcpGetTotalPositions(),
                exchange.dcpGetOrders({ 'offset': 0, 'limit': 20 }),
            ]);
            const dcpPos = dcpPosRaw?.data ?? {};
            const dcpOrders = dcpOrdersRaw?.data?.items ?? [];

            section('5. DCP (Dual Currency)');
            console.log(`  Total position (USD): ${fmt(dcpPos.total_position)}`);
            if (dcpOrders.length > 0) {
                console.log('');
                console.log('  ' + 'Currency'.padEnd(8) + pad('Invested') + pad('Status') + pad('Settle Date'));
                line('-');
                for (const o of dcpOrders) {
                    const ccy = String(o.invest_currency ?? '');
                    const amount = Number(o.invest_amount ?? 0);
                    const settleDate = o.settle_time ? new Date(Number(o.settle_time)).toISOString().slice(0, 10) : '—';
                    console.log('  ' + ccy.padEnd(8) + pad(o.invest_amount) + pad(o.status_text ?? o.status) + pad(settleDate));
                    addToGrand('DCP', ccy, amount);
                }
            }
            if (dcpPos.total_position) {
                usdPositions['DCP'] = dcpPos.total_position;
            }
        } catch (e) {
            section('5. DCP (Dual Currency)');
            console.log('  Skipped:', e instanceof Error ? e.message : String(e));
        }

        // ── 6. Structured Products ────────────────────────────────────
        try {
            const structPosRaw = await exchange.structureGetTotalPositions({ 'strategy_id': '0' });
            const structPos = structPosRaw?.data ?? {};

            section('6. Structured Products');
            console.log(`  Total position (USD): ${fmt(structPos.total_position)}`);
            if (structPos.total_position) {
                usdPositions['Structure'] = structPos.total_position;
            }
        } catch (e) {
            section('6. Structured Products');
            console.log('  Skipped:', e instanceof Error ? e.message : String(e));
        }

        // ── 7. Collateral Lending ─────────────────────────────────────
        try {
            const loanStatRaw = await exchange.collateralLendingGetUserLoanStat();
            const loanStat = loanStatRaw?.data ?? {};

            section('7. Collateral Lending');
            console.log(`  Total loan amount: ${fmt(loanStat.total_loan_amount)}`);
            console.log(`  Active loans: ${fmt(loanStat.order_count)}`);
            console.log(`  Next repay date: ${safe(loanStat.next_repay_date, '—')}`);
        } catch (e) {
            section('7. Collateral Lending');
            console.log('  Skipped:', e instanceof Error ? e.message : String(e));
        }

        // ── 8. Strategy Products ──────────────────────────────────────
        try {
            const stratOrdersRaw = await exchange.strategyGetOrders({ 'offset': 0, 'limit': 20, 'order_sort_by': 0 });
            const stratOrders = stratOrdersRaw?.data?.items ?? [];

            section('8. Strategy Products');
            if (stratOrders.length > 0) {
                for (const o of stratOrders) {
                    const ccy = String(o.currency ?? '');
                    const amount = Number(o.amount ?? o.invest_amount ?? 0);
                    console.log(`  ${ccy.padEnd(8)} amount: ${pad(o.amount ?? o.invest_amount)}`);
                    addToGrand('Strategy', ccy, amount);
                }
            } else {
                console.log('  No active strategy positions.');
            }
        } catch (e) {
            section('8. Strategy Products');
            console.log('  Skipped:', e instanceof Error ? e.message : String(e));
        }

        // ── GRAND TOTAL ───────────────────────────────────────────────
        const categories = ['Wallet', 'Savings', 'Staking', 'FixedIncome', 'DCP', 'Strategy'];
        const allGrandCodes = Object.keys(grandTotals).sort();

        header('Grand Total — All Assets by Currency');
        const colW = 14;
        const totW = 20;
        console.log('  ' + 'Currency'.padEnd(10) + categories.map((c) => c.padStart(colW)).join('') + ' | ' + 'TOTAL'.padStart(totW));
        line('-');

        for (const code of allGrandCodes) {
            const row = grandTotals[code];
            let rowTotal = 0;
            let rowStr = '  ' + code.padEnd(10);
            for (const cat of categories) {
                const val = row[cat] ?? 0;
                rowTotal += val;
                rowStr += (val > 0 ? fmt(val) : '—').padStart(colW);
            }
            rowStr += ' | ' + fmt(rowTotal).padStart(totW);
            console.log(rowStr);
        }

        if (allGrandCodes.length === 0) {
            console.log('  (no assets found across any product)');
        }

        // USD position summary
        const usdKeys = Object.keys(usdPositions);
        if (usdKeys.length > 0) {
            console.log('');
            console.log('  USD Position Summary:');
            for (const key of usdKeys) {
                console.log(`    ${key.padEnd(20)} $${fmt(usdPositions[key])}`);
            }
        }

        console.log('');
        line('=');
        console.log('  Done.');
        line('=');
    } catch (e) {
        console.error('Error:', e instanceof Error ? e.message : String(e));
    }
}

main();

import ccxt from '../js/ccxt.js';
import fs from 'fs';

// One-time ERC20 approve of USDC for the Limitless CLOB spender on Base, using the EOA key.
// Reuses myriad's verified EIP-1559 tx-signing helpers (chain-agnostic).
async function main () {
    const k = JSON.parse (fs.readFileSync ('keys.local.json', 'utf8')).limitless;
    const RPC = 'https://mainnet.base.org';
    const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const EOA = k.walletAddress;
    const m = new (ccxt as any).prediction.myriad ({ 'privateKey': k.privateKey });
    const spenders = [
        '0xa4409d988ca2218d956beefd3874100f444f0dc3', // clob spender (allowance API)
        '0x05c748E2f4DcDe0ec9Fa8DDc40DE6b867f923fa5', // venue.exchange (settlement)
    ];
    const maxUint = 'f'.repeat (64);
    for (const spender of spenders) {
        const data = '0x095ea7b3' + m.padHexAddress (spender) + maxUint;
        console.log ('>>> approve USDC ->', spender);
        const hash = await m.sendEvmTransaction (RPC, '8453', EOA, USDC, '0x0', data, '0x186a0');
        console.log ('   txHash', hash);
        const receipt = await m.waitForTransactionReceipt (RPC, hash, 90000);
        console.log ('   status', receipt && receipt.status);
    }
    console.log ('done');
}

main ().catch ((e) => { console.error ('ERR', e.constructor.name, e.message); process.exit (1); });

import ora from 'ora';
import blessed from 'blessed';
import { loadSettingsAndCreateExchange } from '../helpers.js';
const spinner = ora('Loading Orderbook...');
const defaultDepth = 15;
async function plotOrderBook(exchangeNames, symbol, args, cliOptions) {
    spinner.start();
    const exchangeIds = exchangeNames.split(',');
    const exchangePromises = exchangeIds.map((id) => loadSettingsAndCreateExchange(id, cliOptions));
    const exchanges = await Promise.all(exchangePromises);
    const depth = args[0] ?? defaultDepth;
    const boxWidth = 35;
    const boxHeight = depth * 2 + 7;
    const screen = blessed.screen({
        'smartCSR': true,
        'title': `Order Book - ${symbol}`,
    });
    // append screens
    const boxes = [];
    for (let i = 0; i < exchanges.length; i++) {
        const box = blessed.box({
            'top': 'center',
            'left': boxWidth * i + 2,
            'width': boxWidth,
            'height': boxHeight,
            'tags': true,
            'border': {
                'type': 'line',
            },
            'style': {
                'fg': 'white',
                'bg': 'black',
                'border': { 'fg': 'magenta' },
            },
        });
        boxes.push(box);
        screen.append(box);
    }
    screen.key(['escape', 'q', 'C-c'], () => {
        process.exit(0);
    });
    process.on('SIGINT', () => {
        screen.destroy(); // cleanup blessed screen
        spinner.clear();
        process.exit(0);
    });
    // screen.render ();
    const renderPromises = [];
    for (let i = 0; i < exchanges.length; i++) {
        renderPromises.push(renderOrderBook(screen, exchanges[i], symbol, boxes[i], exchanges[i].id, depth));
    }
    await Promise.all(renderPromises);
}
function center(str, width) {
    const len = str.length;
    const pad = Math.max(0, width - len);
    const left = Math.floor(pad / 2);
    const right = pad - left;
    return ' '.repeat(left) + str + ' '.repeat(right);
}
async function renderOrderBook(screen, exchange, symbol, box, name, depth) {
    try {
        while (true) {
            const ob = await exchange.watchOrderBook(symbol);
            if (spinner.isSpinning) {
                spinner.clear();
                spinner.stop();
            }
            const asks = ob.asks.slice(0, depth);
            const bids = ob.bids.slice(0, depth);
            const bestAsk = asks[0][0];
            const bestBid = bids[0][0];
            const spread = bestAsk - bestBid;
            // const spreadPct = (spread / bestAsk) * 100;
            const mid = (bestAsk + bestBid) / 2;
            let content = `{center}{bold}${name} - ${symbol}{/bold}{/center}\n`;
            content += `{center}{bold}${center('Price', 12)} ${center('Size', 10)}{/bold}\n`;
            for (const [price, amount] of asks.slice().reverse()) {
                content += `{red-fg}${center(price.toFixed(2), 12)} ${center(amount.toFixed(4), 10)}{/red-fg}\n`;
            }
            const spreadLine = `Spread: ${spread.toFixed(2)} | Mid: ${mid.toFixed(2)}`;
            content += `\n{cyan-fg}${center(spreadLine, 32)}{/cyan-fg}\n\n`;
            for (const [price, amount] of bids) {
                content += `{green-fg}${center(price.toFixed(2), 12)} ${center(amount.toFixed(4), 10)}{/green-fg}\n`;
            }
            box.setContent(content);
            screen.render();
            // await new Promise ((resolve) => setTimeout (resolve, 10));
        }
        // setTimeout (() => renderOrderBook (screen, exchange, box, name), 100);
    }
    catch (err) {
        // console.log ('error inside loops');
        box.setContent(`{red-fg}Error: ${err.message}{/red-fg}`);
        screen.render();
        setTimeout(() => renderOrderBook(screen, exchange, symbol, box, name, depth), 3000);
    }
}
export { plotOrderBook, };
//# sourceMappingURL=orderbook.js.map
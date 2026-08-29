
import ora from 'ora';
import blessed from 'blessed';
import { loadSettingsAndCreateExchange } from '../helpers.js';

const spinner = ora ('Loading Ticker...');

async function plotTicker (exchangeNames: string, symbol: string, args: any) {
    spinner.start ();
    const exchangeIds = exchangeNames.split (',');

    const exchangePromises = exchangeIds.map ((id) => loadSettingsAndCreateExchange (id, {}));

    const exchanges = await Promise.all (exchangePromises);

    const boxWidth = 32;
    const boxHeight = 10 * 2 + 5;

    const screen = blessed.screen ({
        'smartCSR': true,
        'title': `Ticker - ${symbol}`,
    });

    // append screens
    const boxes = [];
    for (let i = 0; i < exchanges.length; i++) {
        const box = blessed.box ({
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
        boxes.push (box);
        screen.append (box);
    }
    screen.key ([ 'escape', 'q', 'C-c' ], () => {
        process.exit (0);
    });

    process.on ('SIGINT', () => {
        screen.destroy (); // cleanup blessed screen
        spinner.clear ();
        process.exit (0);
    });
    // screen.render ();
    const renderPromises = [];
    for (let i = 0; i < exchanges.length; i++) {
        renderPromises.push (renderTicker (screen, exchanges[i], symbol, boxes[i], exchanges[i].id));
    }
    await Promise.all (renderPromises);
}

function center (str, width) {
    const len = str.length;
    const pad = Math.max (0, width - len);
    const left = Math.floor (pad / 2);
    const right = pad - left;
    return ' '.repeat (left) + str + ' '.repeat (right);
}

async function renderTicker (screen, exchange, symbol, box, name) {
    try {
        while (true) {
            const ticker = await exchange.watchTicker (symbol);
            if (spinner.isSpinning) {
                spinner.clear ();
                spinner.stop ();
            }
            const {
                last,
                percentage,
                change,
                open,
                high,
                low,
                baseVolume,
                quoteVolume,
                bid,
                ask,
                vwap,
                average,
                previousClose,
                indexPrice,
                markPrice,
                bidVolume,
                askVolume,
                datetime,
            } = ticker;

            function fmt (value, digits = 2) {
                return (typeof value === 'number') ? value.toFixed (digits) : 'undefined';
            }

            function fmtDate (datetime) {
                if (!datetime) {
                    return undefined;
                }
                return datetime.split ('.')[0];
            }

            function colorize (label, value, color = 'white') {
                return `{bold}${center (label, 12)}:{/bold} {${color}-fg}${center (value, 14)}{/${color}-fg}`;
            }

            function addLine (content: string) {
                return content;
                // content += '{center}{gray-fg}─────────────────────{/gray-fg}{/center}\n';
                const line = '─'.repeat (33); // 35 - 2 (for borders)
                content += `{center}{gray-fg}${line}{/gray-fg}{/center}\n`;
                return content;
            }

            function colorForNumber (val) {
                if (typeof val !== 'number') return 'white';
                if (val > 0) return 'green';
                if (val < 0) return 'red';
                return 'white';
            }

            let content = `\n{center}{bold}${name} — ${symbol}{/bold}{/center}\n\n\n`;

            content += colorize ('Last', fmt (last)) + '\n';
            content = addLine (content);
            content += colorize ('Change', fmt (change), colorForNumber (change)) + '\n';
            content = addLine (content);
            content += colorize ('Percent', percentage !== undefined ? percentage.toFixed (2) + '%' : 'undefined', 'cyan') + '\n';
            content = addLine (content);
            content += colorize ('Open', fmt (open)) + '\n';
            content = addLine (content);
            content += colorize ('High', fmt (high)) + '\n';
            content = addLine (content);
            content += colorize ('Low', fmt (low)) + '\n';
            content = addLine (content);
            content += colorize ('Bid', fmt (bid), 'green') + '\n';
            content = addLine (content);
            content += colorize ('Ask', fmt (ask), 'red') + '\n';
            content = addLine (content);
            content += colorize ('Base Vol', fmt (baseVolume)) + '\n';
            content = addLine (content);
            content += colorize ('Quote Vol', fmt (quoteVolume)) + '\n';
            content = addLine (content);
            content += colorize ('VWAP', fmt (vwap)) + '\n';
            content = addLine (content);
            content += colorize ('Avg', fmt (average), 'yellow') + '\n';
            content = addLine (content);
            content += colorize ('Prev Close', fmt (previousClose)) + '\n';

            content = addLine (content);
            content += colorize ('Index Price', fmt (indexPrice)) + '\n';

            content = addLine (content);
            content += colorize ('Mark Price', fmt (markPrice)) + '\n';

            content = addLine (content);
            content += colorize ('Bid Vol', fmt (bidVolume)) + '\n';

            content = addLine (content);
            content += colorize ('Ask Vol', fmt (askVolume)) + '\n';

            content = addLine (content);
            content += colorize ('Datetime', formatShortDate (datetime), 'cyan') + '\n';

            box.setContent (content);
            screen.render ();
        }
    } catch (err) {
        box.setContent (`{red-fg}Error: ${err.message}{/red-fg}`);
        screen.render ();
        setTimeout (() => renderTicker (screen, exchange, symbol, box, name), 3000);
    }
}

function formatShortDate (input) {
    if (!input) {
        return undefined;
    }
    // Fill in missing seconds if needed
    let normalized = input;
    if (input.endsWith (':')) {
        normalized += '01';
    }

    const date = new Date (normalized);
    const pad = (n) => String (n).padStart (2, '0');

    const month = pad (date.getMonth () + 1);
    const day = pad (date.getDate ());
    const hours = pad (date.getHours ());
    const minutes = pad (date.getMinutes ());
    const seconds = date.getSeconds (); // no padding

    return `${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export {
    plotTicker,
};

import log from 'ololog'
import ansi from 'ansicolor'
import fs from 'fs';

let exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds = exchanges.ids

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// test if generated files are updated after a full build


// REST FOLDERS
const PY_SYNC_FOLDER = './python/ccxt/';
const PY_FOLDER = './python/ccxt/async_support/';
const PHP_SYNC_FOLDER = './php/';
const PHP_FOLDER = './php/async/';
const CS_FOLDER = './cs/ccxt/exchanges/';

// WS FOLDERS
const PY_WS_FOLDER = './python/ccxt/pro/';
const PHP_WS_FOLDER = './php/pro/';
const CS_WS_FOLDER = './cs/ccxt/exchanges/pro/';


function assertGeneratedFilesAreRecent() {
    const now = new Date().getTime();
    const foldersToCheck = [
        PY_SYNC_FOLDER,
        PY_FOLDER,
        PHP_SYNC_FOLDER,
        PHP_FOLDER,
        CS_FOLDER,
        PY_WS_FOLDER,
        PHP_WS_FOLDER,
        CS_WS_FOLDER
    ];
    for (const folder of foldersToCheck) {
        const files = fs.readdirSync(folder);
        for (const file of files) {
            if (file.startsWith('__')) {
                continue;
            }
            const fileExtension = file.split('.');
            const extensions = ['py', 'cs', 'php'];
            if (!(extensions.includes(fileExtension[1]))) {
                continue;
            }
            if (!exchangeIds.includes(fileExtension[0])) {
                continue;
            }
            var stats = fs.statSync(folder + file);
            var mtime = stats.mtimeMs;
            const diffInSeconds = (now - mtime) / 1000;
            const diffInHours = diffInSeconds / 3600;
            if (diffInHours > 12) {
                log.bright.red('[Freshness][OUT-OF-SYNC] File is outdaded: ' + folder + file);
                process.exit (1);
            }
            // log.yellow("checking", folder+file)
        }
    }
    log.bright.green('[Freshness] Files are updated');
}

async function main() {
    try {
        assertGeneratedFilesAreRecent();
        process.exit(0);
    } catch (e) {
        log.bright.red('[Freshness] Error: ' + e);
        process.exit (1);
    }
}

main()
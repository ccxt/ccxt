import fs from 'fs';
import path from 'path';
import ansi from 'ansicolor';
import ololog from 'ololog';
import os from 'os';

ansi.nice;
const log = ololog.configure ({ 'locate': false }).unlimited;

const defaultConfig = {
    'refreshMarketsTimeout': 24 * 60 * 60 * 1000, // 1 day in ms
    'sampleExchangeId': {
        'apiKey': 'your apiKey here',
        'secret': 'your secret here',
        'options': {
            'customOptionKey': 'customOptionValue',
        },
    },
};

/**
 *
 */
function getCacheDirectory () {
    const homeDir = os.homedir ();
    let cachePath = '';
    if (process.platform === 'win32') {
        cachePath = path.join (process.env.LOCALAPPDATA || path.join (homeDir, 'AppData', 'Local'), 'ccxt-cli', 'cache');
    } else if (process.platform === 'darwin') {  // macOS
        cachePath = path.join (homeDir, 'Library', 'Caches', 'ccxt-cli');
    } else {  // Linux & Others
        cachePath = path.join (process.env.XDG_CACHE_HOME || path.join (homeDir, '.cache'), 'ccxt-cli');
    }
    if (!fs.existsSync (cachePath)) {
        fs.mkdirSync (cachePath, {
            'recursive': true,
        });
    }
    return cachePath;
}

function getCachePathForHelp () {
    loadMainConfigFile ();
    return getCacheDirectory ();
}

function loadMainConfigFile () {
    const cachePath = getCacheDirectory ();
    const configFilePath = path.join (cachePath, 'config.json');
    if (!fs.existsSync (configFilePath)) {
        fs.writeFileSync (configFilePath, JSON.stringify (defaultConfig, null, 2));
        return defaultConfig;
    }

    const configContent = JSON.parse (fs.readFileSync (configFilePath).toString ());
    return configContent;
}

function saveConfigFile (config) {
    const cachePath = getCacheDirectory ();
    const configFilePath = path.join (cachePath, 'config.json');
    fs.writeFileSync (configFilePath, JSON.stringify (config, null, 2));
}

function getExchangeSettings (exchangeId: string) {
    let settingsPath = path.join (getCacheDirectory (), 'config.json');
    const config = loadMainConfigFile ();

    if ('cachePath' in config) {
        settingsPath = config['cachePath'];
    }

    if (!fs.existsSync (settingsPath)) {
        log.error ('The specified config file was not found: ' + settingsPath);
    }

    const settings = JSON.parse (fs.readFileSync (settingsPath).toString ());

    if (exchangeId in settings) {
        return settings[exchangeId];
    }

    return {};
}

/**
 *
 */
function checkCache () {
    loadMainConfigFile ();
    const cachePath = getCacheDirectory ();
    const marketsPath = path.join (cachePath, 'markets');
    if (!fs.existsSync (cachePath)) {
        try {
            fs.mkdirSync (cachePath, {
                'recursive': true,
            });
        } catch (e) {
            log.red ('Error creating cache directory', cachePath);
        }
    } else if (!fs.existsSync (marketsPath)) {
        try {
            fs.mkdirSync (marketsPath, {
                'recursive': true,
            });
        } catch (e) {
            log.red ('Error creating cache directory', cachePath);
        }
    }
}

/**
 *
 * @param command
 */
function saveCommand (cm: string[]) {
    const commands = cm.slice (2);
    const command = commands.join (' ');
    const cachePath = getCacheDirectory ();
    const historyPath = path.join (cachePath, 'history');
    if (!fs.existsSync (historyPath)) {
        try {
            fs.mkdirSync (historyPath, {
                'recursive': true,
            });
        } catch (e) {
            log.red ('Error creating cache directory', cachePath);
        }
    }
    const historyFile = path.join (historyPath, 'commands.json');
    let list: any[] = [];
    if (!fs.existsSync (historyFile)) {
        fs.writeFileSync (historyFile, JSON.stringify (list, null, 2));
    } else {
        list = JSON.parse (fs.readFileSync (historyFile).toString ()) || [];
    }
    list.push (command);
    fs.writeFileSync (historyFile, JSON.stringify (list, null, 2));
}

function changeConfigPath (newPath: string) {
    log ('The config file now will be loaded from: ', newPath);
    const currentConfig = loadMainConfigFile ();
    currentConfig['cachePath'] = newPath;
    saveConfigFile (currentConfig);
}

function getChartsFolder () {
    const cachePath = getCacheDirectory ();
    const chartsFolder = path.join (cachePath, 'charts');
    if (!fs.existsSync (chartsFolder)) {
        try {
            fs.mkdirSync (chartsFolder, {
                'recursive': true,
            });
        } catch (e) {
            log.red ('Error creating cache directory', chartsFolder);
        }
    }

    return chartsFolder;
}

function getDateForNamefile () {
    const now = new Date ();
    const timestamp = now.toISOString ().replace (/[:]/g, '-').replace (/\..+/, '');
    return timestamp;
}

function saveChart (name: string, content: string) {
    const folder = getChartsFolder ();
    const filePath = path.join (folder, getDateForNamefile () + '-' + name);
    fs.writeFileSync (filePath, content, 'utf8');
    return filePath;
}

export {
    changeConfigPath,
    checkCache,
    getCacheDirectory,
    saveCommand,
    loadMainConfigFile as loadConfigFile,
    getExchangeSettings,
    getCachePathForHelp,
    getChartsFolder,
    saveChart,
};

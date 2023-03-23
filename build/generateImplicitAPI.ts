import ccxt from '../js/ccxt.js';
import { promisify } from 'util';
import fs from 'fs';
import log from 'ololog'

const PATH = './js/src/';
const IDEN = '    ';

const promiseReadFile = promisify (fs.readFile);
const promisedWriteFile = promisify(fs.writeFile);

function isHttpMethod(method){
    return ['get', 'post', 'put', 'delete', 'patch'].includes(method);
}
//-------------------------------------------------------------------------

const capitalize = (s: string): string => {
    return s.length ? (s.charAt (0).toUpperCase () + s.slice (1)) : s;
};

//-------------------------------------------------------------------------

function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

//-------------------------------------------------------------------------

function generateImplicitMethodNames(id, api, paths: string[] = []){
    const keys = Object.keys(api);
    for (const key of keys){
        let value = api[key];
        let endpoints = [] as any
        if (isHttpMethod(key)){
            if (value && !Array.isArray(value)) {
                endpoints = Object.keys(value)
            } else {
                if  (Array.isArray(value)) {
                    endpoints = [];
                    for (const item of value){
                        if (Array.isArray(item)) {
                            endpoints.push(item[0])
                        } else {
                            endpoints.push(item)
                        }
                    }
                }
            }
            for (const endpoint of endpoints){
                const input = paths.join("/")  + "/" + key + "/" + endpoint;
                const pattern = /[^a-zA-Z0-9]/g;
                const result = input.split(pattern);
                let completePath = result.filter(r => r.length > 0).map(capitalize).join('');
                completePath = lowercaseFirstLetter(completePath);
                storedResult[id].push(completePath)
            }

        } else {
            generateImplicitMethodNames(id, value, paths.concat([ key ]))
        }
    }
}

//-------------------------------------------------------------------------

function createImplicitMethods(){
    const exchanges = Object.keys(storedResult);
    for (const index in exchanges) {
        const exchange = exchanges[index];
        const methodNames = storedResult[exchange];

        const methods =  methodNames.map(method=> {
            return `${IDEN}${method} (params?: {});`
        }).join('\n');
        storedMethods[exchange] = methods
    }
}

//-------------------------------------------------------------------------

async function editTypesFiles(){
    const exchanges = Object.keys(storedResult);
    const files = exchanges.map(ex => PATH + ex + '.d.ts');
    const fileArray = await Promise.all (files.map (file => promiseReadFile (file, 'utf8')));

    const transformedFiles = fileArray.map((file, idx) => {
        const exchange = exchanges[idx]
        file = file.slice(0, file.lastIndexOf('}')) // remove last }
        file = file + storedMethods[exchange] + '\n}' // restore }
        return file;
    });

    await Promise.all(transformedFiles.map((f,idx) => promisedWriteFile(PATH + exchanges[idx] + '.d.ts', f)))
}

//-------------------------------------------------------------------------

async function main() {
    log.bright.cyan ('Exporting TypeScript implicit api methods')
    const exchanges = ccxt.exchanges;
    for (const index in exchanges) {
        const exchange = exchanges[index];
        storedResult[exchange] = [];
        const instance = new ccxt[exchange]();
        generateImplicitMethodNames(exchange, instance.api)
    }
    createImplicitMethods()
    await editTypesFiles();
    log.bright.cyan ('TypeScript implicit api methods completed!')
}

let storedResult = {};
let storedMethods = {};
main()
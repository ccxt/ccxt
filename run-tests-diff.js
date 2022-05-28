const fs = require('fs');
const exec = require('child_process').exec;

const myArgs = process.argv.slice(2);
const filename = myArgs[0];

if (filename === undefined) {
    console.log("Can't proceed! Please provide the filename of the changed files.")
    process.exit(1)
}

const exchangesList = [];
let exchangesOnly = true;
const allFileContents = fs.readFileSync(filename, 'utf-8');

console.log("Changed Files content:" , allFileContents)

allFileContents.split(/\r?\n/).forEach(file =>  {
    if (file.length > 0) {
        const exchangeRegex = /js\/[\w|]+\.js/;
        if (exchangeRegex.test(file)) {
            exchangesList.push(file)
        } else {
            // if it finds any other file (base, test, etc) 
            // aborts this filtering
            exchangesOnly = false
        }
    }
});

if (exchangesOnly && exchangesList.length > 0) {
    exec("bash -c 'node run-tests --js --python-async --php-async 5' 2>&1");
}

const fs = require('fs');
const isPJP = process.env.RUNSTEP === 'PY_JS_PHP';

async function wait () {
    await new Promise(resolve => setTimeout(resolve, 20 * 1000));
    const rawData = fs.readFileSync('data.json');
    const jsonData = JSON.parse(rawData);
    console.log("read start !", jsonData.key1); 
}
if (isPJP) {
    wait();
} else {
    fs.writeFileSync('data.json', JSON.stringify({ key1: "value1" }));
    console.log("WRITE COMPLETE!")
}
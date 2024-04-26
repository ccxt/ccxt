
import fs from 'fs';
const isPJP = process.env.RUNSTEP === 'PY_JS_PHP';

async function wait () {
    await new Promise(resolve => setTimeout(resolve, 7 * 1000));
    console.log("read start !"); 
    const rawData = fs.readFileSync('/var/data.json');
    const jsonData = JSON.parse(rawData);
    console.log("read done"); 
}
if (isPJP) {
    wait();
} else {
    fs.writeFileSync('/var/data.json', JSON.stringify({ key1: "value1" }));
    console.log("WRITE COMPLETE!")
}
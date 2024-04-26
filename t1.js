
import fs from 'fs';
const isPJP = process.env.RUNSTEP === 'PY_JS_PHP';
const home = process.env.HOME;
const filepath = `data.json`;

async function wait () {
    await new Promise(resolve => setTimeout(resolve, 15 * 1000));
    console.log("read start !"); 
    const rawData = fs.readFileSync(filepath);
    const jsonData = JSON.parse(rawData);
    console.log("read done"); 
}
if (isPJP) {
    wait();
} else {
    fs.writeFileSync(filepath, JSON.stringify({ key1: "value1" }));
    console.log("WRITE COMPLETE!")
}
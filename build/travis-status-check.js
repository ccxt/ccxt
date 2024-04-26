
const RUNSTEP = process.env.RUNSTEP; 
const build_ID = process.env.TRAVIS_BUILD_ID;
const remote_server = 'http://5.75.153.75:8090/travis-status/index.php?';

function url (action, build_id, lang, status='') {
    if (!['read', 'write'].includes(action)) {
        throw new Error('Invalid action');
    }
    if (action ==='write' && !['success', 'fail'].includes(status)) {
        throw new Error('Invalid test status');
    }
    return `${remote_server}action=${action}&build_id=${build_id}&test_lang=${lang}&status=${status}`;
}

async function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function wait (lang) {
    const pauseMS = 1000;
    let count = 0;
    while(true) {
        count ++;
        if (count > 1000) {
            console.error("waiting count more than 1000");
            process.exit(1);
        }
        try {
            const response = await fetch(url('read', build_ID, lang));
            const txt = await response.text();
            console.log("response_for", lang, txt);
            if (txt === 'RESPONSE_success') {
                return;
            } else if (txt === 'RESPONSE_fail') {
                process.exit(1);
            }
            // else RESPONSE_NOT_EXISTS
        } catch (error) {
            console.error("Error while fetching::: ", error);
        }
        await sleep(pauseMS); // pause few seconds
    }
}

const randomMs = Math.floor(Math.random() * 10000);
await sleep(randomMs);
const response = await fetch(url('write', build_ID, RUNSTEP, 'success'));
const txt = await response.text();
console.log("WRITE COMPLETE! for", RUNSTEP, txt);
if(txt !== 'RESPONSE_write_success') {
    console.error("Error while writing response", txt);
    process.exit(1);
}
const waitForStep = RUNSTEP === 'PY_JS_PHP' ? 'CSHARP' : 'PY_JS_PHP';
wait(waitForStep);

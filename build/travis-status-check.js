
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
    const pauseMS = 3000;
    let count = 0;
    while(true) {
        count ++;
        if (count > 400) {
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

// const randomMs = Math.floor(Math.random() * 10000);
// await sleep(randomMs);
const response = await fetch(url('write', build_ID, RUNSTEP, 'success'));
const txt = await response.text();
console.log("WRITE COMPLETE! for", RUNSTEP, txt);
if(txt !== 'RESPONSE_write_success') {
    console.error("Error while writing response", txt);
    process.exit(1);
}
const waitForStep = RUNSTEP === 'PY_JS_PHP' ? 'CSHARP' : 'PY_JS_PHP';
wait(waitForStep);













/*
<?php
// this file needs to be put on remote server, and it's dir chown-ed
// chown www-data:www-data -R ./folder_name_here/

error_reporting(E_ALL);
ini_set('display_errors', 1);

function main() {
    if (!array_key_exists ('build_id', $_GET)){
        "no build";
    }
    
    $build_id = $_GET['build_id'];
    $lang = $_GET['test_lang'];
    $action = $_GET['action'];

    $file = __DIR__.'/travis_status_'.$build_id.'_'.$lang;

    if ($action == 'read') {
        if (file_exists($file)){
            $status = file_get_contents($file);
            echo 'RESPONSE_'.$status;
        } else {
            echo 'RESPONSE_NOT_EXISTS';
        }
    } else if ($action == 'write') {
        if (!in_array($_GET['status'], ['success','fail'])){
            echo 'RESPONSE_invalid_status';
            return;
        }
        if (file_exists($file)){
            echo 'RESPONSE_write_already_exists';
            return;
        }
        file_put_contents($file, $_GET['status']);
        echo 'RESPONSE_write_success';
    } else {
        echo 'RESPONSE_invalid_action';
    }
}

main();


*/
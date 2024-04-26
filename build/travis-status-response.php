<?php

// this file needs to be put on server

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
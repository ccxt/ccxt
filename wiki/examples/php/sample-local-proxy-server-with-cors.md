- [Sample Local Proxy Server With Cors](./examples/php/)


 ```php
 <?php
ini_set('display_errors', 1); 
ini_set('display_startup_errors', 1); 
error_reporting(E_ALL); 



// Note, you are advised to whitelist your IP address if you are going to use such sample proxy script.
// Then, you can run this script against any target url, like: 
//        http://your_server.com/sample-proxy.php?url=https://api64.ipify.org/
class SampleProxy {

    private $whitelisted_ips = [
        'localhost',
        '127.0.0.1',
        '::1',
        // if you are accessing this script from remote device, add your ip here
    ];


    // helper function
    private function enable_cors() {
        // copied from https://stackoverflow.com/a/9866124/2377343
        if (isset($_SERVER['HTTP_ORIGIN'])) { // Allow from any origin
            // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
            // you want to allow, and if so:
            header("Access-Control-Allow-Origin: *");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');    // cache for 1 day
        }
        
        // Access-Control headers are received during OPTIONS requests
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
                // may also be using PUT, PATCH, HEAD etc
                header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, OPTIONS");
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
                header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
            exit(0);
        }
    }

    public function fetch_url ($url, $post_options = []) {
        // todo: POST method is not implemented in this example
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION	,0);
        curl_setopt($ch, CURLOPT_HEADER			,0);  // DO NOT RETURN HTTP HEADERS
        curl_setopt($ch, CURLOPT_RETURNTRANSFER	,1);  // RETURN THE CONTENTS OF THE CALL
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 9);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 9);
        curl_setopt($ch, CURLOPT_ENCODING,  '');
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }

    
    public function __construct() {
        if (!in_array($_SERVER['REMOTE_ADDR'], $this->whitelisted_ips)) {
            die("Your IP is forbidden... " . strval($_SERVER['REMOTE_ADDR']));
        }
        $this->enable_cors();
        echo $this->fetch_url(filter_var($_GET['url'], FILTER_SANITIZE_URL));
        exit(0);
    }
}

new SampleProxy(); 
```
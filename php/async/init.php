
<?php




spl_autoload_register (function ($class_name) {
    $class_name = str_replace ("ccxtpro\\", "", $class_name);
    $file = PATH_TO_CCXTPRO . $class_name . '.php';
    if (file_exists ($file)) {
        require_once $file;
    }
});



?>
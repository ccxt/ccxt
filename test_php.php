<?php

class Foo {
   
    /**
     * An indentifier
     * @var string
     */
    private $name;
    /**
     * A reference to another Foo object
     * @var Foo
     */
    private $link;

    public function __construct($name) {
        $this->name = $name;
    }

    public function setLink(string $link){
        $this->link = $link;
    }

    public function __destruct() {
        echo 'Destroying: ', $this->name, PHP_EOL;
    }
}

// create two Foo objects:
$foo = new Foo('Foo 1');

$foo->setLink("set");

print_r("here");

?>
<?php 

namespace ccxt;
use Evenement\EventEmitter;
require __DIR__.'/../../vendor/autoload.php';


abstract class CcxtEventEmitter {

  private $evt;

  public function __construct () {
      $this->evt = new EventEmitter();
  }

  public function emit ($event, ...$args) {
      $this->evt->emit ($event, $args);
      return $this;
  }

  public function on($event, callable $listener) {
      $this->evt->on ($event, $listener);
      return $this;
  }
  public function once($event, callable $listener) {
      $this->evt->once ($event, $listener);
      return $this;
  }
  public function removeListener($event, callable $listener) {
      $this->evt->removeListener ($event, $listener);
  }
  public function removeAllListeners($event = null) {
      $this->evt->removeListener ($event);
  }
  public function listeners($event = null): array {
      return $this->evt->listeners ($event);
  }
}
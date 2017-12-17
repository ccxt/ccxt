<?php

namespace ccxt;

class BaseError            extends \Exception    {}
class ExchangeError        extends BaseError     {}
class NotSupported         extends ExchangeError {}
class AuthenticationError  extends ExchangeError {}
class InvalidNonce         extends ExchangeError {}
class InsufficientFunds    extends ExchangeError {}
class InvalidOrder         extends ExchangeError {}
class OrderNotFound        extends InvalidOrder  {}
class OrderNotCached       extends InvalidOrder  {}
class CancelPending        extends InvalidOrder  {}
class NetworkError         extends BaseError     {}
class DDoSProtection       extends NetworkError  {}
class RequestTimeout       extends NetworkError  {}
class ExchangeNotAvailable extends NetworkError  {}

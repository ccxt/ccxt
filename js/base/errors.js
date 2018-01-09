class BaseError extends Error {
    constructor (message) {
        super (message)
        // a workaround to make `instanceof BaseError` work in ES5
        this.constructor = BaseError
        this.__proto__   = BaseError.prototype
        this.message     = message
        this.name        = 'BaseError'
    }
}

class ExchangeError extends BaseError {
    constructor (message) {
        super (message)
        this.constructor = ExchangeError
        this.__proto__   = ExchangeError.prototype
        this.message     = message
        this.name        = 'ExchangeError'
    }
}

class NotSupported extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = NotSupported
        this.__proto__   = NotSupported.prototype
        this.message     = message
        this.name        = 'NotSupported'
    }
}

class AuthenticationError extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = AuthenticationError
        this.__proto__   = AuthenticationError.prototype
        this.message     = message
        this.name        = 'AuthenticationError'
    }
}

class InvalidNonce extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = InvalidNonce
        this.__proto__   = InvalidNonce.prototype
        this.message     = message
        this.name        = 'InvalidNonce'
    }
}

class InsufficientFunds extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = InsufficientFunds
        this.__proto__   = InsufficientFunds.prototype
        this.message     = message
        this.name        = 'InsufficientFunds'
    }
}

class InvalidOrder extends ExchangeError {
    constructor (message) {
        super (message)
        this.constructor = InvalidOrder
        this.__proto__   = InvalidOrder.prototype
        this.message     = message
        this.name        = 'InvalidOrder'
    }
}

class OrderNotFound extends InvalidOrder {
    constructor (message) {
        super (message)
        this.constructor = OrderNotFound
        this.__proto__   = OrderNotFound.prototype
        this.message     = message
        this.name        = 'OrderNotFound'
    }
}

class OrderNotCached extends InvalidOrder {
    constructor (message) {
        super (message)
        this.constructor = OrderNotCached
        this.__proto__   = OrderNotCached.prototype
        this.message     = message
        this.name        = 'OrderNotCached'
    }
}

class CancelPending extends InvalidOrder {
    constructor (message) {
        super (message)
        this.constructor = CancelPending
        this.__proto__   = CancelPending.prototype
        this.message     = message
        this.name        = 'CancelPending'
    }
}

class NetworkError extends BaseError {
    constructor (message) {
        super (message)
        this.constructor = NetworkError
        this.__proto__   = NetworkError.prototype
        this.message     = message
        this.name        = 'NetworkError'
    }
}

class DDoSProtection extends NetworkError {
    constructor (message) {
        super (message)
        this.constructor = DDoSProtection
        this.__proto__   = DDoSProtection.prototype
        this.message     = message
        this.name        = 'DDoSProtection'
    }
}

class RequestTimeout extends NetworkError {
    constructor (message) {
        super (message)
        this.constructor = RequestTimeout
        this.__proto__   = RequestTimeout.prototype
        this.message     = message
        this.name        = 'RequestTimeout'
    }
}

class ExchangeNotAvailable extends NetworkError {
    constructor (message) {
        super (message)
        this.constructor = ExchangeNotAvailable
        this.__proto__   = ExchangeNotAvailable.prototype
        this.message     = message
        this.name        = 'ExchangeNotAvailable'
    }
}

module.exports = {

    BaseError,
    ExchangeError,
    NotSupported,
    AuthenticationError,
    InvalidNonce,
    InsufficientFunds,
    InvalidOrder,
    OrderNotFound,
    OrderNotCached,
    CancelPending,
    NetworkError,
    DDoSProtection,
    RequestTimeout,
    ExchangeNotAvailable,
}

import { BaseError } from '../errors.js';

class ReplayError extends BaseError {
    constructor (message: string) {
        super (message);
        this.name = 'ReplayError';
    }
}
class ReplayMismatch extends ReplayError {
    expected: any;
    actual: any;
    field: string;
    constructor (message: string, expected: any, actual: any, field: string) {
        super (message);
        this.name = 'ReplayMismatch';
        this.expected = expected;
        this.actual = actual;
        this.field = field;
    }
}
class ReplayExhausted extends ReplayError {
    constructor (message: string) {
        super (message);
        this.name = 'ReplayExhausted';
    }
}
class ReplayDeadlock extends ReplayError {
    constructor (message: string) {
        super (message);
        this.name = 'ReplayDeadlock';
    }
}
class ReplayIncomplete extends ReplayError {
    constructor (message: string) {
        super (message);
        this.name = 'ReplayIncomplete';
    }
}
class ReplayUnsupported extends ReplayError {
    constructor (message: string) {
        super (message);
        this.name = 'ReplayUnsupported';
    }
}
class RecorderError extends ReplayError {
    constructor (message: string) {
        super (message);
        this.name = 'RecorderError';
    }
}

export { ReplayError, ReplayMismatch, ReplayExhausted, ReplayDeadlock, ReplayIncomplete, ReplayUnsupported, RecorderError };

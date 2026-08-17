
// @ts-nocheck
const now = Date.now; // TODO: figure out how to utilize performance.now () properly – it's not as easy as it does not return a unix timestamp...
const microseconds = () => now () * 1000; // TODO: utilize performance.now for that purpose
const milliseconds = now;
const seconds = () => Math.floor (now () / 1000);
const uuidv1 = () => {
    const biasSeconds = 12219292800; // seconds from 15th Oct 1572 to Jan 1st 1970
    const bias = biasSeconds * 10000000;  // in hundreds of nanoseconds
    const time = microseconds () * 10 + bias;
    const timeHex = time.toString (16);
    const arranged = timeHex.slice (7, 15) + timeHex.slice (3, 7) + '1' + timeHex.slice (0, 3);
    // these should be random, but we're not making more than 10 requests per microsecond so who cares
    const clockId = '9696'; // a 14 bit number
    const macAddress = 'ff'.repeat (6);
    return arranged + clockId + macAddress;
};
const setTimeout_original = setTimeout;
const setTimeout_safe = (done, ms, setTimeout: any = setTimeout_original /* overrideable for mocking purposes */, targetTime = now () + ms) => {
    // avoid MAX_INT issue https://github.com/ccxt/ccxt/issues/10761
    if (ms >= 2147483647) {
        throw new Error ('setTimeout() function was called with unrealistic value of ' + ms.toString ());
    }
    // The built-in setTimeout function can fire its callback earlier than specified, so we
    // need to ensure that it does not happen: sleep recursively until `targetTime` is reached...
    let clearInnerTimeout = () => {};
    let active = true;
    const id = setTimeout (() => {
        active = true;
        const rest = targetTime - now ();
        if (rest > 0) {
            clearInnerTimeout = setTimeout_safe (done, rest, setTimeout, targetTime); // try sleep more
        } else {
            done ();
        }
    }, ms);
    return function clear () {
        if (active) {
            active = false; // dunno if IDs are unique on various platforms, so it's better to rely on this flag to exclude the possible cancellation of the wrong timer (if called after completion)
            clearTimeout (id);
        }
        clearInnerTimeout ();
    };
};
class TimedOut extends Error {
    constructor () {
        const message = 'timed out';
        super (message);
        this.constructor = TimedOut;
        // // @ts-expect-error
        this.__proto__ = TimedOut.prototype;
        this.message = message;
    }
}
// beyond this, native toISOString() switches to extended year notation (+/-YYYYYY);
// everything below it (years 1970-9999) is handled by the fast integer path instead
// of allocating a Date object, since that's the overwhelming majority of real timestamps
const ISO8601_FAST_PATH_LIMIT = Date.UTC (10000, 0, 1);
const pad2 = (n) => (n < 10 ? ('0' + n) : ('' + n));
const pad3 = (n) => (n < 10 ? ('00' + n) : (n < 100 ? ('0' + n) : ('' + n)));
// Howard Hinnant's civil_from_days algorithm (http://howardhinnant.github.io/date_algorithms.html)
// converts days-since-epoch into a proleptic-Gregorian [year, month, day]; z must be >= 0 here
const civilFromDays = (z) => {
    z += 719468;
    const era = (z / 146097) | 0;
    const doe = z - era * 146097; // [0, 146096]
    const yoe = ((doe - ((doe / 1460) | 0) + ((doe / 36524) | 0) - ((doe / 146096) | 0)) / 365) | 0; // [0, 399]
    const y = yoe + era * 400;
    const doy = doe - (365 * yoe + ((yoe / 4) | 0) - ((yoe / 100) | 0)); // [0, 365]
    const mp = ((5 * doy + 2) / 153) | 0; // [0, 11]
    const d = doy - (((153 * mp + 2) / 5) | 0) + 1; // [1, 31]
    const m = mp + ((mp < 10) ? 3 : -9); // [1, 12]
    return [ y + ((m <= 2) ? 1 : 0), m, d ];
};
const iso8601FastPath = (ms) => {
    const msOfDay = ms % 86400000;
    const days = (ms - msOfDay) / 86400000;
    const ms3 = msOfDay % 1000;
    const secOfDay = (msOfDay - ms3) / 1000;
    const s = secOfDay % 60;
    const minOfHour = (secOfDay - s) / 60;
    const mi = minOfHour % 60;
    const h = (minOfHour - mi) / 60;
    const [ year, m, d ] = civilFromDays (days);
    return '' + year + '-' + pad2 (m) + '-' + pad2 (d) + 'T' + pad2 (h) + ':' + pad2 (mi) + ':' + pad2 (s) + '.' + pad3 (ms3) + 'Z';
};
const iso8601 = (timestamp) => {
    let _timestampNumber = undefined;
    if (typeof timestamp === 'number') {
        _timestampNumber = Math.floor (timestamp);
    } else {
        _timestampNumber = parseInt (timestamp, 10);
    }
    // undefined, null and lots of nasty non-numeric values yield NaN
    if (Number.isNaN (_timestampNumber) || _timestampNumber < 0) {
        return undefined;
    }
    if (_timestampNumber < ISO8601_FAST_PATH_LIMIT) {
        return iso8601FastPath (_timestampNumber);
    }
    // last line of defence (extended years / out-of-range values)
    try {
        return new Date (_timestampNumber).toISOString ();
    } catch (e) {
        return undefined;
    }
};
const parse8601 = (x) => {
    if (typeof x !== 'string' || !x) {
        return undefined;
    }
    if (x.match (/^[0-9]+$/)) {
        // a valid number in a string, not a date.
        return undefined;
    }
    if (x.indexOf ('-') < 0 || x.indexOf (':') < 0) { // no date can be without a dash and a colon
        return undefined;
    }
    // last line of defence
    try {
        const candidate = Date.parse (((x.indexOf ('+') >= 0) || (x.slice (-1) === 'Z')) ? x : (x + 'Z').replace (/\s(\d\d):/, 'T$1:'));
        if (Number.isNaN (candidate)) {
            return undefined;
        }
        return candidate;
    } catch (e) {
        return undefined;
    }
};
const parseDate = (x) => {
    if (typeof x !== 'string' || !x) {
        return undefined;
    }
    if (x.indexOf ('GMT') >= 0) {
        try {
            return Date.parse (x);
        } catch (e) {
            return undefined;
        }
    }
    return parse8601 (x);
};

const mdy = (timestamp, infix = '-') => {
    infix = infix || '';
    const date = new Date (timestamp);
    const Y = date.getUTCFullYear ().toString ();
    let m = date.getUTCMonth () + 1;
    let d = date.getUTCDate ();
    m = m < 10 ? ('0' + m) : m.toString ();
    d = d < 10 ? ('0' + d) : d.toString ();
    return m + infix + d + infix + Y;
};
const ymd = (timestamp, infix, fullYear = true) => {
    infix = infix || '';
    const date = new Date (timestamp);
    const intYear = date.getUTCFullYear ();
    const year = fullYear ? intYear : (intYear - 2000);
    const Y = year.toString ();
    let m = date.getUTCMonth () + 1;
    let d = date.getUTCDate ();
    m = m < 10 ? ('0' + m) : m.toString ();
    d = d < 10 ? ('0' + d) : d.toString ();
    return Y + infix + m + infix + d;
};
const yymmdd = (timestamp, infix = '') => ymd (timestamp, infix, false);
const yyyymmdd = (timestamp, infix = '-') => ymd (timestamp, infix, true);
const ymdhms = (timestamp, infix = ' ') => {
    const date = new Date (timestamp);
    const Y = date.getUTCFullYear ();
    let m = date.getUTCMonth () + 1;
    let d = date.getUTCDate ();
    let H = date.getUTCHours ();
    let M = date.getUTCMinutes ();
    let S = date.getUTCSeconds ();
    m = m < 10 ? ('0' + m) : m;
    d = d < 10 ? ('0' + d) : d;
    H = H < 10 ? ('0' + H) : H;
    M = M < 10 ? ('0' + M) : M;
    S = S < 10 ? ('0' + S) : S;
    return Y + '-' + m + '-' + d + infix + H + ':' + M + ':' + S;
};
const sleep = (ms) => new Promise ((resolve) => setTimeout_safe (resolve, ms));


const timeout = async (ms, promise) => {
    let clear = () => {};
    const expires = new Promise ((resolve) => (clear = setTimeout_safe (resolve, ms)));
    try {
        return await Promise.race ([ promise, expires.then (() => {
            throw new TimedOut ();
        }) ]);
    } finally {
        clear (); // fixes https://github.com/ccxt/ccxt/issues/749
    }
};

export {
    now
    , microseconds
    , milliseconds
    , seconds
    , iso8601
    , parse8601
    , uuidv1
    , parseDate
    , mdy
    , ymd
    , yymmdd
    , yyyymmdd
    , ymdhms
    , setTimeout_safe
    , sleep
    , TimedOut
    , timeout,
};

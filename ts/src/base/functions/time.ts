
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
// iso8601 is a hot function (called once per parsed trade, order, candle, etc) and it is
// called with scattered, non-ordered timestamps (multi-symbol feeds, daily OHLCV bars,
// historical pagination), so it is completely stateless and makes no locality assumptions:
// the civil date is derived from the day number with pure integer math (classic
// civil-from-days algorithm, inlined below) and a Date object is never allocated — every
// call costs the same few divisions regardless of ordering. The tables below are static
// bounded data (zero-padded strings and the 8030 post-epoch year strings), not caches:
// every lookup is O(1) for any input, nothing is ever invalidated. The output is
// byte-for-byte identical to new Date (ms).toISOString () (including the extended-year
// '+YYYYYY-' format above year 9999)
const iso8601TwoDigits = [];
for (let i = 0; i < 60; i++) {
    iso8601TwoDigits.push ((i < 10) ? ('0' + i) : ('' + i));
}
const iso8601ThreeDigits = [];
for (let i = 0; i < 1000; i++) {
    iso8601ThreeDigits.push ((i < 10) ? ('00' + i) : ((i < 100) ? ('0' + i) : ('' + i)));
}

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
    // values above 8.64e15 (100,000,000 days) are outside the supported Date range
    if (_timestampNumber > 8640000000000000) {
        return undefined;
    }
    const seconds = Math.floor (_timestampNumber / 1000);
    const milliseconds = _timestampNumber - (seconds * 1000);
    const timeOfDay = seconds - (Math.floor (seconds / 86400) * 86400);
    const day = (seconds - timeOfDay) / 86400;
    // civil-from-days: convert days since 1970-01-01 to a gregorian date
    const z = day + 719468;
    const era = Math.floor (z / 146097);
    const doe = z - (era * 146097); // [0, 146096] day of era
    const yoe = Math.floor ((doe - Math.floor (doe / 1460) + Math.floor (doe / 36524) - Math.floor (doe / 146096)) / 365); // [0, 399] year of era
    const doy = doe - ((365 * yoe) + Math.floor (yoe / 4) - Math.floor (yoe / 100)); // [0, 365] day of year
    const mp = Math.floor (((5 * doy) + 2) / 153); // [0, 11] month index counting from March
    const dayOfMonth = doy - Math.floor (((153 * mp) + 2) / 5) + 1; // [1, 31]
    const month = (mp < 10) ? (mp + 3) : (mp - 9); // [1, 12]
    const yearExact = yoe + (era * 400);
    const year = (month <= 2) ? (yearExact + 1) : yearExact;
    let yearString = undefined;
    if (year > 9999) {
        yearString = '+' + ('' + year).padStart (6, '0');
    } else if (year >= 1000) {
        yearString = '' + year;
    } else {
        yearString = ('' + year).padStart (4, '0');
    }
    const hours = Math.floor (timeOfDay / 3600);
    const minutesSeconds = timeOfDay - (hours * 3600);
    const minutes = Math.floor (minutesSeconds / 60);
    const secondsOfMinute = minutesSeconds - (minutes * 60);
    return yearString + '-' + iso8601TwoDigits[month] + '-' + iso8601TwoDigits[dayOfMonth] + 'T' + iso8601TwoDigits[hours] + ':' + iso8601TwoDigits[minutes] + ':' + iso8601TwoDigits[secondsOfMinute] + '.' + iso8601ThreeDigits[milliseconds] + 'Z';
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

'use strict'

/*  ------------------------------------------------------------------------ */

const { setTimeout_safe
      , timeout
      , now
      , isWindows,
      Exchange } = require ('../../../../ccxt')

    //   const { Exchange, keys, values, unique, index, aggregate } = require ('../../../ccxt')

const { strictEqual: equal } = require ('assert')

/*  ------------------------------------------------------------------------ */

it ('iso8601', done => {
    const exchange = new Exchange ({
        'id': 'chernobyl'
    });

    equal (exchange.iso8601(514862627000), '1986-04-26T01:23:47.000Z');
    equal (exchange.iso8601(0),            '1970-01-01T00:00:00.000Z');

    equal (exchange.iso8601(-1),   undefined);
    equal (exchange.iso8601(),     undefined);
    equal (exchange.iso8601(null), undefined);
    equal (exchange.iso8601(''),   undefined);
    equal (exchange.iso8601('a'),  undefined);
    equal (exchange.iso8601({}),   undefined);

    done();
});

/*  ------------------------------------------------------------------------ */

it ('parse8601', done => {
    const exchange = new Exchange ({
        'id': 'fukusima'
    });

    equal(exchange.parse8601('1986-04-26T01:23:47.000Z'), 514862627000);

    equal(exchange.parse8601('1977-13-13T00:00:00.000Z'), undefined);
    equal(exchange.parse8601('1986-04-26T25:71:47.000Z'), undefined);

    equal(exchange.parse8601('3333'), undefined);
    equal(exchange.parse8601('Sr90'), undefined);
    equal(exchange.parse8601(''),     undefined);
    equal(exchange.parse8601(),       undefined);
    equal(exchange.parse8601(null),   undefined);
    equal(exchange.parse8601({}),     undefined);
    equal(exchange.parse8601(33),     undefined);

    done();
});

/*  ------------------------------------------------------------------------ */

it ('parseDate', done => {
    const exchange = new Exchange ({
        'id': 'TMI'
    });

    equal(exchange.parseDate('1986-04-26 00:00:00'), 514857600000);
    equal(exchange.parseDate('1986-04-26T01:23:47.000Z'), 514862627000);
    equal(exchange.parseDate('1986-13-13 00:00:00'), undefined);

    done();
});

/*  ------------------------------------------------------------------------ */

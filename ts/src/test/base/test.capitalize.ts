
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testCapitalize () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // `inputs` and `expected` must stay index-aligned; every row is asserted below
    const inputs = [
        'hello', 'fooBar', 'helloWorld', 'Hello', 'hELLO', 'a',
        'A', '', '123abc', 'hello world', 'foo_bar_baz', 'aBC',
    ];
    const expected = [
        'Hello', 'FooBar', 'HelloWorld', 'Hello', 'HELLO', 'A',
        'A', '', '123abc', 'Hello world', 'Foo_bar_baz', 'ABC',
    ];
    for (let i = 0; i < inputs.length; i++) {
        assert (exchange.capitalize (inputs[i]) === expected[i], 'capitalize(' + inputs[i] + ') must equal ' + expected[i]);
    }
}

export default testCapitalize;

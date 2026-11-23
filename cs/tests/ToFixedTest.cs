using System;

namespace Tests;

using ccxt;

public partial class BaseTest
{
    // toFixed returns the zero-padded string JavaScript's Number.prototype.toFixed gives
    public void testToFixed()
    {
        var cases = new (object, int, string)[] {
            (0.1, 10, "0.1000000000"),
            (1795410000.123, 8, "1795410000.12299991"),
            (1.005, 2, "1.00"),
            (1.5, 0, "2"),
            (2.5, 0, "3"),
            (-2.5, 0, "-3"),
            (-0.0001220703125, 12, "-0.000122070313"),
            (-0.001, 2, "-0.00"),
            (-0.0, 2, "0.00"),
            ((Int64)42, 3, "42.000"),
            (0.000001, 7, "0.0000010"),
            (123.456, 0, "123"),
        };
        foreach (var (number, digits, expected) in cases)
        {
            var actual = Exchange.toFixed(number, digits);
            Assert(actual == expected, "toFixed(" + number + ", " + digits + ") returned " + actual + ", expected " + expected);
        }
    }
}

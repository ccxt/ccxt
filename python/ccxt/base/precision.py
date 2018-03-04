import decimal
import numbers

# rounding mode
TRUNCATE = 0
ROUND = 1

# digits counting mode
AFTER_POINT = 2
SIGNIFICANT_DIGITS = 3

# padding mode
NO_PADDING = 4
PAD_WITH_ZERO = 5


def decimalToPrecision(n, rounding_mode=ROUND, precision=None, counting_mode=AFTER_POINT, padding_mode=NO_PADDING):
    assert precision is not None and isinstance(precision, numbers.Integral) and precision < 28
    assert rounding_mode in [TRUNCATE, ROUND]
    assert counting_mode in [AFTER_POINT, SIGNIFICANT_DIGITS]
    assert padding_mode in [NO_PADDING, PAD_WITH_ZERO]

    # all default except decimal.Underflow (raised when a number is rounded to zero)
    decimal.getcontext().traps[decimal.Underflow] = True

    dec = decimal.Decimal(n)
    string = str(dec)

    def quant(x):
        return decimal.Decimal('10') ** (-x)

    if rounding_mode == ROUND:
        if counting_mode == AFTER_POINT:
            precise = str(dec.quantize(quant(precision)))  # ROUND_HALF_EVEN is default context
        elif counting_mode == SIGNIFICANT_DIGITS:
            q = precision - dec.adjusted() - 1
            precise = str(dec.quantize(quant(q)))

    elif rounding_mode == TRUNCATE:
        # Slice a string
        if counting_mode == AFTER_POINT:
            before, after = string.split('.')
            truncated = before + '.' + after[:precision]
            precise = truncated.rstrip('.')
        elif counting_mode == SIGNIFICANT_DIGITS:
            dot = string.index('.')
            start = dot - dec.adjusted()
            end = start + precision
            if dec.adjusted() > 0:
                precise = string[:end-1].ljust(dot, '0')
            else:
                precise = string[:end]

    if padding_mode == NO_PADDING:
        return precise.rstrip('0').rstrip('.') if '.' in precise else precise
    elif padding_mode == PAD_WITH_ZERO:
        return precise.ljust(precision, '0').rstrip('.')

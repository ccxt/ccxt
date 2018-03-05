import decimal
import numbers
import itertools

# rounding mode
TRUNCATE = 0
ROUND = 1

# digits counting mode
AFTER_POINT = 2
SIGNIFICANT_DIGITS = 3

# padding mode
NO_PADDING = 4
PAD_WITH_ZERO = 5


def decimal_to_precision(n, rounding_mode=ROUND, precision=None, counting_mode=AFTER_POINT, padding_mode=NO_PADDING):
    assert precision is not None and isinstance(precision, numbers.Integral)
    assert rounding_mode in [TRUNCATE, ROUND]
    assert counting_mode in [AFTER_POINT, SIGNIFICANT_DIGITS]
    assert padding_mode in [NO_PADDING, PAD_WITH_ZERO]

    # all default except decimal.Underflow (raised when a number is rounded to zero)
    decimal.getcontext().traps[decimal.Underflow] = True

    dec = decimal.Decimal(n)
    string = str(dec)

    precision = min(precision, 20)

    def quant(x):
        return decimal.Decimal('10') ** (-x)

    if rounding_mode == ROUND:
        if counting_mode == AFTER_POINT:
            precise = str(dec.quantize(quant(precision)))  # ROUND_HALF_EVEN is default context
        elif counting_mode == SIGNIFICANT_DIGITS:
            q = precision - dec.adjusted() - 1
            sigfig = quant(q)
            if q < 0:
                below = sigfig * decimal.Decimal(string[:precision])
                above = below + sigfig
                precise = str(min((below, above), key=lambda x: abs(x - dec)))
            else:
                precise = str(dec.quantize(sigfig))

    elif rounding_mode == TRUNCATE:
        # Slice a string
        if counting_mode == AFTER_POINT:
            before, after = string.split('.')
            truncated = before + '.' + after[:precision]
            precise = truncated.rstrip('.')
        elif counting_mode == SIGNIFICANT_DIGITS:
            dot = string.index('.')
            start = dot - dec.adjusted() if dot is not None else 0
            end = start + precision
            if dot >= end:
                end -= 1
            if dec.adjusted() < 0:
                end += 1
            precise = string[:end].ljust(dot, '0')

    if '.' == precise[-1]:
        raise ValueError

    if padding_mode == NO_PADDING:
        return precise.rstrip('0').rstrip('.') if '.' in precise else precise
    elif padding_mode == PAD_WITH_ZERO:
        if counting_mode == AFTER_POINT:
            print(precision)
            if '.' in precise:
                before, after = precise.split('.')
                return before + '.' + after.ljust(precision, '0')
            else:
                return precise  # may need more tests
        elif counting_mode == SIGNIFICANT_DIGITS:
            fsfg = len(list(itertools.takewhile(lambda x: x == '.' or x == '0', precise)))
            if precision >= len(precise.replace('.', '').rstrip('0')):
                return precise[:fsfg] + precise[fsfg:].ljust(precision, '0')
            else:
                if '.' in precise:
                    return precise.rstrip('0').ljust(precision, '0').rstrip('.')
                else:
                    return precise

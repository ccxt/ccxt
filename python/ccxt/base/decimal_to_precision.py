import decimal
import numbers
import itertools

__all__ = [
    'TRUNCATE',
    'ROUND',
    'DECIMAL_PLACES',
    'SIGNIFICANT_DIGITS',
    'NO_PADDING',
    'PAD_WITH_ZERO',
    'decimal_to_precision',
]


# rounding mode
TRUNCATE = 0
ROUND = 1

# digits counting mode
DECIMAL_PLACES = 2
SIGNIFICANT_DIGITS = 3

# padding mode
NO_PADDING = 4
PAD_WITH_ZERO = 5


def decimal_to_precision(n, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING):
    assert precision is not None and isinstance(precision, numbers.Integral)
    assert rounding_mode in [TRUNCATE, ROUND]
    assert counting_mode in [DECIMAL_PLACES, SIGNIFICANT_DIGITS]
    assert padding_mode in [NO_PADDING, PAD_WITH_ZERO]

    context = decimal.getcontext()

    precision = min(context.prec - 2, precision)

    # all default except decimal.Underflow (raised when a number is rounded to zero)
    context.traps[decimal.Underflow] = True
    context.rounding = decimal.ROUND_HALF_UP  # rounds 0.5 away from zero

    dec = decimal.Decimal(n)
    string = str(dec)
    precise = None

    def power_of_10(x):
        return decimal.Decimal('10') ** (-x)

    if rounding_mode == ROUND:
        if counting_mode == DECIMAL_PLACES:
            precise = str(dec.quantize(power_of_10(precision)))  # ROUND_HALF_EVEN is default context
        elif counting_mode == SIGNIFICANT_DIGITS:
            q = precision - dec.adjusted() - 1
            sigfig = power_of_10(q)
            if q < 0:
                string_to_precision = string[:precision]
                # string_to_precision is '' when we have zero precision
                below = sigfig * decimal.Decimal(string_to_precision if string_to_precision else '0')
                above = below + sigfig
                precise = str(min((below, above), key=lambda x: abs(x - dec)))
            else:
                precise = str(dec.quantize(sigfig))

    elif rounding_mode == TRUNCATE:
        # Slice a string
        if counting_mode == DECIMAL_PLACES:
            before, after = string.split('.') if '.' in string else (string, '')
            precise = before + '.' + after[:precision]
        elif counting_mode == SIGNIFICANT_DIGITS:
            if precision == 0:
                return '0'
            dot = string.index('.') if '.' in string else 0
            start = dot - dec.adjusted()
            end = start + precision
            # need to clarify these conditionals
            if dot >= end:
                end -= 1
            precise = string[:end].ljust(dot, '0')
        precise = precise.rstrip('.')

    if padding_mode == NO_PADDING:
        return precise.rstrip('0').rstrip('.') if '.' in precise else precise
    elif padding_mode == PAD_WITH_ZERO:
        if '.' in precise:
            if counting_mode == DECIMAL_PLACES:
                before, after = precise.split('.')
                return before + '.' + after.ljust(precision, '0')

            elif counting_mode == SIGNIFICANT_DIGITS:
                fsfg = len(list(itertools.takewhile(lambda x: x == '.' or x == '0', precise)))
                if '.' in precise[fsfg:]:
                    precision += 1
                return precise[:fsfg] + precise[fsfg:].rstrip('0').ljust(precision, '0')
        else:
            if counting_mode == SIGNIFICANT_DIGITS:
                if precision > len(precise):
                    return precise + '.' + (precision - len(precise)) * '0'
            elif counting_mode == DECIMAL_PLACES:
                if precision > 0:
                    return precise + '.' + precision * '0'
            return precise

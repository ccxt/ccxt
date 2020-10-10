import decimal
import numbers
import itertools
import re

__all__ = [
    'TRUNCATE',
    'ROUND',
    'ROUND_UP',
    'ROUND_DOWN',
    'DECIMAL_PLACES',
    'SIGNIFICANT_DIGITS',
    'TICK_SIZE',
    'NO_PADDING',
    'PAD_WITH_ZERO',
    'decimal_to_precision',
]


# rounding mode
TRUNCATE = 0
ROUND = 1
ROUND_UP = 2
ROUND_DOWN = 3

# digits counting mode
DECIMAL_PLACES = 2
SIGNIFICANT_DIGITS = 3
TICK_SIZE = 4

# padding mode
NO_PADDING = 5
PAD_WITH_ZERO = 6


def decimal_to_precision(n, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING):
    assert precision is not None
    if counting_mode == TICK_SIZE:
        assert(isinstance(precision, float) or isinstance(precision, numbers.Integral))
    else:
        assert(isinstance(precision, numbers.Integral))
    assert rounding_mode in [TRUNCATE, ROUND]
    assert counting_mode in [DECIMAL_PLACES, SIGNIFICANT_DIGITS, TICK_SIZE]
    assert padding_mode in [NO_PADDING, PAD_WITH_ZERO]

    context = decimal.getcontext()

    if counting_mode != TICK_SIZE:
        precision = min(context.prec - 2, precision)

    # all default except decimal.Underflow (raised when a number is rounded to zero)
    context.traps[decimal.Underflow] = True
    context.rounding = decimal.ROUND_HALF_UP  # rounds 0.5 away from zero

    dec = decimal.Decimal(str(n))
    precision_dec = decimal.Decimal(str(precision))
    string = '{:f}'.format(dec)  # convert to string using .format to avoid engineering notation
    precise = None

    def power_of_10(x):
        return decimal.Decimal('10') ** (-x)

    if precision < 0:
        if counting_mode == TICK_SIZE:
            raise ValueError('TICK_SIZE cant be used with negative numPrecisionDigits')
        to_nearest = power_of_10(precision)
        if rounding_mode == ROUND:
            return "{:f}".format(to_nearest * decimal.Decimal(decimal_to_precision(dec / to_nearest, rounding_mode, 0, DECIMAL_PLACES, padding_mode)))
        elif rounding_mode == TRUNCATE:
            return decimal_to_precision(dec - dec % to_nearest, rounding_mode, 0, DECIMAL_PLACES, padding_mode)

    if counting_mode == TICK_SIZE:
        # python modulo with negative numbers behaves different than js/php, so use abs first
        missing = abs(dec) % precision_dec
        if missing != 0:
            if rounding_mode == ROUND:
                if dec > 0:
                    if missing >= precision / 2:
                        dec = dec - missing + precision_dec
                    else:
                        dec = dec - missing
                else:
                    if missing >= precision / 2:
                        dec = dec + missing - precision_dec
                    else:
                        dec = dec + missing
            elif rounding_mode == TRUNCATE:
                if dec < 0:
                    dec = dec + missing
                else:
                    dec = dec - missing
        parts = re.sub(r'0+$', '', '{:f}'.format(precision_dec)).split('.')
        if len(parts) > 1:
            new_precision = len(parts[1])
        else:
            match = re.search(r'0+$', parts[0])
            if match is None:
                new_precision = 0
            else:
                new_precision = - len(match.group(0))
        return decimal_to_precision('{:f}'.format(dec), ROUND, new_precision, DECIMAL_PLACES, padding_mode)

    if rounding_mode == ROUND:
        if counting_mode == DECIMAL_PLACES:
            precise = '{:f}'.format(dec.quantize(power_of_10(precision)))  # ROUND_HALF_EVEN is default context
        elif counting_mode == SIGNIFICANT_DIGITS:
            q = precision - dec.adjusted() - 1
            sigfig = power_of_10(q)
            if q < 0:
                string_to_precision = string[:precision]
                # string_to_precision is '' when we have zero precision
                below = sigfig * decimal.Decimal(string_to_precision if string_to_precision else '0')
                above = below + sigfig
                precise = '{:f}'.format(min((below, above), key=lambda x: abs(x - dec)))
            else:
                precise = '{:f}'.format(dec.quantize(sigfig))
        if precise == ('-0.' + len(precise) * '0')[:2] or precise == '-0':
            precise = precise[1:]

    elif rounding_mode == TRUNCATE:
        # Slice a string
        if counting_mode == DECIMAL_PLACES:
            before, after = string.split('.') if '.' in string else (string, '')
            precise = before + '.' + after[:precision]
        elif counting_mode == SIGNIFICANT_DIGITS:
            if precision == 0:
                return '0'
            dot = string.index('.') if '.' in string else len(string)
            start = dot - dec.adjusted()
            end = start + precision
            # need to clarify these conditionals
            if dot >= end:
                end -= 1
            if precision >= len(string.replace('.', '')):
                precise = string
            else:
                precise = string[:end].ljust(dot, '0')
        if precise == ('-0.' + len(precise) * '0')[:3] or precise == '-0':
            precise = precise[1:]
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


def number_to_string(x):
    # avoids scientific notation for too large and too small numbers
    d = decimal.Decimal(str(x))
    formatted = '{:f}'.format(d)
    return formatted.rstrip('0').rstrip('.') if '.' in formatted else formatted

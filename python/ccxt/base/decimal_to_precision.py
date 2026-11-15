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

# hoisted module-level constants, they are looked up on every call
_DECIMAL_TEN = decimal.Decimal('10')
_UNDERFLOW = decimal.Underflow
_ROUND_HALF_UP = decimal.ROUND_HALF_UP

# Decimal('10') ** (-x) is exact and context-independent for x >= 0 (the
# coefficient is always a single digit), so those values can be memoized.
# For x < 0 the result is 10 ** abs(x), whose coefficient is padded to the
# context precision, so it must be recomputed against the live context.
_POWERS_OF_10 = {x: _DECIMAL_TEN ** (-x) for x in range(0, 33)}


def power_of_10(x):
    # the cache is only consulted for exact ints: other numeric types that
    # compare equal to an int (numpy scalars and the like) must keep going
    # through the original expression so their own operator semantics apply
    if type(x) is int and x >= 0:
        result = _POWERS_OF_10.get(x)
        if result is not None:
            return result
        result = _DECIMAL_TEN ** (-x)
        if x < 1024:
            _POWERS_OF_10[x] = result
        return result
    return _DECIMAL_TEN ** (-x)


def decimal_to_precision(n, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING):
    assert precision is not None, 'precision should not be None'

    if isinstance(precision, str):
        precision = float(precision)
    # `type(x) is int/float` is a cheap fast path for the two types that
    # actually reach this function; anything else falls back to the original
    # (much slower) abc-based isinstance checks, so behaviour is unchanged.
    precision_type = type(precision)
    is_int = precision_type is int
    assert is_int or precision_type is float or isinstance(precision, (float, decimal.Decimal, numbers.Integral)), 'precision has an invalid number'

    if counting_mode == TICK_SIZE:
        assert precision > 0, 'negative or zero precision can not be used with TICK_SIZE precisionMode'
    else:
        assert is_int or isinstance(precision, numbers.Integral)

    assert rounding_mode in [TRUNCATE, ROUND]
    assert counting_mode in [DECIMAL_PLACES, SIGNIFICANT_DIGITS, TICK_SIZE]
    assert padding_mode in [NO_PADDING, PAD_WITH_ZERO]
    # end of checks

    context = decimal.getcontext()

    if counting_mode != TICK_SIZE:
        # equivalent to min(context.prec - 2, precision), including the case
        # where the two compare equal and min() returns its first argument
        max_precision = context.prec - 2
        if precision >= max_precision:
            precision = max_precision

    # all default except decimal.Underflow (raised when a number is rounded to zero)
    context.traps[_UNDERFLOW] = True
    context.rounding = _ROUND_HALF_UP  # rounds 0.5 away from zero

    dec = decimal.Decimal(str(n))
    if is_int:
        # the common case, Decimal(str(int)) is always valid and only the
        # TICK_SIZE branch below needs it, so build it lazily there
        precision_dec = None
    else:
        # keep the original eager conversion for every other type: it is what
        # rejects e.g. a bool precision with InvalidOperation
        precision_dec = decimal.Decimal(str(precision))
    precise = None

    if precision < 0:
        if counting_mode == TICK_SIZE:
            raise ValueError('TICK_SIZE cant be used with negative numPrecisionDigits')
        to_nearest = power_of_10(precision)
        if rounding_mode == ROUND:
            return format(to_nearest * decimal.Decimal(decimal_to_precision(dec / to_nearest, rounding_mode, 0, DECIMAL_PLACES, padding_mode)), 'f')
        elif rounding_mode == TRUNCATE:
            return decimal_to_precision(dec - dec % to_nearest, rounding_mode, 0, DECIMAL_PLACES, padding_mode)

    if counting_mode == TICK_SIZE:
        if precision_dec is None:
            precision_dec = decimal.Decimal(str(precision))
        # python modulo with negative numbers behaves different than js/php, so use abs first
        missing = abs(dec) % precision_dec
        if missing != 0:
            if rounding_mode == ROUND:
                if dec > 0:
                    if missing >= precision_dec / 2:
                        dec = dec - missing + precision_dec
                    else:
                        dec = dec - missing
                else:
                    if missing >= precision_dec / 2:
                        dec = dec + missing - precision_dec
                    else:
                        dec = dec + missing
            elif rounding_mode == TRUNCATE:
                if dec < 0:
                    dec = dec + missing
                else:
                    dec = dec - missing
        # rstrip('0') removes exactly the trailing run of zeros matched by r'0+$'
        parts = format(precision_dec, 'f').rstrip('0').split('.')
        if len(parts) > 1:
            new_precision = len(parts[1])
        else:
            match = re.search(r'0+$', parts[0])
            if match is None:
                new_precision = 0
            else:
                new_precision = - len(match.group(0))
        return decimal_to_precision(format(dec, 'f'), ROUND, new_precision, DECIMAL_PLACES, padding_mode)

    if rounding_mode == ROUND:
        if counting_mode == DECIMAL_PLACES:
            precise = format(dec.quantize(power_of_10(precision)), 'f')  # ROUND_HALF_EVEN is default context
        elif counting_mode == SIGNIFICANT_DIGITS:
            q = precision - dec.adjusted() - 1
            sigfig = power_of_10(q)
            if q < 0:
                # convert to string using .format to avoid engineering notation
                string_to_precision = format(dec, 'f')[:precision]
                # string_to_precision is '' when we have zero precision
                below = sigfig * decimal.Decimal(string_to_precision if string_to_precision else '0')
                above = below + sigfig
                precise = format(min((below, above), key=lambda x: abs(x - dec)), 'f')
            else:
                precise = format(dec.quantize(sigfig), 'f')
        if precise.startswith('-0') and all(c in '0.' for c in precise[1:]):
            precise = precise[1:]

    elif rounding_mode == TRUNCATE:
        # Slice a string
        string = format(dec, 'f')  # convert to string using .format to avoid engineering notation
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
        if precise.startswith('-0') and all(c in '0.' for c in precise[1:]):
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
    if x is None:
        return None
    d = decimal.Decimal(str(x))
    formatted = format(d, 'f')
    return formatted.rstrip('0').rstrip('.') if '.' in formatted else formatted

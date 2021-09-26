import decimal
import numbers
import math
from ccxt.base.precise import Precise

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


def decimal_to_precision_p(x, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING):
    assert isinstance(x, Precise)
    assert precision is not None
    assert isinstance(precision, Precise)
    if counting_mode == TICK_SIZE:
        if precision.integer <= 0:
            raise ValueError('TICK_SIZE cant be used with negative or zero precision')

    if precision.integer < 0:
        toNearest = precision.neg().pow10()
        if rounding_mode == ROUND:
            return str(x.div(toNearest).round().mul(toNearest))
        elif rounding_mode == TRUNCATE:
            if x.integer >= 0:
                return str(x.div(toNearest).floor().mul(toNearest))
            else:
                return str(x.div(toNearest).ceil().mul(toNearest))

    # handle tick size
    if counting_mode == TICK_SIZE:
        precision.reduce()
        newprecision = precision.decimals if precision.decimals > 0 else 0
        remainder = x.mod(precision)
        if remainder.integer != 0:
            if rounding_mode == ROUND:
                x = x.div(precision).round().mul(precision)
            elif rounding_mode == TRUNCATE:
                if x.integer >= 0:
                    x = x.div(precision).floor().mul(precision)
                else:
                    x = x.div(precision).ceil().mul(precision)
        rounding_mode = ROUND
        precision = Precise(newprecision, 0)
        counting_mode = DECIMAL_PLACES
        # return decimal_to_precision(x, ROUND, newprecision, DECIMAL_PLACES, padding_mode)

    assert((counting_mode == DECIMAL_PLACES) or (counting_mode == SIGNIFICANT_DIGITS))
    assert(precision.decimals <= 0)
    precision_int = precision.integer * (precision.base ** precision.decimals)
    assert((rounding_mode == ROUND) or (rounding_mode == TRUNCATE))

    result = ''

    if rounding_mode == ROUND:
        if counting_mode == DECIMAL_PLACES:
            to_nearest = precision.neg().pow10()
        elif counting_mode == SIGNIFICANT_DIGITS:
            if x.integer == 0:
                assert(x.decimals == 0)
                significant_position = 0
            else:
                significant_position = len(str(abs(x.integer))) - x.decimals
            precision_digits = significant_position - precision_int
            to_nearest = Precise(precision_digits, 0).pow10()
        x = x.div(to_nearest).round().mul(to_nearest)
        rounding_mode = TRUNCATE

    x.reduce()
    sign = '-' if x.integer < 0 else ''
    integer_string = str(abs(x.integer))
    integer_array = list(integer_string.rjust(x.decimals, '0'))
    index = len(integer_array) - x.decimals
    if index == 0:
        item = '0.'
    else:
        item = '.'

    assert(rounding_mode == TRUNCATE)
    if counting_mode == DECIMAL_PLACES:
        adjustment_digits = precision_int - x.decimals
    elif counting_mode == SIGNIFICANT_DIGITS:
        if integer_string == "0":
            assert(x.decimals == 0)
            significant_position = 0
        else:
            significant_position = len(integer_string) - x.decimals
        adjustment_digits = (precision_int - significant_position) - x.decimals
    if adjustment_digits > 0:
        if padding_mode == NO_PADDING:
            adjustment_digits = max(-x.decimals, 0)
        if adjustment_digits != 0:
            integer_array = integer_array + list("".rjust(adjustment_digits, '0'))
    elif adjustment_digits < 0:
        if -adjustment_digits <= x.decimals:
            integer_array = integer_array[0:adjustment_digits]
        else:
            if len(integer_array) == -adjustment_digits:
                count = len(integer_array) - x.decimals - 1
                integer_array = integer_array[0:count]
                index = index - count
                integer_array[0] = '0'
            else:
                ibegin = len(integer_array) + adjustment_digits
                iend = len(integer_array) - max(x.decimals, 0)
                for i in range(ibegin, iend):
                    integer_array[i] = '0'
            if x.decimals > 0:
                integer_array = integer_array[0:-x.decimals]
            elif x.decimals < 0:
                integer_array = integer_array + list("".rjust(-x.decimals, '0'))
    integer_array.insert(index, item)
    result = sign + ''.join(integer_array)

    has_dot = '.' in result
    if padding_mode == NO_PADDING:
        if ((result == '') and (precision_int == 0)):
            return '0'
        if has_dot:
            result = result.rstrip('0')
    if has_dot:
        result = result.rstrip('.')
    if ((result == "-0") or (result == '-0.' + ('0' * max(len(result) - 3, 0)))):
        result = result[1:]

    return result


def decimal_to_precision(x, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING):
    assert precision is not None

    if isinstance(precision, str):
        precision = Precise(precision)
    elif isinstance(precision, numbers.Integral):
        precision = Precise(precision, 0)
    elif isinstance(precision, float):
        # Occurrences of this should be eliminated and replaced by strings instead.
        # ASSUME that the precision is specified to two decimal places.
        exponent = math.floor(math.log10(precision)) - 1
        mantissa = round(precision / math.pow(10, exponent))
        precision = Precise(mantissa, -exponent)
    else:
        assert isinstance(precision, Precise)

    if isinstance(x, str):
        x = Precise(x)
    elif isinstance(x, numbers.Integral):
        x = Precise(x, 0)
    elif isinstance(x, float):
        # Occurrences of this should be eliminated and replaced by strings instead.
        # FIXME I suspect there is a bug here because a floating point number is passed to BigInt
        # without checking if there is a fractional component.
        x = Precise(x, 0)
    else:
        assert isinstance(x, Precise)

    return decimal_to_precision_p(x, rounding_mode, precision, counting_mode, padding_mode)


def number_to_string(x):
    # avoids scientific notation for too large and too small numbers
    if x is None:
        return None
    d = decimal.Decimal(str(x))
    formatted = '{:f}'.format(d)
    return formatted.rstrip('0').rstrip('.') if '.' in formatted else formatted

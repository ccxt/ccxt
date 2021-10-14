import decimal
import numbers
import math
# import re
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
ROUND = 1
TRUNCATE = 2
ROUND_UP = 4
ROUND_DOWN = 8

# digits counting mode
DECIMAL_PLACES = 16
SIGNIFICANT_DIGITS = 32
TICK_SIZE = 64

# padding mode
NO_PADDING = 128
PAD_WITH_ZERO = 256


def decimal_to_precision(x, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING):
    assert precision is not None

    if x is None:
        raise ValueError('x is None, but it must be a string number or a number')

    # handle tick size
    if counting_mode == TICK_SIZE:
        if isinstance(precision, str):
            precision_p = Precise(precision)
        elif isinstance(precision, numbers.Integral):
            precision_p = Precise(precision, 0)
        elif isinstance(precision, float):
            # Occurrences of this should be eliminated and replaced by strings instead.
            exponent = math.floor(math.log10(precision)) - 15 + 1
            mantissa = round(precision / math.pow(10, exponent))
            precision_p = Precise(mantissa, -exponent)
            precision_p.reduce()
        else:
            raise ValueError('precision must be a string number or a number')
        if precision_p.integer <= 0:
            raise ValueError('TICK_SIZE cant be used with negative or zero precision')
        if isinstance(x, str):
            x_p = Precise(x)
        elif isinstance(x, numbers.Integral):
            x_p = Precise(x, 0)
        elif isinstance(x, float):
            # Occurrences of this should be eliminated and replaced by strings instead.
            exponent = math.floor(math.log10(math.abs(x))) - 15 + 1
            mantissa = round(x / math.pow(10, exponent))
            x_p = Precise(mantissa, -exponent)
            x_p.reduce()
        else:
            raise ValueError('x must be a string number or a number')
        new_precision = precision_p.decimals if precision_p.decimals > 0 else 0
        remainder_p = x_p.mod(precision_p)
        if remainder_p.integer != 0:
            if rounding_mode == ROUND:
                x_p = x_p.div(precision_p).round().mul(precision_p)
            elif rounding_mode == TRUNCATE:
                if x_p.integer >= 0:
                    x_p = x_p.div(precision_p).floor().mul(precision_p)
                else:
                    x_p = x_p.div(precision_p).ceil().mul(precision_p)
        x = str(x_p)
        rounding_mode = ROUND
        precision_num = new_precision
        counting_mode = DECIMAL_PLACES
        # return decimal_to_precision(x, ROUND, newprecision, DECIMAL_PLACES, padding_mode)
    else:
        if isinstance(x, float) or isinstance(x, numbers.Integral):
            x = str(x)
        elif not isinstance(x, str):
            raise ValueError('x must be a string number or a number')
        # assert re.fullmatch('-?[0-9]+(\.[0-9]*)?', x)
        if isinstance(precision, str):
            # if not re.fullmatch('-?[0-9]+', precision):
            #    raise ValueError('precision must be a string integer or a integer')
            precision_num = int(precision)
        elif isinstance(precision, numbers.Integral):
            precision_num = precision
        else:
            raise ValueError('precision must be a string integer or a integer')
    if counting_mode == SIGNIFICANT_DIGITS:
        if precision_num < 0:
            raise ValueError('SIGNIFICANT_DIGITS cant be used with negative precision')
        if precision_num == 0:
            return '0'
    point_index = x.find('.')
    if point_index == -1:
        point_index = len(x)
    first_digit_pos = 0
    while first_digit_pos < len(x) and (x[first_digit_pos] < '1' or x[first_digit_pos] > '9'):
        first_digit_pos += 1
    if counting_mode == DECIMAL_PLACES:
        last_digit_pos = point_index + precision_num
        if last_digit_pos < point_index:
            last_digit_pos -= 1
    elif counting_mode == SIGNIFICANT_DIGITS:
        last_digit_pos = first_digit_pos + precision_num
        if (first_digit_pos < point_index and last_digit_pos < point_index) or first_digit_pos > point_index:
            last_digit_pos -= 1
    else:
        assert False
    char_array = list(x)
    if rounding_mode == ROUND:
        p = last_digit_pos
        p2 = p + 1
        if point_index == p2 and point_index != len(char_array):
            p2 += 1
        carry = 0
        while (p >= 0 and p < len(char_array) and char_array[p] != '-') or p2 >= 0:
            if p >= len(char_array):
                break
            if p2 >= len(char_array) or ord(char_array[p2]) - ord('0') + 10 * carry < 5:
                break
            carry = 1
            if p == -1:
                char_array.insert(p + 1, chr(ord('0') + carry))
                p += 1
                point_index += 1
                if counting_mode == DECIMAL_PLACES:
                    last_digit_pos += 1
                break
            elif ord(char_array[p]) - ord('0') + carry <= 9:
                char_array[p] = chr(ord(char_array[p]) + carry)
                if p < first_digit_pos:
                    delta = p - first_digit_pos
                    first_digit_pos += delta
                    if counting_mode == SIGNIFICANT_DIGITS:
                        last_digit_pos += delta
                break
            char_array[p] = '0'
            p2 = p
            p -= 1
            if p != -1 and char_array[p] == '.':
                p -= 1
            if p == -1 or char_array[p] == '-':
                char_array.insert(p + 1, chr(ord('0') + carry))
                p += 1
                point_index += 1
                if counting_mode == DECIMAL_PLACES:
                    last_digit_pos += 1
                break
        if last_digit_pos < 0 or (last_digit_pos < len(char_array) and char_array[last_digit_pos] == '-'):
            return '0'
        for p in range(last_digit_pos + 1, len(char_array)):
            if p != point_index:
                char_array[p] = '0'
    elif rounding_mode == TRUNCATE:
        if last_digit_pos < 0 or (last_digit_pos < len(char_array) and char_array[last_digit_pos] == '-'):
            return '0'
        for p in range(last_digit_pos + 1, point_index):
            char_array[p] = '0'
    else:
        assert False
    result = ''.join(char_array[0:max(point_index, last_digit_pos + 1)])
    has_dot = '.' in result
    if padding_mode == NO_PADDING:
        if (len(result) == 0) and (precision_num == 0):
            return '0'
        if has_dot:
            result = result.rstrip('0')
    elif padding_mode == PAD_WITH_ZERO:
        if len(result) < last_digit_pos:
            if point_index == len(result):
                result += '.'
            result += '0' * (last_digit_pos - len(result) + 1)
    else:
        assert False
    if has_dot:
        result = result.rstrip('.')
    if ((result == "-0") or (result == '-0.' + ('0' * max(len(result) - 3, 0)))):
        result = result[1:]
    return result


def number_to_string(x):
    # avoids scientific notation for too large and too small numbers
    if x is None:
        return None
    d = decimal.Decimal(str(x))
    formatted = '{:f}'.format(d)
    return formatted.rstrip('0').rstrip('.') if '.' in formatted else formatted

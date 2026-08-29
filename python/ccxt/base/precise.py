# Author: carlo.revelli@berkeley.edu
#
# Precise
# Representation
# Expanding
# CCXT
# Internal
# Scientific
# Exponents
#
# (╯°□°）╯︵ ┻━┻


# static bounded lookup table for 10^n, n in [0, 128] — order-independent,
# never invalidated, uniform O(1) cost for any input (falls back to
# exponentiation for exponents beyond the table)
POW10_LIMIT = 129
POW10 = [10 ** i for i in range(POW10_LIMIT)]


def pow10(exponent):
    return POW10[exponent] if exponent < POW10_LIMIT else 10 ** exponent


class Precise:
    def __init__(self, number, decimals=None):
        if decimals is None:
            modifier = 0
            # scientific notation is rare — only lower and split when an
            # exponent marker is actually present
            if 'e' in number or 'E' in number:
                number = number.lower()
                number, modifier = number.split('e')
                modifier = int(modifier)
            decimal_index = number.find('.')
            if decimal_index > -1:
                self.decimals = len(number) - decimal_index - 1 - modifier
                self.integer = int(number.replace('.', ''))
            else:
                self.integer = int(number)
                self.decimals = -modifier
        else:
            self.integer = number
            self.decimals = decimals
        self.base = 10

    def __add__(self, other):
        return self.add(other)

    def __sub__(self, other):
        return self.sub(other)

    def __mul__(self, other):
        return self.mul(other)

    def __truediv__(self, other):
        return self.div(other)

    def __mod__(self, other):
        return self.mod(other)

    def __neg__(self):
        return self.neg()

    def __abs__(self):
        return self.abs()

    def __min__(self, other):
        return self.min(other)

    def __max__(self, other):
        return self.max(other)

    def __lt__(self, other):
        return self.lt(other)

    def __le__(self, other):
        return self.le(other)

    def __gt__(self, other):
        return self.gt(other)

    def __ge__(self, other):
        return self.ge(other)

    def __eq__(self, other):
        if isinstance(other, str):
            # Allow comparisons with Precise("5") == "5"
            return str(self) == other
        return self.equals(other)

    def mul(self, other):
        integer_result = self.integer * other.integer
        return Precise(integer_result, self.decimals + other.decimals)

    def div(self, other, precision=18):
        distance = precision - self.decimals + other.decimals
        if distance == 0:
            numerator = self.integer
        elif distance < 0:
            numerator = self.integer // pow10(-distance)
        else:
            numerator = self.integer * pow10(distance)
        result, mod = divmod(numerator, other.integer)
        # python floors negative numbers down instead of truncating
        # if mod is zero it will be floored to itself so we do not add one
        result = result + 1 if result < 0 and mod else result
        return Precise(result, precision)

    def add(self, other):
        if self.decimals == other.decimals:
            integer_result = self.integer + other.integer
            return Precise(integer_result, self.decimals)
        if self.decimals > other.decimals:
            normalised = other.integer * pow10(self.decimals - other.decimals)
            return Precise(normalised + self.integer, self.decimals)
        normalised = self.integer * pow10(other.decimals - self.decimals)
        return Precise(normalised + other.integer, other.decimals)

    def sub(self, other):
        # inlined addition of the negation, avoiding an intermediate instance
        if self.decimals == other.decimals:
            return Precise(self.integer - other.integer, self.decimals)
        if self.decimals > other.decimals:
            normalised = other.integer * pow10(self.decimals - other.decimals)
            return Precise(self.integer - normalised, self.decimals)
        normalised = self.integer * pow10(other.decimals - self.decimals)
        return Precise(normalised - other.integer, other.decimals)

    def abs(self):
        return Precise(abs(self.integer), self.decimals)

    def neg(self):
        return Precise(-self.integer, self.decimals)

    def mod(self, other):
        rationizer_numerator = max(other.decimals - self.decimals, 0)
        numerator = self.integer * pow10(rationizer_numerator)
        rationizer_denominator = max(self.decimals - other.decimals, 0)
        denominator = other.integer * pow10(rationizer_denominator)
        result = numerator % denominator
        return Precise(result, rationizer_denominator + other.decimals)

    def orn(self, other):
        integer_result = self.integer | other.integer
        return Precise(integer_result, self.decimals)

    # aligned comparison without intermediate instance allocation:
    # aligns the operand with fewer decimals by multiplying its integer
    # by 10^difference, then compares the scaled integers
    def cmp(self, other):
        this_decimals = self.decimals
        other_decimals = other.decimals
        if this_decimals == other_decimals:
            this_integer = self.integer
            other_integer = other.integer
        elif this_decimals > other_decimals:
            this_integer = self.integer
            other_integer = other.integer * pow10(this_decimals - other_decimals)
        else:
            this_integer = self.integer * pow10(other_decimals - this_decimals)
            other_integer = other.integer
        if this_integer < other_integer:
            return -1
        return 1 if this_integer > other_integer else 0

    def min(self, other):
        return self if self.cmp(other) < 0 else other

    def max(self, other):
        return self if self.cmp(other) > 0 else other

    def gt(self, other):
        return self.cmp(other) > 0

    def ge(self, other):
        return self.cmp(other) >= 0

    def lt(self, other):
        return self.cmp(other) < 0

    def le(self, other):
        return self.cmp(other) <= 0

    # internal: strips trailing zero digits from the integer representation
    # and returns the reduced digit string (sign included) so callers that
    # immediately stringify avoid a second integer-to-string conversion
    def reduce_digits(self):
        string = str(self.integer)
        if string == '0':
            self.decimals = 0
            return string
        reduced = string.rstrip('0')
        difference = len(string) - len(reduced)
        if difference == 0:
            return string
        self.decimals -= difference
        self.integer = int(reduced)
        return reduced

    # reduces the representation in place, returns the instance so calls
    # can be chained (Precise('10.00').reduce() == Precise('10'))
    def reduce(self):
        self.reduce_digits()
        return self

    def equals(self, other):
        self.reduce()
        other.reduce()
        return self.decimals == other.decimals and self.integer == other.integer

    def __str__(self):
        digits = self.reduce_digits()
        if digits[0] == '-':
            sign = '-'
            digits = digits[1:]
        else:
            sign = ''
        decimals = self.decimals
        if decimals <= 0:
            return sign + digits + '0' * (-decimals)
        length = len(digits)
        if length > decimals:
            index = length - decimals
            return sign + digits[:index] + '.' + digits[index:]
        if length < decimals:
            return sign + '0.' + '0' * (decimals - length) + digits
        return sign + '0.' + digits

    def __repr__(self):
        return "Precise(" + str(self) + ")"

    def __float__(self):
        return float(str(self))

    @staticmethod
    def string_mul(string1, string2):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).mul(Precise(string2)))

    @staticmethod
    def string_div(string1, string2, precision=18):
        if string1 is None or string2 is None:
            return None
        string2_precise = Precise(string2)
        if string2_precise.integer == 0:
            return None
        return str(Precise(string1).div(string2_precise, precision))

    @staticmethod
    def string_add(string1, string2):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).add(Precise(string2)))

    @staticmethod
    def string_sub(string1, string2):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).sub(Precise(string2)))

    @staticmethod
    def string_abs(string):
        if string is None:
            return None
        return str(Precise(string).abs())

    @staticmethod
    def string_neg(string):
        if string is None:
            return None
        return str(Precise(string).neg())

    @staticmethod
    def string_mod(string1, string2):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).mod(Precise(string2)))

    @staticmethod
    def string_or(string1, string2):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).orn(Precise(string2)))

    @staticmethod
    def string_equals(string1, string2):
        if string1 is None or string2 is None:
            return False
        return Precise(string1).equals(Precise(string2))

    @staticmethod
    def string_eq(string1, string2):
        if string1 is None or string2 is None:
            return False
        return Precise(string1).equals(Precise(string2))

    @staticmethod
    def string_min(string1, string2):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).min(Precise(string2)))

    @staticmethod
    def string_max(string1, string2):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).max(Precise(string2)))

    @staticmethod
    def string_gt(string1, string2):
        if string1 is None or string2 is None:
            return False
        return Precise(string1).gt(Precise(string2))

    @staticmethod
    def string_ge(string1, string2):
        if string1 is None or string2 is None:
            return False
        return Precise(string1).ge(Precise(string2))

    @staticmethod
    def string_lt(string1, string2):
        if string1 is None or string2 is None:
            return False
        return Precise(string1).lt(Precise(string2))

    @staticmethod
    def string_le(string1, string2):
        if string1 is None or string2 is None:
            return False
        return Precise(string1).le(Precise(string2))

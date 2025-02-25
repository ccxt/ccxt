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


class Precise:
    def __init__(self, number, decimals=None):
        if decimals is None:
            modifier = 0
            number = number.lower()
            if 'e' in number:
                number, modifier = number.split('e')
                modifier = int(modifier)
            decimal_index = number.find('.')
            if decimal_index > -1:
                self.decimals = len(number) - decimal_index - 1
                self.integer = int(number.replace('.', ''))
            else:
                self.decimals = 0
                self.integer = int(number)
            self.decimals = self.decimals - modifier
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
            exponent = self.base ** -distance
            numerator = self.integer // exponent
        else:
            exponent = self.base ** distance
            numerator = self.integer * exponent
        result, mod = divmod(numerator, other.integer)
        # python floors negative numbers down instead of truncating
        # if mod is zero it will be floored to itself so we do not add one
        result = result + 1 if result < 0 and mod else result
        return Precise(result, precision)

    def add(self, other):
        if self.decimals == other.decimals:
            integer_result = self.integer + other.integer
            return Precise(integer_result, self.decimals)
        else:
            smaller, bigger = [other, self] if self.decimals > other.decimals else [self, other]
            exponent = bigger.decimals - smaller.decimals
            normalised = smaller.integer * (self.base ** exponent)
            result = normalised + bigger.integer
            return Precise(result, bigger.decimals)

    def sub(self, other):
        negative = Precise(-other.integer, other.decimals)
        return self.add(negative)

    def abs(self):
        return Precise(abs(self.integer), self.decimals)

    def neg(self):
        return Precise(-self.integer, self.decimals)

    def mod(self, other):
        rationizerNumberator = max(-self.decimals + other.decimals, 0)
        numerator = self.integer * (self.base ** rationizerNumberator)
        rationizerDenominator = max(-other.decimals + self.decimals, 0)
        denominator = other.integer * (self.base ** rationizerDenominator)
        result = numerator % denominator
        return Precise(result, rationizerDenominator + other.decimals)

    def orn(self, other):
        integer_result = self.integer | other.integer
        return Precise(integer_result, self.decimals)

    def min(self, other):
        return self if self.lt(other) else other

    def max(self, other):
        return self if self.gt(other) else other

    def gt(self, other):
        add = self.sub(other)
        return add.integer > 0

    def ge(self, other):
        add = self.sub(other)
        return add.integer >= 0

    def lt(self, other):
        return other.gt(self)

    def le(self, other):
        return other.ge(self)

    def reduce(self):
        string = str(self.integer)
        start = len(string) - 1
        if start == 0:
            if string == "0":
                self.decimals = 0
            return self
        for i in range(start, -1, -1):
            if string[i] != '0':
                break
        difference = start - i
        if difference == 0:
            return self
        self.decimals -= difference
        self.integer = int(string[:i + 1])

    def equals(self, other):
        self.reduce()
        other.reduce()
        return self.decimals == other.decimals and self.integer == other.integer

    def __str__(self):
        self.reduce()
        sign = '-' if self.integer < 0 else ''
        integer_array = list(str(abs(self.integer)).rjust(self.decimals, '0'))
        index = len(integer_array) - self.decimals
        if index == 0:
            item = '0.'
        elif self.decimals < 0:
            item = '0' * (-self.decimals)
        elif self.decimals == 0:
            item = ''
        else:
            item = '.'
        integer_array.insert(index, item)
        return sign + ''.join(integer_array)

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
        if string1 is None and string2 is None:
            return None
        if string1 is None:
            return string2
        elif string2 is None:
            return string1
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
            return None
        return Precise(string1).equals(Precise(string2))

    @staticmethod
    def string_eq(string1, string2):
        if string1 is None or string2 is None:
            return None
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
            return None
        return Precise(string1).gt(Precise(string2))

    @staticmethod
    def string_ge(string1, string2):
        if string1 is None or string2 is None:
            return None
        return Precise(string1).ge(Precise(string2))

    @staticmethod
    def string_lt(string1, string2):
        if string1 is None or string2 is None:
            return None
        return Precise(string1).lt(Precise(string2))

    @staticmethod
    def string_le(string1, string2):
        if string1 is None or string2 is None:
            return None
        return Precise(string1).le(Precise(string2))

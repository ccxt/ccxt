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
    def __init__(self, number, decimals=0):
        is_string = isinstance(number, str)
        is_int = isinstance(number, int)
        if not (is_string or is_int):
            raise RuntimeError('Precise class initiated with something other than a string or int')
        if is_int:
            self.integer = number
            self.decimals = decimals
        else:
            if decimals:
                raise RuntimeError('Cannot set decimals when initializing with a string')
            modifier = 0
            number = number.lower()
            if 'e' in number:
                number, modifier = number.split('e')
                modifier = int(modifier)
            decimal_index = number.find('.')
            self.decimals = len(number) - decimal_index - 1 if decimal_index > -1 else 0
            integer_string = number.replace('.', '')
            self.integer = int(integer_string)
            self.decimals = self.decimals - modifier
        self.base = 10
        self.reduce()

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

    def reduce(self):
        if self.integer == 0:
            self.decimals = 0
            return self
        div, mod = divmod(self.integer, self.base)
        while mod == 0:
            self.integer = div
            self.decimals -= 1
            div, mod = divmod(self.integer, self.base)
        return self

    def __str__(self):
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

    @staticmethod
    def string_mul(string1, string2):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).mul(Precise(string2)))

    @staticmethod
    def string_div(string1, string2, precision=18):
        if string1 is None or string2 is None:
            return None
        return str(Precise(string1).div(Precise(string2), precision))

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

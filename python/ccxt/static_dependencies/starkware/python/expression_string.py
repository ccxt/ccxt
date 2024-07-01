"""
The class ExpressionString allows creating strings that represent arithmetic expressions with the
correct amount of parentheses.

For example, you may define:
    a = ExpressionString.highest('a')
    b = ExpressionString.highest('b')
    ...
And then,
    str((a + b) * (c * (d + e)) == '(a + b) * c * (d + e)'
"""


from enum import Enum, auto


class OperatorPrecedence(Enum):
    """
    Represents the precedence of an operator.
    """

    LOWEST = 0  # Unary minus.
    PLUS = auto()  # Either + or -.
    MUL = auto()  # Either * or /.
    POW = auto()  # Power (**).
    ADDROF = auto()  # Address-of operator (&).
    HIGHEST = auto()  # Numeric values, variables, parenthesized expressions, ...

    def __lt__(self, other):
        return self.value < other.value


class ExpressionString:
    """
    Represents a string which contains an arithmetic expression, together with the precedence of the
    outmost operator in this expression (the root of the derivation tree).
    This allows to combine expression without unnecessary parentheses.
    For example, if a=4*19 and b=20*54 are two expressions, then the lowest operation in both
    is '*'. In this case a + b and a * b do not require parentheses:
        a + b: 4 * 19 + 20 * 54
        a * b: 4 * 19 * 20 * 54
    whereas a^b does:
        a^b: (4 * 19)^(20 * 54)
    """

    def __init__(self, txt, outmost_operator_precedence):
        self.txt = txt
        self.outmost_operator_precedence = outmost_operator_precedence

    @staticmethod
    def highest(txt):
        return ExpressionString(txt, OperatorPrecedence.HIGHEST)

    @staticmethod
    def lowest(txt):
        return ExpressionString(txt, OperatorPrecedence.LOWEST)

    def __format__(self, format_spec: str) -> str:
        """
        format_spec should be the lowest operator precedence (e.g., 'PLUS', 'MUL', ...) from which
        the resulting string does not require parentheses. If the current outmost operator
        precedence is lower than the precedence in the format specification, parentheses will be
        added.

        For example, consider the format string '{x:MUL} * {y:MUL}'.
        If x is the expression '5 + 7', parentheses will be added (as PLUS is lower than MUL) and
        the result will start with '(5 + 7) * ...'. On the other hand, expressions such as '5 * 7'
        and '5^7' will not require parentheses, and the result will start with '5 * 7 * ...' or
        '5^7 * ...'.
        """
        if format_spec == "":
            format_spec = "LOWEST"
        return self._maybe_add_parentheses(OperatorPrecedence[format_spec])

    def __str__(self):
        return self.txt

    def __add__(self, other):
        other = to_expr_string(other)
        return ExpressionString(f"{self:PLUS} + {other:PLUS}", OperatorPrecedence.PLUS)

    def __sub__(self, other):
        # Note that self and other are not symmetric. For example (a + b) - (c + d) should be:
        #   a + b - (c + d).
        other = to_expr_string(other)
        return ExpressionString(f"{self:PLUS} - {other:MUL}", OperatorPrecedence.PLUS)

    def __mul__(self, other):
        other = to_expr_string(other)
        return ExpressionString(f"{self:MUL} * {other:MUL}", OperatorPrecedence.MUL)

    def __truediv__(self, other):
        # Note that self and other are not symmetric. For example (a * b) / (c * d) should be:
        #   a * b / (c * d).
        other = to_expr_string(other)
        return ExpressionString(f"{self:MUL} / {other:POW}", OperatorPrecedence.MUL)

    def __pow__(self, other):
        other = to_expr_string(other)
        # For the two expressions (a^b)^c and a^(b^c), parentheses will always be added.
        return ExpressionString(f"{self:HIGHEST}^{other:HIGHEST}", OperatorPrecedence.POW)

    def double_star_pow(self, other):
        """
        Same as self ** other, except that the text is using " ** " instead of "^".
        """
        other = to_expr_string(other)
        # For the two expressions (a ** b) ** c and a ** (b ** c), parentheses will always be added.
        return ExpressionString(f"{self:HIGHEST} ** {other:HIGHEST}", OperatorPrecedence.POW)

    def __neg__(self):
        # Use OperatorPrecedence.LOWEST (even though the actual precedence of the unary minus is
        # higher) so that parentheses will be added even when lower-precedence operators are used.
        # For example: `(-x) + y`.
        return ExpressionString(f"-{self:ADDROF}", OperatorPrecedence.LOWEST)

    def address_of(self):
        return ExpressionString(f"&{self:ADDROF}", OperatorPrecedence.ADDROF)

    def operator_new(self):
        # Use OperatorPrecedence.LOWEST (even though the actual precedence of the new operator is
        # higher) so that parentheses will be added even when lower-precedence operators are used.
        # For example: `(new x) + y`.
        return ExpressionString(f"new {self:ADDROF}", OperatorPrecedence.LOWEST)

    def prepend(self, txt):
        """
        Prepends the given text to the string, without changing its OperatorPrecedence.
        """
        return ExpressionString(txt + self.txt, self.outmost_operator_precedence)

    def _maybe_add_parentheses(self, operator_precedence: OperatorPrecedence) -> str:
        """
        Returns the expression without parentheses if the current precedence is less than or equal
        to operator_precedence and with parentheses otherwise.
        """
        if self.outmost_operator_precedence < operator_precedence:
            return "(%s)" % self.txt
        else:
            return self.txt


def to_expr_string(val):
    """
    If val is a string, returns it as an ExpressionString of the lowest operation level.
    This means that including it in an expression will cause an addition of parentheses.
    """
    if isinstance(val, str):
        return ExpressionString.lowest(val)
    assert isinstance(val, ExpressionString)
    return val

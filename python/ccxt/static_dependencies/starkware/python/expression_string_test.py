from starkware.python.expression_string import ExpressionString


def test_expression_string():
    # Declare a few variables.
    a = ExpressionString.highest("a")
    b = ExpressionString.highest("b")
    c = ExpressionString.highest("c")
    d = ExpressionString.highest("d")
    e = ExpressionString.highest("e")
    f = ExpressionString.highest("f")

    assert str(a + b + c + d) == "a + b + c + d"
    assert str((a + b) + (c + (d + e) + f)) == "a + b + c + d + e + f"
    assert str((a + b) - (c - (d - e + f))) == "a + b - (c - (d - e + f))"
    assert str(-a + (-b)) == "(-a) + (-b)"

    assert str(a * b * c * d) == "a * b * c * d"
    assert str((a * b) * (c * (d * e) * f)) == "a * b * c * d * e * f"
    assert str((a * b) / (c / (d / e * f))) == "a * b / (c / (d / e * f))"
    assert str((-a) * b) == "(-a) * b"
    assert str(-(a * b)) == "-(a * b)"

    assert str((a + b) * c + d + e * f) == "(a + b) * c + d + e * f"
    assert str(a - (b - c) / (d - e) / f) == "a - (b - c) / (d - e) / f"

    assert str((a**b) ** c) == "(a^b)^c"
    assert str(a**b**c) == "a^(b^c)"
    assert str(a ** ((b**c) ** (d**e)) ** f) == "a^(((b^c)^(d^e))^f)"
    assert str(a / b ** (c + d) * (e + f)) == "a / b^(c + d) * (e + f)"
    assert str(a.double_star_pow(b.double_star_pow(c))) == "a ** (b ** c)"
    assert str((a.double_star_pow(b)).double_star_pow(c)) == "(a ** b) ** c"

    assert str(-a) == "-a"
    assert str(-(a + b) + (-(a - b)) - (-(a - b))) == "(-(a + b)) + (-(a - b)) - (-(a - b))"
    assert str(-(a * b) * (-(a / b)) / (-(a / b))) == "(-(a * b)) * (-(a / b)) / (-(a / b))"
    assert str((-((-a) ** (-b))) ** c) == "(-((-a)^(-b)))^c"
    assert str(-(-a)) == "-(-a)"

    assert str((a**b).address_of().address_of()) == "&&(a^b)"
    assert str((-((-a).address_of())).address_of()) == "&(-&(-a))"
    assert str(a.address_of() - b.address_of()) == "&a - &b"

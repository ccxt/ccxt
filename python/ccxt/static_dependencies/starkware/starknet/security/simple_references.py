from starkware.cairo.lang.compiler.ast.expr import (
    ExprCast,
    ExprConst,
    ExprDeref,
    Expression,
    ExprNeg,
    ExprOperator,
    ExprParentheses,
    ExprReg,
)


class InvalidReferenceExpressionError(Exception):
    pass


class ReferenceExpressionComplexityVisitor:
    """
    Visits an expression that is defined recursively by:
    * (explicit) constant
    * ap, fp
    * addition, subtraction, multiplication, negation
    * dereference.
    Returns a complexity measurement (a cost of 1 for each item).
    Throws InvalidReferenceExpressionError if the expression is not of the form above.
    """

    def visit(self, expr: Expression):
        funcname = f"visit_{type(expr).__name__}"
        if not hasattr(self, funcname):
            raise InvalidReferenceExpressionError()

        return getattr(self, funcname)(expr)

    def visit_ExprConst(self, expr: ExprConst):
        return 1

    def visit_ExprReg(self, expr: ExprReg):
        return 1

    def visit_ExprOperator(self, expr: ExprOperator):
        if expr.op not in ["+", "-", "*"]:
            raise InvalidReferenceExpressionError()
        return self.visit(expr.a) + self.visit(expr.b) + 1

    def visit_ExprNeg(self, expr: ExprNeg):
        return self.visit(expr.val) + 1

    def visit_ExprParentheses(self, expr: ExprParentheses):
        return self.visit(expr.val) + 1

    def visit_ExprDeref(self, expr: ExprDeref):
        return self.visit(expr.addr) + 1


def is_simple_reference(expr: Expression, simplicity_bound: int):
    """
    Returns True if the expression is of the form described in ReferenceExpressionComplexityVisitor
    and of complexity lower than simplicity_bound.
    Expressions of the form cast(simple_expr, type) and [cast(simple_expr, type)] are also allowed.
    """
    # Remove one dereference and one cast from the top of the expression AST, if present.
    if isinstance(expr, ExprDeref):
        expr = expr.addr
        simplicity_bound -= 1
    if isinstance(expr, ExprCast):
        expr = expr.expr
        simplicity_bound -= 1

    try:
        return ReferenceExpressionComplexityVisitor().visit(expr) < simplicity_bound
    except InvalidReferenceExpressionError:
        return False

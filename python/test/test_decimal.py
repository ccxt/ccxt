import os
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root)

# --------------------------------------------------------------------------------------------------------

from base.precision import *


def equal(a, b):
    """I'm lazy"""
    if a != b:
        raise ValueError('{} does not equal {}'.format(a, b))


equal(decimal_to_precision ('12.3456000', TRUNCATE, 20, AFTER_POINT),  '12.3456')
equal(decimal_to_precision ('12.3456',    TRUNCATE, 20, AFTER_POINT),  '12.3456')
equal(decimal_to_precision ('12.3456',    TRUNCATE,   4, AFTER_POINT),  '12.3456')
equal(decimal_to_precision ('12.3456',    TRUNCATE,   3, AFTER_POINT),  '12.345')
equal(decimal_to_precision ('12.3456',    TRUNCATE,   2, AFTER_POINT),  '12.34')
equal(decimal_to_precision ('12.3456',    TRUNCATE,   1, AFTER_POINT),  '12.3')
equal(decimal_to_precision ('12.3456',    TRUNCATE,   0, AFTER_POINT),  '12')
#equal(decimal_to_precision ('12.3456',    TRUNCATE,  -1, AFTER_POINT),  '10')   # not yet supported
#equal(decimal_to_precision ('123.456',    TRUNCATE,  -2, AFTER_POINT),  '120')  # not yet supported
#equal(decimal_to_precision ('123.456',    TRUNCATE,  -3, AFTER_POINT),  '100')  # not yet supported

# --------------------------------------------------------------------------------------------------------


equal(decimal_to_precision ('0.000123456700', TRUNCATE, 20, SIGNIFICANT_DIGITS),  '0.0001234567')
equal(decimal_to_precision ('0.0001234567',   TRUNCATE, 20, SIGNIFICANT_DIGITS),  '0.0001234567')
equal(decimal_to_precision ('0.0001234567',   TRUNCATE, 7,   SIGNIFICANT_DIGITS),  '0.0001234567')

equal(decimal_to_precision ('0.000123456',    TRUNCATE, 6,  SIGNIFICANT_DIGITS),   '0.000123456')
equal(decimal_to_precision ('0.00012345',     TRUNCATE, 5,  SIGNIFICANT_DIGITS),   '0.00012345')
equal(decimal_to_precision ('0.00012',        TRUNCATE, 2,  SIGNIFICANT_DIGITS),   '0.00012')
equal(decimal_to_precision ('0.0001',         TRUNCATE, 1,  SIGNIFICANT_DIGITS),   '0.0001')

equal(decimal_to_precision ('123.0000987654',  TRUNCATE, 10,  SIGNIFICANT_DIGITS),                '123.0000987')
equal(decimal_to_precision ('123.0000987654',  TRUNCATE,  8,  SIGNIFICANT_DIGITS),                '123.00009')
equal(decimal_to_precision ('123.0000987654',  TRUNCATE,  7,  SIGNIFICANT_DIGITS),                '123')
equal(decimal_to_precision ('123.0000987654',  TRUNCATE,  7,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123.0000')
equal(decimal_to_precision ('123.0000987654',  TRUNCATE,  4,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '123.0')

equal(decimal_to_precision ('123.0000987654',  TRUNCATE,  2,  SIGNIFICANT_DIGITS),                '120')
equal(decimal_to_precision ('123.0000987654',  TRUNCATE,  1,  SIGNIFICANT_DIGITS),                '100')
equal(decimal_to_precision ('123.0000987654',  TRUNCATE,  1,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '100')


# --------------------------------------------------------------------------------------------------------


equal(decimal_to_precision ('12.3456000',  ROUND, 20, AFTER_POINT),  '12.3456')
equal(decimal_to_precision ('12.3456',     ROUND, 20, AFTER_POINT),  '12.3456')
equal(decimal_to_precision ('12.3456',     ROUND,   4, AFTER_POINT),  '12.3456')
equal(decimal_to_precision ('12.3456',     ROUND,   3, AFTER_POINT),  '12.346')
equal(decimal_to_precision ('12.3456',     ROUND,   2, AFTER_POINT),  '12.35')
equal(decimal_to_precision ('12.3456',     ROUND,   1, AFTER_POINT),  '12.3')
equal(decimal_to_precision ('12.3456',     ROUND,   0, AFTER_POINT),  '12')
#   equal(decimal_to_precision ('12.3456',     ROUND,  -1, AFTER_POINT),  '10')  // not yet supported
#   equal(decimal_to_precision ('123.456',     ROUND,  -1, AFTER_POINT), '120')  // not yet supported
#   equal(decimal_to_precision ('123.456',     ROUND,  -2, AFTER_POINT), '100')  // not yet supported

equal(decimal_to_precision ( '9.999',  ROUND, 3, AFTER_POINT),                 '9.999')
equal(decimal_to_precision ( '9.999',  ROUND, 2, AFTER_POINT),                 '10')
equal(decimal_to_precision ( '9.999',  ROUND, 2, AFTER_POINT, PAD_WITH_ZERO),  '10.00')
equal(decimal_to_precision ( '99.999', ROUND, 2, AFTER_POINT, PAD_WITH_ZERO),  '100.00')
equal(decimal_to_precision ('-99.999', ROUND, 2, AFTER_POINT, PAD_WITH_ZERO), '-100.00')

# --------------------------------------------------------------------------------------------------------

equal(decimal_to_precision ('0.000123456700', ROUND, 20, SIGNIFICANT_DIGITS),  '0.0001234567')
equal(decimal_to_precision ('0.0001234567',   ROUND, 20, SIGNIFICANT_DIGITS),  '0.0001234567')
equal(decimal_to_precision ('0.0001234567',   ROUND, 7,   SIGNIFICANT_DIGITS),  '0.0001234567')

equal(decimal_to_precision ('0.000123456',    ROUND, 6,  SIGNIFICANT_DIGITS),   '0.000123456')
equal(decimal_to_precision ('0.000123456',    ROUND, 5,  SIGNIFICANT_DIGITS),   '0.00012346')
equal(decimal_to_precision ('0.000123456',    ROUND, 4,  SIGNIFICANT_DIGITS),   '0.0001235')
equal(decimal_to_precision ('0.00012',        ROUND, 2,  SIGNIFICANT_DIGITS),   '0.00012')
equal(decimal_to_precision ('0.0001',         ROUND, 1,  SIGNIFICANT_DIGITS),   '0.0001')

equal(decimal_to_precision ('123.0000987654', ROUND, 7,  SIGNIFICANT_DIGITS),   '123.0001')
equal(decimal_to_precision ('123.0000987654', ROUND, 6,  SIGNIFICANT_DIGITS),   '123')
equal(decimal_to_precision ('123', TRUNCATE, 6,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO),   '123.000')



equal(decimal_to_precision ('0.00098765', ROUND, 2,  SIGNIFICANT_DIGITS),                '0.00099')
equal(decimal_to_precision ('0.00098765', ROUND, 2,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.00099')

equal(decimal_to_precision ('0.00098765', ROUND, 1,   SIGNIFICANT_DIGITS),                '0.001')
equal(decimal_to_precision ('0.00098765', ROUND, 10,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.0009876500000')

equal(decimal_to_precision ('0.098765', ROUND, 1,  SIGNIFICANT_DIGITS, PAD_WITH_ZERO), '0.1')

# --------------------------------------------------------------------------------------------------------

equal(decimal_to_precision ('-0.123456', TRUNCATE, 5, AFTER_POINT), '-0.12345')
equal(decimal_to_precision ('-0.123456', ROUND,    5, AFTER_POINT), '-0.12346')

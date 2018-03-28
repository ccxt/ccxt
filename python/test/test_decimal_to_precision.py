import os
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root)


# --------------------------------------------------------------------------------------------------------

from ccxt.base.decimalToPrecision import decimal_to_precision  # noqa F401
from ccxt.base import decimalToPrecision                       # noqa F401


# load in all tests
test_path = os.path.join(os.path.dirname(root), 'precisionTests')
with open(test_path, 'r') as f:
    lines = f.read().splitlines()

for line_no, line in enumerate(lines[1:], 1):
    if ' ' in line:
        input_val, rounding_mode_arg, prec, counting_mode_arg, padding_mode_arg, result = line.split(' ')
        rounding_mode, counting_mode, padding_mode = map(lambda s: getattr(decimalToPrecision, s),
                                                         (rounding_mode_arg, counting_mode_arg, padding_mode_arg))
        dec_to_prec_result = decimal_to_precision(input_val, rounding_mode, int(prec), counting_mode, padding_mode)
        print('Reading line', line_no, rounding_mode_arg, prec, counting_mode_arg, padding_mode_arg, input_val, result)
        if dec_to_prec_result != result:
            raise ValueError('Error in {}, {} does not equal {}'.format(line_no, dec_to_prec_result, result))

from .numbertheory import (SquareRootError, factorization, gcd, lcm,
                           jacobi, inverse_mod,
                           is_prime, next_prime, smallprimes,
                           square_root_mod_prime)
from six import print_

def test_numbertheory():

  # Making sure locally defined exceptions work:
  # p = modular_exp(2, -2, 3)
  # p = square_root_mod_prime(2, 3)

  print_("Testing gcd...")
  assert gcd(3 * 5 * 7, 3 * 5 * 11, 3 * 5 * 13) == 3 * 5
  assert gcd([3 * 5 * 7, 3 * 5 * 11, 3 * 5 * 13]) == 3 * 5
  assert gcd(3) == 3

  print_("Testing lcm...")
  assert lcm(3, 5 * 3, 7 * 3) == 3 * 5 * 7
  assert lcm([3, 5 * 3, 7 * 3]) == 3 * 5 * 7
  assert lcm(3) == 3

  print_("Testing next_prime...")
  bigprimes = (999671,
               999683,
               999721,
               999727,
               999749,
               999763,
               999769,
               999773,
               999809,
               999853,
               999863,
               999883,
               999907,
               999917,
               999931,
               999953,
               999959,
               999961,
               999979,
               999983)

  for i in range(len(bigprimes) - 1):
    assert next_prime(bigprimes[i]) == bigprimes[i + 1]

  error_tally = 0

  # Test the square_root_mod_prime function:

  for p in smallprimes:
    print_("Testing square_root_mod_prime for modulus p = %d." % p)
    squares = []

    for root in range(0, 1 + p // 2):
      sq = (root * root) % p
      squares.append(sq)
      calculated = square_root_mod_prime(sq, p)
      if (calculated * calculated) % p != sq:
        error_tally = error_tally + 1
        print_("Failed to find %d as sqrt( %d ) mod %d. Said %d." % \
               (root, sq, p, calculated))

    for nonsquare in range(0, p):
      if nonsquare not in squares:
        try:
          calculated = square_root_mod_prime(nonsquare, p)
        except SquareRootError:
          pass
        else:
          error_tally = error_tally + 1
          print_("Failed to report no root for sqrt( %d ) mod %d." % \
                 (nonsquare, p))

  # Test the jacobi function:
  for m in range(3, 400, 2):
    print_("Testing jacobi for modulus m = %d." % m)
    if is_prime(m):
      squares = []
      for root in range(1, m):
        if jacobi(root * root, m) != 1:
          error_tally = error_tally + 1
          print_("jacobi( %d * %d, %d) != 1" % (root, root, m))
        squares.append(root * root % m)
      for i in range(1, m):
        if i not in squares:
          if jacobi(i, m) != -1:
            error_tally = error_tally + 1
            print_("jacobi( %d, %d ) != -1" % (i, m))
    else:       # m is not prime.
      f = factorization(m)
      for a in range(1, m):
        c = 1
        for i in f:
          c = c * jacobi(a, i[0]) ** i[1]
        if c != jacobi(a, m):
          error_tally = error_tally + 1
          print_("%d != jacobi( %d, %d )" % (c, a, m))


# Test the inverse_mod function:
  print_("Testing inverse_mod . . .")
  import random
  n_tests = 0
  for i in range(100):
    m = random.randint(20, 10000)
    for j in range(100):
      a = random.randint(1, m - 1)
      if gcd(a, m) == 1:
        n_tests = n_tests + 1
        inv = inverse_mod(a, m)
        if inv <= 0 or inv >= m or (a * inv) % m != 1:
          error_tally = error_tally + 1
          print_("%d = inverse_mod( %d, %d ) is wrong." % (inv, a, m))
  assert n_tests > 1000
  print_(n_tests, " tests of inverse_mod completed.")

  class FailedTest(Exception):
    pass

  print_(error_tally, "errors detected.")
  if error_tally != 0:
    raise FailedTest("%d errors detected" % error_tally)

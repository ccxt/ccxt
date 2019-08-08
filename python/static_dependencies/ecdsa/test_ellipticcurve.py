from .ellipticcurve import CurveFp, INFINITY, Point
from six import print_

def test_ellipticcurve():

  class FailedTest(Exception):
    pass

  def test_add(c, x1, y1, x2, y2, x3, y3):
    """We expect that on curve c, (x1,y1) + (x2, y2 ) = (x3, y3)."""
    p1 = Point(c, x1, y1)
    p2 = Point(c, x2, y2)
    p3 = p1 + p2
    print_("%s + %s = %s" % (p1, p2, p3), end=' ')
    if p3.x() != x3 or p3.y() != y3:
      raise FailedTest("Failure: should give (%d,%d)." % (x3, y3))
    else:
      print_(" Good.")

  def test_double(c, x1, y1, x3, y3):
    """We expect that on curve c, 2*(x1,y1) = (x3, y3)."""
    p1 = Point(c, x1, y1)
    p3 = p1.double()
    print_("%s doubled = %s" % (p1, p3), end=' ')
    if p3.x() != x3 or p3.y() != y3:
      raise FailedTest("Failure: should give (%d,%d)." % (x3, y3))
    else:
      print_(" Good.")

  def test_double_infinity(c):
    """We expect that on curve c, 2*INFINITY = INFINITY."""
    p1 = INFINITY
    p3 = p1.double()
    print_("%s doubled = %s" % (p1, p3), end=' ')
    if p3.x() != INFINITY.x() or p3.y() != INFINITY.y():
      raise FailedTest("Failure: should give (%d,%d)." % (INFINITY.x(), INFINITY.y()))
    else:
      print_(" Good.")

  def test_multiply(c, x1, y1, m, x3, y3):
    """We expect that on curve c, m*(x1,y1) = (x3,y3)."""
    p1 = Point(c, x1, y1)
    p3 = p1 * m
    print_("%s * %d = %s" % (p1, m, p3), end=' ')
    if p3.x() != x3 or p3.y() != y3:
      raise FailedTest("Failure: should give (%d,%d)." % (x3, y3))
    else:
      print_(" Good.")

  # A few tests from X9.62 B.3:

  c = CurveFp(23, 1, 1)
  test_add(c, 3, 10, 9, 7, 17, 20)
  test_double(c, 3, 10, 7, 12)
  test_add(c, 3, 10, 3, 10, 7, 12)  # (Should just invoke double.)
  test_multiply(c, 3, 10, 2, 7, 12)

  test_double_infinity(c)

  # From X9.62 I.1 (p. 96):

  g = Point(c, 13, 7, 7)

  check = INFINITY
  for i in range(7 + 1):
    p = (i % 7) * g
    print_("%s * %d = %s, expected %s . . ." % (g, i, p, check), end=' ')
    if p == check:
      print_(" Good.")
    else:
      raise FailedTest("Bad.")
    check = check + g

  # NIST Curve P-192:
  p = 6277101735386680763835789423207666416083908700390324961279
  r = 6277101735386680763835789423176059013767194773182842284081
  # s = 0x3045ae6fc8422f64ed579528d38120eae12196d5L
  c = 0x3099d2bbbfcb2538542dcd5fb078b6ef5f3d6fe2c745de65
  b = 0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1
  Gx = 0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012
  Gy = 0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811

  c192 = CurveFp(p, -3, b)
  p192 = Point(c192, Gx, Gy, r)

  # Checking against some sample computations presented
  # in X9.62:

  d = 651056770906015076056810763456358567190100156695615665659
  Q = d * p192
  if Q.x() != 0x62B12D60690CDCF330BABAB6E69763B471F994DD702D16A5:
    raise FailedTest("p192 * d came out wrong.")
  else:
    print_("p192 * d came out right.")

  k = 6140507067065001063065065565667405560006161556565665656654
  R = k * p192
  if R.x() != 0x885052380FF147B734C330C43D39B2C4A89F29B0F749FEAD \
     or R.y() != 0x9CF9FA1CBEFEFB917747A3BB29C072B9289C2547884FD835:
    raise FailedTest("k * p192 came out wrong.")
  else:
    print_("k * p192 came out right.")

  u1 = 2563697409189434185194736134579731015366492496392189760599
  u2 = 6266643813348617967186477710235785849136406323338782220568
  temp = u1 * p192 + u2 * Q
  if temp.x() != 0x885052380FF147B734C330C43D39B2C4A89F29B0F749FEAD \
     or temp.y() != 0x9CF9FA1CBEFEFB917747A3BB29C072B9289C2547884FD835:
    raise FailedTest("u1 * p192 + u2 * Q came out wrong.")
  else:
    print_("u1 * p192 + u2 * Q came out right.")

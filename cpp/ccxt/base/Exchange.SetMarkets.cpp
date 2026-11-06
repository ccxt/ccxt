// Out-of-line definitions of the generated base-method surface
// (setMarkets + its callee cluster: describe, safeDict/safeList/safeString
// helpers, deepExtend, ...), compiled at -O2 while the rest of the generated
// tier keeps the fast -O0 build regime. This is the live loadMarkets hot
// path; the probe measured 2.6x for setMarkets alone (4.6s -> 1.8s on a
// warm binance load). Exchange.h must be included so the members can be
// defined out of line.
#include "Exchange.h"

#include "Exchange.SetMarkets.inc"

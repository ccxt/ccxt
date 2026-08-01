# This directory contains ccxt's own integration test harness, driven by
# ccxt/test/tests_init.py (see the repository CI), not by pytest.
# The test functions here are parameterized by the harness
# (exchange, skipped_properties, ...) and run against live exchange APIs,
# so collecting them with pytest fails with "fixture 'exchange' not found"
# and they would not be runnable offline in any case.
# This guard makes pytest skip the whole tree gracefully, which matters for
# downstream packagers (FreeBSD ports, Debian, nixpkgs, conda-forge) that
# reflexively run pytest over installed site-packages.
# See https://github.com/ccxt/ccxt/issues/29383
collect_ignore_glob = ['*']

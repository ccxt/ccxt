# -*- coding: utf-8 -*-
"""Tests for the per-exchange package split.

The subset tests run on every invocation. Setting ``CCXT_SPLIT_FULL=1`` adds a
sweep over all ~110 generated packages, which is what CI runs.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

import pytest

import split_packages
import verify_packages

REPO_ROOT = Path(__file__).resolve().parents[3]

# binance    - the largest exchange, ships sync + async + pro
# binanceus  - subclasses binance, so it must depend on a sibling distribution
# hyperliquid- the only id present in all four flavours, including prediction
# kalshi     - prediction-only, so it has no top-level exchange class
# bit2c      - a small sync/async exchange, cheap coverage of the common case
# paradex    - reaches the heaviest vendored bundle (starknet, 1.1 MB)
SUBSET = ['binance', 'binanceus', 'hyperliquid', 'kalshi', 'bit2c', 'paradex']

FULL_RUN = os.environ.get('CCXT_SPLIT_FULL') == '1'


@pytest.fixture(scope='session')
def layout():
    return split_packages.discover_layout()


@pytest.fixture(scope='session')
def subset_tree(tmp_path_factory):
    out_dir = tmp_path_factory.mktemp('split-subset')
    packages = split_packages.split(out_dir=out_dir, only=SUBSET)
    return out_dir, packages


@pytest.fixture(scope='session')
def full_tree(tmp_path_factory):
    if not FULL_RUN:
        pytest.skip('set CCXT_SPLIT_FULL=1 to run the full sweep')
    out_dir = tmp_path_factory.mktemp('split-full')
    packages = split_packages.split(out_dir=out_dir)
    return out_dir, packages


# ---------------------------------------------------------------------------
# source-tree introspection
# ---------------------------------------------------------------------------


def test_layout_matches_the_source_tree(layout):
    assert layout.ids['sync'], 'no sync exchanges discovered'
    assert set(layout.ids['pro']) <= set(layout.ids['async_support']), 'a ws exchange has no async counterpart'
    assert set(layout.all_ids) == set().union(*(set(v) for v in layout.ids.values()))
    assert re.match(r'^\d+\.\d+\.\d+', layout.version)


def test_version_tracks_the_root_pyproject(layout):
    text = (REPO_ROOT / 'pyproject.toml').read_text(encoding='utf-8')
    assert 'version = "%s"' % layout.version in text


# ---------------------------------------------------------------------------
# the rewriter
# ---------------------------------------------------------------------------


def _resolver(layout, self_module='ccxt_binance'):
    return split_packages.Resolver(layout, 'ccxt_', self_module)


def test_rewrites_module_paths(layout):
    source = (
        'from ccxt.base.exchange import Exchange\n'
        'from ccxt.abstract.binance import ImplicitAPI\n'
        'from ccxt.base.errors import ExchangeError\n'
    )
    rewritten = split_packages.rewrite_source(source, _resolver(layout))
    assert 'from ccxt_core.base.exchange import Exchange' in rewritten
    assert 'from ccxt_core.base.errors import ExchangeError' in rewritten
    assert 'from ccxt_binance.abstract.binance import ImplicitAPI' in rewritten


def test_leaves_strings_and_comments_alone(layout):
    source = (
        "url = 'https://docs.ccxt.com/#/README'  # see ccxt.com/docs\n"
        'import ccxt.async_support\n'
    )
    rewritten = split_packages.rewrite_source(source, _resolver(layout))
    assert "'https://docs.ccxt.com/#/README'" in rewritten
    assert '# see ccxt.com/docs' in rewritten
    assert 'import ccxt_binance.async_support\n' in rewritten


def test_rewrites_cross_exchange_references(layout):
    source = 'from ccxt.binance import binance\nclass x(ccxt.async_support.binance):\n    pass\n'
    resolver = _resolver(layout, 'ccxt_binanceus')
    rewritten = split_packages.rewrite_source(source, resolver)
    assert 'from ccxt_binance.binance import binance' in rewritten
    assert 'class x(ccxt_binance.async_support.binance):' in rewritten
    assert resolver.referenced == {'ccxt_binance'}


def test_bare_package_reference_targets_the_owning_package(layout):
    resolver = _resolver(layout, 'ccxt_core')
    rewritten = split_packages.rewrite_source('from ccxt import NetworkError\n', resolver)
    assert rewritten == 'from ccxt_core import NetworkError\n'


def test_filter_init_keeps_the_selected_exchange_only():
    source = (
        '__version__ = "1.0"\n'
        'from ccxt.base.errors import BaseError\n'
        'from ccxt.binance import binance  # noqa: F401\n'
        'from ccxt.okx import okx  # noqa: F401\n'
        'exchanges = [\n    "binance",\n    "okx",\n]\n'
    )
    filtered = split_packages.filter_init(source, ['binance'], ['binance', 'okx'])
    assert 'from ccxt.binance import binance' in filtered
    assert 'okx' not in filtered
    assert 'from ccxt.base.errors import BaseError' in filtered
    assert filtered.endswith('exchanges = [\n    \'binance\',\n]\n')


# ---------------------------------------------------------------------------
# generated trees
# ---------------------------------------------------------------------------


def test_generates_core_and_the_requested_exchanges(subset_tree):
    out_dir, packages = subset_tree
    names = {package.dist_name for package in packages}
    assert 'ccxt-core' in names
    assert {'ccxt-' + i for i in SUBSET} <= names
    for package in packages:
        assert (out_dir / package.dist_name / 'pyproject.toml').is_file()
        assert (out_dir / package.dist_name / 'README.md').is_file()
        assert (out_dir / package.dist_name / package.module_name / '__init__.py').is_file()


def test_core_ships_no_exchange_implementation(subset_tree):
    out_dir, _ = subset_tree
    core = out_dir / 'ccxt-core' / 'ccxt_core'
    stray = [p.name for p in core.glob('*.py') if p.stem != '__init__']
    assert stray == [], 'ccxt-core must contain base code only'
    assert sorted(p.name for p in core.iterdir() if p.is_dir()) == ['async_support', 'base', 'static_dependencies']
    assert 'exchanges = [\n]' in (core / '__init__.py').read_text(encoding='utf-8')


# ---------------------------------------------------------------------------
# vendored third-party trees
# ---------------------------------------------------------------------------


def test_vendor_plan_groups_by_reachability(layout):
    plan = split_packages.plan_vendoring(split_packages.SOURCE_PACKAGE, layout)
    starknet = plan.bundles['starknet']
    # lark exists only to parse Cairo ABIs, so it travels with starknet
    assert 'lark' in [directory for _, directory in starknet.trees]
    # keccak is reachable on its own as well as through ethabi, so it stays apart
    assert plan.owner['keccak'] == 'keccak'
    assert 'keccak' in plan.bundles['ethabi'].requires
    assert not plan.core_dirs, 'nothing in the vendored trees is imported eagerly'
    assert set(plan.exchange_bundles['paradex']) >= {'starknet', 'keccak'}
    assert 'binance' not in plan.exchange_bundles


def test_most_exchanges_need_no_vendored_code(layout):
    plan = split_packages.plan_vendoring(split_packages.SOURCE_PACKAGE, layout)
    assert len(plan.exchange_bundles) < len(layout.all_ids) / 3


def test_vendored_trees_leave_core(subset_tree):
    out_dir, packages = subset_tree
    vendored = out_dir / 'ccxt-core' / 'ccxt_core' / 'static_dependencies'
    assert [p.name for p in vendored.iterdir() if p.is_dir()] == []
    assert (out_dir / 'ccxt-core-starknet' / 'ccxt_core_starknet' / 'starknet').is_dir()
    assert '"ccxt-core-starknet==' in (out_dir / 'ccxt-paradex' / 'pyproject.toml').read_text(encoding='utf-8')
    assert 'ccxt-core-starknet' not in (out_dir / 'ccxt-binance' / 'pyproject.toml').read_text(encoding='utf-8')


def test_cross_bundle_relative_imports_become_absolute(subset_tree):
    out_dir, _ = subset_tree
    # `from ... import keccak` used to reach a sibling of starknet/; keccak now
    # ships separately, so the relative import has to be rewritten
    utils = out_dir / 'ccxt-core-starknet' / 'ccxt_core_starknet' / 'starknet' / 'hash' / 'utils.py'
    assert 'from ccxt_core_keccak import keccak' in utils.read_text(encoding='utf-8')
    # lark stays in the same bundle, so its relative import is left alone
    parser = out_dir / 'ccxt-core-starknet' / 'ccxt_core_starknet' / 'starknet' / 'abi' / 'v1' / 'parser_transformer.py'
    assert 'from ....lark import' in parser.read_text(encoding='utf-8')


def test_core_offers_the_bundles_as_extras(subset_tree):
    out_dir, _ = subset_tree
    text = (out_dir / 'ccxt-core' / 'pyproject.toml').read_text(encoding='utf-8')
    assert 'starknet = ["ccxt-core-starknet==' in text
    assert text.count('all = [') == 1


def test_vendored_can_stay_in_core(tmp_path):
    packages = split_packages.split(out_dir=tmp_path, only=['paradex'], split_vendored=False)
    assert [p for p in packages if p.kind == 'bundle'] == []
    assert (tmp_path / 'ccxt-core' / 'ccxt_core' / 'static_dependencies' / 'starknet').is_dir()
    assert 'ccxt-core-starknet' not in (tmp_path / 'ccxt-paradex' / 'pyproject.toml').read_text(encoding='utf-8')


def test_no_upstream_imports_survive(subset_tree):
    out_dir, _ = subset_tree
    pattern = re.compile(r'^\s*(from|import)\s+ccxt(\.|\s|$)')
    offenders = [
        '%s:%d' % (path, number)
        for path in out_dir.rglob('*.py')
        for number, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1)
        if pattern.match(line)
    ]
    assert offenders == [], 'these files still import the monolithic package: %s' % offenders[:10]


def test_every_generated_file_compiles(subset_tree):
    out_dir, _ = subset_tree
    for path in out_dir.rglob('*.py'):
        compile(path.read_text(encoding='utf-8'), str(path), 'exec')


def test_dependencies_are_declared_not_vendored(subset_tree):
    out_dir, packages = subset_tree
    by_name = {package.dist_name: package for package in packages}
    text = (out_dir / 'ccxt-binanceus' / 'pyproject.toml').read_text(encoding='utf-8')
    assert '"ccxt-binance==' in text, 'binanceus must depend on ccxt-binance rather than copy it'
    assert '"ccxt-core==' in text
    assert not (out_dir / 'ccxt-binanceus' / 'ccxt_binanceus' / 'binance.py').exists()
    assert by_name['ccxt-binance'].requires == {'ccxt_core'}


def test_prediction_only_exchange_has_no_sync_class(subset_tree):
    out_dir, packages = subset_tree
    kalshi = next(p for p in packages if p.exchange_id == 'kalshi')
    assert kalshi.flavours == ['prediction']
    assert (out_dir / 'ccxt-kalshi' / 'ccxt_kalshi' / 'prediction' / 'kalshi.py').is_file()
    assert not (out_dir / 'ccxt-kalshi' / 'ccxt_kalshi' / 'kalshi.py').exists()


def test_manifest_records_every_package(subset_tree):
    out_dir, packages = subset_tree
    manifest = json.loads((out_dir / 'manifest.json').read_text(encoding='utf-8'))
    assert {p['dist'] for p in manifest['packages']} == {p.dist_name for p in packages}
    binanceus = next(p for p in manifest['packages'] if p['dist'] == 'ccxt-binanceus')
    assert sorted(binanceus['requires']) == ['ccxt-binance', 'ccxt-core']


# ---------------------------------------------------------------------------
# behaviour of the generated packages
# ---------------------------------------------------------------------------


def test_subset_imports_in_isolation(subset_tree):
    out_dir, _ = subset_tree
    assert verify_packages.verify(out_dir) == []


def test_subset_matches_upstream(subset_tree):
    out_dir, _ = subset_tree
    pytest.importorskip('aiohttp')
    assert verify_packages.verify(out_dir, compare_upstream=True) == []


def test_importing_one_exchange_does_not_load_the_others(subset_tree):
    out_dir, packages = subset_tree
    roots = os.pathsep.join(str(out_dir / package.dist_name) for package in packages)
    environment = dict(os.environ, PYTHONPATH=roots, PYTHONDONTWRITEBYTECODE='1')
    script = (
        'import sys, json, ccxt_binance\n'
        'ccxt_binance.binance()\n'
        'print(json.dumps(sorted({m.split(".")[0] for m in sys.modules if m.startswith("ccxt")})))\n'
    )
    output = subprocess.run([sys.executable, '-c', script], capture_output=True, text=True,
                            env=environment, check=True).stdout
    assert json.loads(output.strip().splitlines()[-1]) == ['ccxt_binance', 'ccxt_core']


def test_errors_are_shared_across_exchange_packages(subset_tree):
    out_dir, packages = subset_tree
    roots = os.pathsep.join(str(out_dir / package.dist_name) for package in packages)
    environment = dict(os.environ, PYTHONPATH=roots, PYTHONDONTWRITEBYTECODE='1')
    script = (
        'import ccxt_binance, ccxt_bit2c, ccxt_core\n'
        'assert ccxt_binance.NetworkError is ccxt_bit2c.NetworkError is ccxt_core.NetworkError\n'
        'assert issubclass(ccxt_binance.binance, ccxt_core.Exchange)\n'
        'import ccxt_binanceus\n'
        'assert issubclass(ccxt_binanceus.binanceus, ccxt_binance.binance)\n'
        'print("ok")\n'
    )
    output = subprocess.run([sys.executable, '-c', script], capture_output=True, text=True,
                            env=environment, check=True).stdout
    assert output.strip().endswith('ok')


# ---------------------------------------------------------------------------
# full sweep (CI)
# ---------------------------------------------------------------------------


def test_full_tree_covers_every_exchange(full_tree, layout):
    _, packages = full_tree
    assert {p.exchange_id for p in packages if p.exchange_id} == set(layout.all_ids)


def test_full_tree_imports_in_isolation(full_tree):
    out_dir, _ = full_tree
    assert verify_packages.verify(out_dir) == []


def test_full_tree_matches_upstream(full_tree):
    out_dir, _ = full_tree
    pytest.importorskip('aiohttp')
    assert verify_packages.verify(out_dir, compare_upstream=True) == []

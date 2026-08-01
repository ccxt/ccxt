#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Split the monolithic ``ccxt`` Python package into per-exchange distributions.

The upstream package has a single entry point: ``import ccxt`` executes
``python/ccxt/__init__.py``, which imports every exchange module. Applications
that talk to one venue therefore pay for all of them in import time, memory and
supply-chain surface.

This script mechanically rewrites the generated Python tree into:

* ``ccxt-core``  -> module ``ccxt_core``: base classes, errors, ws plumbing.
  No exchange code, no vendored third-party code.
* ``ccxt-<id>``  -> module ``ccxt_<id>``: exactly one exchange, in whichever of
  the sync / ``async_support`` / ``pro`` / ``prediction`` flavours upstream
  ships it, plus its ``abstract`` endpoint table.
* ``ccxt-core-<lib>`` -> the vendored trees under ``static_dependencies`` and
  ``protobuf``, which ccxt-core imports lazily, published separately so they
  reach only the exchange packages whose call graph needs them.

Exchanges that subclass another exchange (``binanceus`` -> ``binance``) declare a
dependency on the parent distribution instead of vendoring a second copy, so
``isinstance`` and ``except`` keep working across packages.

Nothing here is hand-maintained per exchange: the exchange list, the inheritance
edges and the package contents are all derived from the source tree, so the same
command works on every future ccxt release.

Usage::

    python python/split/split_packages.py --out python/split-dist
    python python/split/split_packages.py --out python/split-dist --only binance,okx
    python python/split/split_packages.py --out python/split-dist --build
    python python/split/split_packages.py --out python/split-dist --vendored core
"""

from __future__ import annotations

import argparse
import ast
import collections
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tokenize
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Optional, Sequence, Set, Tuple

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python 3.10
    import tomli as tomllib  # type: ignore[no-redef]


REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_PACKAGE = REPO_ROOT / 'python' / 'ccxt'

# Sub-namespaces of ``ccxt`` that hold one module per exchange.
FLAVOURS = ('sync', 'async_support', 'pro', 'prediction')

# Directories that belong to ccxt-core rather than to any single exchange.
CORE_TREES = ('base', 'static_dependencies', 'protobuf')

DEFAULT_DIST_PREFIX = 'ccxt-'
DEFAULT_MODULE_PREFIX = 'ccxt_'
CORE_SUFFIX = 'core'


# ---------------------------------------------------------------------------
# source-tree introspection
# ---------------------------------------------------------------------------


def _assignment_node(source: str, name: str) -> Optional[ast.Assign]:
    tree = ast.parse(source)
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == name:
                    return node
    return None


def read_string_list(path: Path, name: str) -> List[str]:
    """Return the value of a module-level ``name = ['a', 'b']`` assignment."""
    node = _assignment_node(path.read_text(encoding='utf-8'), name)
    if node is None:
        return []
    return [element.value for element in node.value.elts]  # type: ignore[attr-defined]


@dataclass
class Layout:
    """Which upstream files exist for every exchange id."""

    version: str
    # flavour -> ordered exchange ids, as listed in that flavour's __init__.py
    ids: Dict[str, List[str]]
    # every id that has at least one module
    all_ids: List[str] = field(default_factory=list)

    def flavours_of(self, exchange_id: str) -> List[str]:
        return [flavour for flavour in FLAVOURS if exchange_id in self.ids[flavour]]


def discover_layout(source: Path = SOURCE_PACKAGE) -> Layout:
    version = read_version(source / '__init__.py')
    ids = {
        'sync': read_string_list(source / '__init__.py', 'exchanges'),
        'async_support': read_string_list(source / 'async_support' / '__init__.py', 'exchanges'),
        'pro': read_string_list(source / 'pro' / '__init__.py', 'exchanges'),
        'prediction': read_string_list(source / 'prediction' / '__init__.py', 'exchanges'),
    }
    for flavour, listed in ids.items():
        subdir = source if flavour == 'sync' else source / flavour
        missing = [i for i in listed if not (subdir / (i + '.py')).is_file()]
        if missing:
            raise SystemExit('%s/__init__.py lists modules that do not exist: %s' % (flavour, missing))
    ordered: List[str] = []
    for flavour in FLAVOURS:
        for exchange_id in ids[flavour]:
            if exchange_id not in ordered:
                ordered.append(exchange_id)
    return Layout(version=version, ids=ids, all_ids=sorted(ordered))


def read_version(init_path: Path) -> str:
    node = _assignment_node(init_path.read_text(encoding='utf-8'), '__version__')
    if node is None:
        raise SystemExit('no __version__ in %s' % init_path)
    return node.value.value  # type: ignore[attr-defined]


# ---------------------------------------------------------------------------
# vendored dependencies
# ---------------------------------------------------------------------------

# `python/ccxt/static_dependencies` and `python/ccxt/protobuf` are 1.7 MB of
# vendored third-party code that base/exchange.py imports *inside* the handful of
# methods that need it - starknet signing, dydx transaction encoding, msgpack,
# keccak, and so on. Shipped in ccxt-core it would land on every install, even
# though most exchanges never reach any of it.
#
# So each one is published as its own distribution and an exchange package
# depends only on what its call graph can reach. The grouping is derived, not
# declared: vendored directories that are reachable from exactly the same set of
# base-method entry points travel together, which is what puts lark, marshmallow,
# starkware and marshmallow_oneofschema in the starknet bundle while keccak -
# reachable on its own as well as through ethabi and starknet - stays separate.

VENDOR_PARENT = 'static_dependencies'


@dataclass
class Bundle:
    """One optional distribution carrying vendored third-party code."""

    name: str
    # top-level directories it ships, as `(source path, module directory)`
    trees: List[Tuple[Path, str]]
    requires: Set[str] = field(default_factory=set)

    def dist_name(self, dist_prefix: str) -> str:
        # PyPI names are dash-separated even where the vendored directory is not
        return '%s%s-%s' % (dist_prefix, CORE_SUFFIX, self.name.replace('_', '-'))

    def module_name(self, module_prefix: str) -> str:
        return '%s%s_%s' % (module_prefix, CORE_SUFFIX, self.name)


@dataclass
class VendorPlan:
    bundles: Dict[str, Bundle]
    # vendored directory -> the bundle that ships it
    owner: Dict[str, str]
    # exchange id -> bundle names it may need, closed over bundle dependencies
    exchange_bundles: Dict[str, Set[str]]
    # directories that stay in ccxt-core because core imports them eagerly
    core_dirs: Set[str] = field(default_factory=set)

    def bundle_of(self, directory: str) -> Optional[str]:
        return self.owner.get(directory)


def _resolve_relative(package: Sequence[str], level: int, module: Optional[str]) -> List[str]:
    """Resolve a relative import to a path below ``static_dependencies``.

    ``package`` is the importing module's package path relative to that
    directory, so an empty result means the import targets a sibling of the
    top-level vendored directories.
    """
    base = list(package[:len(package) - (level - 1)]) if level > 1 else list(package)
    return base + (module.split('.') if module else [])


def _vendor_edges(vendor_root: Path) -> Dict[str, Set[str]]:
    """Which vendored top-level directory imports which other one."""
    edges: Dict[str, Set[str]] = collections.defaultdict(set)
    for path in sorted(vendor_root.rglob('*.py')):
        parts = path.relative_to(vendor_root).parts
        if len(parts) < 2:
            continue
        top, package = parts[0], list(parts[:-1])
        try:
            tree = ast.parse(path.read_text(encoding='utf-8'))
        except SyntaxError:  # vendored code occasionally targets another Python
            continue
        for node in ast.walk(tree):
            if not isinstance(node, ast.ImportFrom):
                continue
            if node.level:
                target = _resolve_relative(package, node.level, node.module)
                # `from ... import keccak` names the directory rather than the module
                names = [target[0]] if target else [alias.name for alias in node.names]
            elif node.module and node.module.startswith('ccxt.%s.' % VENDOR_PARENT):
                names = [node.module.split('.')[2]]
            else:
                continue
            edges[top] |= {name for name in names if name != top and (vendor_root / name).is_dir()}
    return edges


def _base_method_usage(source: Path) -> Tuple[Dict[str, Set[str]], Set[str]]:
    """Map each base-Exchange method to the vendored directories it can reach.

    The second element is the set of directories imported at module level, which
    therefore cannot be made optional.
    """
    imports: Dict[str, Set[str]] = collections.defaultdict(set)
    calls: Dict[str, Set[str]] = collections.defaultdict(set)
    eager: Set[str] = set()

    for relative in (Path('base') / 'exchange.py', Path('async_support') / 'base' / 'exchange.py'):
        text = (source / relative).read_text(encoding='utf-8')
        tree = ast.parse(text)
        lines = text.splitlines()

        for node in _module_level(tree.body):
            if isinstance(node, ast.ImportFrom):
                eager |= _vendor_targets(node)

        for class_node in [n for n in tree.body if isinstance(n, ast.ClassDef)]:
            for method in [n for n in class_node.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]:
                body = '\n'.join(lines[method.lineno - 1:method.end_lineno])
                for sub in ast.walk(method):
                    if isinstance(sub, ast.ImportFrom):
                        imports[method.name] |= _vendor_targets(sub)
                calls[method.name] |= set(re.findall(r'\bself\.([a-zA-Z_][a-zA-Z_0-9]*)\b', body))

    # a method also needs whatever the base methods it calls need
    reachable: Dict[str, Set[str]] = {name: set(found) for name, found in imports.items()}
    for name in set(calls) | set(imports):
        reachable.setdefault(name, set())
    changed = True
    while changed:
        changed = False
        for name, callees in calls.items():
            grown = set(reachable[name])
            for callee in callees:
                grown |= reachable.get(callee, set())
            if grown != reachable[name]:
                reachable[name] = grown
                changed = True
    return {name: found for name, found in reachable.items() if found}, eager


def _module_level(body: Sequence[ast.stmt]) -> List[ast.stmt]:
    """Statements that run on import, descending through module-level blocks."""
    found: List[ast.stmt] = []
    for node in body:
        found.append(node)
        if isinstance(node, (ast.If, ast.Try)):
            found += _module_level(node.body + node.orelse + node.finalbody
                                   if isinstance(node, ast.Try) else node.body + node.orelse)
    return found


def _vendor_targets(node: ast.ImportFrom) -> Set[str]:
    """The vendored directories a ``from ccxt.…`` statement pulls in, if any."""
    parts = (node.module or '').split('.')
    if parts[:2] == ['ccxt', VENDOR_PARENT]:
        # `from ccxt.static_dependencies.starknet.hash import x` names the
        # directory in the path; `from ccxt.static_dependencies import keccak`
        # names it in the import list
        return {parts[2]} if len(parts) > 2 else {alias.name for alias in node.names}
    if parts[:2] == ['ccxt', 'protobuf']:
        return {'protobuf'}
    return set()


def _camel(name: str) -> str:
    head, *rest = name.split('_')
    return head + ''.join(word.capitalize() for word in rest)


def plan_vendoring(source: Path, layout: Layout, split: bool = True) -> VendorPlan:
    """Group the vendored trees into optional distributions and map exchanges to them."""
    vendor_root = source / VENDOR_PARENT
    method_dirs, eager = _base_method_usage(source)
    entries = {directory for dirs in method_dirs.values() for directory in dirs}

    if not split:
        return VendorPlan({}, {}, {}, core_dirs=entries | eager)

    edges = _vendor_edges(vendor_root)

    def reachable_from(entry: str) -> Set[str]:
        seen, pending = set(), [entry]
        while pending:
            current = pending.pop()
            if current in seen:
                continue
            seen.add(current)
            pending.extend(edges.get(current, ()))
        return seen

    reach = {entry: reachable_from(entry) for entry in entries if entry != 'protobuf'}

    # directories reachable from exactly the same entry points ship together
    signatures: Dict[frozenset, List[str]] = collections.defaultdict(list)
    for directory in {d for found in reach.values() for d in found}:
        if directory in eager:
            continue
        signatures[frozenset(e for e, found in reach.items() if directory in found)].append(directory)

    bundles: Dict[str, Bundle] = {}
    owner: Dict[str, str] = {}
    for signature, directories in signatures.items():
        named = sorted(set(directories) & signature) or sorted(directories)
        bundle = Bundle(named[0], [(vendor_root / d, d) for d in sorted(directories)])
        bundles[bundle.name] = bundle
        owner.update({d: bundle.name for d in directories})
    if 'protobuf' in entries and 'protobuf' not in eager:
        bundles['protobuf'] = Bundle('protobuf', [(source / 'protobuf', 'protobuf')])
        owner['protobuf'] = 'protobuf'

    for directory, bundle_name in owner.items():
        for target in edges.get(directory, ()):
            if owner.get(target) not in (None, bundle_name):
                bundles[bundle_name].requires.add(owner[target])

    def close(names: Set[str]) -> Set[str]:
        seen, pending = set(), list(names)
        while pending:
            current = pending.pop()
            if current in seen:
                continue
            seen.add(current)
            pending.extend(bundles[current].requires)
        return seen

    exchange_bundles: Dict[str, Set[str]] = {}
    for exchange_id in layout.all_ids:
        needed: Set[str] = set()
        for flavour in layout.flavours_of(exchange_id):
            relative = exchange_id + '.py' if flavour == 'sync' else '%s/%s.py' % (flavour, exchange_id)
            text = (source / relative).read_text(encoding='utf-8')
            for method, directories in method_dirs.items():
                if re.search(r'\bself\.(%s|%s)\b' % (re.escape(method), re.escape(_camel(method))), text):
                    needed |= {owner[d] for d in directories if d in owner}
        if needed:
            exchange_bundles[exchange_id] = close(needed)
    return VendorPlan(bundles, owner, exchange_bundles, core_dirs=eager)


# ---------------------------------------------------------------------------
# import rewriting
# ---------------------------------------------------------------------------


class Resolver:
    """Maps a dotted ``ccxt.…`` path onto its post-split module path.

    ``resolve`` receives the attribute chain that follows the ``ccxt`` name and
    returns ``(replacement, consumed)`` where ``consumed`` is how many of those
    attributes the replacement already accounts for, or ``None`` when the chain
    is not a module path we own (a local variable called ``ccxt``, say).
    """

    def __init__(self, layout: Layout, module_prefix: str, self_module: str,
                 vendor: Optional[VendorPlan] = None) -> None:
        self.layout = layout
        self.module_prefix = module_prefix
        self.self_module = self_module
        self.core = module_prefix + CORE_SUFFIX
        self.vendor = vendor or VendorPlan({}, {}, {})
        self.referenced: Set[str] = set()

    def vendor_module(self, directory: str) -> Optional[str]:
        """The module a vendored directory now lives in, or None if it stayed in core."""
        bundle = self.vendor.bundle_of(directory)
        return self.vendor.bundles[bundle].module_name(self.module_prefix) if bundle else None

    def _module_for(self, exchange_id: str) -> str:
        return self.module_prefix + exchange_id

    def _record(self, module: str) -> None:
        self.referenced.add(module.split('.')[0])

    def resolve(self, parts: Sequence[str]) -> Optional[Tuple[str, int]]:
        known = self.layout.all_ids

        if not parts:
            self._record(self.self_module)
            return self.self_module, 0

        head = parts[0]

        if head == VENDOR_PARENT and len(parts) > 1:
            moved = self.vendor_module(parts[1])
            if moved:
                self._record(moved)
                return '%s.%s' % (moved, parts[1]), 2

        if head == 'protobuf':
            moved = self.vendor_module('protobuf')
            if moved:
                self._record(moved)
                return '%s.protobuf' % moved, 1

        if head in CORE_TREES:
            self._record(self.core)
            return '%s.%s' % (self.core, head), 1

        if head == 'async_support' and len(parts) > 1 and parts[1] == 'base':
            self._record(self.core)
            return '%s.async_support.base' % self.core, 2

        if head == 'abstract':
            if len(parts) > 2 and parts[1] == 'prediction' and parts[2] in known:
                module = self._module_for(parts[2])
                self._record(module)
                return '%s.abstract.prediction.%s' % (module, parts[2]), 3
            if len(parts) > 1 and parts[1] in known:
                module = self._module_for(parts[1])
                self._record(module)
                return '%s.abstract.%s' % (module, parts[1]), 2
            self._record(self.self_module)
            return '%s.abstract' % self.self_module, 1

        if head in ('async_support', 'pro', 'prediction'):
            if len(parts) > 1 and parts[1] in known:
                module = self._module_for(parts[1])
                self._record(module)
                return '%s.%s.%s' % (module, head, parts[1]), 2
            self._record(self.self_module)
            return '%s.%s' % (self.self_module, head), 1

        if head in known:
            module = self._module_for(head)
            self._record(module)
            return '%s.%s' % (module, head), 1

        # `ccxt.Exchange`, `ccxt.NetworkError`, … - attributes of the top-level
        # package, which each generated package re-exports.
        self._record(self.self_module)
        return self.self_module, 0


def _rewrite_tokens(source: str, resolve: Callable[[Sequence[str]], Optional[Tuple[str, int]]]) -> str:
    """Replace ``ccxt.…`` module paths in real code, never inside strings.

    Tokenising rather than running a regex over the text is what keeps the 5981
    ``ccxt.com`` URLs in docstrings and describe() blocks untouched.
    """
    tokens = list(tokenize.generate_tokens(io.StringIO(source).readline))
    lines = source.splitlines(keepends=True)
    edits: List[Tuple[Tuple[int, int], Tuple[int, int], str]] = []

    for index, token in enumerate(tokens):
        if token.type != tokenize.NAME or token.string != 'ccxt':
            continue
        previous = tokens[index - 1] if index else None
        if previous is not None and previous.type == tokenize.OP and previous.string == '.':
            continue  # `something.ccxt`, not our package

        parts: List[str] = []
        ends: List[Tuple[int, int]] = [token.end]
        cursor = index
        while (
            cursor + 2 < len(tokens)
            and tokens[cursor + 1].type == tokenize.OP
            and tokens[cursor + 1].string == '.'
            and tokens[cursor + 2].type == tokenize.NAME
        ):
            parts.append(tokens[cursor + 2].string)
            ends.append(tokens[cursor + 2].end)
            cursor += 2

        tail = tokens[cursor + 1] if cursor + 1 < len(tokens) else None
        if tail is not None and tail.type == tokenize.OP and tail.string == '.':
            # the chain continues past a line break, so `parts` is incomplete and
            # resolving it would silently point at the wrong module
            raise ValueError('module path wraps onto the next line at line %d' % token.start[0])

        resolved = resolve(parts)
        if resolved is None:
            continue
        replacement, consumed = resolved
        end = ends[consumed]
        if end[0] != token.start[0]:
            raise ValueError('module path split across lines at line %d' % token.start[0])
        edits.append((token.start, end, replacement))

    for (start_row, start_col), (_, end_col), replacement in reversed(edits):
        line = lines[start_row - 1]
        lines[start_row - 1] = line[:start_col] + replacement + line[end_col:]
    return ''.join(lines)


def rewrite_source(source: str, resolver: Resolver) -> str:
    return _rewrite_tokens(source, resolver.resolve)


def rewrite_vendor_statements(source: str, resolver: Resolver, package: Optional[Sequence[str]] = None) -> str:
    """Rewrite the import forms where the target module depends on the imported name.

    Two shapes need the whole statement rather than the dotted path the token
    rewriter sees. ``from ccxt.static_dependencies import keccak, ethabi`` names
    its directories in the import list, and those two may now live in different
    distributions. And inside the vendored trees themselves,
    ``from ... import keccak`` reaches a sibling directory that may have moved
    elsewhere, so the relative import has to become an absolute one.

    ``package`` is the importing module's package path below
    ``static_dependencies``; pass None for anything outside the vendored trees.
    """
    if not resolver.vendor.bundles:
        return source
    tree = ast.parse(source)
    lines = source.splitlines(keepends=True)
    edits: List[Tuple[int, int, List[str]]] = []

    for node in ast.walk(tree):
        if not isinstance(node, ast.ImportFrom):
            continue
        parts = (node.module or '').split('.')
        if node.level and package is not None:
            target = _resolve_relative(package, node.level, node.module)
            prefix = target
        elif not node.level and parts[:2] == ['ccxt', VENDOR_PARENT]:
            target = parts[2:]
            prefix = target
        else:
            continue

        indent = ' ' * (len(lines[node.lineno - 1]) - len(lines[node.lineno - 1].lstrip()))
        if prefix:
            moved = resolver.vendor_module(prefix[0])
            here = resolver.vendor_module(package[0]) if package else None
            if not moved or moved == here:
                continue
            names = ', '.join(_alias(a) for a in node.names)
            edits.append((node.lineno, node.end_lineno,
                          ['%sfrom %s import %s\n' % (indent, '.'.join([moved] + list(prefix)), names)]))
            continue

        # the directories are the imported names, so one statement per bundle
        grouped: Dict[str, List[ast.alias]] = collections.defaultdict(list)
        for alias in node.names:
            grouped[resolver.vendor_module(alias.name) or '%s.%s' % (resolver.core, VENDOR_PARENT)].append(alias)
        here = resolver.vendor_module(package[0]) if package else None
        if list(grouped) == [here]:
            continue
        replacement = ['%sfrom %s import %s\n' % (indent, module, ', '.join(_alias(a) for a in aliases))
                       for module, aliases in sorted(grouped.items())]
        edits.append((node.lineno, node.end_lineno, replacement))

    for start, end, replacement in sorted(edits, reverse=True):
        lines[start - 1:end] = replacement
    return ''.join(lines)


def _alias(alias: ast.alias) -> str:
    return '%s as %s' % (alias.name, alias.asname) if alias.asname else alias.name


# ---------------------------------------------------------------------------
# __init__.py surgery
# ---------------------------------------------------------------------------


EXCHANGE_IMPORT = re.compile(
    r'^from ccxt\.(?:(?P<sub>async_support|pro|prediction)\.)?(?P<id>[a-z0-9_]+) import (?P=id)\b.*$'
)


def filter_init(source: str, keep: Sequence[str], known_ids: Iterable[str]) -> str:
    """Drop the per-exchange imports we do not ship and shrink ``exchanges``.

    Everything else - the licence header, ``__version__``, the base/error
    re-exports, ``__all__`` - is carried over verbatim, so a generated
    ``__init__`` tracks upstream automatically.
    """
    known = set(known_ids)
    keep_set = set(keep)

    kept_lines = []
    for line in source.splitlines(keepends=True):
        match = EXCHANGE_IMPORT.match(line.rstrip('\n'))
        if match and match.group('id') in known and match.group('id') not in keep_set:
            continue
        kept_lines.append(line)
    filtered = ''.join(kept_lines)

    node = _assignment_node(filtered, 'exchanges')
    if node is not None:
        lines = filtered.splitlines(keepends=True)
        body = 'exchanges = [\n' + ''.join("    '%s',\n" % i for i in keep) + ']\n'
        lines[node.lineno - 1:node.end_lineno] = [body]
        filtered = ''.join(lines)
    return filtered


# ---------------------------------------------------------------------------
# package emission
# ---------------------------------------------------------------------------


@dataclass
class Package:
    dist_name: str
    module_name: str
    exchange_id: Optional[str]
    flavours: List[str]
    requires: Set[str] = field(default_factory=set)
    kind: str = 'exchange'
    bundle_name: Optional[str] = None

    @property
    def is_core(self) -> bool:
        return self.kind == 'core'


class Splitter:
    def __init__(
        self,
        out_dir: Path,
        layout: Layout,
        source: Path = SOURCE_PACKAGE,
        dist_prefix: str = DEFAULT_DIST_PREFIX,
        module_prefix: str = DEFAULT_MODULE_PREFIX,
        vendor: Optional[VendorPlan] = None,
    ) -> None:
        self.out_dir = out_dir
        self.layout = layout
        self.source = source
        self.dist_prefix = dist_prefix
        self.module_prefix = module_prefix
        self.core_module = module_prefix + CORE_SUFFIX
        self.core_dist = dist_prefix + CORE_SUFFIX
        self.vendor = vendor or VendorPlan({}, {}, {})
        self.metadata = tomllib.loads((REPO_ROOT / 'pyproject.toml').read_text(encoding='utf-8'))

    # -- helpers ----------------------------------------------------------

    def _resolver(self, self_module: str) -> Resolver:
        return Resolver(self.layout, self.module_prefix, self_module, self.vendor)

    def _copy_rewritten(self, relative: Path, destination: Path, resolver: Resolver,
                        package: Optional[Sequence[str]] = None) -> None:
        text = (self.source / relative).read_text(encoding='utf-8')
        destination.parent.mkdir(parents=True, exist_ok=True)
        if relative.suffix == '.py':
            try:
                text = rewrite_source(rewrite_vendor_statements(text, resolver, package), resolver)
            except (tokenize.TokenError, SyntaxError, ValueError) as error:
                raise SystemExit('cannot rewrite %s: %s' % (relative, error))
        destination.write_text(text, encoding='utf-8')

    def _copy_tree(self, relative: Path, destination: Path, resolver: Resolver,
                   vendor_root: Optional[Path] = None, skip: Sequence[str] = ()) -> None:
        for path in sorted((self.source / relative).rglob('*')):
            if path.is_dir() or '__pycache__' in path.parts:
                continue
            child = path.relative_to(self.source)
            tail = child.relative_to(relative)
            if tail.parts and tail.parts[0] in skip:
                continue
            # inside the vendored trees, relative imports are resolved against the
            # module's own package path, so the rewriter needs to know where it sits
            package = list(path.relative_to(vendor_root).parts[:-1]) if vendor_root else None
            self._copy_rewritten(child, destination / tail, resolver, package)

    # -- core -------------------------------------------------------------

    def emit_core(self) -> Package:
        package = Package(self.core_dist, self.core_module, None, [], kind='core')
        root = self.out_dir / self.core_dist / self.core_module
        resolver = self._resolver(self.core_module)

        for tree in CORE_TREES:
            if tree in self.vendor.owner:  # the whole tree moved into a bundle
                continue
            is_vendor = tree == VENDOR_PARENT
            moved = [d for d in self.vendor.owner if is_vendor and (self.source / tree / d).is_dir()]
            self._copy_tree(Path(tree), root / tree, resolver,
                            vendor_root=self.source / tree if is_vendor else None, skip=moved)
        self._copy_tree(Path('async_support') / 'base', root / 'async_support' / 'base', resolver)

        for source_name, target in (
            ('__init__.py', root / '__init__.py'),
            (Path('async_support') / '__init__.py', root / 'async_support' / '__init__.py'),
        ):
            text = (self.source / source_name).read_text(encoding='utf-8')
            text = filter_init(text, [], self.layout.all_ids)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(rewrite_source(text, resolver), encoding='utf-8')

        self._write_project(package, root)
        return package

    # -- vendored bundles -------------------------------------------------

    def emit_bundle(self, bundle: Bundle) -> Package:
        module_name = bundle.module_name(self.module_prefix)
        package = Package(bundle.dist_name(self.dist_prefix), module_name, None, [],
                          kind='bundle', bundle_name=bundle.name)
        root = self.out_dir / package.dist_name / module_name
        resolver = self._resolver(module_name)

        for source_tree, directory in bundle.trees:
            relative = source_tree.relative_to(self.source)
            under_vendor = source_tree.parent.name == VENDOR_PARENT
            self._copy_tree(relative, root / directory, resolver,
                            vendor_root=source_tree.parent if under_vendor else None)
        (root / '__init__.py').write_text(
            '# -*- coding: utf-8 -*-\n\n'
            '"""Vendored third-party code used by ccxt-core: %s.\n\n'
            'Generated by python/split/split_packages.py - not a public API.\n"""\n'
            % ', '.join(directory for _, directory in bundle.trees),
            encoding='utf-8')

        package.requires = {self.vendor.bundles[name].module_name(self.module_prefix) for name in bundle.requires}
        self._write_project(package, root)
        return package

    # -- exchanges --------------------------------------------------------

    def emit_exchange(self, exchange_id: str) -> Package:
        flavours = self.layout.flavours_of(exchange_id)
        module_name = self.module_prefix + exchange_id
        package = Package(self.dist_prefix + exchange_id, module_name, exchange_id, flavours)
        root = self.out_dir / package.dist_name / module_name
        resolver = self._resolver(module_name)

        for flavour in flavours:
            relative = Path(exchange_id + '.py') if flavour == 'sync' else Path(flavour) / (exchange_id + '.py')
            target = root / relative
            self._copy_rewritten(relative, target, resolver)

            init_source = '__init__.py' if flavour == 'sync' else str(Path(flavour) / '__init__.py')
            text = (self.source / init_source).read_text(encoding='utf-8')
            text = filter_init(text, [exchange_id], self.layout.all_ids)
            init_target = root / '__init__.py' if flavour == 'sync' else root / flavour / '__init__.py'
            init_target.parent.mkdir(parents=True, exist_ok=True)
            init_target.write_text(rewrite_source(text, resolver), encoding='utf-8')

        # an exchange with no sync flavour (prediction-only venues) still needs a
        # top-level __init__ so `import ccxt_kalshi.prediction` resolves
        if 'sync' not in flavours:
            text = filter_init((self.source / '__init__.py').read_text(encoding='utf-8'), [], self.layout.all_ids)
            (root / '__init__.py').write_text(rewrite_source(text, resolver), encoding='utf-8')

        for abstract in (Path('abstract') / (exchange_id + '.py'), Path('abstract') / 'prediction' / (exchange_id + '.py')):
            if (self.source / abstract).is_file():
                self._copy_rewritten(abstract, root / abstract, resolver)
                for marker in (root / 'abstract' / '__init__.py', root / abstract.parent / '__init__.py'):
                    marker.parent.mkdir(parents=True, exist_ok=True)
                    marker.touch()

        package.requires = {name for name in resolver.referenced if name != module_name}
        # the vendored code an exchange reaches is imported lazily by ccxt-core's
        # base methods, so it never shows up in `referenced` - see plan_vendoring
        package.requires |= {self.vendor.bundles[name].module_name(self.module_prefix)
                             for name in self.vendor.exchange_bundles.get(exchange_id, ())}
        self._write_project(package, root)
        return package

    # -- packaging metadata ----------------------------------------------

    def dist_for_module(self, module_name: str) -> str:
        tail = module_name[len(self.module_prefix):]
        if tail.startswith(CORE_SUFFIX + '_'):  # ccxt_core_dydx_v4_client -> ccxt-core-dydx-v4-client
            tail = tail.replace('_', '-')
        return self.dist_prefix + tail

    def _write_project(self, package: Package, root: Path) -> None:
        project = self.metadata['project']
        version = self.layout.version
        pinned = ['%s==%s' % (self.dist_for_module(m), version) for m in sorted(package.requires)]
        if package.is_core:
            description = 'ccxt base classes, errors and ws plumbing - shared by every ccxt-<exchange> package'
            requirements = list(project['dependencies'])
        elif package.kind == 'bundle':
            description = 'vendored %s, used by the ccxt exchanges that need it' % package.module_name
            requirements = pinned
        else:
            description = 'ccxt API for the %s exchange, without the other %d exchanges' % (
                package.exchange_id,
                len(self.layout.all_ids) - 1,
            )
            requirements = pinned

        lines = [
            '# Generated by python/split/split_packages.py - do not edit by hand.',
            '[build-system]',
            'requires = ["setuptools>=77"]',
            'build-backend = "setuptools.build_meta"',
            '',
            '[project]',
            'name = %s' % json.dumps(package.dist_name),
            'version = %s' % json.dumps(version),
            'description = %s' % json.dumps(description),
            'readme = "README.md"',
            'license = %s' % json.dumps(project['license']),
            'requires-python = %s' % json.dumps(project['requires-python']),
            'authors = [',
            '    { name = %s, email = %s },' % (
                json.dumps(project['authors'][0]['name']),
                json.dumps(project['authors'][0]['email']),
            ),
            ']',
            'keywords = [',
        ]
        keywords = list(project['keywords'])
        if package.exchange_id:
            keywords = [package.exchange_id] + keywords
        lines += ['    %s,' % json.dumps(keyword) for keyword in keywords]
        lines += [']', 'classifiers = [']
        lines += ['    %s,' % json.dumps(classifier) for classifier in project['classifiers']]
        lines += [']', 'dependencies = [']
        lines += ['    %s,' % json.dumps(requirement) for requirement in requirements]
        lines += [']']
        if package.is_core and self.vendor.bundles:
            # the vendored trees are pulled in by whichever exchange package needs
            # them; these extras let anyone calling the base methods directly ask
            # for them by hand, e.g. `pip install ccxt-core[starknet]`
            lines += ['', '[project.optional-dependencies]']
            everything = []
            for name, bundle in sorted(self.vendor.bundles.items()):
                requirement = '%s==%s' % (bundle.dist_name(self.dist_prefix), version)
                everything.append(requirement)
                lines.append('%s = [%s]' % (name.replace('_', '-'), json.dumps(requirement)))
            lines.append('all = [%s]' % ', '.join(json.dumps(r) for r in everything))
        lines += [
            '',
            '[project.urls]',
        ]
        for key, value in project['urls'].items():
            lines.append('%s = %s' % (key, json.dumps(value)))
        lines += [
            '',
            '[tool.setuptools.packages.find]',
            'where = ["."]',
            'include = [%s, %s]' % (json.dumps(package.module_name), json.dumps(package.module_name + '.*')),
            '',
            '[tool.setuptools.package-data]',
            '# static_dependencies vendors grammars, wordlists and Cython sources alongside the modules',
            '"*" = ["**/*"]',
            '',
        ]
        (root.parent / 'pyproject.toml').write_text('\n'.join(lines), encoding='utf-8')
        (root.parent / 'README.md').write_text(self._readme(package), encoding='utf-8')

    def _readme(self, package: Package) -> str:
        if package.is_core:
            return (
                '# %s\n\n'
                'Shared runtime for the per-exchange [ccxt](https://github.com/ccxt/ccxt) packages: `Exchange`,\n'
                '`Precise`, the error hierarchy and the WebSocket client.\n\n'
                'It contains no exchange implementations. Install `%s<exchange>` instead - it pulls this in.\n\n'
                'The vendored third-party code the base class imports lazily (starknet signing, dydx\n'
                'transaction encoding, msgpack, keccak, …) ships separately, so it only lands on the\n'
                'installs that reach it. Exchange packages depend on what they need; to pull one in by\n'
                'hand use an extra, e.g. `pip install %s[starknet]` or `%s[all]`.\n\n'
                'Generated from ccxt %s by `python/split/split_packages.py`.\n'
                % (package.dist_name, self.dist_prefix, package.dist_name, package.dist_name,
                   self.layout.version)
            )
        if package.kind == 'bundle':
            bundle = self.vendor.bundles[package.bundle_name]
            users = sorted(e for e, names in self.vendor.exchange_bundles.items() if package.bundle_name in names)
            return (
                '# %s\n\n'
                'Third-party code vendored into [ccxt](https://github.com/ccxt/ccxt) and imported lazily by\n'
                '`%s`: %s.\n\n'
                'You do not install this directly - the %d exchange package(s) that reach it depend on it: %s.\n\n'
                'Generated from ccxt %s by `python/split/split_packages.py`.\n'
                % (package.dist_name, self.core_dist,
                   ', '.join('`%s`' % directory for _, directory in bundle.trees),
                   len(users), ', '.join(users) or 'none',
                   self.layout.version)
            )
        entry_points = []
        if 'sync' in package.flavours:
            entry_points.append(
                'import %s\n\nexchange = %s.%s()\nprint(exchange.fetch_ticker("BTC/USDT"))'
                % (package.module_name, package.module_name, package.exchange_id)
            )
        if 'async_support' in package.flavours:
            entry_points.append(
                'import %s.async_support as %s_async\n\nexchange = %s_async.%s()'
                % (package.module_name, package.exchange_id, package.exchange_id, package.exchange_id)
            )
        if 'pro' in package.flavours:
            entry_points.append(
                'import %s.pro as %s_pro\n\nexchange = %s_pro.%s()'
                % (package.module_name, package.exchange_id, package.exchange_id, package.exchange_id)
            )
        if 'prediction' in package.flavours:
            entry_points.append(
                'import %s.prediction as %s_prediction\n\nexchange = %s_prediction.%s()'
                % (package.module_name, package.exchange_id, package.exchange_id, package.exchange_id)
            )
        blocks = '\n\n'.join('```python\n%s\n```' % block for block in entry_points)
        siblings = sorted(self.dist_for_module(m) for m in package.requires if m != self.core_module)
        extra = ''
        if siblings:
            extra = '\nThis exchange subclasses another one, so it also installs %s.\n' % ', '.join(
                '`%s`' % s for s in siblings
            )
        return (
            '# %s\n\n'
            '[ccxt](https://github.com/ccxt/ccxt) for **%s** only. Importing it loads one exchange instead\n'
            'of all %d, which keeps import time, memory and dependency surface proportional to what you use.\n\n'
            '```console\n$ pip install %s\n```\n\n'
            '%s\n%s\n'
            'API and behaviour are identical to `ccxt.%s` upstream.\n\n'
            'Generated from ccxt %s by `python/split/split_packages.py`.\n'
            % (
                package.dist_name,
                package.exchange_id,
                len(self.layout.all_ids),
                package.dist_name,
                blocks,
                extra,
                package.exchange_id,
                self.layout.version,
            )
        )


# ---------------------------------------------------------------------------
# driver
# ---------------------------------------------------------------------------


def build_distributions(out_dir: Path, packages: Sequence[Package], dist_dir: Path, jobs: int,
                        isolation: bool = True) -> None:
    dist_dir.mkdir(parents=True, exist_ok=True)
    flags = [] if isolation else ['--no-isolation']

    def build(package: Package) -> Tuple[str, int, str]:
        result = subprocess.run(
            [sys.executable, '-m', 'build', '--outdir', str(dist_dir), *flags, str(out_dir / package.dist_name)],
            capture_output=True,
            text=True,
        )
        return package.dist_name, result.returncode, result.stderr or result.stdout

    with ThreadPoolExecutor(max_workers=jobs) as pool:
        failures = [(name, log) for name, code, log in pool.map(build, packages) if code != 0]
    for name, log in failures:
        print('build failed: %s\n%s' % (name, log[-2000:]), file=sys.stderr)
    if failures:
        raise SystemExit('%d distribution(s) failed to build' % len(failures))
    print('built %d distributions into %s' % (len(packages), dist_dir))


def split(
    out_dir: Path,
    only: Optional[Sequence[str]] = None,
    dist_prefix: str = DEFAULT_DIST_PREFIX,
    module_prefix: str = DEFAULT_MODULE_PREFIX,
    clean: bool = True,
    source: Path = SOURCE_PACKAGE,
    split_vendored: bool = True,
) -> List[Package]:
    """Generate ``ccxt-core`` plus one distribution per exchange. Returns them."""
    layout = discover_layout(source)
    if clean and out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    vendor = plan_vendoring(source, layout, split=split_vendored)
    splitter = Splitter(out_dir, layout, source, dist_prefix, module_prefix, vendor)
    packages = [splitter.emit_core()]

    selected = list(layout.all_ids)
    if only:
        unknown = sorted(set(only) - set(layout.all_ids))
        if unknown:
            raise SystemExit('unknown exchange id(s): %s' % ', '.join(unknown))
        selected = [i for i in layout.all_ids if i in set(only)]
        selected = _with_parents(splitter, selected)

    # always emit every bundle, even for a subset: ccxt-core's lazy imports and
    # its extras name all of them regardless of which exchanges were selected
    packages += [splitter.emit_bundle(bundle) for _, bundle in sorted(vendor.bundles.items())]
    packages += [splitter.emit_exchange(exchange_id) for exchange_id in selected]

    manifest = {
        'ccxt_version': layout.version,
        'dist_prefix': dist_prefix,
        'module_prefix': module_prefix,
        'packages': [
            {
                'dist': package.dist_name,
                'module': package.module_name,
                'exchange': package.exchange_id,
                'flavours': package.flavours,
                'kind': package.kind,
                'requires': sorted(splitter.dist_for_module(m) for m in package.requires),
            }
            for package in packages
        ],
    }
    (out_dir / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    return packages


def _with_parents(splitter: Splitter, selected: Sequence[str]) -> List[str]:
    """Add the exchanges the selection inherits from, transitively."""
    resolved: List[str] = []
    pending = list(selected)
    seen: Set[str] = set()
    while pending:
        exchange_id = pending.pop()
        if exchange_id in seen:
            continue
        seen.add(exchange_id)
        resolved.append(exchange_id)
        probe = Resolver(splitter.layout, splitter.module_prefix, splitter.module_prefix + exchange_id)
        for flavour in splitter.layout.flavours_of(exchange_id):
            relative = exchange_id + '.py' if flavour == 'sync' else '%s/%s.py' % (flavour, exchange_id)
            rewrite_source((splitter.source / relative).read_text(encoding='utf-8'), probe)
        for module in probe.referenced:
            parent = module[len(splitter.module_prefix):]
            if parent in splitter.layout.all_ids and parent not in seen:
                pending.append(parent)
    return [i for i in splitter.layout.all_ids if i in seen]


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--out', type=Path, default=REPO_ROOT / 'python' / 'split-dist',
                        help='directory to write the generated source distributions into')
    parser.add_argument('--source', type=Path, default=SOURCE_PACKAGE, help='the monolithic ccxt package to split')
    parser.add_argument('--only', help='comma-separated exchange ids; parents are pulled in automatically')
    parser.add_argument('--dist-prefix', default=DEFAULT_DIST_PREFIX, help='PyPI name prefix (default: ccxt-)')
    parser.add_argument('--module-prefix', default=DEFAULT_MODULE_PREFIX, help='import name prefix (default: ccxt_)')
    parser.add_argument('--no-clean', action='store_true', help='keep whatever is already in --out')
    parser.add_argument('--build', action='store_true', help='also run `python -m build` for every package')
    parser.add_argument('--dist-dir', type=Path, default=None, help='where --build puts wheels (default: <out>/dist)')
    parser.add_argument('--jobs', type=int, default=min(8, (os.cpu_count() or 2)), help='parallel builds')
    parser.add_argument('--no-isolation', action='store_true',
                        help='reuse the current environment for --build instead of creating one per package')
    parser.add_argument('--vendored', choices=['split', 'core'], default='split',
                        help='publish the vendored third-party trees separately (default) or inside ccxt-core')
    args = parser.parse_args(argv)

    only = [i.strip() for i in args.only.split(',') if i.strip()] if args.only else None
    packages = split(
        out_dir=args.out,
        only=only,
        dist_prefix=args.dist_prefix,
        module_prefix=args.module_prefix,
        clean=not args.no_clean,
        source=args.source,
        split_vendored=args.vendored == 'split',
    )
    print('generated %d packages into %s' % (len(packages), args.out))
    if args.build:
        build_distributions(args.out, packages, args.dist_dir or args.out / 'dist', args.jobs,
                            isolation=not args.no_isolation)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

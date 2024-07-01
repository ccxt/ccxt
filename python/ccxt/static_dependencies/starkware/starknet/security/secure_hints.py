import os
import re
from dataclasses import field
from typing import ClassVar, Dict, Iterable, List, Set, Type

import marshmallow
import marshmallow.fields as mfields
import marshmallow_dataclass

from starkware.cairo.lang.compiler.parser import parse_expr
from starkware.cairo.lang.compiler.preprocessor.flow import ReferenceManager
from starkware.cairo.lang.compiler.program import CairoHint, Program
from starkware.starknet.security.simple_references import is_simple_reference
from starkware.starkware_utils.marshmallow_dataclass_fields import additional_metadata
from starkware.starkware_utils.validated_dataclass import (
    ValidatedDataclass,
    ValidatedMarshmallowDataclass,
)


class SetField(mfields.List):
    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        res = super()._serialize(value, attr, obj, **kwargs)
        assert res is not None
        return sorted(res, key=lambda x: (x["name"], x["expr"]))

    def _deserialize(self, *args, **kwargs):
        return set(super()._deserialize(*args, **kwargs))


class InsecureHintError(Exception):
    pass


@marshmallow_dataclass.dataclass(frozen=True)
class NamedExpression(ValidatedMarshmallowDataclass):
    name: str
    expr: str

    def __lt__(self, other):
        if not isinstance(other, NamedExpression):
            return NotImplemented
        return (self.name, self.expr) < (other.name, other.expr)


@marshmallow_dataclass.dataclass(frozen=True)
class HintsWhitelistEntry(ValidatedDataclass):
    hint_lines: List[str]
    allowed_expressions: Set[NamedExpression] = field(
        metadata=additional_metadata(
            marshmallow_field=SetField(mfields.Nested(NamedExpression.Schema))
        )
    )
    Schema: ClassVar[Type[marshmallow.Schema]]

    def serialize(self) -> dict:
        return HintsWhitelistEntry.Schema().dump(self)


class HintsWhitelistDict(mfields.Field):
    """
    A field that behaves like a dictionary from hint to a set of allowed expressions, but
    serializes as a list where the hint is split to lines.
    """

    def _serialize(self, value, attr, obj, **kwargs):
        return [
            HintsWhitelistEntry(
                hint_lines.split("\n"), allowed_expressions=allowed_expressions
            ).serialize()
            for hint_lines, allowed_expressions in sorted(value.items())
        ]

    def _deserialize(self, value, attr, data, **kwargs) -> Dict[str, Set[NamedExpression]]:
        entries = [HintsWhitelistEntry.Schema().load(entry) for entry in value]
        return {"\n".join(entry.hint_lines): entry.allowed_expressions for entry in entries}


@marshmallow_dataclass.dataclass(frozen=True)
class HintsWhitelist(ValidatedMarshmallowDataclass):
    """
    Checks the security of hints in a Cairo program against a whitelist.
    """

    # Maps a hint string to the set of allowed expressions in its references.
    allowed_reference_expressions_for_hint: Dict[str, Set[NamedExpression]] = field(
        metadata=additional_metadata(marshmallow_field=HintsWhitelistDict())
    )

    @classmethod
    def empty(cls):
        """
        Returns an empty whitelist.
        """
        return cls(allowed_reference_expressions_for_hint={})

    # Serialization operations.
    @classmethod
    def from_file(cls, filename: str) -> "HintsWhitelist":
        with open(filename, "r") as fp:
            return cls.loads(data=fp.read())

    @classmethod
    def from_dir(cls, dirname: str) -> "HintsWhitelist":
        """
        Returns a whitelist from all the files in the given directory.
        """
        whitelists = [
            cls.from_file(filename=os.path.join(dirname, x))
            for x in os.listdir(dirname)
            if x.endswith(".json")
        ]

        return cls.union(whitelists)

    @classmethod
    def from_program(cls, program: Program) -> "HintsWhitelist":
        """
        Creates a whitelist from all the hints in an existing program.
        """
        whitelist = cls.empty()
        for hints in program.hints.values():
            for hint in hints:
                whitelist.add_hint_to_whitelist(hint, program.reference_manager)
        return whitelist

    def add_hint_to_whitelist(self, hint: CairoHint, reference_manager: ReferenceManager):
        self.allowed_reference_expressions_for_hint.setdefault(hint.code, set()).update(
            self._get_hint_reference_expressions(hint, reference_manager)
        )

    @classmethod
    def union(cls, whitelists: Iterable["HintsWhitelist"]) -> "HintsWhitelist":
        """
        Returns the union of the given list of whitelists.
        """
        res: Dict[str, Set[NamedExpression]] = {}
        for whitelist in whitelists:
            for code, refs in whitelist.allowed_reference_expressions_for_hint.items():
                res.setdefault(code, set()).update(refs)
        return cls(allowed_reference_expressions_for_hint=res)

    def diff(self, other_whitelist: "HintsWhitelist") -> "HintsWhitelist":
        """
        Returns the difference between this whitelist and the given other_whitelist.
        """
        diff_allowed_reference_expressions_for_hint = {
            code: self.allowed_reference_expressions_for_hint[code]
            for code in (
                self.allowed_reference_expressions_for_hint.keys()
                - other_whitelist.allowed_reference_expressions_for_hint.keys()
            )
        }
        return HintsWhitelist(
            allowed_reference_expressions_for_hint=diff_allowed_reference_expressions_for_hint
        )

    # Reading operations.
    def verify_program_hint_secure(self, program: Program):
        """
        Determines whether a Cairo program is hint-secure. This happens when all the
        hints and their associated reference expressions exist within a given whitelist.
        """
        for hints in program.hints.values():
            for hint in hints:
                self.verify_hint_secure(hint=hint, reference_manager=program.reference_manager)

    def verify_hint_secure(self, hint: CairoHint, reference_manager: ReferenceManager):
        allowed_expressions = self.allowed_reference_expressions_for_hint.get(hint.code)
        if allowed_expressions is None:
            raise InsecureHintError(f"Hint is not whitelisted:\n{hint.code}")

        expressions = self._get_hint_reference_expressions(hint, reference_manager)
        invalid_expressions = expressions - allowed_expressions
        if invalid_expressions:
            raise InsecureHintError(
                f'Forbidden expressions in hint "{hint.code}":\n{sorted(invalid_expressions)}'
            )

    def _get_hint_reference_expressions(
        self, hint: CairoHint, reference_manager: ReferenceManager
    ) -> Set[NamedExpression]:
        ref_exprs: Set[NamedExpression] = set()
        for ref_name, ref_id in hint.flow_tracking_data.reference_ids.items():
            if re.match("^__temp[0-9]+$", ref_name.path[-1]):
                continue
            ref = reference_manager.get_ref(ref_id)
            # Format and parse to get a canonical form of the expression to guarantee the same
            # simplicity value after serialization.
            ref_expr_str = ref.value.format()
            cannocial_form = parse_expr(ref_expr_str)
            if is_simple_reference(cannocial_form, simplicity_bound=20):
                continue
            ref_exprs.add(NamedExpression(name=str(ref_name), expr=ref_expr_str))
        return ref_exprs

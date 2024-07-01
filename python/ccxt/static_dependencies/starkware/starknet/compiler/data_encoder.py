import dataclasses
from enum import Enum, auto
from typing import Callable, List, Optional, Sequence, Tuple

from starkware.cairo.lang.compiler.ast.cairo_types import (
    CairoType,
    TypeFelt,
    TypePointer,
    TypeStruct,
    TypeTuple,
)
from starkware.cairo.lang.compiler.ast.code_elements import CommentedCodeElement
from starkware.cairo.lang.compiler.ast.expr import ArgList, ExprAssignment, ExprIdentifier
from starkware.cairo.lang.compiler.ast.notes import Notes
from starkware.cairo.lang.compiler.error_handling import Location, ParentLocation
from starkware.cairo.lang.compiler.identifier_definition import StructDefinition
from starkware.cairo.lang.compiler.identifier_manager import IdentifierManager
from starkware.cairo.lang.compiler.parser import ParserContext
from starkware.cairo.lang.compiler.preprocessor.preprocessor_error import PreprocessorError
from starkware.cairo.lang.compiler.preprocessor.preprocessor_utils import autogen_parse_code_block
from starkware.cairo.lang.compiler.type_utils import check_felts_only_type


class EncodingType(Enum):
    """
    The required encoding type.
    Controls the temporary variable names and the error messages.
    """

    CALLDATA = 0
    RETURN = auto()


@dataclasses.dataclass
class ArgumentInfo:
    name: str
    # The resolved type of the argument.
    cairo_type: CairoType
    location: Location


def struct_to_argument_info_list(struct_def: StructDefinition) -> List[ArgumentInfo]:
    """
    Returns a list of ArgumentInfo entries that correspond to the struct members.
    """
    res = []
    for name, member_def in struct_def.members.items():
        assert member_def.location is not None
        res.append(
            ArgumentInfo(name=name, cairo_type=member_def.cairo_type, location=member_def.location)
        )
    return res


def tuple_type_to_argument_info_list(cairo_type: TypeTuple) -> List[ArgumentInfo]:
    """
    Returns a list of ArgumentInfo entries that correspond to the tuple members.
    """
    res = []
    for member in cairo_type.members:
        assert member.location is not None
        assert member.name is not None, "tuple_type_to_argument_info_list expects a named tuple."

        res.append(ArgumentInfo(name=member.name, cairo_type=member.typ, location=member.location))
    return res


class DataEncodingProcessor:
    """
    An helper class for encoding and decoding list of typed arguments to a list of felts.
    """

    # See var_name().
    VARIABLE_NAME = {
        EncodingType.CALLDATA: "calldata",
        EncodingType.RETURN: "return_value",
    }

    # See all_args_text().
    ALL_ARGS_TEXT = {
        EncodingType.CALLDATA: "calldata",
        EncodingType.RETURN: "return values",
    }

    # See arg_text().
    ARGUMENT_TEXT = {
        EncodingType.CALLDATA: "calldata argument",
        EncodingType.RETURN: "return value",
    }

    def __init__(
        self,
        encoding_type: EncodingType,
        has_range_check_builtin: bool,
        identifiers: IdentifierManager,
    ):
        self.encoding_type = encoding_type
        self.has_range_check_builtin = has_range_check_builtin
        self.code_elements: List[CommentedCodeElement] = []
        self.args: List[ExprAssignment] = []
        self.identifiers = identifiers

    @property
    def var_name(self):
        """
        The base variable name. For example 'calldata'.
        """
        return DataEncodingProcessor.VARIABLE_NAME[self.encoding_type]

    @property
    def all_args_text(self):
        """
        A text for error messages that refers to the entire input.
        """
        return DataEncodingProcessor.ALL_ARGS_TEXT[self.encoding_type]

    @property
    def arg_text(self):
        """
        A text for error messages that refers to a single argument.
        """
        return DataEncodingProcessor.ARGUMENT_TEXT[self.encoding_type]

    def add_code(self, code: str, parent_location: ParentLocation):
        code_block = autogen_parse_code_block(
            path="autogen/starknet/arg_processor",
            code=code,
            parser_context=ParserContext(
                parent_location=parent_location,
                resolved_types=True,
            ),
        )
        self.code_elements += code_block.code_elements

    def run(self, arguments: Sequence[ArgumentInfo]):
        self.pre_process()
        prev_arg: Optional[ArgumentInfo] = None
        for arg_info in arguments:
            member_parent_location = (
                arg_info.location,
                f"While handling {self.arg_text} '{arg_info.name}'",
            )
            cairo_type = arg_info.cairo_type
            if isinstance(cairo_type, TypePointer):
                elm_size = check_felts_only_type(
                    cairo_type=cairo_type.pointee, identifier_manager=self.identifiers
                )
                if elm_size is None:
                    raise PreprocessorError(
                        "Only pointers to types that consist of felts are supported.",
                        location=arg_info.cairo_type.location,
                    )

                has_len = (
                    prev_arg is not None
                    and prev_arg.name == f"{arg_info.name}_len"
                    and isinstance(prev_arg.cairo_type, TypeFelt)
                )
                if not has_len:
                    raise PreprocessorError(
                        f'Array argument "{arg_info.name}" must be preceded by a length argument '
                        f'named "{arg_info.name}_len" of type felt.',
                        location=arg_info.location,
                    )
                if not self.has_range_check_builtin:
                    raise PreprocessorError(
                        "The 'range_check' builtin must be declared in the '%builtins' directive "
                        "when using array arguments in external functions.",
                        location=arg_info.location,
                    )

                code_block_str = self.process_array(arg_info=arg_info, elm_size=elm_size)
            elif isinstance(cairo_type, (TypeTuple, TypeStruct)):
                size = check_felts_only_type(
                    cairo_type=cairo_type, identifier_manager=self.identifiers
                )
                if size is None:
                    raise PreprocessorError(
                        f"{self.arg_text} must be a felts-only type (cannot contain pointers).",
                        location=arg_info.location,
                    )
                code_block_str = self.process_felts_object(arg_info=arg_info, size=size)
            elif isinstance(cairo_type, TypeFelt):
                code_block_str = self.process_felt(arg_info=arg_info)
            else:
                raise PreprocessorError(
                    f"Unsupported {self.arg_text} type {cairo_type.format()}.",
                    location=cairo_type.location,
                )

            self.add_code(code_block_str, parent_location=member_parent_location)

            self.args.append(
                ExprAssignment(
                    identifier=ExprIdentifier(name=arg_info.name, location=arg_info.location),
                    expr=ExprIdentifier(
                        name=f"__{self.var_name}_arg_{arg_info.name}", location=arg_info.location
                    ),
                    location=arg_info.location,
                )
            )

            prev_arg = arg_info
        self.post_process()

    def pre_process(self):
        """
        Called before processing the arguments.
        """

    def post_process(self):
        """
        Called after processing the arguments.
        """

    def process_felt(self, arg_info: ArgumentInfo):
        raise PreprocessorError(
            "felt arguments are not supported in this context", location=arg_info.location
        )

    def process_array(self, arg_info: ArgumentInfo, elm_size: int):
        raise PreprocessorError(
            "Array arguments are not supported in this context", location=arg_info.location
        )

    def process_felts_object(self, arg_info: ArgumentInfo, size: int):
        """
        Handles tuples or structs which recursively consist only of felts.
        """
        raise PreprocessorError(
            "Tuples/structs are not supported in this context", location=arg_info.location
        )


class DataDecoder(DataEncodingProcessor):
    def __init__(
        self,
        data_ptr: str,
        data_size: str,
        has_range_check_builtin: bool,
        encoding_type: EncodingType,
        location: Location,
        identifiers: IdentifierManager,
    ):
        super().__init__(
            encoding_type=encoding_type,
            has_range_check_builtin=has_range_check_builtin,
            identifiers=identifiers,
        )
        self.data_ptr = data_ptr
        self.data_size = data_size
        self.struct_parent_location = (location, f"While handling {self.all_args_text} of")

    def pre_process(self):
        self.add_code(
            f"""\
let __{self.var_name}_ptr: felt* = cast({self.data_ptr}, felt*);
""",
            parent_location=self.struct_parent_location,
        )

    def post_process(self):
        self.add_code(
            f"""\
let __{self.var_name}_actual_size =  __{self.var_name}_ptr - cast({self.data_ptr}, felt*);
""",
            parent_location=self.struct_parent_location,
        )
        self.add_code(
            f"""\
assert {self.data_size} = __{self.var_name}_actual_size;
""",
            parent_location=self.struct_parent_location,
        )

    def process_felt(self, arg_info: ArgumentInfo):
        return f"""\
let __{self.var_name}_arg_{arg_info.name} = [__{self.var_name}_ptr];
let __{self.var_name}_ptr = __{self.var_name}_ptr + 1;
"""

    def process_array(self, arg_info: ArgumentInfo, elm_size: int):
        type_str = arg_info.cairo_type.format()
        var = f"__{self.var_name}_arg_{arg_info.name}"
        len_var = f"__{self.var_name}_arg_{arg_info.name}_len"
        return f"""\
// Check that the length is non-negative.
assert [range_check_ptr] = {len_var};
let range_check_ptr = range_check_ptr + 1;
// Create the reference.
let {var} = cast(__{self.var_name}_ptr, {type_str});
// Use 'tempvar' instead of 'let' to avoid repeating this computation for the
// following arguments.
tempvar __{self.var_name}_ptr = __{self.var_name}_ptr + {len_var} * {elm_size};
"""

    def process_felts_object(self, arg_info: ArgumentInfo, size: int):
        return f"""\
let __{self.var_name}_arg_{arg_info.name} = [
    cast(__{self.var_name}_ptr, {TypePointer(pointee=arg_info.cairo_type).format()})];
let __{self.var_name}_ptr = __{self.var_name}_ptr + {size};
"""


def decode_data(
    data_ptr: str,
    data_size: str,
    arguments: Sequence[ArgumentInfo],
    encoding_type: EncodingType,
    has_range_check_builtin: bool,
    location: Location,
    identifiers: IdentifierManager,
) -> Tuple[List[CommentedCodeElement], ArgList]:
    """
    Processes the calldata of a function.

    Returns code elements that create the required references and an ArgList that corresponds to
    'struct_def'.

    Currently only the cases:
        (1) felt
        (2) array of felts
    are supported.
    """

    parser = DataDecoder(
        data_ptr=data_ptr,
        data_size=data_size,
        encoding_type=encoding_type,
        has_range_check_builtin=has_range_check_builtin,
        location=location,
        identifiers=identifiers,
    )
    parser.run(arguments)
    args = parser.args
    has_trailing_comma = len(args) > 0
    return parser.code_elements, ArgList(
        args=args,
        notes=[Notes()] * (len(args) + 1),
        has_trailing_comma=has_trailing_comma,
        location=location,
    )


class DataEncoder(DataEncodingProcessor):
    def __init__(
        self,
        arg_name_func: Callable[[ArgumentInfo], str],
        encoding_type: EncodingType,
        has_range_check_builtin: bool,
        identifiers: IdentifierManager,
    ):
        """
        Constructs a DataEncoder instance.

        arg_name_func is a function that get ArgumentInfo and returns the name of the reference
        containing that argument.
        """
        super().__init__(
            encoding_type=encoding_type,
            has_range_check_builtin=has_range_check_builtin,
            identifiers=identifiers,
        )
        self.arg_name_func = arg_name_func

        # True if the compiler can track the change in the ap register in the generated code.
        self.known_ap_change = True

    def process_felt(self, arg_info: ArgumentInfo):
        return f"""\
assert [__{self.var_name}_ptr] = {self.arg_name_func(arg_info)};
let __{self.var_name}_ptr = __{self.var_name}_ptr + 1;
"""

    def process_array(self, arg_info: ArgumentInfo, elm_size: int):
        len_var = f"{self.arg_name_func(arg_info)}_len"
        self.known_ap_change = False
        return f"""\
// Check that the length is non-negative.
assert [range_check_ptr] = {len_var};
// Store the updated range_check_ptr as a local variable to keep it available after
// the memcpy.
local range_check_ptr = range_check_ptr + 1;
// Keep a reference to __{self.var_name}_ptr.
let __{self.var_name}_ptr_copy = __{self.var_name}_ptr;
// Store the updated __{self.var_name}_ptr as a local variable to keep it available after
// the memcpy.
local __{self.var_name}_ptr: felt* = __{self.var_name}_ptr + {len_var} * {elm_size};
memcpy(
    dst=__{self.var_name}_ptr_copy,
    src={self.arg_name_func(arg_info)},
    len={len_var} * {elm_size});
"""

    def process_felts_object(self, arg_info: ArgumentInfo, size: int):
        body = "\n".join(
            f"assert [__{self.var_name}_ptr + {i}] = [__{self.var_name}_tmp + {i}];"
            for i in range(size)
        )
        return f"""\
// Create a reference to {self.arg_name_func(arg_info)} as felt*.
let __{self.var_name}_tmp: felt* = cast(&{self.arg_name_func(arg_info)}, felt*);
{body}
let __{self.var_name}_ptr = __{self.var_name}_ptr + {size};
"""


def encode_data(
    arguments: Sequence[ArgumentInfo],
    encoding_type: EncodingType,
    has_range_check_builtin: bool,
    identifiers: IdentifierManager,
    arg_name_func: Callable[[ArgumentInfo], str] = lambda arg_info: arg_info.name,
) -> List[CommentedCodeElement]:
    parser = DataEncoder(
        arg_name_func=arg_name_func,
        encoding_type=encoding_type,
        has_range_check_builtin=has_range_check_builtin,
        identifiers=identifiers,
    )
    parser.run(arguments)
    return parser.code_elements

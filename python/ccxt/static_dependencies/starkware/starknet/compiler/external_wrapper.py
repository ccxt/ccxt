import dataclasses
from typing import Dict, List, Optional, Set, Tuple

from starkware.cairo.lang.compiler.ast.cairo_types import CairoType, TypeFelt, TypeTuple
from starkware.cairo.lang.compiler.ast.code_elements import (
    CodeElementFunction,
    CodeElementImport,
    CodeElementReturnValueReference,
    CodeElementScoped,
    CodeElementWith,
    CommentedCodeElement,
)
from starkware.cairo.lang.compiler.ast.expr import (
    ArgList,
    ExprAssignment,
    Expression,
    ExprIdentifier,
)
from starkware.cairo.lang.compiler.ast.notes import Notes
from starkware.cairo.lang.compiler.ast.types import TypedIdentifier
from starkware.cairo.lang.compiler.ast.visitor import Visitor
from starkware.cairo.lang.compiler.error_handling import Location
from starkware.cairo.lang.compiler.identifier_definition import AliasDefinition, MemberDefinition
from starkware.cairo.lang.compiler.identifier_manager import IdentifierManager
from starkware.cairo.lang.compiler.instruction import Register
from starkware.cairo.lang.compiler.parser import ParserContext, parse_type
from starkware.cairo.lang.compiler.preprocessor.identifier_aware_visitor import (
    IdentifierAwareVisitor,
)
from starkware.cairo.lang.compiler.preprocessor.identifier_collector import IdentifierCollector
from starkware.cairo.lang.compiler.preprocessor.pass_manager import PassManagerContext, Stage
from starkware.cairo.lang.compiler.preprocessor.preprocessor_error import PreprocessorError
from starkware.cairo.lang.compiler.preprocessor.preprocessor_utils import autogen_parse_code_block
from starkware.cairo.lang.compiler.preprocessor.struct_collector import StructCollector
from starkware.cairo.lang.compiler.references import create_simple_ref_expr
from starkware.cairo.lang.compiler.scoped_name import ScopedName
from starkware.cairo.lang.compiler.type_casts import FELT_STAR
from starkware.python.utils import safe_zip
from starkware.starknet.compiler.data_encoder import (
    DataEncoder,
    EncodingType,
    decode_data,
    struct_to_argument_info_list,
    tuple_type_to_argument_info_list,
)
from starkware.starknet.definitions import constants
from starkware.starknet.public.abi import DEFAULT_ENTRY_POINT_NAME, DEFAULT_L1_ENTRY_POINT_NAME
from starkware.starknet.services.api.contract_class.contract_class import SUPPORTED_BUILTINS

RAW_INPUT_DECORATOR = "raw_input"
RAW_OUTPUT_DECORATOR = "raw_output"
RAW_OUTPUT_RETURNS = parse_type("(retdata_size: felt, retdata: felt*)")

EXTERNAL_DECORATOR = "external"
L1_HANDLER_DECORATOR = "l1_handler"
VIEW_DECORATOR = "view"
CONSTRUCTOR_DECORATOR = "constructor"

ENTRY_POINT_DECORATORS = {
    EXTERNAL_DECORATOR,
    L1_HANDLER_DECORATOR,
    VIEW_DECORATOR,
    CONSTRUCTOR_DECORATOR,
}
SUPPORTED_DECORATORS = ENTRY_POINT_DECORATORS | {RAW_INPUT_DECORATOR, RAW_OUTPUT_DECORATOR}

WRAPPER_SCOPE = ScopedName.from_string("__wrappers__")

BUILTIN_PTR_TO_BUILTIN = {
    f"{builtin_name}_ptr": builtin_name for builtin_name in SUPPORTED_BUILTINS
}


def parse_entry_point_decorators(
    elm: CodeElementFunction,
) -> Tuple[Optional[ExprIdentifier], bool, bool, List[ExprIdentifier]]:
    """
    If the function has one of the external decorators, returns
      (external_decorator, is_raw_input, is_raw_output, other_decorators).
    Otherwise, returns None.
    """
    is_raw_input = False
    is_raw_output = False
    external_decorator = None
    other_decorators = []
    for decorator in elm.decorators:
        if decorator.name in ENTRY_POINT_DECORATORS and external_decorator is None:
            external_decorator = decorator
        elif decorator.name == RAW_INPUT_DECORATOR:
            is_raw_input = True
        elif decorator.name == RAW_OUTPUT_DECORATOR:
            is_raw_output = True
        else:
            other_decorators.append(decorator)

    return external_decorator, is_raw_input, is_raw_output, other_decorators


def get_abi_entry_type(external_decorator_name: str) -> str:
    if external_decorator_name == L1_HANDLER_DECORATOR:
        return "l1_handler"
    elif external_decorator_name in [EXTERNAL_DECORATOR, VIEW_DECORATOR]:
        return "function"
    elif external_decorator_name == CONSTRUCTOR_DECORATOR:
        return "constructor"
    else:
        raise NotImplementedError(f"Unsupported decorator {external_decorator_name}")


@dataclasses.dataclass
class ExternalWrapperResources:
    # A list of pairs (path, name) of entities (directly) imported by the main module.
    # External functions from other modules will be wrapped only if they appear in this set.
    directly_imported_names: Set[Tuple[str, str]] = dataclasses.field(default_factory=set)


class PreExternalWrapperVisitor(Visitor):
    """
    Scans the external wrappers before ExternalWrapperVisitor, runs some validations and collects
    the used builtins.
    """

    def __init__(
        self,
        builtins: Optional[List[str]],
        main_scope: ScopedName,
        external_wrapper_resources: ExternalWrapperResources,
    ):
        super().__init__()
        # The list of builtins in the %builtins directive, or None if the %builtins directive is
        # missing.
        self.directive_builtins = builtins
        # The set of builtins used by external functions. This will only be used if the builtin
        # directive is not specified.
        # Always assume that the range_check builtin is required.
        self.collected_builtins = {"range_check"}

        # The constructor definition. Only one constructor is allowed.
        self.constructor: Optional[CodeElementFunction] = None

        self.external_wrapper_resources = external_wrapper_resources
        self.main_scope = main_scope

    def _visit_default(self, obj):
        return obj

    def visit_CodeElementImport(self, elm: CodeElementImport):
        if self.current_scope != self.main_scope:
            return elm

        # This is an import statement that appears in the main module,
        # add the imported items to directly_imported_names.
        directly_imported_names = self.external_wrapper_resources.directly_imported_names
        for item in elm.import_items:
            directly_imported_names.add((elm.path.name, item.orig_identifier.name))
        return elm

    def visit_CodeElementFunction(self, elm: CodeElementFunction):
        is_default_entry_point = elm.name in [DEFAULT_ENTRY_POINT_NAME, DEFAULT_L1_ENTRY_POINT_NAME]
        if is_default_entry_point:
            self.validate_default_entry_point_signature(elm)

        external_decorator, is_raw_input, is_raw_output, _ = parse_entry_point_decorators(elm=elm)
        if external_decorator is None:
            return super().visit_CodeElementFunction(elm=elm)

        if is_raw_input:
            self.validate_raw_input_signature(elm=elm)

        if is_raw_output:
            self.validate_raw_output_signature(elm=elm)

        if self.file_lang != constants.STARKNET_LANG_DIRECTIVE:
            raise PreprocessorError(
                "External decorators can only be used in source files that contain the "
                '"%lang starknet" directive.',
                location=external_decorator.location,
            )

        if external_decorator.name == L1_HANDLER_DECORATOR:
            if not is_raw_input:
                self.validate_l1_handler_arguments(elm=elm)
            self.validate_l1_handler_return_values(elm=elm)
        elif external_decorator.name == CONSTRUCTOR_DECORATOR:
            self.validate_constructor_signature(elm=elm)

        self.validate_implicit_arguments(elm=elm)

    def validate_implicit_arguments(self, elm: CodeElementFunction):
        if elm.implicit_arguments is None:
            return

        for typed_identifier in elm.implicit_arguments.identifiers:
            ptr_name = typed_identifier.name
            if ptr_name == "syscall_ptr":
                continue

            builtin_name = BUILTIN_PTR_TO_BUILTIN.get(ptr_name)

            if builtin_name is None:
                allowed_builtin = False
            else:
                # If the %builtins directive is specified, check if the builtin is present.
                if self.directive_builtins is None:
                    allowed_builtin = True
                else:
                    allowed_builtin = builtin_name in self.directive_builtins

            if not allowed_builtin:
                raise PreprocessorError(
                    f"Unexpected implicit argument '{ptr_name}' in an external function.",
                    location=typed_identifier.identifier.location,
                )

            assert builtin_name is not None
            self.collected_builtins.add(builtin_name)

    def validate_constructor_signature(self, elm: CodeElementFunction):
        """
        Validates the signature of the constructor.
        """

        if self.constructor is not None:
            previous_def_loc = self.constructor.identifier.location
            notes = (
                []
                if previous_def_loc is None
                else [
                    previous_def_loc.to_string_with_content(
                        "The constructor was previously defined here:"
                    )
                ]
            )

            raise PreprocessorError(
                "Multiple constructors definitions are not supported.",
                location=elm.identifier.location,
                notes=notes,
            )

        self.constructor = elm

        if elm.name != "constructor":
            raise PreprocessorError(
                "The constructor name must be 'constructor'.",
                location=elm.identifier.location,
            )

        if elm.returns is not None:
            raise PreprocessorError(
                "A constructor can not have a return value.", location=elm.returns.location
            )

    def validate_l1_handler_arguments(self, elm: CodeElementFunction):
        """
        Validates the signature of an l1_handler.
        """

        args = elm.arguments.identifiers
        if len(args) == 0 or args[0].name != "from_address":
            # An empty argument list has no location so we point to the identifier.
            location = elm.identifier.location if len(args) == 0 else args[0].location
            raise PreprocessorError(
                "The first argument of an L1 handler must be named 'from_address'.",
                location=location,
            )

        from_address_type = args[0].get_type()
        if not isinstance(from_address_type, TypeFelt):
            raise PreprocessorError(
                "The type of 'from_address' must be felt.", location=from_address_type.location
            )

    def validate_l1_handler_return_values(self, elm: CodeElementFunction):
        if elm.returns is not None:
            raise PreprocessorError(
                "An L1 handler can not have a return value.", location=elm.returns.location
            )

    def validate_default_entry_point_signature(self, elm: CodeElementFunction):
        """
        Validates the signature of a default entry point.
        """

        if elm.name == DEFAULT_ENTRY_POINT_NAME:
            expected_decorator = EXTERNAL_DECORATOR
        elif elm.name == DEFAULT_L1_ENTRY_POINT_NAME:
            expected_decorator = L1_HANDLER_DECORATOR
        else:
            raise NotImplementedError(f"The {elm.name} default entry point is not supported.")

        if len(elm.decorators) == 0:
            raise PreprocessorError(
                f"The {elm.name} entry point needs to be decorated with '@{expected_decorator}'.",
                location=elm.identifier.location,
            )

        allowed_decorators = [expected_decorator, RAW_INPUT_DECORATOR, RAW_OUTPUT_DECORATOR]
        for decorator in elm.decorators:
            if decorator.name not in allowed_decorators:
                raise PreprocessorError(
                    f"The {elm.name} entry point may only be decorated with "
                    f"'@{expected_decorator}'.",
                    location=decorator.location,
                )

    def validate_raw_input_signature(self, elm: CodeElementFunction):
        expected_args = [
            TypedIdentifier(identifier=ExprIdentifier("selector"), expr_type=TypeFelt()),
            TypedIdentifier(identifier=ExprIdentifier("calldata_size"), expr_type=TypeFelt()),
            TypedIdentifier(identifier=ExprIdentifier("calldata"), expr_type=FELT_STAR),
        ]

        args = elm.arguments.identifiers
        if args != expected_args:
            raise PreprocessorError(
                f"@{RAW_INPUT_DECORATOR} requires the following arguments:\n"
                "(selector: felt, calldata_size: felt, calldata: felt*).",
                location=elm.arguments.location,
            )

    def validate_raw_output_signature(self, elm: CodeElementFunction):
        returns = elm.returns
        if returns != RAW_OUTPUT_RETURNS:
            raise PreprocessorError(
                f"@{RAW_OUTPUT_DECORATOR} requires the following return values:\n"
                f"{RAW_OUTPUT_RETURNS.format()}.",
                location=elm.identifier.location if returns is None else returns.location,
            )

    def get_collected_builtins(self):
        """
        Returns the builtins collected from the external functions, ordered by SUPPORTED_BUILTINS.
        """
        return [builtin for builtin in SUPPORTED_BUILTINS if builtin in self.collected_builtins]


class PreExternalWrapperStage(Stage):
    def run(self, context: PassManagerContext):
        visitor = PreExternalWrapperVisitor(
            builtins=context.builtins,
            main_scope=context.main_scope,
            external_wrapper_resources=context.get_resource(ExternalWrapperResources),
        )
        for module in context.modules:
            visitor.visit(module)
        if context.builtins is None:
            context.builtins = visitor.get_collected_builtins()


class ExternalWrapperVisitor(IdentifierAwareVisitor):
    """
    Adds function wrappers for external functions (@external, @view, @l1_handler, ...)
    that converts between the StarkNet contract ABI and the Cairo calling convention.
    """

    def __init__(
        self,
        builtins: List[str],
        external_wrapper_resources: ExternalWrapperResources,
        main_scope: ScopedName,
        identifiers: Optional[IdentifierManager] = None,
    ):
        super().__init__(identifiers=identifiers)

        self.external_wrapper_resources = external_wrapper_resources
        self.main_scope = main_scope

        # A mapping from name to offset in the os_context that is passed to the contract.
        self.os_context: Dict[str, int] = self.get_os_context(builtins=builtins)

    def _visit_default(self, obj):
        return obj

    @staticmethod
    def get_os_context(builtins) -> Dict[str, int]:
        os_context = {"syscall_ptr": 0}
        for index, builtin_name in enumerate(builtins, len(os_context)):
            ptr_name = f"{builtin_name}_ptr"
            assert (
                os_context.setdefault(ptr_name, index) == index
            ), f"os_context.{ptr_name} was redefined."

        return os_context

    def prepare_raw_input_args(
        self,
        selector: Expression,
        calldata_size: Expression,
        calldata_ptr: Expression,
        arg_struct_members: Dict[str, MemberDefinition],
        func_location: Location,
    ) -> ArgList:
        call_args = ArgList(
            args=[
                ExprAssignment(identifier=ExprIdentifier(name=arg_name), expr=expr)
                for arg_name, expr in safe_zip(
                    arg_struct_members, [selector, calldata_size, calldata_ptr]
                )
            ],
            notes=[Notes()] * (len(arg_struct_members) + 1),
            has_trailing_comma=True,
            location=func_location,
        )
        return call_args

    def create_func_wrapper(
        self,
        elm: CodeElementFunction,
        func_alias_name: str,
        is_raw_input: bool,
        is_raw_output: bool,
    ) -> List[CodeElementFunction]:
        """
        Generates a wrapper that converts between the StarkNet contract ABI and the
        Cairo calling convention.

        Arguments:
        elm - the CodeElementFunction of the wrapped function.
        func_alias_name - an alias for the FunctionDefinition in the current scope.
        """

        code_elements = []

        os_context = self.os_context

        # True if the generated function is using local variables.
        using_locals = False

        func_location = elm.identifier.location
        assert func_location is not None

        # We expect the call stack to look as follows:
        # Selector
        # pointer to os_context struct.
        # calldata size.
        # pointer to the call data array.
        # ret_fp.
        # ret_pc.
        selector = create_simple_ref_expr(
            reg=Register.FP,
            offset=-6,
            cairo_type=TypeFelt(),
            location=func_location,
        )

        os_context_ptr = create_simple_ref_expr(
            reg=Register.FP,
            offset=-5,
            cairo_type=FELT_STAR,
            location=func_location,
        )

        calldata_size = create_simple_ref_expr(
            reg=Register.FP,
            offset=-4,
            cairo_type=TypeFelt(),
            location=func_location,
        )

        calldata_ptr = create_simple_ref_expr(
            reg=Register.FP,
            offset=-3,
            cairo_type=FELT_STAR,
            location=func_location,
        )

        implicit_arguments = ""

        implicit_arguments_identifiers: Dict[str, TypedIdentifier] = {}
        if elm.implicit_arguments is not None:
            args = []
            for typed_identifier in elm.implicit_arguments.identifiers:
                ptr_name = typed_identifier.name
                assert ptr_name in os_context

                implicit_arguments_identifiers[ptr_name] = typed_identifier

                # Add the assignment expression 'ptr_name = ptr_name' to the implicit arg list.
                args.append(f"{ptr_name}={ptr_name}")

            implicit_arguments = ", ".join(args)

        return_args_decl: List[str] = []
        return_args_exprs: List[str] = []

        # Create references.
        for ptr_name, index in os_context.items():
            arg_identifier = implicit_arguments_identifiers.get(ptr_name)
            if arg_identifier is None:
                location: Location = func_location
                cairo_type: CairoType = TypeFelt(location=location)
            else:
                location = (
                    arg_identifier.location
                    if arg_identifier.location is not None
                    else func_location
                )
                cairo_type = self.resolve_type(arg_identifier.get_type())

            code_elements += autogen_parse_code_block(
                path=f"autogen/starknet/external/{elm.name}",
                code=(
                    f"let {ptr_name} = [cast({os_context_ptr.format()} + {index}, "
                    f"{cairo_type.format()}*)];\n"
                ),
                parser_context=ParserContext(
                    parent_location=(
                        location,
                        "While constructing the external wrapper for:",
                    ),
                    resolved_types=True,
                ),
            ).code_elements

            assert index == len(return_args_exprs), "Unexpected index."

            return_args_decl.append(f"{ptr_name}: {cairo_type.format()}")
            return_args_exprs.append(ptr_name)

        arg_struct_def = self.get_struct_definition(
            name=ScopedName.from_string(f"{elm.name}.{func_alias_name}")
            + CodeElementFunction.ARGUMENT_SCOPE,
            location=func_location,
        )

        if is_raw_input:
            call_args = self.prepare_raw_input_args(
                selector=selector,
                calldata_size=calldata_size,
                calldata_ptr=calldata_ptr,
                arg_struct_members=arg_struct_def.members,
                func_location=func_location,
            )
            decode_code_elements: List[CommentedCodeElement] = []
        else:
            # Prepare code for handling the arguments.
            decode_code_elements, call_args = decode_data(
                data_ptr=calldata_ptr.format(),
                data_size=calldata_size.format(),
                arguments=struct_to_argument_info_list(arg_struct_def),
                encoding_type=EncodingType.CALLDATA,
                has_range_check_builtin="range_check_ptr" in os_context,
                location=func_location,
                identifiers=self.identifiers,
            )

        if is_raw_output:
            encode_return_func = None
        else:
            # Prepare code for handling the return values.
            ret_struct_name = (
                ScopedName.from_string(f"{elm.name}.{func_alias_name}")
                + CodeElementFunction.RETURN_SCOPE
            )
            ret_tuple_type = self.get_type_definition(
                name=ret_struct_name, location=func_location
            ).cairo_type
            if not isinstance(ret_tuple_type, TypeTuple):
                raise PreprocessorError(
                    "Only tuple types are supported as the return type of external functions.",
                    location=ret_tuple_type.location,
                )

            encode_return_func, known_ap_change = self.process_retdata(
                func_name=elm.name,
                ret_tuple_type=ret_tuple_type,
                location=func_location,
            )

        # Prepare code for calling the original function.
        call_code = f"""\
let ret_value = {func_alias_name}{{{implicit_arguments}}}({call_args.format()});
"""

        if encode_return_func is None:
            if is_raw_output:
                call_code += """\
let retdata_size = ret_value.retdata_size;
let retdata = ret_value.retdata;
"""
            else:
                call_code += """\
%{ memory[ap] = segments.add() %}        // Allocate memory for return value.
tempvar retdata: felt*;
let retdata_size = 0;
"""
        else:
            if not known_ap_change:
                # If the return value handling is expected to revoke ap tracking, alloc_locals is
                # required.
                for decl, name in zip(return_args_decl, return_args_exprs):
                    if name in implicit_arguments_identifiers:
                        using_locals = True

            if "range_check_ptr" not in os_context:
                raise PreprocessorError(
                    "In order to use external functions, the '%builtins' directive must "
                    "include the 'range_check' builtin.",
                    location=func_location,
                )
            call_code += f"""\
let (range_check_ptr, retdata_size, retdata) = {elm.name}_encode_return(ret_value, range_check_ptr);
"""

        call_code_elements = autogen_parse_code_block(
            path=f"autogen/starknet/external/{elm.name}",
            code=call_code,
            parser_context=ParserContext(
                parent_location=(func_location, "While constructing the external wrapper for:"),
                resolved_types=True,
            ),
        ).code_elements
        # Override the location of call to the wrapped function, to simplify the error message
        # in case of printing the traceback.
        assert isinstance(call_code_elements[0].code_elm, CodeElementReturnValueReference)
        call_code_elements[0].code_elm.func_call = dataclasses.replace(
            call_code_elements[0].code_elm.func_call, location=func_location
        )

        code_elements += decode_code_elements
        code_elements += call_code_elements

        return_args_decl += ["size: felt", "retdata: felt*"]
        return_args_exprs += ["retdata_size", "retdata"]

        code = f"""\
return ({",".join(return_args_exprs)});
"""

        code_elements += autogen_parse_code_block(
            path=f"autogen/starknet/external/{elm.name}",
            code=code,
            parser_context=ParserContext(
                parent_location=(func_location, "While constructing the external wrapper for:"),
                resolved_types=True,
            ),
        ).code_elements

        # Generate the function skeleton code.
        return_str = ", ".join(return_args_decl)
        code = f"""\
func {elm.name}() -> ({return_str}) {{
    {"alloc_locals;" if using_locals else ""}
}}
"""

        func_code_block = autogen_parse_code_block(
            path=f"autogen/starknet/external/{elm.name}",
            code=code,
            parser_context=ParserContext(
                parent_location=(func_location, "While constructing the external wrapper for:"),
                resolved_types=True,
            ),
        )

        # Use the collected code_elements as the function's body and copy the decorators.
        func_elm = func_code_block.code_elements[0].code_elm
        assert isinstance(func_elm, CodeElementFunction)
        func_elm.code_block.code_elements += code_elements
        func_elm.decorators = elm.decorators

        # Run identifier collector on the function.
        identifier_collector = IdentifierCollector(identifiers=self.identifiers)
        identifier_collector.accessible_scopes = list(self.accessible_scopes)
        if encode_return_func is not None:
            identifier_collector.visit(encode_return_func)
        identifier_collector.visit(func_code_block)

        # Run struct collector on the function.
        struct_collector = StructCollector(identifiers=self.identifiers)
        struct_collector.accessible_scopes = list(self.accessible_scopes)
        if encode_return_func is not None:
            struct_collector.visit(encode_return_func)
        struct_collector.visit(func_code_block)

        return ([] if encode_return_func is None else [encode_return_func]) + [func_elm]

    def process_retdata(
        self,
        func_name: str,
        ret_tuple_type: TypeTuple,
        location: Location,
    ) -> Tuple[Optional[CodeElementFunction], bool]:
        """
        Generates a function that processes the return values. Returns:
        1. The auto-generated function. None if there are no return values.
        2. Whether the ap change is known.
        """

        if len(ret_tuple_type.members) == 0:
            return None, True

        for item in ret_tuple_type.members:
            if item.name is None:
                raise PreprocessorError(
                    "A return value in an external function must be named.", location=item.location
                )

        data_encoder = DataEncoder(
            arg_name_func=lambda arg_info: f"ret_value.{arg_info.name}",
            encoding_type=EncodingType.RETURN,
            has_range_check_builtin="range_check_ptr" in self.os_context,
            identifiers=self.identifiers,
        )
        data_encoder.run(arguments=tuple_type_to_argument_info_list(ret_tuple_type))

        func_elm = self.prepare_return_function(
            func_name=func_name,
            ret_tuple_type=ret_tuple_type,
            encoding_code_elements=data_encoder.code_elements,
            location=location,
        )

        return (
            func_elm,
            data_encoder.known_ap_change,
        )

    def prepare_return_function(
        self,
        func_name: str,
        ret_tuple_type: TypeTuple,
        encoding_code_elements: List[CommentedCodeElement],
        location: Location,
    ) -> CodeElementFunction:
        code = f"""\
func {func_name}_encode_return(ret_value: {ret_tuple_type.format()}, range_check_ptr) -> (
        range_check_ptr: felt, data_len: felt, data: felt*) {{
    %{{ memory[ap] = segments.add() %}}
    alloc_locals;
    local __return_value_ptr_start: felt*;
    let __return_value_ptr = __return_value_ptr_start;
    with range_check_ptr {{
    }}
    return (
        range_check_ptr=range_check_ptr,
        data_len=__return_value_ptr - __return_value_ptr_start,
        data=__return_value_ptr_start);
}}
"""

        code_elements = autogen_parse_code_block(
            path=f"autogen/starknet/external/return/{func_name}",
            code=code,
            parser_context=ParserContext(
                parent_location=(location, "While handling return value of"),
                resolved_types=True,
            ),
        ).code_elements
        func_elm = code_elements[0].code_elm
        assert isinstance(func_elm, CodeElementFunction)

        # Insert the data encoding code in the with statement.
        with_elm = func_elm.code_block.code_elements[-2].code_elm
        assert isinstance(with_elm, CodeElementWith)
        with_elm.code_block.code_elements += encoding_code_elements

        return func_elm

    def visit_CodeElementFunction(self, elm: CodeElementFunction):
        (
            external_decorator,
            is_raw_input,
            is_raw_output,
            other_decorators,
        ) = parse_entry_point_decorators(elm=elm)
        if external_decorator is None:
            return super().visit_CodeElementFunction(elm=elm)

        directly_imported_names = self.external_wrapper_resources.directly_imported_names
        is_directly_imported = (str(self.current_scope), elm.name) in directly_imported_names
        is_in_main_module = self.current_scope == self.main_scope
        if not (is_in_main_module or is_directly_imported):
            # Remove the external-related decorators, so that the function will not appear in the
            # ABI.
            return super().visit_CodeElementFunction(
                elm=dataclasses.replace(elm, decorators=other_decorators)
            )
        location = elm.identifier.location

        # Retrieve the canonical name of the function before switching scopes.
        func_canonical_name = self.current_scope + elm.name

        # Generate an alias that will allow us to call the original function.
        func_alias_name = f"__wrapped_func"
        alias_canonical_name = WRAPPER_SCOPE + elm.name + func_alias_name

        self.add_name_definition(
            name=alias_canonical_name,
            identifier_definition=AliasDefinition(destination=func_canonical_name),
            location=location,
            require_future_definition=False,
        )
        self.add_name_definition(
            name=WRAPPER_SCOPE + (elm.name + "_encode_return") + "memcpy",
            identifier_definition=AliasDefinition(
                destination=ScopedName.from_string("starkware.cairo.common.memcpy.memcpy")
            ),
            location=location,
            require_future_definition=False,
        )

        with self.scoped(WRAPPER_SCOPE, parent=elm):
            wrapper_funcs = self.create_func_wrapper(
                elm=elm,
                func_alias_name=func_alias_name,
                is_raw_input=is_raw_input,
                is_raw_output=is_raw_output,
            )

        return CodeElementScoped(
            scope=self.current_scope,
            code_elements=[
                elm,
                CodeElementScoped(scope=WRAPPER_SCOPE, code_elements=list(wrapper_funcs)),
            ],
        )

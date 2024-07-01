import dataclasses
from typing import Dict, List, Optional

from starkware.cairo.lang.compiler.ast.cairo_types import CairoType, TypePointer, TypeTuple
from starkware.cairo.lang.compiler.ast.code_elements import CodeElementFunction
from starkware.cairo.lang.compiler.ast.formatting_utils import get_max_line_length
from starkware.cairo.lang.compiler.error_handling import Location
from starkware.cairo.lang.compiler.parser import parse
from starkware.cairo.lang.compiler.preprocessor.identifier_aware_visitor import (
    IdentifierAwareVisitor,
)
from starkware.cairo.lang.compiler.preprocessor.preprocessor_error import PreprocessorError
from starkware.cairo.lang.compiler.preprocessor.preprocessor_utils import verify_empty_code_block
from starkware.cairo.lang.compiler.type_utils import check_felts_only_type
from starkware.python.utils import safe_zip
from starkware.starknet.compiler.validation_utils import (
    has_decorator,
    verify_decorators,
    verify_no_implicit_arguments,
    verify_starknet_lang,
)
from starkware.starknet.public.abi import MAX_STORAGE_ITEM_SIZE, get_storage_var_address

STORAGE_VAR_DECORATOR = "storage_var"
STORAGE_VAR_ATTR = "storage_var"

# The following names cannot be used as argument names for storage variables because they collide
# with existing functions.
FORBIDDEN_ARGUMENT_NAMES = {
    "addr",
    "normalize_address",
    "storage_read",
    "storage_write",
    "hash2",
    "read",
    "write",
}


def get_return_type(elm: CodeElementFunction) -> CairoType:
    returns_single_value = False
    if elm.returns is not None:
        if not isinstance(elm.returns, TypeTuple):
            raise PreprocessorError(
                "Only tuple types are currently supported for storage variables.",
                location=elm.returns.location,
            )

        returns_single_value = len(elm.returns.members) == 1

    if not returns_single_value:
        raise PreprocessorError(
            "Storage variables must return exactly one value.",
            location=elm.returns.location if elm.returns is not None else elm.identifier.location,
        )
    assert elm.returns is not None
    return elm.returns.members[0].typ


def generate_storage_var_functions(
    elm: CodeElementFunction,
    addr_func_body: str,
    read_func_body: str,
    write_func_body: str,
    is_impl: bool,
) -> CodeElementFunction:
    var_name = elm.identifier.name
    autogen_filename = (
        f'autogen/starknet/storage_var/{var_name}/{"impl" if is_impl else "decl"}.cairo'
    )

    code = f"""\
namespace {var_name} {{
    from starkware.starknet.common.storage import normalize_address
    from starkware.starknet.common.syscalls import storage_read, storage_write
    from starkware.cairo.common.cairo_builtins import HashBuiltin
    from starkware.cairo.common.hash import hash2

    func addr{{pedersen_ptr: HashBuiltin*, range_check_ptr}}() -> (res: felt) {{
        {addr_func_body}
    }}

    func read{{
        syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
    }}() {{
        {read_func_body}
    }}

    func write{{
        syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
    }}(value: felt) {{
        {write_func_body}
    }}
}}\
"""

    res = parse(autogen_filename, code, "code_element", CodeElementFunction)

    variable_type = get_return_type(elm=elm)

    # Copy the arguments and return values.
    assert isinstance(res, CodeElementFunction) and res.element_type == "namespace"
    addr_func = res.code_block.code_elements[5].code_elm
    assert (
        isinstance(addr_func, CodeElementFunction)
        and addr_func.element_type == "func"
        and addr_func.identifier.name == "addr"
    ), f"Unexpected address function code element: {addr_func}."
    addr_func.arguments = elm.arguments

    read_func = res.code_block.code_elements[7].code_elm
    assert (
        isinstance(read_func, CodeElementFunction)
        and read_func.element_type == "func"
        and read_func.identifier.name == "read"
    ), f"Unexpected read function code element: {read_func}."
    read_func.arguments = elm.arguments
    read_func.returns = elm.returns

    write_func = res.code_block.code_elements[9].code_elm
    assert (
        isinstance(write_func, CodeElementFunction)
        and write_func.element_type == "func"
        and write_func.identifier.name == "write"
    ), f"Unexpected write function code element: {write_func}."
    # Append the value argument to the storage var arguments.
    write_func.arguments = dataclasses.replace(
        elm.arguments,
        identifiers=elm.arguments.identifiers
        + [dataclasses.replace(write_func.arguments.identifiers[0], expr_type=variable_type)],
    )

    # Format and re-parse to get locations to a well-formatted code.
    res = parse(
        autogen_filename, res.format(get_max_line_length()), "code_element", CodeElementFunction
    )

    res.additional_attributes[STORAGE_VAR_ATTR] = elm

    return res


def process_storage_var(visitor: IdentifierAwareVisitor, elm: CodeElementFunction):
    verify_empty_code_block(
        code_block=elm.code_block,
        error_message="Storage variables must have an empty body.",
        default_location=elm.identifier.location,
    )
    verify_no_implicit_arguments(elm=elm, name_in_error_message="Storage variables")
    verify_decorators(
        elm=elm,
        allowed_decorators=[STORAGE_VAR_DECORATOR],
        name_in_error_message="a storage variable",
    )

    arg_sizes: List[int] = []
    for arg in elm.arguments.identifiers:
        if arg.identifier.name in FORBIDDEN_ARGUMENT_NAMES:
            raise PreprocessorError(
                f"'{arg.identifier.name}' cannot be used as a storage variable argument name.",
                location=arg.identifier.location,
            )
        unresolved_arg_type = arg.get_type()
        arg_type = visitor.resolve_type(unresolved_arg_type)
        arg_size = check_felts_only_type(
            cairo_type=arg_type, identifier_manager=visitor.identifiers
        )
        if arg_size is None:
            raise PreprocessorError(
                "Arguments of storage variables must be a felts-only type "
                "(cannot contain pointers).",
                location=unresolved_arg_type.location,
            )
        arg_sizes.append(arg_size)

    unresolved_return_type = get_return_type(elm=elm)
    return_type = visitor.resolve_type(unresolved_return_type)
    if (
        check_felts_only_type(cairo_type=return_type, identifier_manager=visitor.identifiers)
        is None
    ):
        raise PreprocessorError(
            "The return type of storage variables must be a felts-only type "
            "(cannot contain pointers).",
            location=elm.returns.location if elm.returns is not None else elm.identifier.location,
        )
    var_size = visitor.get_size(return_type)

    if var_size > MAX_STORAGE_ITEM_SIZE:
        raise PreprocessorError(
            f"The storage variable size ({var_size}) exceeds the maximum value "
            f"({MAX_STORAGE_ITEM_SIZE}).",
            location=elm.returns.location if elm.returns is not None else elm.identifier.location,
        )

    var_name = elm.identifier.name
    addr = storage_var_name_to_base_addr(var_name)
    addr_func_body = f"let res = {addr};\n"
    for arg, arg_size in safe_zip(elm.arguments.identifiers, arg_sizes):
        assert arg_size is not None
        for i in range(arg_size):
            value_str = f"cast(&{arg.identifier.name}, felt*)[{i}]"
            addr_func_body += f"let (res) = hash2{{hash_ptr=pedersen_ptr}}(res, {value_str});\n"
    if len(elm.arguments.identifiers) > 0:
        addr_func_body += "let (res) = normalize_address(addr=res);\n"
    addr_func_body += "return (res=res);\n"

    args = ", ".join(arg.identifier.name for arg in elm.arguments.identifiers)

    read_func_body = f"let (storage_addr) = addr({args});\n"
    for i in range(var_size):
        read_func_body += (
            f"let (__storage_var_temp{i}) = storage_read(address=storage_addr + {i});\n"
        )
    # Copy the return implicit args and the return values to a contiguous segment.
    read_func_body += """
tempvar syscall_ptr = syscall_ptr;
tempvar pedersen_ptr = pedersen_ptr;
tempvar range_check_ptr = range_check_ptr;
"""
    for i in range(var_size):
        read_func_body += f"tempvar __storage_var_temp{i}: felt = __storage_var_temp{i};\n"
    unresolved_return_type_ptr = TypePointer(pointee=unresolved_return_type)
    read_func_body += (
        f"return ([cast(&__storage_var_temp0, {unresolved_return_type_ptr.format()})],);"
    )

    write_func_body = f"let (storage_addr) = addr({args});\n"
    for i in range(var_size):
        write_func_body += (
            f"storage_write(address=storage_addr + {i}, value=[cast(&value, felt) + {i}]);\n"
        )
    write_func_body += "return ();\n"
    return generate_storage_var_functions(
        elm,
        addr_func_body=addr_func_body,
        read_func_body=read_func_body,
        write_func_body=write_func_body,
        is_impl=True,
    )


def storage_var_name_to_base_addr(var_name: str) -> int:
    """
    Returns the base address of a StarkNet Storage variable, ignoring the storage var arguments.
    """

    return get_storage_var_address(var_name=var_name)


class StorageVarDeclVisitor(IdentifierAwareVisitor):
    """
    Replaces @storage_var decorated functions with a namespace with empty functions.
    After the struct collection phase is completed, those functions will be replaced by
    functions will full implementation.
    """

    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)

        # A map from storage variable name to its location.
        # Used to ensure unique names.
        self.storage_var_name_to_location: Dict[str, Optional[Location]] = {}

    def _visit_default(self, obj):
        return obj

    def visit_CodeElementFunction(self, elm: CodeElementFunction):
        is_storage_var, storage_var_location = has_decorator(
            elm=elm, decorator_name=STORAGE_VAR_DECORATOR
        )
        if not is_storage_var:
            return elm

        self.check_unique_names(elm=elm)

        verify_starknet_lang(
            file_lang=self.file_lang,
            location=storage_var_location,
            name_in_error_message=f"@{STORAGE_VAR_DECORATOR}",
        )
        # Add dummy references and calls that will be visited by the identifier collector
        # and the dependency graph.
        # Those statements will later be replaced by the real implementation.
        addr_func_body = """
let res = 0;
call hash2;
call normalize_address;
"""
        read_func_body = """
let storage_addr = 0;
call addr;
call storage_read;
"""
        write_func_body = """
let storage_addr = 0;
call addr;
call storage_write;
"""
        return generate_storage_var_functions(
            elm,
            addr_func_body=addr_func_body,
            read_func_body=read_func_body,
            write_func_body=write_func_body,
            is_impl=False,
        )

    def check_unique_names(self, elm: CodeElementFunction):
        if elm.name not in self.storage_var_name_to_location:
            self.storage_var_name_to_location[elm.name] = elm.identifier.location
            return

        notes = []
        other_location = self.storage_var_name_to_location[elm.name]
        if other_location is not None:
            notes.append(
                other_location.to_string_with_content("Note: another definition appears here.")
            )
        raise PreprocessorError(
            f"Found more than one storage variable with the same name ('{elm.name}').",
            location=elm.identifier.location,
            notes=notes,
        )


class StorageVarImplementationVisitor(IdentifierAwareVisitor):
    """
    Replaces @storage_var decorated functions (obtained from the additional attribute
    STORAGE_VAR_ATTR added by StorageVarDeclVisitor) with a namespace with read() and write()
    functions.
    """

    def _visit_default(self, obj):
        return obj

    def visit_CodeElementFunction(self, elm: CodeElementFunction):
        attr = elm.additional_attributes.get(STORAGE_VAR_ATTR)
        if attr is None:
            return elm

        assert isinstance(attr, CodeElementFunction)
        return process_storage_var(self, attr)

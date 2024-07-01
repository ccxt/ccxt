import dataclasses
from typing import List

from typing_extensions import Protocol

from starkware.cairo.lang.compiler.ast.cairo_types import TypeTuple
from starkware.cairo.lang.compiler.ast.code_elements import (
    CodeBlock,
    CodeElementEmptyLine,
    CodeElementFunction,
    CommentedCodeElement,
)
from starkware.cairo.lang.compiler.error_handling import ParentLocation
from starkware.cairo.lang.compiler.parser import ParserContext
from starkware.cairo.lang.compiler.preprocessor.identifier_aware_visitor import (
    IdentifierAwareVisitor,
)
from starkware.cairo.lang.compiler.preprocessor.preprocessor_error import PreprocessorError
from starkware.cairo.lang.compiler.preprocessor.preprocessor_utils import (
    autogen_parse_code_block,
    verify_empty_code_block,
)
from starkware.python.utils import as_non_optional
from starkware.starknet.compiler.data_encoder import ArgumentInfo, EncodingType, decode_data
from starkware.starknet.compiler.validation_utils import (
    encode_calldata_arguments,
    get_function_attr,
    has_decorator,
    non_optional_location,
    verify_decorators,
    verify_no_implicit_arguments,
    verify_starknet_lang,
)
from starkware.starknet.public.abi import get_selector_from_name

CONTRACT_INTERFACE_DECORATOR = "contract_interface"
CONTRACT_INTERFACE_ATTR = "contract_interface"
AUTOGEN_PREFIX = "autogen/starknet/contract_interface/"


@dataclasses.dataclass
class ContractFunctionInfo:
    """
    Represents information about a function in a @contract_interface decorated namespace
    that can be collected before the struct collection phase.
    """

    # The original code element.
    elm: CodeElementFunction
    # A parent location to be used in case of errors concerning the function.
    parent_location: ParentLocation
    # The name of the selector constant of the function.
    selector: str
    # The name of the auto-generated file for code segments related to this function.
    autogen_code_name: str

    @property
    def name(self):
        """
        Returns the name of the function.
        """
        return self.elm.name

    @staticmethod
    def from_code_element(contract_name: str, elm: CodeElementFunction) -> "ContractFunctionInfo":
        name = elm.identifier.name
        func_location = non_optional_location(elm.identifier.location)

        if len(elm.decorators) != 0:
            raise PreprocessorError(
                "Unexpected decorator for a contract interface function.",
                location=elm.decorators[0].location,
            )

        verify_empty_code_block(
            code_block=elm.code_block,
            error_message="Contract interface functions must have an empty body.",
            default_location=elm.identifier.location,
        )
        verify_no_implicit_arguments(elm=elm, name_in_error_message="Contract interface functions")

        return ContractFunctionInfo(
            elm=elm,
            parent_location=(func_location, "While handling contract interface function:"),
            selector=f"{name.upper()}_SELECTOR",
            autogen_code_name=AUTOGEN_PREFIX + f"{contract_name}/{name}",
        )


@dataclasses.dataclass
class ContractInterfaceInfo:
    """
    Represents information about a @contract_interface decorated namespace that can be collected
    before the struct collection phase.
    """

    name: str
    # A parent location to be used in case of errors concerning the contract.
    parent_location: ParentLocation
    functions: List[ContractFunctionInfo]

    @staticmethod
    def from_code_element(elm: CodeElementFunction) -> "ContractInterfaceInfo":
        # Ensure it's a namespace.
        if elm.element_type != "namespace":
            raise PreprocessorError(
                f"@{CONTRACT_INTERFACE_DECORATOR} can only be used with namespaces.",
                location=elm.identifier.location,
            )

        # Make sure there are no decorators other than CONTRACT_INTERFACE_DECORATOR.
        verify_decorators(
            elm=elm,
            allowed_decorators=[CONTRACT_INTERFACE_DECORATOR],
            name_in_error_message="a contract interface",
        )

        contract_name = elm.identifier.name
        contract_name_location = non_optional_location(elm.identifier.location)

        functions: List[ContractFunctionInfo] = []
        for commented_func_code_elm in elm.code_block.code_elements:
            func_code_elm = commented_func_code_elm.code_elm
            if isinstance(func_code_elm, CodeElementEmptyLine):
                continue
            is_func = (
                isinstance(func_code_elm, CodeElementFunction)
                and func_code_elm.element_type == "func"
            )
            if not is_func:
                error_location = (
                    elm.identifier.location
                    if commented_func_code_elm.location is None
                    else commented_func_code_elm.location
                )
                raise PreprocessorError(
                    "Only functions are supported within a contract interface.",
                    location=error_location,
                )

            assert isinstance(func_code_elm, CodeElementFunction)
            functions.append(ContractFunctionInfo.from_code_element(contract_name, func_code_elm))

        return ContractInterfaceInfo(
            name=contract_name,
            parent_location=(contract_name_location, "While handling contract interface:"),
            functions=functions,
        )


def process_function_selector(function_info: ContractFunctionInfo) -> List[CommentedCodeElement]:
    code = f"""\
const {function_info.selector} = {get_selector_from_name(function_info.name)};
"""
    code_block = autogen_parse_code_block(
        path=function_info.autogen_code_name,
        code=code,
        parser_context=ParserContext(
            parent_location=function_info.parent_location,
        ),
    )
    return code_block.code_elements


def process_contract_function(
    function_info: ContractFunctionInfo, func_body: CodeBlock, is_library_call: bool
) -> List[CommentedCodeElement]:
    func_code_elm = function_info.elm
    func_name = f"{'library_call_' if is_library_call else ''}{function_info.name}"
    argument_name = _get_argument_name(is_library_call=is_library_call)
    code = f"""\
func {func_name}{{syscall_ptr: felt*, range_check_ptr}}(
    {argument_name}: felt) {{
}}
"""

    code_block = autogen_parse_code_block(
        path=function_info.autogen_code_name,
        code=code,
        parser_context=ParserContext(
            parent_location=function_info.parent_location,
        ),
    )
    call_func = code_block.code_elements[0].code_elm
    assert isinstance(call_func, CodeElementFunction)
    call_func.arguments = dataclasses.replace(
        func_code_elm.arguments,
        identifiers=call_func.arguments.identifiers + func_code_elm.arguments.identifiers,
    )
    call_func.returns = func_code_elm.returns
    call_func.code_block = func_body

    return code_block.code_elements


class FuncBodyCallback(Protocol):
    def __call__(self, function_info: ContractFunctionInfo, is_library_call: bool) -> CodeBlock:
        pass


def generate_contract_interface_namespace(
    contract_info: ContractInterfaceInfo,
    func_body_callback: FuncBodyCallback,
) -> CodeElementFunction:
    contract_name = contract_info.name
    code = f"""\
namespace {contract_name} {{
    from starkware.cairo.common.alloc import alloc
    from starkware.cairo.common.memcpy import memcpy
    from starkware.starknet.common.syscalls import call_contract, library_call
}}
"""

    code_block = autogen_parse_code_block(
        path=AUTOGEN_PREFIX + contract_name,
        code=code,
        parser_context=ParserContext(
            parent_location=contract_info.parent_location,
        ),
    )
    assert len(code_block.code_elements) == 1
    res = code_block.code_elements[0].code_elm
    assert isinstance(res, CodeElementFunction) and res.element_type == "namespace"

    for function_info in contract_info.functions:
        res.code_block.code_elements += process_function_selector(function_info)
        for is_library_call in [False, True]:
            res.code_block.code_elements += process_contract_function(
                function_info=function_info,
                func_body=func_body_callback(
                    function_info=function_info, is_library_call=is_library_call
                ),
                is_library_call=is_library_call,
            )

    res.additional_attributes[CONTRACT_INTERFACE_ATTR] = contract_info

    return res


class ContractInterfaceDeclVisitor(IdentifierAwareVisitor):
    """
    Replaces @contract_interface decorated namespaces with a namespace with dummy functions.
    After the struct collection phase is completed, those functions will be replaced by
    functions will full implementation.
    """

    def _visit_default(self, obj):
        return obj

    def visit_CodeElementFunction(self, elm: CodeElementFunction):
        is_contract_interface, contract_interface_location = has_decorator(
            elm=elm, decorator_name=CONTRACT_INTERFACE_DECORATOR
        )
        if is_contract_interface:
            verify_starknet_lang(
                file_lang=self.file_lang,
                location=contract_interface_location,
                name_in_error_message=f"@{CONTRACT_INTERFACE_DECORATOR}",
            )

            return generate_contract_interface_namespace(
                ContractInterfaceInfo.from_code_element(elm),
                func_body_callback=self.generate_contract_function_body,
            )

        return elm

    def generate_contract_function_body(
        self, function_info: ContractFunctionInfo, is_library_call: bool
    ):
        # Add dummy references and calls that will be visited by the identifier collector
        # and the dependency graph.
        # Those statements will later be replaced by the real implementation.
        code = f"""
let calldata_ptr_start = 0;
let retdata_size = 0;
let retdata = 0;
call alloc;
call memcpy;
call {_get_syscall_name(is_library_call=is_library_call)};
"""
        return autogen_parse_code_block(
            path=function_info.autogen_code_name,
            code=code,
            parser_context=ParserContext(
                parent_location=function_info.parent_location,
            ),
        )


class ContractInterfaceImplementationVisitor(IdentifierAwareVisitor):
    """
    Replaces @contract_interface decorated namespaces (obtained from the additional attribute
    CONTRACT_INTERFACE_ATTR added by ContractInterfaceDeclVisitor) with a namespace with
    generated code that calls the call_contract() system call.
    """

    def _visit_default(self, obj):
        return obj

    def visit_CodeElementFunction(self, elm: CodeElementFunction):
        contract_info = get_function_attr(
            elm=elm, attr_name=CONTRACT_INTERFACE_ATTR, attr_type=ContractInterfaceInfo
        )
        if contract_info is None:
            return elm

        return generate_contract_interface_namespace(
            contract_info=contract_info,
            func_body_callback=self.generate_contract_function_body,
        )

    def generate_contract_function_body(
        self, function_info: ContractFunctionInfo, is_library_call: bool
    ):
        def get_code_elements(code: str) -> List[CommentedCodeElement]:
            return autogen_parse_code_block(
                path=function_info.autogen_code_name,
                code=code,
                parser_context=ParserContext(
                    parent_location=function_info.parent_location,
                ),
            ).code_elements

        code_elements: List[CommentedCodeElement] = []
        code_elements += get_code_elements(
            code=f"""
alloc_locals;
let (local calldata_ptr_start: felt*) = alloc();
let __calldata_ptr = calldata_ptr_start;
"""
        )

        # Handle inputs.
        code_elements += encode_calldata_arguments(
            arguments=function_info.elm.arguments, visitor=self
        )
        # Add the system call.
        argument_name = _get_argument_name(is_library_call=is_library_call)
        code_elements += get_code_elements(
            code=f"""
let (retdata_size, retdata) = {_get_syscall_name(is_library_call=is_library_call)}(
    {argument_name}={argument_name},
    function_selector={function_info.selector},
    calldata_size=__calldata_ptr - calldata_ptr_start,
    calldata=calldata_ptr_start);
"""
        )

        # Handle outputs.

        return_str = ""
        if function_info.elm.returns is not None:
            returns = self.resolve_type(cairo_type=function_info.elm.returns)
            if not isinstance(returns, TypeTuple):
                raise PreprocessorError(
                    "Only tuple types are supported as the return type of external functions.",
                    location=returns.location,
                )

            for item in returns.members:
                if item.name is None:
                    raise PreprocessorError(
                        "A return value in an interface must be named.", location=item.location
                    )
            rets = [
                ArgumentInfo(
                    name=as_non_optional(item.name),
                    cairo_type=self.resolve_type(item.typ),
                    location=non_optional_location(item.location),
                )
                for item in returns.members
            ]
            ret_elements, ret_arg_list = decode_data(
                data_ptr="retdata",
                data_size="retdata_size",
                arguments=rets,
                encoding_type=EncodingType.RETURN,
                has_range_check_builtin=True,
                location=function_info.parent_location[0],
                identifiers=self.identifiers,
            )
            # Update the return values.
            return_str = ret_arg_list.format()
            code_elements += [code_elm for code_elm in ret_elements]

        code_elements += get_code_elements(
            code=f"""
return ({return_str});
"""
        )

        return CodeBlock(code_elements=code_elements)


def _get_argument_name(is_library_call: bool) -> str:
    return "class_hash" if is_library_call else "contract_address"


def _get_syscall_name(is_library_call: bool) -> str:
    return "library_call" if is_library_call else "call_contract"

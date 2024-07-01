import dataclasses
from typing import List

from starkware.cairo.lang.compiler.ast.code_elements import (
    CodeBlock,
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
from starkware.starknet.compiler.validation_utils import (
    encode_calldata_arguments,
    get_function_attr,
    has_decorator,
    non_optional_location,
    verify_decorators,
    verify_no_implicit_arguments,
    verify_no_return_values,
    verify_starknet_lang,
)
from starkware.starknet.public.abi import get_selector_from_name

EVENT_DECORATOR = "event"
EVENT_ATTR = "event"
AUTOGEN_PREFIX = "autogen/starknet/event/"


@dataclasses.dataclass
class EventInfo:
    """
    Represents information about an @event decorated function that can be collected
    before the struct collection phase.
    """

    # The original code element.
    elm: CodeElementFunction
    # A parent location to be used in case of errors concerning this event.
    parent_location: ParentLocation
    # The name of the auto-generated file for code segments related to this event.
    autogen_code_name: str

    @classmethod
    def from_code_element(cls, elm: CodeElementFunction) -> "EventInfo":
        cls.verify(elm=elm)
        name = elm.identifier.name
        event_location = non_optional_location(elm.identifier.location)

        return cls(
            elm=elm,
            parent_location=(event_location, "While handling event:"),
            autogen_code_name=AUTOGEN_PREFIX + name,
        )

    @classmethod
    def verify(cls, elm: CodeElementFunction):
        # Ensure it is a function.
        if elm.element_type != "func":
            raise PreprocessorError(
                f"@{EVENT_DECORATOR} can only be used with functions.",
                location=elm.identifier.location,
            )

        # Make sure there are no decorators other than EVENT_DECORATOR.
        verify_decorators(
            elm=elm, allowed_decorators=[EVENT_DECORATOR], name_in_error_message="an event"
        )
        verify_empty_code_block(
            code_block=elm.code_block,
            error_message="Events must have an empty body.",
            default_location=elm.identifier.location,
        )
        verify_no_implicit_arguments(elm=elm, name_in_error_message="Events")
        verify_no_return_values(elm=elm, name_in_error_message="Events")

    def parse_code_block(self, code: str) -> CodeBlock:
        """
        Parses the given code as CodeBlock.
        """
        return autogen_parse_code_block(
            path=self.autogen_code_name,
            code=code,
            parser_context=ParserContext(
                parent_location=self.parent_location,
            ),
        )


def generate_event_namespace(
    event_info: EventInfo,
    emit_func_body: CodeBlock,
) -> CodeElementFunction:
    event_name = event_info.elm.identifier.name
    code = f"""\
namespace {event_name} {{
    from starkware.cairo.common.alloc import alloc
    from starkware.cairo.common.memcpy import memcpy
    from starkware.starknet.common.syscalls import emit_event

    const SELECTOR = {get_selector_from_name(event_name)};
}}
"""

    # Generate the namespace without the functions.
    code_block = event_info.parse_code_block(code=code)
    res = code_block.code_elements[0].code_elm
    assert isinstance(res, CodeElementFunction) and res.element_type == "namespace"

    # Enrich the namespace with the event functions.
    res.code_block.code_elements += process_event(
        event_info=event_info, emit_func_body=emit_func_body
    )
    # Store the event info - to be used by the next visitor.
    res.additional_attributes[EVENT_ATTR] = event_info

    return res


def process_event(event_info: EventInfo, emit_func_body: CodeBlock) -> List[CommentedCodeElement]:
    code = """\
func emit{syscall_ptr: felt*, range_check_ptr}() {
}
"""

    # Generate an empty emit function.
    code_block = event_info.parse_code_block(code=code)
    emit_func = code_block.code_elements[0].code_elm
    assert isinstance(emit_func, CodeElementFunction)

    # Enrich the function with the high-level event arguments and the given body.
    emit_func.arguments = event_info.elm.arguments
    emit_func.code_block = emit_func_body

    return code_block.code_elements


class EventDeclVisitor(IdentifierAwareVisitor):
    """
    Replaces @event decorated functions with a namespace with a dummy emit function.
    After the struct collection phase is completed, that function will be replaced by
    one will full implementation.
    """

    def _visit_default(self, obj):
        return obj

    def visit_CodeElementFunction(self, elm: CodeElementFunction):
        is_event, event_location = has_decorator(elm=elm, decorator_name=EVENT_DECORATOR)
        if not is_event:
            return elm

        verify_starknet_lang(
            file_lang=self.file_lang,
            location=event_location,
            name_in_error_message=f"@{EVENT_DECORATOR}",
        )
        event_info = EventInfo.from_code_element(elm=elm)
        emit_func_body = self.generate_emit_function_body(event_info=event_info)

        return generate_event_namespace(event_info=event_info, emit_func_body=emit_func_body)

    def generate_emit_function_body(self, event_info: EventInfo) -> CodeBlock:
        # Add dummy references and calls that will be visited by the identifier collector
        # and the dependency graph.
        # Those statements will later be replaced by the real implementation.
        code = """\
let __keys_ptr = 0;
let __data_ptr = 0;
call alloc;
call memcpy;
call emit_event;
"""
        return event_info.parse_code_block(code=code)


class EventImplementationVisitor(IdentifierAwareVisitor):
    """
    Replaces @event decorated functions (obtained from the additional attribute
    EVENT_ATTR added by EventDeclVisitor) with a namespace with an emit() function.
    """

    def _visit_default(self, obj):
        return obj

    def visit_CodeElementFunction(self, elm: CodeElementFunction):
        event_info = get_function_attr(elm=elm, attr_name=EVENT_ATTR, attr_type=EventInfo)
        if event_info is None:
            return elm

        return generate_event_namespace(
            event_info=event_info,
            emit_func_body=self.generate_emit_function_body(event_info=event_info),
        )

    def generate_emit_function_body(self, event_info: EventInfo) -> CodeBlock:
        code_elements = event_info.parse_code_block(
            code="""\
alloc_locals;
let (local __keys_ptr: felt*) = alloc();
assert [__keys_ptr] = SELECTOR;
let (local __data_ptr: felt*) = alloc();
let __calldata_ptr = __data_ptr;
"""
        ).code_elements

        # Flatten the calldata - which is the data to emit - to an array of felts.
        code_elements += encode_calldata_arguments(arguments=event_info.elm.arguments, visitor=self)
        # Add the emit_event system call.
        code_elements += event_info.parse_code_block(
            code="""\
emit_event(keys_len=1, keys=__keys_ptr, data_len=__calldata_ptr - __data_ptr, data=__data_ptr);
return ();
"""
        ).code_elements

        return CodeBlock(code_elements=code_elements)

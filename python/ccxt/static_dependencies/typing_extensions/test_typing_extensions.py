import abc
import collections
import collections.abc
import contextlib
import copy
import functools
import gc
import importlib
import inspect
import io
import pickle
import re
import subprocess
import sys
import tempfile
import textwrap
import types
import typing
import warnings
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
from unittest import TestCase, main, skipIf, skipUnless
from unittest.mock import patch

import typing_extensions
from _typed_dict_test_helper import Foo, FooGeneric, VeryAnnotated
from typing_extensions import (
    _PEP_649_OR_749_IMPLEMENTED,
    Annotated,
    Any,
    AnyStr,
    AsyncContextManager,
    AsyncIterator,
    Awaitable,
    Buffer,
    Callable,
    ClassVar,
    Concatenate,
    Dict,
    Doc,
    Final,
    Format,
    Generic,
    IntVar,
    Iterable,
    Iterator,
    List,
    Literal,
    LiteralString,
    NamedTuple,
    Never,
    NewType,
    NoDefault,
    NoReturn,
    NotRequired,
    Optional,
    ParamSpec,
    ParamSpecArgs,
    ParamSpecKwargs,
    Protocol,
    ReadOnly,
    Required,
    Self,
    Set,
    Tuple,
    Type,
    TypeAlias,
    TypeAliasType,
    TypedDict,
    TypeExpr,
    TypeGuard,
    TypeIs,
    TypeVar,
    TypeVarTuple,
    Union,
    Unpack,
    assert_never,
    assert_type,
    clear_overloads,
    dataclass_transform,
    deprecated,
    final,
    get_annotations,
    get_args,
    get_origin,
    get_original_bases,
    get_overloads,
    get_protocol_members,
    get_type_hints,
    is_protocol,
    is_typeddict,
    no_type_check,
    overload,
    override,
    reveal_type,
    runtime,
    runtime_checkable,
)

NoneType = type(None)
T = TypeVar("T")
KT = TypeVar("KT")
VT = TypeVar("VT")

# Flags used to mark tests that only apply after a specific
# version of the typing module.
TYPING_3_9_0 = sys.version_info[:3] >= (3, 9, 0)
TYPING_3_10_0 = sys.version_info[:3] >= (3, 10, 0)

# 3.11 makes runtime type checks (_type_check) more lenient.
TYPING_3_11_0 = sys.version_info[:3] >= (3, 11, 0)

# 3.12 changes the representation of Unpack[] (PEP 692)
# and adds PEP 695 to CPython's grammar
TYPING_3_12_0 = sys.version_info[:3] >= (3, 12, 0)

# 3.13 drops support for the keyword argument syntax of TypedDict
TYPING_3_13_0 = sys.version_info[:3] >= (3, 13, 0)

# https://github.com/python/cpython/pull/27017 was backported into some 3.9 and 3.10
# versions, but not all
HAS_FORWARD_MODULE = "module" in inspect.signature(typing._type_check).parameters

skip_if_py313_beta_1 = skipIf(
    sys.version_info[:5] == (3, 13, 0, 'beta', 1),
    "Bugfixes will be released in 3.13.0b2"
)

ANN_MODULE_SOURCE = '''\
import sys
from typing import List, Optional
from functools import wraps

try:
    __annotations__[1] = 2
except NameError:
    assert sys.version_info >= (3, 14)

class C:

    x = 5; y: Optional['C'] = None

from typing import Tuple
x: int = 5; y: str = x; f: Tuple[int, int]

class M(type):
    try:
        __annotations__['123'] = 123
    except NameError:
        assert sys.version_info >= (3, 14)
    o: type = object

(pars): bool = True

class D(C):
    j: str = 'hi'; k: str= 'bye'

from types import new_class
h_class = new_class('H', (C,))
j_class = new_class('J')

class F():
    z: int = 5
    def __init__(self, x):
        pass

class Y(F):
    def __init__(self):
        super(F, self).__init__(123)

class Meta(type):
    def __new__(meta, name, bases, namespace):
        return super().__new__(meta, name, bases, namespace)

class S(metaclass = Meta):
    x: str = 'something'
    y: str = 'something else'

def foo(x: int = 10):
    def bar(y: List[str]):
        x: str = 'yes'
    bar()

def dec(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
'''

ANN_MODULE_2_SOURCE = '''\
from typing import no_type_check, ClassVar

i: int = 1
j: int
x: float = i/10

def f():
    class C: ...
    return C()

f().new_attr: object = object()

class C:
    def __init__(self, x: int) -> None:
        self.x = x

c = C(5)
c.new_attr: int = 10

__annotations__ = {}


@no_type_check
class NTC:
    def meth(self, param: complex) -> None:
        ...

class CV:
    var: ClassVar['CV']

CV.var = CV()
'''

ANN_MODULE_3_SOURCE = '''\
def f_bad_ann():
    __annotations__[1] = 2

class C_OK:
    def __init__(self, x: int) -> None:
        self.x: no_such_name = x  # This one is OK as proposed by Guido

class D_bad_ann:
    def __init__(self, x: int) -> None:
        sfel.y: int = 0

def g_bad_ann():
    no_such_name.attr: int = 0
'''


STOCK_ANNOTATIONS = """
a:int=3
b:str="foo"

class MyClass:
    a:int=4
    b:str="bar"
    def __init__(self, a, b):
        self.a = a
        self.b = b
    def __eq__(self, other):
        return isinstance(other, MyClass) and self.a == other.a and self.b == other.b

def function(a:int, b:str) -> MyClass:
    return MyClass(a, b)


def function2(a:int, b:"str", c:MyClass) -> MyClass:
    pass


def function3(a:"int", b:"str", c:"MyClass"):
    pass


class UnannotatedClass:
    pass

def unannotated_function(a, b, c): pass
"""

STRINGIZED_ANNOTATIONS = """
from __future__ import annotations

a:int=3
b:str="foo"

class MyClass:
    a:int=4
    b:str="bar"
    def __init__(self, a, b):
        self.a = a
        self.b = b
    def __eq__(self, other):
        return isinstance(other, MyClass) and self.a == other.a and self.b == other.b

def function(a:int, b:str) -> MyClass:
    return MyClass(a, b)


def function2(a:int, b:"str", c:MyClass) -> MyClass:
    pass


def function3(a:"int", b:"str", c:"MyClass"):
    pass


class UnannotatedClass:
    pass

def unannotated_function(a, b, c): pass

class MyClassWithLocalAnnotations:
    mytype = int
    x: mytype
"""

STRINGIZED_ANNOTATIONS_2 = """
from __future__ import annotations


def foo(a, b, c):  pass
"""

if TYPING_3_12_0:
    STRINGIZED_ANNOTATIONS_PEP_695 = textwrap.dedent(
        """
        from __future__ import annotations
        from typing import Callable, Unpack


        class A[T, *Ts, **P]:
            x: T
            y: tuple[*Ts]
            z: Callable[P, str]


        class B[T, *Ts, **P]:
            T = int
            Ts = str
            P = bytes
            x: T
            y: Ts
            z: P


        Eggs = int
        Spam = str


        class C[Eggs, **Spam]:
            x: Eggs
            y: Spam


        def generic_function[T, *Ts, **P](
            x: T, *y: Unpack[Ts], z: P.args, zz: P.kwargs
        ) -> None: ...


        def generic_function_2[Eggs, **Spam](x: Eggs, y: Spam): pass


        class D:
            Foo = int
            Bar = str

            def generic_method[Foo, **Bar](
                self, x: Foo, y: Bar
            ) -> None: ...

            def generic_method_2[Eggs, **Spam](self, x: Eggs, y: Spam): pass


        # Eggs is `int` in globals, a TypeVar in type_params, and `str` in locals:
        class E[Eggs]:
            Eggs = str
            x: Eggs



        def nested():
            from types import SimpleNamespace
            from typing_extensions import get_annotations

            Eggs = bytes
            Spam = memoryview


            class F[Eggs, **Spam]:
                x: Eggs
                y: Spam

                def generic_method[Eggs, **Spam](self, x: Eggs, y: Spam): pass


            def generic_function[Eggs, **Spam](x: Eggs, y: Spam): pass


            # Eggs is `int` in globals, `bytes` in the function scope,
            # a TypeVar in the type_params, and `str` in locals:
            class G[Eggs]:
                Eggs = str
                x: Eggs


            return SimpleNamespace(
                F=F,
                F_annotations=get_annotations(F, eval_str=True),
                F_meth_annotations=get_annotations(F.generic_method, eval_str=True),
                G_annotations=get_annotations(G, eval_str=True),
                generic_func=generic_function,
                generic_func_annotations=get_annotations(generic_function, eval_str=True)
            )
        """
    )
else:
    STRINGIZED_ANNOTATIONS_PEP_695 = None


class BaseTestCase(TestCase):
    def assertIsSubclass(self, cls, class_or_tuple, msg=None):
        if not issubclass(cls, class_or_tuple):
            message = f'{cls!r} is not a subclass of {class_or_tuple!r}'
            if msg is not None:
                message += f' : {msg}'
            raise self.failureException(message)

    def assertNotIsSubclass(self, cls, class_or_tuple, msg=None):
        if issubclass(cls, class_or_tuple):
            message = f'{cls!r} is a subclass of {class_or_tuple!r}'
            if msg is not None:
                message += f' : {msg}'
            raise self.failureException(message)


class Employee:
    pass


class BottomTypeTestsMixin:
    bottom_type: ClassVar[Any]

    def test_equality(self):
        self.assertEqual(self.bottom_type, self.bottom_type)
        self.assertIs(self.bottom_type, self.bottom_type)
        self.assertNotEqual(self.bottom_type, None)

    def test_get_origin(self):
        self.assertIs(get_origin(self.bottom_type), None)

    def test_instance_type_error(self):
        with self.assertRaises(TypeError):
            isinstance(42, self.bottom_type)

    def test_subclass_type_error(self):
        with self.assertRaises(TypeError):
            issubclass(Employee, self.bottom_type)
        with self.assertRaises(TypeError):
            issubclass(NoReturn, self.bottom_type)

    def test_not_generic(self):
        with self.assertRaises(TypeError):
            self.bottom_type[int]

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class A(self.bottom_type):
                pass
        with self.assertRaises(TypeError):
            class B(type(self.bottom_type)):
                pass

    def test_cannot_instantiate(self):
        with self.assertRaises(TypeError):
            self.bottom_type()
        with self.assertRaises(TypeError):
            type(self.bottom_type)()

    def test_pickle(self):
        for proto in range(pickle.HIGHEST_PROTOCOL):
            pickled = pickle.dumps(self.bottom_type, protocol=proto)
            self.assertIs(self.bottom_type, pickle.loads(pickled))


class NoReturnTests(BottomTypeTestsMixin, BaseTestCase):
    bottom_type = NoReturn

    def test_repr(self):
        if hasattr(typing, 'NoReturn'):
            self.assertEqual(repr(NoReturn), 'typing.NoReturn')
        else:
            self.assertEqual(repr(NoReturn), 'typing_extensions.NoReturn')

    def test_get_type_hints(self):
        def some(arg: NoReturn) -> NoReturn: ...
        def some_str(arg: 'NoReturn') -> 'typing.NoReturn': ...

        expected = {'arg': NoReturn, 'return': NoReturn}
        for target in some, some_str:
            with self.subTest(target=target):
                self.assertEqual(gth(target), expected)

    def test_not_equality(self):
        self.assertNotEqual(NoReturn, Never)
        self.assertNotEqual(Never, NoReturn)


class NeverTests(BottomTypeTestsMixin, BaseTestCase):
    bottom_type = Never

    def test_repr(self):
        if hasattr(typing, 'Never'):
            self.assertEqual(repr(Never), 'typing.Never')
        else:
            self.assertEqual(repr(Never), 'typing_extensions.Never')

    def test_get_type_hints(self):
        def some(arg: Never) -> Never: ...
        def some_str(arg: 'Never') -> 'typing_extensions.Never': ...

        expected = {'arg': Never, 'return': Never}
        for target in [some, some_str]:
            with self.subTest(target=target):
                self.assertEqual(gth(target), expected)


class AssertNeverTests(BaseTestCase):
    def test_exception(self):
        with self.assertRaises(AssertionError):
            assert_never(None)

        value = "some value"
        with self.assertRaisesRegex(AssertionError, value):
            assert_never(value)

        # Make sure a huge value doesn't get printed in its entirety
        huge_value = "a" * 10000
        with self.assertRaises(AssertionError) as cm:
            assert_never(huge_value)
        self.assertLess(
            len(cm.exception.args[0]),
            typing_extensions._ASSERT_NEVER_REPR_MAX_LENGTH * 2,
        )


class OverrideTests(BaseTestCase):
    def test_override(self):
        class Base:
            def normal_method(self): ...
            @staticmethod
            def static_method_good_order(): ...
            @staticmethod
            def static_method_bad_order(): ...
            @staticmethod
            def decorator_with_slots(): ...

        class Derived(Base):
            @override
            def normal_method(self):
                return 42

            @staticmethod
            @override
            def static_method_good_order():
                return 42

            @override
            @staticmethod
            def static_method_bad_order():
                return 42

        self.assertIsSubclass(Derived, Base)
        instance = Derived()
        self.assertEqual(instance.normal_method(), 42)
        self.assertIs(True, instance.normal_method.__override__)
        self.assertEqual(Derived.static_method_good_order(), 42)
        self.assertIs(True, Derived.static_method_good_order.__override__)
        self.assertEqual(Derived.static_method_bad_order(), 42)
        self.assertIs(False, hasattr(Derived.static_method_bad_order, "__override__"))


class DeprecatedTests(BaseTestCase):
    def test_dunder_deprecated(self):
        @deprecated("A will go away soon")
        class A:
            pass

        self.assertEqual(A.__deprecated__, "A will go away soon")
        self.assertIsInstance(A, type)

        @deprecated("b will go away soon")
        def b():
            pass

        self.assertEqual(b.__deprecated__, "b will go away soon")
        self.assertIsInstance(b, types.FunctionType)

        @overload
        @deprecated("no more ints")
        def h(x: int) -> int: ...
        @overload
        def h(x: str) -> str: ...
        def h(x):
            return x

        overloads = get_overloads(h)
        self.assertEqual(len(overloads), 2)
        self.assertEqual(overloads[0].__deprecated__, "no more ints")

    def test_class(self):
        @deprecated("A will go away soon")
        class A:
            pass

        with self.assertWarnsRegex(DeprecationWarning, "A will go away soon"):
            A()
        with self.assertWarnsRegex(DeprecationWarning, "A will go away soon"):
            with self.assertRaises(TypeError):
                A(42)

    def test_class_with_init(self):
        @deprecated("HasInit will go away soon")
        class HasInit:
            def __init__(self, x):
                self.x = x

        with self.assertWarnsRegex(DeprecationWarning, "HasInit will go away soon"):
            instance = HasInit(42)
        self.assertEqual(instance.x, 42)

    def test_class_with_new(self):
        has_new_called = False

        @deprecated("HasNew will go away soon")
        class HasNew:
            def __new__(cls, x):
                nonlocal has_new_called
                has_new_called = True
                return super().__new__(cls)

            def __init__(self, x) -> None:
                self.x = x

        with self.assertWarnsRegex(DeprecationWarning, "HasNew will go away soon"):
            instance = HasNew(42)
        self.assertEqual(instance.x, 42)
        self.assertTrue(has_new_called)

    def test_class_with_inherited_new(self):
        new_base_called = False

        class NewBase:
            def __new__(cls, x):
                nonlocal new_base_called
                new_base_called = True
                return super().__new__(cls)

            def __init__(self, x) -> None:
                self.x = x

        @deprecated("HasInheritedNew will go away soon")
        class HasInheritedNew(NewBase):
            pass

        with self.assertWarnsRegex(DeprecationWarning, "HasInheritedNew will go away soon"):
            instance = HasInheritedNew(42)
        self.assertEqual(instance.x, 42)
        self.assertTrue(new_base_called)

    def test_class_with_new_but_no_init(self):
        new_called = False

        @deprecated("HasNewNoInit will go away soon")
        class HasNewNoInit:
            def __new__(cls, x):
                nonlocal new_called
                new_called = True
                obj = super().__new__(cls)
                obj.x = x
                return obj

        with self.assertWarnsRegex(DeprecationWarning, "HasNewNoInit will go away soon"):
            instance = HasNewNoInit(42)
        self.assertEqual(instance.x, 42)
        self.assertTrue(new_called)

    def test_mixin_class(self):
        @deprecated("Mixin will go away soon")
        class Mixin:
            pass

        class Base:
            def __init__(self, a) -> None:
                self.a = a

        with self.assertWarnsRegex(DeprecationWarning, "Mixin will go away soon"):
            class Child(Base, Mixin):
                pass

        instance = Child(42)
        self.assertEqual(instance.a, 42)

    def test_existing_init_subclass(self):
        @deprecated("C will go away soon")
        class C:
            def __init_subclass__(cls) -> None:
                cls.inited = True

        with self.assertWarnsRegex(DeprecationWarning, "C will go away soon"):
            C()

        with self.assertWarnsRegex(DeprecationWarning, "C will go away soon"):
            class D(C):
                pass

        self.assertTrue(D.inited)
        self.assertIsInstance(D(), D)  # no deprecation

    def test_existing_init_subclass_in_base(self):
        class Base:
            def __init_subclass__(cls, x) -> None:
                cls.inited = x

        @deprecated("C will go away soon")
        class C(Base, x=42):
            pass

        self.assertEqual(C.inited, 42)

        with self.assertWarnsRegex(DeprecationWarning, "C will go away soon"):
            C()

        with self.assertWarnsRegex(DeprecationWarning, "C will go away soon"):
            class D(C, x=3):
                pass

        self.assertEqual(D.inited, 3)

    def test_init_subclass_has_correct_cls(self):
        init_subclass_saw = None

        @deprecated("Base will go away soon")
        class Base:
            def __init_subclass__(cls) -> None:
                nonlocal init_subclass_saw
                init_subclass_saw = cls

        self.assertIsNone(init_subclass_saw)

        with self.assertWarnsRegex(DeprecationWarning, "Base will go away soon"):
            class C(Base):
                pass

        self.assertIs(init_subclass_saw, C)

    def test_init_subclass_with_explicit_classmethod(self):
        init_subclass_saw = None

        @deprecated("Base will go away soon")
        class Base:
            @classmethod
            def __init_subclass__(cls) -> None:
                nonlocal init_subclass_saw
                init_subclass_saw = cls

        self.assertIsNone(init_subclass_saw)

        with self.assertWarnsRegex(DeprecationWarning, "Base will go away soon"):
            class C(Base):
                pass

        self.assertIs(init_subclass_saw, C)

    def test_function(self):
        @deprecated("b will go away soon")
        def b():
            pass

        with self.assertWarnsRegex(DeprecationWarning, "b will go away soon"):
            b()

    def test_method(self):
        class Capybara:
            @deprecated("x will go away soon")
            def x(self):
                pass

        instance = Capybara()
        with self.assertWarnsRegex(DeprecationWarning, "x will go away soon"):
            instance.x()

    def test_property(self):
        class Capybara:
            @property
            @deprecated("x will go away soon")
            def x(self):
                pass

            @property
            def no_more_setting(self):
                return 42

            @no_more_setting.setter
            @deprecated("no more setting")
            def no_more_setting(self, value):
                pass

        instance = Capybara()
        with self.assertWarnsRegex(DeprecationWarning, "x will go away soon"):
            instance.x

        with warnings.catch_warnings():
            warnings.simplefilter("error")
            self.assertEqual(instance.no_more_setting, 42)

        with self.assertWarnsRegex(DeprecationWarning, "no more setting"):
            instance.no_more_setting = 42

    def test_category(self):
        @deprecated("c will go away soon", category=RuntimeWarning)
        def c():
            pass

        with self.assertWarnsRegex(RuntimeWarning, "c will go away soon"):
            c()

    def test_turn_off_warnings(self):
        @deprecated("d will go away soon", category=None)
        def d():
            pass

        with warnings.catch_warnings():
            warnings.simplefilter("error")
            d()

    def test_only_strings_allowed(self):
        with self.assertRaisesRegex(
            TypeError,
            "Expected an object of type str for 'message', not 'type'"
        ):
            @deprecated
            class Foo: ...

        with self.assertRaisesRegex(
            TypeError,
            "Expected an object of type str for 'message', not 'function'"
        ):
            @deprecated
            def foo(): ...

    def test_no_retained_references_to_wrapper_instance(self):
        @deprecated('depr')
        def d(): pass

        self.assertFalse(any(
            isinstance(cell.cell_contents, deprecated) for cell in d.__closure__
        ))


class AnyTests(BaseTestCase):
    def test_can_subclass(self):
        class Mock(Any): pass
        self.assertTrue(issubclass(Mock, Any))
        self.assertIsInstance(Mock(), Mock)

        class Something: pass
        self.assertFalse(issubclass(Something, Any))
        self.assertNotIsInstance(Something(), Mock)

        class MockSomething(Something, Mock): pass
        self.assertTrue(issubclass(MockSomething, Any))
        ms = MockSomething()
        self.assertIsInstance(ms, MockSomething)
        self.assertIsInstance(ms, Something)
        self.assertIsInstance(ms, Mock)

    class SubclassesAny(Any):
        ...

    def test_repr(self):
        if sys.version_info >= (3, 11):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(Any), f"{mod_name}.Any")

    @skipIf(sys.version_info[:3] == (3, 11, 0), "A bug was fixed in 3.11.1")
    def test_repr_on_Any_subclass(self):
        self.assertEqual(
            repr(self.SubclassesAny),
            f"<class '{self.SubclassesAny.__module__}.AnyTests.SubclassesAny'>"
        )

    def test_instantiation(self):
        with self.assertRaises(TypeError):
            Any()

        self.SubclassesAny()

    def test_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(object(), Any)

        isinstance(object(), self.SubclassesAny)


class ClassVarTests(BaseTestCase):

    def test_basics(self):
        if not TYPING_3_11_0:
            with self.assertRaises(TypeError):
                ClassVar[1]
        with self.assertRaises(TypeError):
            ClassVar[int, str]
        with self.assertRaises(TypeError):
            ClassVar[int][str]

    def test_repr(self):
        if hasattr(typing, 'ClassVar'):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(ClassVar), mod_name + '.ClassVar')
        cv = ClassVar[int]
        self.assertEqual(repr(cv), mod_name + '.ClassVar[int]')
        cv = ClassVar[Employee]
        self.assertEqual(repr(cv), mod_name + f'.ClassVar[{__name__}.Employee]')

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(ClassVar)):
                pass
        with self.assertRaises(TypeError):
            class D(type(ClassVar[int])):
                pass

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            ClassVar()
        with self.assertRaises(TypeError):
            type(ClassVar)()
        with self.assertRaises(TypeError):
            type(ClassVar[Optional[int]])()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, ClassVar[int])
        with self.assertRaises(TypeError):
            issubclass(int, ClassVar)


class FinalTests(BaseTestCase):

    def test_basics(self):
        if not TYPING_3_11_0:
            with self.assertRaises(TypeError):
                Final[1]
        with self.assertRaises(TypeError):
            Final[int, str]
        with self.assertRaises(TypeError):
            Final[int][str]

    def test_repr(self):
        self.assertEqual(repr(Final), 'typing.Final')
        cv = Final[int]
        self.assertEqual(repr(cv), 'typing.Final[int]')
        cv = Final[Employee]
        self.assertEqual(repr(cv), f'typing.Final[{__name__}.Employee]')

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(Final)):
                pass
        with self.assertRaises(TypeError):
            class D(type(Final[int])):
                pass

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            Final()
        with self.assertRaises(TypeError):
            type(Final)()
        with self.assertRaises(TypeError):
            type(Final[Optional[int]])()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, Final[int])
        with self.assertRaises(TypeError):
            issubclass(int, Final)


class RequiredTests(BaseTestCase):

    def test_basics(self):
        if not TYPING_3_11_0:
            with self.assertRaises(TypeError):
                Required[1]
        with self.assertRaises(TypeError):
            Required[int, str]
        with self.assertRaises(TypeError):
            Required[int][str]

    def test_repr(self):
        if hasattr(typing, 'Required'):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(Required), f'{mod_name}.Required')
        cv = Required[int]
        self.assertEqual(repr(cv), f'{mod_name}.Required[int]')
        cv = Required[Employee]
        self.assertEqual(repr(cv), f'{mod_name}.Required[{__name__}.Employee]')

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(Required)):
                pass
        with self.assertRaises(TypeError):
            class D(type(Required[int])):
                pass

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            Required()
        with self.assertRaises(TypeError):
            type(Required)()
        with self.assertRaises(TypeError):
            type(Required[Optional[int]])()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, Required[int])
        with self.assertRaises(TypeError):
            issubclass(int, Required)


class NotRequiredTests(BaseTestCase):

    def test_basics(self):
        if not TYPING_3_11_0:
            with self.assertRaises(TypeError):
                NotRequired[1]
        with self.assertRaises(TypeError):
            NotRequired[int, str]
        with self.assertRaises(TypeError):
            NotRequired[int][str]

    def test_repr(self):
        if hasattr(typing, 'NotRequired'):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(NotRequired), f'{mod_name}.NotRequired')
        cv = NotRequired[int]
        self.assertEqual(repr(cv), f'{mod_name}.NotRequired[int]')
        cv = NotRequired[Employee]
        self.assertEqual(repr(cv), f'{mod_name}.NotRequired[{ __name__}.Employee]')

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(NotRequired)):
                pass
        with self.assertRaises(TypeError):
            class D(type(NotRequired[int])):
                pass

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            NotRequired()
        with self.assertRaises(TypeError):
            type(NotRequired)()
        with self.assertRaises(TypeError):
            type(NotRequired[Optional[int]])()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, NotRequired[int])
        with self.assertRaises(TypeError):
            issubclass(int, NotRequired)


class IntVarTests(BaseTestCase):
    def test_valid(self):
        IntVar("T_ints")

    def test_invalid(self):
        with self.assertRaises(TypeError):
            IntVar("T_ints", int)
        with self.assertRaises(TypeError):
            IntVar("T_ints", bound=int)
        with self.assertRaises(TypeError):
            IntVar("T_ints", covariant=True)


class LiteralTests(BaseTestCase):
    def test_basics(self):
        Literal[1]
        Literal[1, 2, 3]
        Literal["x", "y", "z"]
        Literal[None]

    def test_enum(self):
        import enum
        class My(enum.Enum):
            A = 'A'

        self.assertEqual(Literal[My.A].__args__, (My.A,))

    def test_illegal_parameters_do_not_raise_runtime_errors(self):
        # Type checkers should reject these types, but we do not
        # raise errors at runtime to maintain maximum flexibility
        Literal[int]
        Literal[Literal[1, 2], Literal[4, 5]]
        Literal[3j + 2, ..., ()]
        Literal[b"foo", "bar"]
        Literal[{"foo": 3, "bar": 4}]
        Literal[T]

    def test_literals_inside_other_types(self):
        List[Literal[1, 2, 3]]
        List[Literal[("foo", "bar", "baz")]]

    def test_repr(self):
        # we backport various bugfixes that were added in 3.10.1 and earlier
        if sys.version_info >= (3, 10, 1):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(Literal[1]), mod_name + ".Literal[1]")
        self.assertEqual(repr(Literal[1, True, "foo"]), mod_name + ".Literal[1, True, 'foo']")
        self.assertEqual(repr(Literal[int]), mod_name + ".Literal[int]")
        self.assertEqual(repr(Literal), mod_name + ".Literal")
        self.assertEqual(repr(Literal[None]), mod_name + ".Literal[None]")
        self.assertEqual(repr(Literal[1, 2, 3, 3]), mod_name + ".Literal[1, 2, 3]")

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            Literal()
        with self.assertRaises(TypeError):
            Literal[1]()
        with self.assertRaises(TypeError):
            type(Literal)()
        with self.assertRaises(TypeError):
            type(Literal[1])()

    def test_no_isinstance_or_issubclass(self):
        with self.assertRaises(TypeError):
            isinstance(1, Literal[1])
        with self.assertRaises(TypeError):
            isinstance(int, Literal[1])
        with self.assertRaises(TypeError):
            issubclass(1, Literal[1])
        with self.assertRaises(TypeError):
            issubclass(int, Literal[1])

    def test_no_subclassing(self):
        with self.assertRaises(TypeError):
            class Foo(Literal[1]): pass
        with self.assertRaises(TypeError):
            class Bar(Literal): pass

    def test_no_multiple_subscripts(self):
        with self.assertRaises(TypeError):
            Literal[1][1]

    def test_equal(self):
        self.assertNotEqual(Literal[0], Literal[False])
        self.assertNotEqual(Literal[True], Literal[1])
        self.assertNotEqual(Literal[1], Literal[2])
        self.assertNotEqual(Literal[1, True], Literal[1])
        self.assertNotEqual(Literal[1, True], Literal[1, 1])
        self.assertNotEqual(Literal[1, 2], Literal[True, 2])
        self.assertEqual(Literal[1], Literal[1])
        self.assertEqual(Literal[1, 2], Literal[2, 1])
        self.assertEqual(Literal[1, 2, 3], Literal[1, 2, 3, 3])

    def test_hash(self):
        self.assertEqual(hash(Literal[1]), hash(Literal[1]))
        self.assertEqual(hash(Literal[1, 2]), hash(Literal[2, 1]))
        self.assertEqual(hash(Literal[1, 2, 3]), hash(Literal[1, 2, 3, 3]))

    def test_args(self):
        self.assertEqual(Literal[1, 2, 3].__args__, (1, 2, 3))
        self.assertEqual(Literal[1, 2, 3, 3].__args__, (1, 2, 3))
        self.assertEqual(Literal[1, Literal[2], Literal[3, 4]].__args__, (1, 2, 3, 4))
        # Mutable arguments will not be deduplicated
        self.assertEqual(Literal[[], []].__args__, ([], []))

    def test_union_of_literals(self):
        self.assertEqual(Union[Literal[1], Literal[2]].__args__,
                         (Literal[1], Literal[2]))
        self.assertEqual(Union[Literal[1], Literal[1]],
                         Literal[1])

        self.assertEqual(Union[Literal[False], Literal[0]].__args__,
                         (Literal[False], Literal[0]))
        self.assertEqual(Union[Literal[True], Literal[1]].__args__,
                         (Literal[True], Literal[1]))

        import enum
        class Ints(enum.IntEnum):
            A = 0
            B = 1

        self.assertEqual(Union[Literal[Ints.A], Literal[Ints.B]].__args__,
                         (Literal[Ints.A], Literal[Ints.B]))

        self.assertEqual(Union[Literal[Ints.A], Literal[Ints.A]],
                         Literal[Ints.A])
        self.assertEqual(Union[Literal[Ints.B], Literal[Ints.B]],
                         Literal[Ints.B])

        self.assertEqual(Union[Literal[0], Literal[Ints.A], Literal[False]].__args__,
                         (Literal[0], Literal[Ints.A], Literal[False]))
        self.assertEqual(Union[Literal[1], Literal[Ints.B], Literal[True]].__args__,
                         (Literal[1], Literal[Ints.B], Literal[True]))

    @skipUnless(TYPING_3_10_0, "Python 3.10+ required")
    def test_or_type_operator_with_Literal(self):
        self.assertEqual((Literal[1] | Literal[2]).__args__,
                         (Literal[1], Literal[2]))

        self.assertEqual((Literal[0] | Literal[False]).__args__,
                         (Literal[0], Literal[False]))
        self.assertEqual((Literal[1] | Literal[True]).__args__,
                         (Literal[1], Literal[True]))

        self.assertEqual(Literal[1] | Literal[1], Literal[1])
        self.assertEqual(Literal['a'] | Literal['a'], Literal['a'])

        import enum
        class Ints(enum.IntEnum):
            A = 0
            B = 1

        self.assertEqual(Literal[Ints.A] | Literal[Ints.A], Literal[Ints.A])
        self.assertEqual(Literal[Ints.B] | Literal[Ints.B], Literal[Ints.B])

        self.assertEqual((Literal[Ints.B] | Literal[Ints.A]).__args__,
                         (Literal[Ints.B], Literal[Ints.A]))

        self.assertEqual((Literal[0] | Literal[Ints.A]).__args__,
                         (Literal[0], Literal[Ints.A]))
        self.assertEqual((Literal[1] | Literal[Ints.B]).__args__,
                         (Literal[1], Literal[Ints.B]))

    def test_flatten(self):
        l1 = Literal[Literal[1], Literal[2], Literal[3]]
        l2 = Literal[Literal[1, 2], 3]
        l3 = Literal[Literal[1, 2, 3]]
        for lit in l1, l2, l3:
            self.assertEqual(lit, Literal[1, 2, 3])
            self.assertEqual(lit.__args__, (1, 2, 3))

    def test_does_not_flatten_enum(self):
        import enum
        class Ints(enum.IntEnum):
            A = 1
            B = 2

        literal = Literal[
            Literal[Ints.A],
            Literal[Ints.B],
            Literal[1],
            Literal[2],
        ]
        self.assertEqual(literal.__args__, (Ints.A, Ints.B, 1, 2))

    def test_caching_of_Literal_respects_type(self):
        self.assertIs(type(Literal[1].__args__[0]), int)
        self.assertIs(type(Literal[True].__args__[0]), bool)


class MethodHolder:
    @classmethod
    def clsmethod(cls): ...
    @staticmethod
    def stmethod(): ...
    def method(self): ...


if TYPING_3_11_0:
    registry_holder = typing
else:
    registry_holder = typing_extensions


class OverloadTests(BaseTestCase):

    def test_overload_fails(self):
        with self.assertRaises(RuntimeError):

            @overload
            def blah():
                pass

            blah()

    def test_overload_succeeds(self):
        @overload
        def blah():
            pass

        def blah():
            pass

        blah()

    @skipIf(
        sys.implementation.name == "pypy",
        "sum() and print() are not compiled in pypy"
    )
    @patch(
        f"{registry_holder.__name__}._overload_registry",
        defaultdict(lambda: defaultdict(dict))
    )
    def test_overload_on_compiled_functions(self):
        registry = registry_holder._overload_registry
        # The registry starts out empty:
        self.assertEqual(registry, {})

        # This should just not fail:
        overload(sum)
        overload(print)

        # No overloads are recorded:
        self.assertEqual(get_overloads(sum), [])
        self.assertEqual(get_overloads(print), [])

    def set_up_overloads(self):
        def blah():
            pass

        overload1 = blah
        overload(blah)

        def blah():
            pass

        overload2 = blah
        overload(blah)

        def blah():
            pass

        return blah, [overload1, overload2]

    # Make sure we don't clear the global overload registry
    @patch(
        f"{registry_holder.__name__}._overload_registry",
        defaultdict(lambda: defaultdict(dict))
    )
    def test_overload_registry(self):
        registry = registry_holder._overload_registry
        # The registry starts out empty
        self.assertEqual(registry, {})

        impl, overloads = self.set_up_overloads()
        self.assertNotEqual(registry, {})
        self.assertEqual(list(get_overloads(impl)), overloads)

        def some_other_func(): pass
        overload(some_other_func)
        other_overload = some_other_func
        def some_other_func(): pass
        self.assertEqual(list(get_overloads(some_other_func)), [other_overload])
        # Unrelated function still has no overloads:
        def not_overloaded(): pass
        self.assertEqual(list(get_overloads(not_overloaded)), [])

        # Make sure that after we clear all overloads, the registry is
        # completely empty.
        clear_overloads()
        self.assertEqual(registry, {})
        self.assertEqual(get_overloads(impl), [])

        # Querying a function with no overloads shouldn't change the registry.
        def the_only_one(): pass
        self.assertEqual(get_overloads(the_only_one), [])
        self.assertEqual(registry, {})

    def test_overload_registry_repeated(self):
        for _ in range(2):
            impl, overloads = self.set_up_overloads()

            self.assertEqual(list(get_overloads(impl)), overloads)


class AssertTypeTests(BaseTestCase):

    def test_basics(self):
        arg = 42
        self.assertIs(assert_type(arg, int), arg)
        self.assertIs(assert_type(arg, Union[str, float]), arg)
        self.assertIs(assert_type(arg, AnyStr), arg)
        self.assertIs(assert_type(arg, None), arg)

    def test_errors(self):
        # Bogus calls are not expected to fail.
        arg = 42
        self.assertIs(assert_type(arg, 42), arg)
        self.assertIs(assert_type(arg, 'hello'), arg)


T_a = TypeVar('T_a')

class AwaitableWrapper(Awaitable[T_a]):

    def __init__(self, value):
        self.value = value

    def __await__(self) -> typing.Iterator[T_a]:
        yield
        return self.value

class AsyncIteratorWrapper(AsyncIterator[T_a]):

    def __init__(self, value: Iterable[T_a]):
        self.value = value

    def __aiter__(self) -> AsyncIterator[T_a]:
        return self

    async def __anext__(self) -> T_a:
        data = await self.value
        if data:
            return data
        else:
            raise StopAsyncIteration

class ACM:
    async def __aenter__(self) -> int:
        return 42

    async def __aexit__(self, etype, eval, tb):
        return None


class A:
    y: float
class B(A):
    x: ClassVar[Optional['B']] = None
    y: int
    b: int
class CSub(B):
    z: ClassVar['CSub'] = B()
class G(Generic[T]):
    lst: ClassVar[List[T]] = []

class Loop:
    attr: Final['Loop']

class NoneAndForward:
    parent: 'NoneAndForward'
    meaning: None

class XRepr(NamedTuple):
    x: int
    y: int = 1

    def __str__(self):
        return f'{self.x} -> {self.y}'

    def __add__(self, other):
        return 0

@runtime_checkable
class HasCallProtocol(Protocol):
    __call__: typing.Callable


async def g_with(am: AsyncContextManager[int]):
    x: int
    async with am as x:
        return x

try:
    g_with(ACM()).send(None)
except StopIteration as e:
    assert e.args[0] == 42

Label = TypedDict('Label', [('label', str)])

class Point2D(TypedDict):
    x: int
    y: int

class Point2Dor3D(Point2D, total=False):
    z: int

class LabelPoint2D(Point2D, Label): ...

class Options(TypedDict, total=False):
    log_level: int
    log_path: str

class BaseAnimal(TypedDict):
    name: str

class Animal(BaseAnimal, total=False):
    voice: str
    tail: bool

class Cat(Animal):
    fur_color: str

class TotalMovie(TypedDict):
    title: str
    year: NotRequired[int]

class NontotalMovie(TypedDict, total=False):
    title: Required[str]
    year: int

class ParentNontotalMovie(TypedDict, total=False):
    title: Required[str]

class ChildTotalMovie(ParentNontotalMovie):
    year: NotRequired[int]

class ParentDeeplyAnnotatedMovie(TypedDict):
    title: Annotated[Annotated[Required[str], "foobar"], "another level"]

class ChildDeeplyAnnotatedMovie(ParentDeeplyAnnotatedMovie):
    year: NotRequired[Annotated[int, 2000]]

class AnnotatedMovie(TypedDict):
    title: Annotated[Required[str], "foobar"]
    year: NotRequired[Annotated[int, 2000]]

class WeirdlyQuotedMovie(TypedDict):
    title: Annotated['Annotated[Required[str], "foobar"]', "another level"]
    year: NotRequired['Annotated[int, 2000]']


gth = get_type_hints


class GetTypeHintTests(BaseTestCase):
    @classmethod
    def setUpClass(cls):
        with tempfile.TemporaryDirectory() as tempdir:
            sys.path.append(tempdir)
            Path(tempdir, "ann_module.py").write_text(ANN_MODULE_SOURCE)
            Path(tempdir, "ann_module2.py").write_text(ANN_MODULE_2_SOURCE)
            Path(tempdir, "ann_module3.py").write_text(ANN_MODULE_3_SOURCE)
            cls.ann_module = importlib.import_module("ann_module")
            cls.ann_module2 = importlib.import_module("ann_module2")
            cls.ann_module3 = importlib.import_module("ann_module3")
        sys.path.pop()

    @classmethod
    def tearDownClass(cls):
        for modname in "ann_module", "ann_module2", "ann_module3":
            delattr(cls, modname)
            del sys.modules[modname]

    def test_get_type_hints_modules(self):
        if sys.version_info >= (3, 14):
            ann_module_type_hints = {'f': Tuple[int, int], 'x': int, 'y': str}
        else:
            ann_module_type_hints = {1: 2, 'f': Tuple[int, int], 'x': int, 'y': str}
        self.assertEqual(gth(self.ann_module), ann_module_type_hints)
        self.assertEqual(gth(self.ann_module2), {})
        self.assertEqual(gth(self.ann_module3), {})

    def test_get_type_hints_classes(self):
        self.assertEqual(gth(self.ann_module.C, self.ann_module.__dict__),
                         {'y': Optional[self.ann_module.C]})
        self.assertIsInstance(gth(self.ann_module.j_class), dict)
        if sys.version_info >= (3, 14):
            self.assertEqual(gth(self.ann_module.M), {'o': type})
        else:
            self.assertEqual(gth(self.ann_module.M), {'123': 123, 'o': type})
        self.assertEqual(gth(self.ann_module.D),
                         {'j': str, 'k': str, 'y': Optional[self.ann_module.C]})
        self.assertEqual(gth(self.ann_module.Y), {'z': int})
        self.assertEqual(gth(self.ann_module.h_class),
                         {'y': Optional[self.ann_module.C]})
        self.assertEqual(gth(self.ann_module.S), {'x': str, 'y': str})
        self.assertEqual(gth(self.ann_module.foo), {'x': int})
        self.assertEqual(gth(NoneAndForward, globals()),
                         {'parent': NoneAndForward, 'meaning': type(None)})

    def test_respect_no_type_check(self):
        @no_type_check
        class NoTpCheck:
            class Inn:
                def __init__(self, x: 'not a type'): ...  # noqa: F722  # (yes, there's a syntax error in this annotation, that's the point)
        self.assertTrue(NoTpCheck.__no_type_check__)
        self.assertTrue(NoTpCheck.Inn.__init__.__no_type_check__)
        self.assertEqual(gth(self.ann_module2.NTC.meth), {})
        class ABase(Generic[T]):
            def meth(x: int): ...
        @no_type_check
        class Der(ABase): ...
        self.assertEqual(gth(ABase.meth), {'x': int})

    def test_get_type_hints_ClassVar(self):
        self.assertEqual(gth(self.ann_module2.CV, self.ann_module2.__dict__),
                         {'var': ClassVar[self.ann_module2.CV]})
        self.assertEqual(gth(B, globals()),
                         {'y': int, 'x': ClassVar[Optional[B]], 'b': int})
        self.assertEqual(gth(CSub, globals()),
                         {'z': ClassVar[CSub], 'y': int, 'b': int,
                          'x': ClassVar[Optional[B]]})
        self.assertEqual(gth(G), {'lst': ClassVar[List[T]]})

    def test_final_forward_ref(self):
        self.assertEqual(gth(Loop, globals())['attr'], Final[Loop])
        self.assertNotEqual(gth(Loop, globals())['attr'], Final[int])
        self.assertNotEqual(gth(Loop, globals())['attr'], Final)


class GetUtilitiesTestCase(TestCase):
    def test_get_origin(self):
        T = TypeVar('T')
        P = ParamSpec('P')
        Ts = TypeVarTuple('Ts')
        class C(Generic[T]): pass
        self.assertIs(get_origin(C[int]), C)
        self.assertIs(get_origin(C[T]), C)
        self.assertIs(get_origin(int), None)
        self.assertIs(get_origin(ClassVar[int]), ClassVar)
        self.assertIs(get_origin(Union[int, str]), Union)
        self.assertIs(get_origin(Literal[42, 43]), Literal)
        self.assertIs(get_origin(Final[List[int]]), Final)
        self.assertIs(get_origin(Generic), Generic)
        self.assertIs(get_origin(Generic[T]), Generic)
        self.assertIs(get_origin(List[Tuple[T, T]][int]), list)
        self.assertIs(get_origin(Annotated[T, 'thing']), Annotated)
        self.assertIs(get_origin(List), list)
        self.assertIs(get_origin(Tuple), tuple)
        self.assertIs(get_origin(Callable), collections.abc.Callable)
        if sys.version_info >= (3, 9):
            self.assertIs(get_origin(list[int]), list)
        self.assertIs(get_origin(list), None)
        self.assertIs(get_origin(P.args), P)
        self.assertIs(get_origin(P.kwargs), P)
        self.assertIs(get_origin(Required[int]), Required)
        self.assertIs(get_origin(NotRequired[int]), NotRequired)
        self.assertIs(get_origin(Unpack[Ts]), Unpack)
        self.assertIs(get_origin(Unpack), None)

    def test_get_args(self):
        T = TypeVar('T')
        Ts = TypeVarTuple('Ts')
        class C(Generic[T]): pass
        self.assertEqual(get_args(C[int]), (int,))
        self.assertEqual(get_args(C[T]), (T,))
        self.assertEqual(get_args(int), ())
        self.assertEqual(get_args(ClassVar[int]), (int,))
        self.assertEqual(get_args(Union[int, str]), (int, str))
        self.assertEqual(get_args(Literal[42, 43]), (42, 43))
        self.assertEqual(get_args(Final[List[int]]), (List[int],))
        self.assertEqual(get_args(Union[int, Tuple[T, int]][str]),
                         (int, Tuple[str, int]))
        self.assertEqual(get_args(typing.Dict[int, Tuple[T, T]][Optional[int]]),
                         (int, Tuple[Optional[int], Optional[int]]))
        self.assertEqual(get_args(Callable[[], T][int]), ([], int))
        self.assertEqual(get_args(Callable[..., int]), (..., int))
        self.assertEqual(get_args(Union[int, Callable[[Tuple[T, ...]], str]]),
                         (int, Callable[[Tuple[T, ...]], str]))
        self.assertEqual(get_args(Tuple[int, ...]), (int, ...))
        if TYPING_3_11_0:
            self.assertEqual(get_args(Tuple[()]), ())
        else:
            self.assertEqual(get_args(Tuple[()]), ((),))
        self.assertEqual(get_args(Annotated[T, 'one', 2, ['three']]), (T, 'one', 2, ['three']))
        self.assertEqual(get_args(List), ())
        self.assertEqual(get_args(Tuple), ())
        self.assertEqual(get_args(Callable), ())
        if sys.version_info >= (3, 9):
            self.assertEqual(get_args(list[int]), (int,))
        self.assertEqual(get_args(list), ())
        if sys.version_info >= (3, 9):
            # Support Python versions with and without the fix for
            # https://bugs.python.org/issue42195
            # The first variant is for 3.9.2+, the second for 3.9.0 and 1
            self.assertIn(get_args(collections.abc.Callable[[int], str]),
                          (([int], str), ([[int]], str)))
            self.assertIn(get_args(collections.abc.Callable[[], str]),
                          (([], str), ([[]], str)))
            self.assertEqual(get_args(collections.abc.Callable[..., str]), (..., str))
        P = ParamSpec('P')
        # In 3.9 and lower we use typing_extensions's hacky implementation
        # of ParamSpec, which gets incorrectly wrapped in a list
        self.assertIn(get_args(Callable[P, int]), [(P, int), ([P], int)])
        self.assertEqual(get_args(Callable[Concatenate[int, P], int]),
                         (Concatenate[int, P], int))
        self.assertEqual(get_args(Required[int]), (int,))
        self.assertEqual(get_args(NotRequired[int]), (int,))
        self.assertEqual(get_args(Unpack[Ts]), (Ts,))
        self.assertEqual(get_args(Unpack), ())


class CollectionsAbcTests(BaseTestCase):

    def test_isinstance_collections(self):
        self.assertNotIsInstance(1, collections.abc.Mapping)
        self.assertNotIsInstance(1, collections.abc.Iterable)
        self.assertNotIsInstance(1, collections.abc.Container)
        self.assertNotIsInstance(1, collections.abc.Sized)
        with self.assertRaises(TypeError):
            isinstance(collections.deque(), typing_extensions.Deque[int])
        with self.assertRaises(TypeError):
            issubclass(collections.Counter, typing_extensions.Counter[str])

    def test_awaitable(self):
        async def foo() -> typing_extensions.Awaitable[int]:
            return await AwaitableWrapper(42)

        g = foo()
        self.assertIsInstance(g, typing_extensions.Awaitable)
        self.assertNotIsInstance(foo, typing_extensions.Awaitable)
        g.send(None)  # Run foo() till completion, to avoid warning.

    def test_coroutine(self):
        async def foo():
            return

        g = foo()
        self.assertIsInstance(g, typing_extensions.Coroutine)
        with self.assertRaises(TypeError):
            isinstance(g, typing_extensions.Coroutine[int])
        self.assertNotIsInstance(foo, typing_extensions.Coroutine)
        try:
            g.send(None)
        except StopIteration:
            pass

    def test_async_iterable(self):
        base_it: Iterator[int] = range(10)
        it = AsyncIteratorWrapper(base_it)
        self.assertIsInstance(it, typing_extensions.AsyncIterable)
        self.assertIsInstance(it, typing_extensions.AsyncIterable)
        self.assertNotIsInstance(42, typing_extensions.AsyncIterable)

    def test_async_iterator(self):
        base_it: Iterator[int] = range(10)
        it = AsyncIteratorWrapper(base_it)
        self.assertIsInstance(it, typing_extensions.AsyncIterator)
        self.assertNotIsInstance(42, typing_extensions.AsyncIterator)

    def test_deque(self):
        self.assertIsSubclass(collections.deque, typing_extensions.Deque)
        class MyDeque(typing_extensions.Deque[int]): ...
        self.assertIsInstance(MyDeque(), collections.deque)

    def test_counter(self):
        self.assertIsSubclass(collections.Counter, typing_extensions.Counter)

    def test_defaultdict_instantiation(self):
        self.assertIs(
            type(typing_extensions.DefaultDict()),
            collections.defaultdict)
        self.assertIs(
            type(typing_extensions.DefaultDict[KT, VT]()),
            collections.defaultdict)
        self.assertIs(
            type(typing_extensions.DefaultDict[str, int]()),
            collections.defaultdict)

    def test_defaultdict_subclass(self):

        class MyDefDict(typing_extensions.DefaultDict[str, int]):
            pass

        dd = MyDefDict()
        self.assertIsInstance(dd, MyDefDict)

        self.assertIsSubclass(MyDefDict, collections.defaultdict)
        self.assertNotIsSubclass(collections.defaultdict, MyDefDict)

    def test_ordereddict_instantiation(self):
        self.assertIs(
            type(typing_extensions.OrderedDict()),
            collections.OrderedDict)
        self.assertIs(
            type(typing_extensions.OrderedDict[KT, VT]()),
            collections.OrderedDict)
        self.assertIs(
            type(typing_extensions.OrderedDict[str, int]()),
            collections.OrderedDict)

    def test_ordereddict_subclass(self):

        class MyOrdDict(typing_extensions.OrderedDict[str, int]):
            pass

        od = MyOrdDict()
        self.assertIsInstance(od, MyOrdDict)

        self.assertIsSubclass(MyOrdDict, collections.OrderedDict)
        self.assertNotIsSubclass(collections.OrderedDict, MyOrdDict)

    def test_chainmap_instantiation(self):
        self.assertIs(type(typing_extensions.ChainMap()), collections.ChainMap)
        self.assertIs(type(typing_extensions.ChainMap[KT, VT]()), collections.ChainMap)
        self.assertIs(type(typing_extensions.ChainMap[str, int]()), collections.ChainMap)
        class CM(typing_extensions.ChainMap[KT, VT]): ...
        self.assertIs(type(CM[int, str]()), CM)

    def test_chainmap_subclass(self):

        class MyChainMap(typing_extensions.ChainMap[str, int]):
            pass

        cm = MyChainMap()
        self.assertIsInstance(cm, MyChainMap)

        self.assertIsSubclass(MyChainMap, collections.ChainMap)
        self.assertNotIsSubclass(collections.ChainMap, MyChainMap)

    def test_deque_instantiation(self):
        self.assertIs(type(typing_extensions.Deque()), collections.deque)
        self.assertIs(type(typing_extensions.Deque[T]()), collections.deque)
        self.assertIs(type(typing_extensions.Deque[int]()), collections.deque)
        class D(typing_extensions.Deque[T]): ...
        self.assertIs(type(D[int]()), D)

    def test_counter_instantiation(self):
        self.assertIs(type(typing_extensions.Counter()), collections.Counter)
        self.assertIs(type(typing_extensions.Counter[T]()), collections.Counter)
        self.assertIs(type(typing_extensions.Counter[int]()), collections.Counter)
        class C(typing_extensions.Counter[T]): ...
        self.assertIs(type(C[int]()), C)
        self.assertEqual(C.__bases__, (collections.Counter, typing.Generic))

    def test_counter_subclass_instantiation(self):

        class MyCounter(typing_extensions.Counter[int]):
            pass

        d = MyCounter()
        self.assertIsInstance(d, MyCounter)
        self.assertIsInstance(d, collections.Counter)
        self.assertIsInstance(d, typing_extensions.Counter)


# These are a separate TestCase class,
# as (unlike most collections.abc aliases in typing_extensions),
# these are reimplemented on Python <=3.12 so that we can provide
# default values for the second and third parameters
class GeneratorTests(BaseTestCase):

    def test_generator_basics(self):
        def foo():
            yield 42
        g = foo()

        self.assertIsInstance(g, typing_extensions.Generator)
        self.assertNotIsInstance(foo, typing_extensions.Generator)
        self.assertIsSubclass(type(g), typing_extensions.Generator)
        self.assertNotIsSubclass(type(foo), typing_extensions.Generator)

        parameterized = typing_extensions.Generator[int, str, None]
        with self.assertRaises(TypeError):
            isinstance(g, parameterized)
        with self.assertRaises(TypeError):
            issubclass(type(g), parameterized)

    def test_generator_default(self):
        g1 = typing_extensions.Generator[int]
        g2 = typing_extensions.Generator[int, None, None]
        self.assertEqual(get_args(g1), (int, type(None), type(None)))
        self.assertEqual(get_args(g1), get_args(g2))

        g3 = typing_extensions.Generator[int, float]
        g4 = typing_extensions.Generator[int, float, None]
        self.assertEqual(get_args(g3), (int, float, type(None)))
        self.assertEqual(get_args(g3), get_args(g4))

    def test_no_generator_instantiation(self):
        with self.assertRaises(TypeError):
            typing_extensions.Generator()
        with self.assertRaises(TypeError):
            typing_extensions.Generator[T, T, T]()
        with self.assertRaises(TypeError):
            typing_extensions.Generator[int, int, int]()

    def test_subclassing_generator(self):
        class G(typing_extensions.Generator[int, int, None]):
            def send(self, value):
                pass
            def throw(self, typ, val=None, tb=None):
                pass

        def g(): yield 0

        self.assertIsSubclass(G, typing_extensions.Generator)
        self.assertIsSubclass(G, typing_extensions.Iterable)
        self.assertIsSubclass(G, collections.abc.Generator)
        self.assertIsSubclass(G, collections.abc.Iterable)
        self.assertNotIsSubclass(type(g), G)

        instance = G()
        self.assertIsInstance(instance, typing_extensions.Generator)
        self.assertIsInstance(instance, typing_extensions.Iterable)
        self.assertIsInstance(instance, collections.abc.Generator)
        self.assertIsInstance(instance, collections.abc.Iterable)
        self.assertNotIsInstance(type(g), G)
        self.assertNotIsInstance(g, G)

    def test_async_generator_basics(self):
        async def f():
            yield 42
        g = f()

        self.assertIsInstance(g, typing_extensions.AsyncGenerator)
        self.assertIsSubclass(type(g), typing_extensions.AsyncGenerator)
        self.assertNotIsInstance(f, typing_extensions.AsyncGenerator)
        self.assertNotIsSubclass(type(f), typing_extensions.AsyncGenerator)

        parameterized = typing_extensions.AsyncGenerator[int, str]
        with self.assertRaises(TypeError):
            isinstance(g, parameterized)
        with self.assertRaises(TypeError):
            issubclass(type(g), parameterized)

    def test_async_generator_default(self):
        ag1 = typing_extensions.AsyncGenerator[int]
        ag2 = typing_extensions.AsyncGenerator[int, None]
        self.assertEqual(get_args(ag1), (int, type(None)))
        self.assertEqual(get_args(ag1), get_args(ag2))

    def test_no_async_generator_instantiation(self):
        with self.assertRaises(TypeError):
            typing_extensions.AsyncGenerator()
        with self.assertRaises(TypeError):
            typing_extensions.AsyncGenerator[T, T]()
        with self.assertRaises(TypeError):
            typing_extensions.AsyncGenerator[int, int]()

    def test_subclassing_async_generator(self):
        class G(typing_extensions.AsyncGenerator[int, int]):
            def asend(self, value):
                pass
            def athrow(self, typ, val=None, tb=None):
                pass

        async def g(): yield 0

        self.assertIsSubclass(G, typing_extensions.AsyncGenerator)
        self.assertIsSubclass(G, typing_extensions.AsyncIterable)
        self.assertIsSubclass(G, collections.abc.AsyncGenerator)
        self.assertIsSubclass(G, collections.abc.AsyncIterable)
        self.assertNotIsSubclass(type(g), G)

        instance = G()
        self.assertIsInstance(instance, typing_extensions.AsyncGenerator)
        self.assertIsInstance(instance, typing_extensions.AsyncIterable)
        self.assertIsInstance(instance, collections.abc.AsyncGenerator)
        self.assertIsInstance(instance, collections.abc.AsyncIterable)
        self.assertNotIsInstance(type(g), G)
        self.assertNotIsInstance(g, G)

    def test_subclassing_subclasshook(self):

        class Base(typing_extensions.Generator):
            @classmethod
            def __subclasshook__(cls, other):
                if other.__name__ == 'Foo':
                    return True
                else:
                    return False

        class C(Base): ...
        class Foo: ...
        class Bar: ...
        self.assertIsSubclass(Foo, Base)
        self.assertIsSubclass(Foo, C)
        self.assertNotIsSubclass(Bar, C)

    def test_subclassing_register(self):

        class A(typing_extensions.Generator): ...
        class B(A): ...

        class C: ...
        A.register(C)
        self.assertIsSubclass(C, A)
        self.assertNotIsSubclass(C, B)

        class D: ...
        B.register(D)
        self.assertIsSubclass(D, A)
        self.assertIsSubclass(D, B)

        class M: ...
        collections.abc.Generator.register(M)
        self.assertIsSubclass(M, typing_extensions.Generator)

    def test_collections_as_base(self):

        class M(collections.abc.Generator): ...
        self.assertIsSubclass(M, typing_extensions.Generator)
        self.assertIsSubclass(M, typing_extensions.Iterable)

        class S(collections.abc.AsyncGenerator): ...
        self.assertIsSubclass(S, typing_extensions.AsyncGenerator)
        self.assertIsSubclass(S, typing_extensions.AsyncIterator)

        class A(collections.abc.Generator, metaclass=abc.ABCMeta): ...
        class B: ...
        A.register(B)
        self.assertIsSubclass(B, typing_extensions.Generator)

    @skipIf(sys.version_info < (3, 10), "PEP 604 has yet to be")
    def test_or_and_ror(self):
        self.assertEqual(
            typing_extensions.Generator | typing_extensions.AsyncGenerator,
            Union[typing_extensions.Generator, typing_extensions.AsyncGenerator]
        )
        self.assertEqual(
            typing_extensions.Generator | typing.Deque,
            Union[typing_extensions.Generator, typing.Deque]
        )


class OtherABCTests(BaseTestCase):

    def test_contextmanager(self):
        @contextlib.contextmanager
        def manager():
            yield 42

        cm = manager()
        self.assertIsInstance(cm, typing_extensions.ContextManager)
        self.assertNotIsInstance(42, typing_extensions.ContextManager)

    def test_contextmanager_type_params(self):
        cm1 = typing_extensions.ContextManager[int]
        self.assertEqual(get_args(cm1), (int, typing.Optional[bool]))
        cm2 = typing_extensions.ContextManager[int, None]
        self.assertEqual(get_args(cm2), (int, NoneType))

    def test_async_contextmanager(self):
        class NotACM:
            pass
        self.assertIsInstance(ACM(), typing_extensions.AsyncContextManager)
        self.assertNotIsInstance(NotACM(), typing_extensions.AsyncContextManager)
        @contextlib.contextmanager
        def manager():
            yield 42

        cm = manager()
        self.assertNotIsInstance(cm, typing_extensions.AsyncContextManager)
        self.assertEqual(
            typing_extensions.AsyncContextManager[int].__args__,
            (int, typing.Optional[bool])
        )
        with self.assertRaises(TypeError):
            isinstance(42, typing_extensions.AsyncContextManager[int])
        with self.assertRaises(TypeError):
            typing_extensions.AsyncContextManager[int, str, float]

    def test_asynccontextmanager_type_params(self):
        cm1 = typing_extensions.AsyncContextManager[int]
        self.assertEqual(get_args(cm1), (int, typing.Optional[bool]))
        cm2 = typing_extensions.AsyncContextManager[int, None]
        self.assertEqual(get_args(cm2), (int, NoneType))


class TypeTests(BaseTestCase):

    def test_type_basic(self):

        class User: pass
        class BasicUser(User): pass
        class ProUser(User): pass

        def new_user(user_class: Type[User]) -> User:
            return user_class()

        new_user(BasicUser)

    def test_type_typevar(self):

        class User: pass
        class BasicUser(User): pass
        class ProUser(User): pass

        U = TypeVar('U', bound=User)

        def new_user(user_class: Type[U]) -> U:
            return user_class()

        new_user(BasicUser)

    def test_type_optional(self):
        A = Optional[Type[BaseException]]

        def foo(a: A) -> Optional[BaseException]:
            if a is None:
                return None
            else:
                return a()

        assert isinstance(foo(KeyboardInterrupt), KeyboardInterrupt)
        assert foo(None) is None


class NewTypeTests(BaseTestCase):
    @classmethod
    def setUpClass(cls):
        global UserId
        UserId = NewType('UserId', int)
        cls.UserName = NewType(cls.__qualname__ + '.UserName', str)

    @classmethod
    def tearDownClass(cls):
        global UserId
        del UserId
        del cls.UserName

    def test_basic(self):
        self.assertIsInstance(UserId(5), int)
        self.assertIsInstance(self.UserName('Joe'), str)
        self.assertEqual(UserId(5) + 1, 6)

    def test_errors(self):
        with self.assertRaises(TypeError):
            issubclass(UserId, int)
        with self.assertRaises(TypeError):
            class D(UserId):
                pass

    @skipUnless(TYPING_3_10_0, "PEP 604 has yet to be")
    def test_or(self):
        for cls in (int, self.UserName):
            with self.subTest(cls=cls):
                self.assertEqual(UserId | cls, Union[UserId, cls])
                self.assertEqual(cls | UserId, Union[cls, UserId])

                self.assertEqual(get_args(UserId | cls), (UserId, cls))
                self.assertEqual(get_args(cls | UserId), (cls, UserId))

    def test_special_attrs(self):
        self.assertEqual(UserId.__name__, 'UserId')
        self.assertEqual(UserId.__qualname__, 'UserId')
        self.assertEqual(UserId.__module__, __name__)
        self.assertEqual(UserId.__supertype__, int)

        UserName = self.UserName
        self.assertEqual(UserName.__name__, 'UserName')
        self.assertEqual(UserName.__qualname__,
                         self.__class__.__qualname__ + '.UserName')
        self.assertEqual(UserName.__module__, __name__)
        self.assertEqual(UserName.__supertype__, str)

    def test_repr(self):
        self.assertEqual(repr(UserId), f'{__name__}.UserId')
        self.assertEqual(repr(self.UserName),
                         f'{__name__}.{self.__class__.__qualname__}.UserName')

    def test_pickle(self):
        UserAge = NewType('UserAge', float)
        for proto in range(pickle.HIGHEST_PROTOCOL + 1):
            with self.subTest(proto=proto):
                pickled = pickle.dumps(UserId, proto)
                loaded = pickle.loads(pickled)
                self.assertIs(loaded, UserId)

                pickled = pickle.dumps(self.UserName, proto)
                loaded = pickle.loads(pickled)
                self.assertIs(loaded, self.UserName)

                with self.assertRaises(pickle.PicklingError):
                    pickle.dumps(UserAge, proto)

    def test_missing__name__(self):
        code = ("import typing_extensions\n"
                "NT = typing_extensions.NewType('NT', int)\n"
                )
        exec(code, {})

    def test_error_message_when_subclassing(self):
        with self.assertRaisesRegex(
            TypeError,
            re.escape(
                "Cannot subclass an instance of NewType. Perhaps you were looking for: "
                "`ProUserId = NewType('ProUserId', UserId)`"
            )
        ):
            class ProUserId(UserId):
                ...


class Coordinate(Protocol):
    x: int
    y: int

@runtime_checkable
class Point(Coordinate, Protocol):
    label: str

class MyPoint:
    x: int
    y: int
    label: str

class XAxis(Protocol):
    x: int

class YAxis(Protocol):
    y: int

@runtime_checkable
class Position(XAxis, YAxis, Protocol):
    pass

@runtime_checkable
class Proto(Protocol):
    attr: int

    def meth(self, arg: str) -> int:
        ...

class Concrete(Proto):
    pass

class Other:
    attr: int = 1

    def meth(self, arg: str) -> int:
        if arg == 'this':
            return 1
        return 0

class NT(NamedTuple):
    x: int
    y: int


skip_if_py312b1 = skipIf(
    sys.version_info == (3, 12, 0, 'beta', 1),
    "CPython had bugs in 3.12.0b1"
)


class ProtocolTests(BaseTestCase):
    def test_runtime_alias(self):
        self.assertIs(runtime, runtime_checkable)

    def test_basic_protocol(self):
        @runtime_checkable
        class P(Protocol):
            def meth(self):
                pass
        class C: pass
        class D:
            def meth(self):
                pass
        def f():
            pass
        self.assertIsSubclass(D, P)
        self.assertIsInstance(D(), P)
        self.assertNotIsSubclass(C, P)
        self.assertNotIsInstance(C(), P)
        self.assertNotIsSubclass(types.FunctionType, P)
        self.assertNotIsInstance(f, P)

    def test_everything_implements_empty_protocol(self):
        @runtime_checkable
        class Empty(Protocol): pass
        class C: pass
        def f():
            pass
        for thing in (object, type, tuple, C, types.FunctionType):
            self.assertIsSubclass(thing, Empty)
        for thing in (object(), 1, (), typing, f):
            self.assertIsInstance(thing, Empty)

    def test_function_implements_protocol(self):
        def f():
            pass
        self.assertIsInstance(f, HasCallProtocol)

    def test_no_inheritance_from_nominal(self):
        class C: pass
        class BP(Protocol): pass
        with self.assertRaises(TypeError):
            class P(C, Protocol):
                pass
        with self.assertRaises(TypeError):
            class Q(Protocol, C):
                pass
        with self.assertRaises(TypeError):
            class R(BP, C, Protocol):
                pass
        class D(BP, C): pass
        class E(C, BP): pass
        self.assertNotIsInstance(D(), E)
        self.assertNotIsInstance(E(), D)

    def test_runtimecheckable_on_typing_dot_Protocol(self):
        @runtime_checkable
        class Foo(typing.Protocol):
            x: int

        class Bar:
            def __init__(self):
                self.x = 42

        self.assertIsInstance(Bar(), Foo)
        self.assertNotIsInstance(object(), Foo)

    def test_typing_dot_runtimecheckable_on_Protocol(self):
        @typing.runtime_checkable
        class Foo(Protocol):
            x: int

        class Bar:
            def __init__(self):
                self.x = 42

        self.assertIsInstance(Bar(), Foo)
        self.assertNotIsInstance(object(), Foo)

    def test_typing_Protocol_and_extensions_Protocol_can_mix(self):
        class TypingProto(typing.Protocol):
            x: int

        class ExtensionsProto(Protocol):
            y: int

        class SubProto(TypingProto, ExtensionsProto, typing.Protocol):
            z: int

        class SubProto2(TypingProto, ExtensionsProto, Protocol):
            z: int

        class SubProto3(ExtensionsProto, TypingProto, typing.Protocol):
            z: int

        class SubProto4(ExtensionsProto, TypingProto, Protocol):
            z: int

        for proto in (
            ExtensionsProto, SubProto, SubProto2, SubProto3, SubProto4
        ):
            with self.subTest(proto=proto.__name__):
                self.assertTrue(is_protocol(proto))
                if Protocol is not typing.Protocol:
                    self.assertIsInstance(proto, typing_extensions._ProtocolMeta)
                self.assertIsInstance(proto.__protocol_attrs__, set)
                with self.assertRaisesRegex(
                    TypeError, "Protocols cannot be instantiated"
                ):
                    proto()
                # check these don't raise
                runtime_checkable(proto)
                typing.runtime_checkable(proto)

        class Concrete(SubProto): pass
        class Concrete2(SubProto2): pass
        class Concrete3(SubProto3): pass
        class Concrete4(SubProto4): pass

        for cls in Concrete, Concrete2, Concrete3, Concrete4:
            with self.subTest(cls=cls.__name__):
                self.assertFalse(is_protocol(cls))
                # Check that this doesn't raise:
                self.assertIsInstance(cls(), cls)
                with self.assertRaises(TypeError):
                    runtime_checkable(cls)
                with self.assertRaises(TypeError):
                    typing.runtime_checkable(cls)

    def test_no_instantiation(self):
        class P(Protocol): pass
        with self.assertRaises(TypeError):
            P()
        class C(P): pass
        self.assertIsInstance(C(), C)
        T = TypeVar('T')
        class PG(Protocol[T]): pass
        with self.assertRaises(TypeError):
            PG()
        with self.assertRaises(TypeError):
            PG[int]()
        with self.assertRaises(TypeError):
            PG[T]()
        class CG(PG[T]): pass
        self.assertIsInstance(CG[int](), CG)

    def test_protocol_defining_init_does_not_get_overridden(self):
        # check that P.__init__ doesn't get clobbered
        # see https://bugs.python.org/issue44807

        class P(Protocol):
            x: int
            def __init__(self, x: int) -> None:
                self.x = x
        class C: pass

        c = C()
        P.__init__(c, 1)
        self.assertEqual(c.x, 1)

    def test_concrete_class_inheriting_init_from_protocol(self):
        class P(Protocol):
            x: int
            def __init__(self, x: int) -> None:
                self.x = x

        class C(P): pass

        c = C(1)
        self.assertIsInstance(c, C)
        self.assertEqual(c.x, 1)

    def test_cannot_instantiate_abstract(self):
        @runtime_checkable
        class P(Protocol):
            @abc.abstractmethod
            def ameth(self) -> int:
                raise NotImplementedError
        class B(P):
            pass
        class C(B):
            def ameth(self) -> int:
                return 26
        with self.assertRaises(TypeError):
            B()
        self.assertIsInstance(C(), P)

    def test_subprotocols_extending(self):
        class P1(Protocol):
            def meth1(self):
                pass
        @runtime_checkable
        class P2(P1, Protocol):
            def meth2(self):
                pass
        class C:
            def meth1(self):
                pass
            def meth2(self):
                pass
        class C1:
            def meth1(self):
                pass
        class C2:
            def meth2(self):
                pass
        self.assertNotIsInstance(C1(), P2)
        self.assertNotIsInstance(C2(), P2)
        self.assertNotIsSubclass(C1, P2)
        self.assertNotIsSubclass(C2, P2)
        self.assertIsInstance(C(), P2)
        self.assertIsSubclass(C, P2)

    def test_subprotocols_merging(self):
        class P1(Protocol):
            def meth1(self):
                pass
        class P2(Protocol):
            def meth2(self):
                pass
        @runtime_checkable
        class P(P1, P2, Protocol):
            pass
        class C:
            def meth1(self):
                pass
            def meth2(self):
                pass
        class C1:
            def meth1(self):
                pass
        class C2:
            def meth2(self):
                pass
        self.assertNotIsInstance(C1(), P)
        self.assertNotIsInstance(C2(), P)
        self.assertNotIsSubclass(C1, P)
        self.assertNotIsSubclass(C2, P)
        self.assertIsInstance(C(), P)
        self.assertIsSubclass(C, P)

    def test_protocols_issubclass(self):
        T = TypeVar('T')
        @runtime_checkable
        class P(Protocol):
            def x(self): ...
        @runtime_checkable
        class PG(Protocol[T]):
            def x(self): ...
        class BadP(Protocol):
            def x(self): ...
        class BadPG(Protocol[T]):
            def x(self): ...
        class C:
            def x(self): ...
        self.assertIsSubclass(C, P)
        self.assertIsSubclass(C, PG)
        self.assertIsSubclass(BadP, PG)

        no_subscripted_generics = (
            "Subscripted generics cannot be used with class and instance checks"
        )

        with self.assertRaisesRegex(TypeError, no_subscripted_generics):
            issubclass(C, PG[T])
        with self.assertRaisesRegex(TypeError, no_subscripted_generics):
            issubclass(C, PG[C])

        only_runtime_checkable_protocols = (
            "Instance and class checks can only be used with "
            "@runtime_checkable protocols"
        )

        with self.assertRaisesRegex(TypeError, only_runtime_checkable_protocols):
            issubclass(C, BadP)
        with self.assertRaisesRegex(TypeError, only_runtime_checkable_protocols):
            issubclass(C, BadPG)

        with self.assertRaisesRegex(TypeError, no_subscripted_generics):
            issubclass(P, PG[T])
        with self.assertRaisesRegex(TypeError, no_subscripted_generics):
            issubclass(PG, PG[int])

        only_classes_allowed = r"issubclass\(\) arg 1 must be a class"

        with self.assertRaisesRegex(TypeError, only_classes_allowed):
            issubclass(1, P)
        with self.assertRaisesRegex(TypeError, only_classes_allowed):
            issubclass(1, PG)
        with self.assertRaisesRegex(TypeError, only_classes_allowed):
            issubclass(1, BadP)
        with self.assertRaisesRegex(TypeError, only_classes_allowed):
            issubclass(1, BadPG)

    def test_implicit_issubclass_between_two_protocols(self):
        @runtime_checkable
        class CallableMembersProto(Protocol):
            def meth(self): ...

        # All the below protocols should be considered "subclasses"
        # of CallableMembersProto at runtime,
        # even though none of them explicitly subclass CallableMembersProto

        class IdenticalProto(Protocol):
            def meth(self): ...

        class SupersetProto(Protocol):
            def meth(self): ...
            def meth2(self): ...

        class NonCallableMembersProto(Protocol):
            meth: Callable[[], None]

        class NonCallableMembersSupersetProto(Protocol):
            meth: Callable[[], None]
            meth2: Callable[[str, int], bool]

        class MixedMembersProto1(Protocol):
            meth: Callable[[], None]
            def meth2(self): ...

        class MixedMembersProto2(Protocol):
            def meth(self): ...
            meth2: Callable[[str, int], bool]

        for proto in (
            IdenticalProto, SupersetProto, NonCallableMembersProto,
            NonCallableMembersSupersetProto, MixedMembersProto1, MixedMembersProto2
        ):
            with self.subTest(proto=proto.__name__):
                self.assertIsSubclass(proto, CallableMembersProto)

        # These two shouldn't be considered subclasses of CallableMembersProto, however,
        # since they don't have the `meth` protocol member

        class EmptyProtocol(Protocol): ...
        class UnrelatedProtocol(Protocol):
            def wut(self): ...

        self.assertNotIsSubclass(EmptyProtocol, CallableMembersProto)
        self.assertNotIsSubclass(UnrelatedProtocol, CallableMembersProto)

        # These aren't protocols at all (despite having annotations),
        # so they should only be considered subclasses of CallableMembersProto
        # if they *actually have an attribute* matching the `meth` member
        # (just having an annotation is insufficient)

        class AnnotatedButNotAProtocol:
            meth: Callable[[], None]

        class NotAProtocolButAnImplicitSubclass:
            def meth(self): pass

        class NotAProtocolButAnImplicitSubclass2:
            meth: Callable[[], None]
            def meth(self): pass

        class NotAProtocolButAnImplicitSubclass3:
            meth: Callable[[], None]
            meth2: Callable[[int, str], bool]
            def meth(self): pass
            def meth2(self, x, y): return True

        self.assertNotIsSubclass(AnnotatedButNotAProtocol, CallableMembersProto)
        self.assertIsSubclass(NotAProtocolButAnImplicitSubclass, CallableMembersProto)
        self.assertIsSubclass(NotAProtocolButAnImplicitSubclass2, CallableMembersProto)
        self.assertIsSubclass(NotAProtocolButAnImplicitSubclass3, CallableMembersProto)

    @skip_if_py312b1
    def test_issubclass_and_isinstance_on_Protocol_itself(self):
        class C:
            def x(self): pass

        self.assertNotIsSubclass(object, Protocol)
        self.assertNotIsInstance(object(), Protocol)

        self.assertNotIsSubclass(str, Protocol)
        self.assertNotIsInstance('foo', Protocol)

        self.assertNotIsSubclass(C, Protocol)
        self.assertNotIsInstance(C(), Protocol)

        only_classes_allowed = r"issubclass\(\) arg 1 must be a class"

        with self.assertRaisesRegex(TypeError, only_classes_allowed):
            issubclass(1, Protocol)
        with self.assertRaisesRegex(TypeError, only_classes_allowed):
            issubclass('foo', Protocol)
        with self.assertRaisesRegex(TypeError, only_classes_allowed):
            issubclass(C(), Protocol)

        T = TypeVar('T')

        @runtime_checkable
        class EmptyProtocol(Protocol): pass

        @runtime_checkable
        class SupportsStartsWith(Protocol):
            def startswith(self, x: str) -> bool: ...

        @runtime_checkable
        class SupportsX(Protocol[T]):
            def x(self): ...

        for proto in EmptyProtocol, SupportsStartsWith, SupportsX:
            with self.subTest(proto=proto.__name__):
                self.assertIsSubclass(proto, Protocol)

        # gh-105237 / PR #105239:
        # check that the presence of Protocol subclasses
        # where `issubclass(X, <subclass>)` evaluates to True
        # doesn't influence the result of `issubclass(X, Protocol)`

        self.assertIsSubclass(object, EmptyProtocol)
        self.assertIsInstance(object(), EmptyProtocol)
        self.assertNotIsSubclass(object, Protocol)
        self.assertNotIsInstance(object(), Protocol)

        self.assertIsSubclass(str, SupportsStartsWith)
        self.assertIsInstance('foo', SupportsStartsWith)
        self.assertNotIsSubclass(str, Protocol)
        self.assertNotIsInstance('foo', Protocol)

        self.assertIsSubclass(C, SupportsX)
        self.assertIsInstance(C(), SupportsX)
        self.assertNotIsSubclass(C, Protocol)
        self.assertNotIsInstance(C(), Protocol)

    @skip_if_py312b1
    def test_isinstance_checks_not_at_whim_of_gc(self):
        self.addCleanup(gc.enable)
        gc.disable()

        with self.assertRaisesRegex(
            TypeError,
            "Protocols can only inherit from other protocols"
        ):
            class Foo(collections.abc.Mapping, Protocol):
                pass

        self.assertNotIsInstance([], collections.abc.Mapping)

    def test_protocols_issubclass_non_callable(self):
        class C:
            x = 1

        @runtime_checkable
        class PNonCall(Protocol):
            x = 1

        non_callable_members_illegal = (
            "Protocols with non-method members don't support issubclass()"
        )

        with self.assertRaisesRegex(TypeError, non_callable_members_illegal):
            issubclass(C, PNonCall)

        self.assertIsInstance(C(), PNonCall)
        PNonCall.register(C)

        with self.assertRaisesRegex(TypeError, non_callable_members_illegal):
            issubclass(C, PNonCall)

        self.assertIsInstance(C(), PNonCall)

        # check that non-protocol subclasses are not affected
        class D(PNonCall): ...

        self.assertNotIsSubclass(C, D)
        self.assertNotIsInstance(C(), D)
        D.register(C)
        self.assertIsSubclass(C, D)
        self.assertIsInstance(C(), D)

        with self.assertRaisesRegex(TypeError, non_callable_members_illegal):
            issubclass(D, PNonCall)

    def test_no_weird_caching_with_issubclass_after_isinstance(self):
        @runtime_checkable
        class Spam(Protocol):
            x: int

        class Eggs:
            def __init__(self) -> None:
                self.x = 42

        self.assertIsInstance(Eggs(), Spam)

        # gh-104555: If we didn't override ABCMeta.__subclasscheck__ in _ProtocolMeta,
        # TypeError wouldn't be raised here,
        # as the cached result of the isinstance() check immediately above
        # would mean the issubclass() call would short-circuit
        # before we got to the "raise TypeError" line
        with self.assertRaisesRegex(
            TypeError,
            "Protocols with non-method members don't support issubclass()"
        ):
            issubclass(Eggs, Spam)

    def test_no_weird_caching_with_issubclass_after_isinstance_2(self):
        @runtime_checkable
        class Spam(Protocol):
            x: int

        class Eggs: ...

        self.assertNotIsInstance(Eggs(), Spam)

        # gh-104555: If we didn't override ABCMeta.__subclasscheck__ in _ProtocolMeta,
        # TypeError wouldn't be raised here,
        # as the cached result of the isinstance() check immediately above
        # would mean the issubclass() call would short-circuit
        # before we got to the "raise TypeError" line
        with self.assertRaisesRegex(
            TypeError,
            "Protocols with non-method members don't support issubclass()"
        ):
            issubclass(Eggs, Spam)

    def test_no_weird_caching_with_issubclass_after_isinstance_3(self):
        @runtime_checkable
        class Spam(Protocol):
            x: int

        class Eggs:
            def __getattr__(self, attr):
                if attr == "x":
                    return 42
                raise AttributeError(attr)

        self.assertNotIsInstance(Eggs(), Spam)

        # gh-104555: If we didn't override ABCMeta.__subclasscheck__ in _ProtocolMeta,
        # TypeError wouldn't be raised here,
        # as the cached result of the isinstance() check immediately above
        # would mean the issubclass() call would short-circuit
        # before we got to the "raise TypeError" line
        with self.assertRaisesRegex(
            TypeError,
            "Protocols with non-method members don't support issubclass()"
        ):
            issubclass(Eggs, Spam)

    def test_protocols_isinstance(self):
        T = TypeVar('T')
        @runtime_checkable
        class P(Protocol):
            def meth(x): ...
        @runtime_checkable
        class PG(Protocol[T]):
            def meth(x): ...
        @runtime_checkable
        class WeirdProto(Protocol):
            meth = str.maketrans
        @runtime_checkable
        class WeirdProto2(Protocol):
            meth = lambda *args, **kwargs: None  # noqa: E731
        class CustomCallable:
            def __call__(self, *args, **kwargs):
                pass
        @runtime_checkable
        class WeirderProto(Protocol):
            meth = CustomCallable()
        class BadP(Protocol):
            def meth(x): ...
        class BadPG(Protocol[T]):
            def meth(x): ...
        class C:
            def meth(x): ...
        class C2:
            def __init__(self):
                self.meth = lambda: None
        for klass in C, C2:
            for proto in P, PG, WeirdProto, WeirdProto2, WeirderProto:
                with self.subTest(klass=klass.__name__, proto=proto.__name__):
                    self.assertIsInstance(klass(), proto)

        no_subscripted_generics = (
            "Subscripted generics cannot be used with class and instance checks"
        )

        with self.assertRaisesRegex(TypeError, no_subscripted_generics):
            isinstance(C(), PG[T])
        with self.assertRaisesRegex(TypeError, no_subscripted_generics):
            isinstance(C(), PG[C])

        only_runtime_checkable_msg = (
            "Instance and class checks can only be used "
            "with @runtime_checkable protocols"
        )

        with self.assertRaisesRegex(TypeError, only_runtime_checkable_msg):
            isinstance(C(), BadP)
        with self.assertRaisesRegex(TypeError, only_runtime_checkable_msg):
            isinstance(C(), BadPG)

    def test_protocols_isinstance_properties_and_descriptors(self):
        class C:
            @property
            def attr(self):
                return 42

        class CustomDescriptor:
            def __get__(self, obj, objtype=None):
                return 42

        class D:
            attr = CustomDescriptor()

        # Check that properties set on superclasses
        # are still found by the isinstance() logic
        class E(C): ...
        class F(D): ...

        class Empty: ...

        T = TypeVar('T')

        @runtime_checkable
        class P(Protocol):
            @property
            def attr(self): ...

        @runtime_checkable
        class P1(Protocol):
            attr: int

        @runtime_checkable
        class PG(Protocol[T]):
            @property
            def attr(self): ...

        @runtime_checkable
        class PG1(Protocol[T]):
            attr: T

        @runtime_checkable
        class MethodP(Protocol):
            def attr(self): ...

        @runtime_checkable
        class MethodPG(Protocol[T]):
            def attr(self) -> T: ...

        for protocol_class in P, P1, PG, PG1, MethodP, MethodPG:
            for klass in C, D, E, F:
                with self.subTest(
                    klass=klass.__name__,
                    protocol_class=protocol_class.__name__
                ):
                    self.assertIsInstance(klass(), protocol_class)

            with self.subTest(klass="Empty", protocol_class=protocol_class.__name__):
                self.assertNotIsInstance(Empty(), protocol_class)

        class BadP(Protocol):
            @property
            def attr(self): ...

        class BadP1(Protocol):
            attr: int

        class BadPG(Protocol[T]):
            @property
            def attr(self): ...

        class BadPG1(Protocol[T]):
            attr: T

        cases = (
            PG[T], PG[C], PG1[T], PG1[C], MethodPG[T],
            MethodPG[C], BadP, BadP1, BadPG, BadPG1
        )

        for obj in cases:
            for klass in C, D, E, F, Empty:
                with self.subTest(klass=klass.__name__, obj=obj):
                    with self.assertRaises(TypeError):
                        isinstance(klass(), obj)

    def test_protocols_isinstance_not_fooled_by_custom_dir(self):
        @runtime_checkable
        class HasX(Protocol):
            x: int

        class CustomDirWithX:
            x = 10
            def __dir__(self):
                return []

        class CustomDirWithoutX:
            def __dir__(self):
                return ["x"]

        self.assertIsInstance(CustomDirWithX(), HasX)
        self.assertNotIsInstance(CustomDirWithoutX(), HasX)

    def test_protocols_isinstance_attribute_access_with_side_effects(self):
        class C:
            @property
            def attr(self):
                raise AttributeError('no')

        class CustomDescriptor:
            def __get__(self, obj, objtype=None):
                raise RuntimeError("NO")

        class D:
            attr = CustomDescriptor()

        # Check that properties set on superclasses
        # are still found by the isinstance() logic
        class E(C): ...
        class F(D): ...

        class WhyWouldYouDoThis:
            def __getattr__(self, name):
                raise RuntimeError("wut")

        T = TypeVar('T')

        @runtime_checkable
        class P(Protocol):
            @property
            def attr(self): ...

        @runtime_checkable
        class P1(Protocol):
            attr: int

        @runtime_checkable
        class PG(Protocol[T]):
            @property
            def attr(self): ...

        @runtime_checkable
        class PG1(Protocol[T]):
            attr: T

        @runtime_checkable
        class MethodP(Protocol):
            def attr(self): ...

        @runtime_checkable
        class MethodPG(Protocol[T]):
            def attr(self) -> T: ...

        for protocol_class in P, P1, PG, PG1, MethodP, MethodPG:
            for klass in C, D, E, F:
                with self.subTest(
                    klass=klass.__name__,
                    protocol_class=protocol_class.__name__
                ):
                    self.assertIsInstance(klass(), protocol_class)

            with self.subTest(
                klass="WhyWouldYouDoThis",
                protocol_class=protocol_class.__name__
            ):
                self.assertNotIsInstance(WhyWouldYouDoThis(), protocol_class)

    def test_protocols_isinstance___slots__(self):
        # As per the consensus in https://github.com/python/typing/issues/1367,
        # this is desirable behaviour
        @runtime_checkable
        class HasX(Protocol):
            x: int

        class HasNothingButSlots:
            __slots__ = ("x",)

        self.assertIsInstance(HasNothingButSlots(), HasX)

    def test_protocols_isinstance_py36(self):
        class APoint:
            def __init__(self, x, y, label):
                self.x = x
                self.y = y
                self.label = label
        class BPoint:
            label = 'B'
            def __init__(self, x, y):
                self.x = x
                self.y = y
        class C:
            def __init__(self, attr):
                self.attr = attr
            def meth(self, arg):
                return 0
        class Bad: pass
        self.assertIsInstance(APoint(1, 2, 'A'), Point)
        self.assertIsInstance(BPoint(1, 2), Point)
        self.assertNotIsInstance(MyPoint(), Point)
        self.assertIsInstance(BPoint(1, 2), Position)
        self.assertIsInstance(Other(), Proto)
        self.assertIsInstance(Concrete(), Proto)
        self.assertIsInstance(C(42), Proto)
        self.assertNotIsInstance(Bad(), Proto)
        self.assertNotIsInstance(Bad(), Point)
        self.assertNotIsInstance(Bad(), Position)
        self.assertNotIsInstance(Bad(), Concrete)
        self.assertNotIsInstance(Other(), Concrete)
        self.assertIsInstance(NT(1, 2), Position)

    def test_runtime_checkable_with_match_args(self):
        @runtime_checkable
        class P_regular(Protocol):
            x: int
            y: int

        @runtime_checkable
        class P_match(Protocol):
            __match_args__ = ("x", "y")
            x: int
            y: int

        class Regular:
            def __init__(self, x: int, y: int):
                self.x = x
                self.y = y

        class WithMatch:
            __match_args__ = ("x", "y", "z")
            def __init__(self, x: int, y: int, z: int):
                self.x = x
                self.y = y
                self.z = z

        class Nope: ...

        self.assertIsInstance(Regular(1, 2), P_regular)
        self.assertIsInstance(Regular(1, 2), P_match)
        self.assertIsInstance(WithMatch(1, 2, 3), P_regular)
        self.assertIsInstance(WithMatch(1, 2, 3), P_match)
        self.assertNotIsInstance(Nope(), P_regular)
        self.assertNotIsInstance(Nope(), P_match)

    def test_protocols_isinstance_init(self):
        T = TypeVar('T')
        @runtime_checkable
        class P(Protocol):
            x = 1
        @runtime_checkable
        class PG(Protocol[T]):
            x = 1
        class C:
            def __init__(self, x):
                self.x = x
        self.assertIsInstance(C(1), P)
        self.assertIsInstance(C(1), PG)

    def test_protocols_isinstance_monkeypatching(self):
        @runtime_checkable
        class HasX(Protocol):
            x: int

        class Foo: ...

        f = Foo()
        self.assertNotIsInstance(f, HasX)
        f.x = 42
        self.assertIsInstance(f, HasX)
        del f.x
        self.assertNotIsInstance(f, HasX)

    @skip_if_py312b1
    def test_runtime_checkable_generic_non_protocol(self):
        # Make sure this doesn't raise AttributeError
        with self.assertRaisesRegex(
            TypeError,
            "@runtime_checkable can be only applied to protocol classes",
        ):
            @runtime_checkable
            class Foo(Generic[T]): ...

    def test_runtime_checkable_generic(self):
        @runtime_checkable
        class Foo(Protocol[T]):
            def meth(self) -> T: ...

        class Impl:
            def meth(self) -> int: ...

        self.assertIsSubclass(Impl, Foo)

        class NotImpl:
            def method(self) -> int: ...

        self.assertNotIsSubclass(NotImpl, Foo)

    if sys.version_info >= (3, 12):
        exec(textwrap.dedent(
            """
            @skip_if_py312b1
            def test_pep695_generics_can_be_runtime_checkable(self):
                @runtime_checkable
                class HasX(Protocol):
                    x: int

                class Bar[T]:
                    x: T
                    def __init__(self, x):
                        self.x = x

                class Capybara[T]:
                    y: str
                    def __init__(self, y):
                        self.y = y

                self.assertIsInstance(Bar(1), HasX)
                self.assertNotIsInstance(Capybara('a'), HasX)
                """
        ))

    @skip_if_py312b1
    def test_protocols_isinstance_generic_classes(self):
        T = TypeVar("T")

        class Foo(Generic[T]):
            x: T

            def __init__(self, x):
                self.x = x

        class Bar(Foo[int]):
            ...

        @runtime_checkable
        class HasX(Protocol):
            x: int

        foo = Foo(1)
        self.assertIsInstance(foo, HasX)

        bar = Bar(2)
        self.assertIsInstance(bar, HasX)

    def test_protocols_support_register(self):
        @runtime_checkable
        class P(Protocol):
            x = 1
        class PM(Protocol):
            def meth(self): pass
        class D(PM): pass
        class C: pass
        D.register(C)
        P.register(C)
        self.assertIsInstance(C(), P)
        self.assertIsInstance(C(), D)

    def test_none_on_non_callable_doesnt_block_implementation(self):
        @runtime_checkable
        class P(Protocol):
            x = 1
        class A:
            x = 1
        class B(A):
            x = None
        class C:
            def __init__(self):
                self.x = None
        self.assertIsInstance(B(), P)
        self.assertIsInstance(C(), P)

    def test_none_on_callable_blocks_implementation(self):
        @runtime_checkable
        class P(Protocol):
            def x(self): ...
        class A:
            def x(self): ...
        class B(A):
            x = None
        class C:
            def __init__(self):
                self.x = None
        self.assertNotIsInstance(B(), P)
        self.assertNotIsInstance(C(), P)

    def test_non_protocol_subclasses(self):
        class P(Protocol):
            x = 1
        @runtime_checkable
        class PR(Protocol):
            def meth(self): pass
        class NonP(P):
            x = 1
        class NonPR(PR): pass
        class C(metaclass=abc.ABCMeta):
            x = 1
        class D(metaclass=abc.ABCMeta):
            def meth(self): pass  # noqa: B027
        self.assertNotIsInstance(C(), NonP)
        self.assertNotIsInstance(D(), NonPR)
        self.assertNotIsSubclass(C, NonP)
        self.assertNotIsSubclass(D, NonPR)
        self.assertIsInstance(NonPR(), PR)
        self.assertIsSubclass(NonPR, PR)

        self.assertNotIn("__protocol_attrs__", vars(NonP))
        self.assertNotIn("__protocol_attrs__", vars(NonPR))
        self.assertNotIn("__non_callable_proto_members__", vars(NonP))
        self.assertNotIn("__non_callable_proto_members__", vars(NonPR))

        acceptable_extra_attrs = {
            '_is_protocol', '_is_runtime_protocol', '__parameters__',
            '__init__', '__annotations__', '__subclasshook__', '__annotate__'
        }
        self.assertLessEqual(vars(NonP).keys(), vars(C).keys() | acceptable_extra_attrs)
        self.assertLessEqual(
            vars(NonPR).keys(), vars(D).keys() | acceptable_extra_attrs
        )

    def test_custom_subclasshook(self):
        class P(Protocol):
            x = 1
        class OKClass: pass
        class BadClass:
            x = 1
        class C(P):
            @classmethod
            def __subclasshook__(cls, other):
                return other.__name__.startswith("OK")
        self.assertIsInstance(OKClass(), C)
        self.assertNotIsInstance(BadClass(), C)
        self.assertIsSubclass(OKClass, C)
        self.assertNotIsSubclass(BadClass, C)

    @skipIf(
        sys.version_info[:4] == (3, 12, 0, 'beta') and sys.version_info[4] < 4,
        "Early betas of Python 3.12 had a bug"
    )
    def test_custom_subclasshook_2(self):
        @runtime_checkable
        class HasX(Protocol):
            # The presence of a non-callable member
            # would mean issubclass() checks would fail with TypeError
            # if it weren't for the custom `__subclasshook__` method
            x = 1

            @classmethod
            def __subclasshook__(cls, other):
                return hasattr(other, 'x')

        class Empty: pass

        class ImplementsHasX:
            x = 1

        self.assertIsInstance(ImplementsHasX(), HasX)
        self.assertNotIsInstance(Empty(), HasX)
        self.assertIsSubclass(ImplementsHasX, HasX)
        self.assertNotIsSubclass(Empty, HasX)

        # isinstance() and issubclass() checks against this still raise TypeError,
        # despite the presence of the custom __subclasshook__ method,
        # as it's not decorated with @runtime_checkable
        class NotRuntimeCheckable(Protocol):
            @classmethod
            def __subclasshook__(cls, other):
                return hasattr(other, 'x')

        must_be_runtime_checkable = (
            "Instance and class checks can only be used "
            "with @runtime_checkable protocols"
        )

        with self.assertRaisesRegex(TypeError, must_be_runtime_checkable):
            issubclass(object, NotRuntimeCheckable)
        with self.assertRaisesRegex(TypeError, must_be_runtime_checkable):
            isinstance(object(), NotRuntimeCheckable)

    @skip_if_py312b1
    def test_issubclass_fails_correctly(self):
        @runtime_checkable
        class NonCallableMembers(Protocol):
            x = 1

        class NotRuntimeCheckable(Protocol):
            def callable_member(self) -> int: ...

        @runtime_checkable
        class RuntimeCheckable(Protocol):
            def callable_member(self) -> int: ...

        class C: pass

        # These three all exercise different code paths,
        # but should result in the same error message:
        for protocol in NonCallableMembers, NotRuntimeCheckable, RuntimeCheckable:
            with self.subTest(proto_name=protocol.__name__):
                with self.assertRaisesRegex(
                    TypeError, r"issubclass\(\) arg 1 must be a class"
                ):
                    issubclass(C(), protocol)

    def test_defining_generic_protocols(self):
        T = TypeVar('T')
        S = TypeVar('S')
        @runtime_checkable
        class PR(Protocol[T, S]):
            def meth(self): pass
        class P(PR[int, T], Protocol[T]):
            y = 1
        with self.assertRaises(TypeError):
            issubclass(PR[int, T], PR)
        with self.assertRaises(TypeError):
            issubclass(P[str], PR)
        with self.assertRaises(TypeError):
            PR[int]
        with self.assertRaises(TypeError):
            P[int, str]
        if not TYPING_3_10_0:
            with self.assertRaises(TypeError):
                PR[int, 1]
            with self.assertRaises(TypeError):
                PR[int, ClassVar]
        class C(PR[int, T]): pass
        self.assertIsInstance(C[str](), C)

    def test_defining_generic_protocols_old_style(self):
        T = TypeVar('T')
        S = TypeVar('S')
        @runtime_checkable
        class PR(Protocol, Generic[T, S]):
            def meth(self): pass
        class P(PR[int, str], Protocol):
            y = 1
        with self.assertRaises(TypeError):
            self.assertIsSubclass(PR[int, str], PR)
        self.assertIsSubclass(P, PR)
        with self.assertRaises(TypeError):
            PR[int]
        if not TYPING_3_10_0:
            with self.assertRaises(TypeError):
                PR[int, 1]
        class P1(Protocol, Generic[T]):
            def bar(self, x: T) -> str: ...
        class P2(Generic[T], Protocol):
            def bar(self, x: T) -> str: ...
        @runtime_checkable
        class PSub(P1[str], Protocol):
            x = 1
        class Test:
            x = 1
            def bar(self, x: str) -> str:
                return x
        self.assertIsInstance(Test(), PSub)
        if not TYPING_3_10_0:
            with self.assertRaises(TypeError):
                PR[int, ClassVar]

    if hasattr(typing, "TypeAliasType"):
        exec(textwrap.dedent(
            """
            def test_pep695_generic_protocol_callable_members(self):
                @runtime_checkable
                class Foo[T](Protocol):
                    def meth(self, x: T) -> None: ...

                class Bar[T]:
                    def meth(self, x: T) -> None: ...

                self.assertIsInstance(Bar(), Foo)
                self.assertIsSubclass(Bar, Foo)

                @runtime_checkable
                class SupportsTrunc[T](Protocol):
                    def __trunc__(self) -> T: ...

                self.assertIsInstance(0.0, SupportsTrunc)
                self.assertIsSubclass(float, SupportsTrunc)

            def test_no_weird_caching_with_issubclass_after_isinstance_pep695(self):
                @runtime_checkable
                class Spam[T](Protocol):
                    x: T

                class Eggs[T]:
                    def __init__(self, x: T) -> None:
                        self.x = x

                self.assertIsInstance(Eggs(42), Spam)

                # gh-104555: If we didn't override ABCMeta.__subclasscheck__ in _ProtocolMeta,
                # TypeError wouldn't be raised here,
                # as the cached result of the isinstance() check immediately above
                # would mean the issubclass() call would short-circuit
                # before we got to the "raise TypeError" line
                with self.assertRaises(TypeError):
                    issubclass(Eggs, Spam)
            """
        ))

    def test_init_called(self):
        T = TypeVar('T')
        class P(Protocol[T]): pass
        class C(P[T]):
            def __init__(self):
                self.test = 'OK'
        self.assertEqual(C[int]().test, 'OK')

    def test_protocols_bad_subscripts(self):
        T = TypeVar('T')
        S = TypeVar('S')
        with self.assertRaises(TypeError):
            class P(Protocol[T, T]): pass
        with self.assertRaises(TypeError):
            class P2(Protocol[int]): pass
        with self.assertRaises(TypeError):
            class P3(Protocol[T], Protocol[S]): pass
        with self.assertRaises(TypeError):
            class P4(typing.Mapping[T, S], Protocol[T]): pass

    def test_generic_protocols_repr(self):
        T = TypeVar('T')
        S = TypeVar('S')
        class P(Protocol[T, S]): pass
        self.assertTrue(repr(P[T, S]).endswith('P[~T, ~S]'))
        self.assertTrue(repr(P[int, str]).endswith('P[int, str]'))

    def test_generic_protocols_eq(self):
        T = TypeVar('T')
        S = TypeVar('S')
        class P(Protocol[T, S]): pass
        self.assertEqual(P, P)
        self.assertEqual(P[int, T], P[int, T])
        self.assertEqual(P[T, T][Tuple[T, S]][int, str],
                         P[Tuple[int, str], Tuple[int, str]])

    def test_generic_protocols_special_from_generic(self):
        T = TypeVar('T')
        class P(Protocol[T]): pass
        self.assertEqual(P.__parameters__, (T,))
        self.assertEqual(P[int].__parameters__, ())
        self.assertEqual(P[int].__args__, (int,))
        self.assertIs(P[int].__origin__, P)

    def test_generic_protocols_special_from_protocol(self):
        @runtime_checkable
        class PR(Protocol):
            x = 1
        class P(Protocol):
            def meth(self):
                pass
        T = TypeVar('T')
        class PG(Protocol[T]):
            x = 1
            def meth(self):
                pass
        self.assertTrue(P._is_protocol)
        self.assertTrue(PR._is_protocol)
        self.assertTrue(PG._is_protocol)
        self.assertFalse(P._is_runtime_protocol)
        self.assertTrue(PR._is_runtime_protocol)
        self.assertTrue(PG[int]._is_protocol)
        self.assertEqual(typing_extensions._get_protocol_attrs(P), {'meth'})
        self.assertEqual(typing_extensions._get_protocol_attrs(PR), {'x'})
        self.assertEqual(frozenset(typing_extensions._get_protocol_attrs(PG)),
                         frozenset({'x', 'meth'}))

    def test_no_runtime_deco_on_nominal(self):
        with self.assertRaises(TypeError):
            @runtime_checkable
            class C: pass
        class Proto(Protocol):
            x = 1
        with self.assertRaises(TypeError):
            @runtime_checkable
            class Concrete(Proto):
                pass

    def test_none_treated_correctly(self):
        @runtime_checkable
        class P(Protocol):
            x: int = None
        class B: pass
        self.assertNotIsInstance(B(), P)
        class C:
            x = 1
        class D:
            x = None
        self.assertIsInstance(C(), P)
        self.assertIsInstance(D(), P)
        class CI:
            def __init__(self):
                self.x = 1
        class DI:
            def __init__(self):
                self.x = None
        self.assertIsInstance(CI(), P)
        self.assertIsInstance(DI(), P)

    def test_protocols_in_unions(self):
        class P(Protocol):
            x: int = None
        Alias = typing.Union[typing.Iterable, P]
        Alias2 = typing.Union[P, typing.Iterable]
        self.assertEqual(Alias, Alias2)

    def test_protocols_pickleable(self):
        global P, CP  # pickle wants to reference the class by name
        T = TypeVar('T')

        @runtime_checkable
        class P(Protocol[T]):
            x = 1
        class CP(P[int]):
            pass

        c = CP()
        c.foo = 42
        c.bar = 'abc'
        for proto in range(pickle.HIGHEST_PROTOCOL + 1):
            z = pickle.dumps(c, proto)
            x = pickle.loads(z)
            self.assertEqual(x.foo, 42)
            self.assertEqual(x.bar, 'abc')
            self.assertEqual(x.x, 1)
            self.assertEqual(x.__dict__, {'foo': 42, 'bar': 'abc'})
            s = pickle.dumps(P)
            D = pickle.loads(s)
            class E:
                x = 1
            self.assertIsInstance(E(), D)

    def test_collections_protocols_allowed(self):
        @runtime_checkable
        class Custom(collections.abc.Iterable, Protocol):
            def close(self): pass

        class A: ...
        class B:
            def __iter__(self):
                return []
            def close(self):
                return 0

        self.assertIsSubclass(B, Custom)
        self.assertNotIsSubclass(A, Custom)

    @skipUnless(
        hasattr(collections.abc, "Buffer"),
        "needs collections.abc.Buffer to exist"
    )
    @skip_if_py312b1
    def test_collections_abc_buffer_protocol_allowed(self):
        @runtime_checkable
        class ReleasableBuffer(collections.abc.Buffer, Protocol):
            def __release_buffer__(self, mv: memoryview) -> None: ...

        class C: pass
        class D:
            def __buffer__(self, flags: int) -> memoryview:
                return memoryview(b'')
            def __release_buffer__(self, mv: memoryview) -> None:
                pass

        self.assertIsSubclass(D, ReleasableBuffer)
        self.assertIsInstance(D(), ReleasableBuffer)
        self.assertNotIsSubclass(C, ReleasableBuffer)
        self.assertNotIsInstance(C(), ReleasableBuffer)

    def test_builtin_protocol_allowlist(self):
        with self.assertRaises(TypeError):
            class CustomProtocol(TestCase, Protocol):
                pass

        class CustomContextManager(typing.ContextManager, Protocol):
            pass

    @skip_if_py312b1
    def test_typing_extensions_protocol_allowlist(self):
        @runtime_checkable
        class ReleasableBuffer(Buffer, Protocol):
            def __release_buffer__(self, mv: memoryview) -> None: ...

        class C: pass
        class D:
            def __buffer__(self, flags: int) -> memoryview:
                return memoryview(b'')
            def __release_buffer__(self, mv: memoryview) -> None:
                pass

        self.assertIsSubclass(D, ReleasableBuffer)
        self.assertIsInstance(D(), ReleasableBuffer)
        self.assertNotIsSubclass(C, ReleasableBuffer)
        self.assertNotIsInstance(C(), ReleasableBuffer)

    def test_non_runtime_protocol_isinstance_check(self):
        class P(Protocol):
            x: int

        with self.assertRaisesRegex(TypeError, "@runtime_checkable"):
            isinstance(1, P)

    def test_no_init_same_for_different_protocol_implementations(self):
        class CustomProtocolWithoutInitA(Protocol):
            pass

        class CustomProtocolWithoutInitB(Protocol):
            pass

        self.assertEqual(CustomProtocolWithoutInitA.__init__, CustomProtocolWithoutInitB.__init__)

    def test_protocol_generic_over_paramspec(self):
        P = ParamSpec("P")
        T = TypeVar("T")
        T2 = TypeVar("T2")

        class MemoizedFunc(Protocol[P, T, T2]):
            cache: typing.Dict[T2, T]
            def __call__(self, *args: P.args, **kwargs: P.kwargs) -> T: ...

        self.assertEqual(MemoizedFunc.__parameters__, (P, T, T2))
        self.assertTrue(MemoizedFunc._is_protocol)

        with self.assertRaises(TypeError):
            MemoizedFunc[[int, str, str]]

        if sys.version_info >= (3, 10):
            # These unfortunately don't pass on <=3.9,
            # due to typing._type_check on older Python versions
            X = MemoizedFunc[[int, str, str], T, T2]
            self.assertEqual(X.__parameters__, (T, T2))
            self.assertEqual(X.__args__, ((int, str, str), T, T2))

            Y = X[bytes, memoryview]
            self.assertEqual(Y.__parameters__, ())
            self.assertEqual(Y.__args__, ((int, str, str), bytes, memoryview))

    def test_protocol_generic_over_typevartuple(self):
        Ts = TypeVarTuple("Ts")
        T = TypeVar("T")
        T2 = TypeVar("T2")

        class MemoizedFunc(Protocol[Unpack[Ts], T, T2]):
            cache: typing.Dict[T2, T]
            def __call__(self, *args: Unpack[Ts]) -> T: ...

        self.assertEqual(MemoizedFunc.__parameters__, (Ts, T, T2))
        self.assertTrue(MemoizedFunc._is_protocol)

        things = "arguments" if sys.version_info >= (3, 10) else "parameters"

        # A bug was fixed in 3.11.1
        # (https://github.com/python/cpython/commit/74920aa27d0c57443dd7f704d6272cca9c507ab3)
        # That means this assertion doesn't pass on 3.11.0,
        # but it passes on all other Python versions
        if sys.version_info[:3] != (3, 11, 0):
            with self.assertRaisesRegex(TypeError, f"Too few {things}"):
                MemoizedFunc[int]

        X = MemoizedFunc[int, T, T2]
        self.assertEqual(X.__parameters__, (T, T2))
        self.assertEqual(X.__args__, (int, T, T2))

        Y = X[bytes, memoryview]
        self.assertEqual(Y.__parameters__, ())
        self.assertEqual(Y.__args__, (int, bytes, memoryview))

    def test_get_protocol_members(self):
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(object)
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(object())
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(Protocol)
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(Generic)

        class P(Protocol):
            a: int
            def b(self) -> str: ...
            @property
            def c(self) -> int: ...

        self.assertEqual(get_protocol_members(P), {'a', 'b', 'c'})
        self.assertIsInstance(get_protocol_members(P), frozenset)
        self.assertIsNot(get_protocol_members(P), P.__protocol_attrs__)

        class Concrete:
            a: int
            def b(self) -> str: return "capybara"
            @property
            def c(self) -> int: return 5

        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(Concrete)
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(Concrete())

        class ConcreteInherit(P):
            a: int = 42
            def b(self) -> str: return "capybara"
            @property
            def c(self) -> int: return 5

        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(ConcreteInherit)
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(ConcreteInherit())

    def test_get_protocol_members_typing(self):
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(typing.Protocol)

        class P(typing.Protocol):
            a: int
            def b(self) -> str: ...
            @property
            def c(self) -> int: ...

        self.assertEqual(get_protocol_members(P), {'a', 'b', 'c'})
        self.assertIsInstance(get_protocol_members(P), frozenset)
        if hasattr(P, "__protocol_attrs__"):
            self.assertIsNot(get_protocol_members(P), P.__protocol_attrs__)

        class Concrete:
            a: int
            def b(self) -> str: return "capybara"
            @property
            def c(self) -> int: return 5

        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(Concrete)
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(Concrete())

        class ConcreteInherit(P):
            a: int = 42
            def b(self) -> str: return "capybara"
            @property
            def c(self) -> int: return 5

        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(ConcreteInherit)
        with self.assertRaisesRegex(TypeError, "not a Protocol"):
            get_protocol_members(ConcreteInherit())

    def test_is_protocol(self):
        self.assertTrue(is_protocol(Proto))
        self.assertTrue(is_protocol(Point))
        self.assertFalse(is_protocol(Concrete))
        self.assertFalse(is_protocol(Concrete()))
        self.assertFalse(is_protocol(Generic))
        self.assertFalse(is_protocol(object))

        # Protocol is not itself a protocol
        self.assertFalse(is_protocol(Protocol))

    def test_is_protocol_with_typing(self):
        self.assertFalse(is_protocol(typing.Protocol))

        class TypingProto(typing.Protocol):
            a: int

        self.assertTrue(is_protocol(TypingProto))

        class Concrete(TypingProto):
            a: int

        self.assertFalse(is_protocol(Concrete))

    @skip_if_py312b1
    def test_interaction_with_isinstance_checks_on_superclasses_with_ABCMeta(self):
        # Ensure the cache is empty, or this test won't work correctly
        collections.abc.Sized._abc_registry_clear()

        class Foo(collections.abc.Sized, Protocol): pass

        # CPython gh-105144: this previously raised TypeError
        # if a Protocol subclass of Sized had been created
        # before any isinstance() checks against Sized
        self.assertNotIsInstance(1, collections.abc.Sized)

    @skip_if_py312b1
    def test_interaction_with_isinstance_checks_on_superclasses_with_ABCMeta_2(self):
        # Ensure the cache is empty, or this test won't work correctly
        collections.abc.Sized._abc_registry_clear()

        class Foo(typing.Sized, Protocol): pass

        # CPython gh-105144: this previously raised TypeError
        # if a Protocol subclass of Sized had been created
        # before any isinstance() checks against Sized
        self.assertNotIsInstance(1, typing.Sized)

    def test_empty_protocol_decorated_with_final(self):
        @final
        @runtime_checkable
        class EmptyProtocol(Protocol): ...

        self.assertIsSubclass(object, EmptyProtocol)
        self.assertIsInstance(object(), EmptyProtocol)

    def test_protocol_decorated_with_final_callable_members(self):
        @final
        @runtime_checkable
        class ProtocolWithMethod(Protocol):
            def startswith(self, string: str) -> bool: ...

        self.assertIsSubclass(str, ProtocolWithMethod)
        self.assertNotIsSubclass(int, ProtocolWithMethod)
        self.assertIsInstance('foo', ProtocolWithMethod)
        self.assertNotIsInstance(42, ProtocolWithMethod)

    def test_protocol_decorated_with_final_noncallable_members(self):
        @final
        @runtime_checkable
        class ProtocolWithNonCallableMember(Protocol):
            x: int

        class Foo:
            x = 42

        only_callable_members_please = (
            r"Protocols with non-method members don't support issubclass()"
        )

        with self.assertRaisesRegex(TypeError, only_callable_members_please):
            issubclass(Foo, ProtocolWithNonCallableMember)

        with self.assertRaisesRegex(TypeError, only_callable_members_please):
            issubclass(int, ProtocolWithNonCallableMember)

        self.assertIsInstance(Foo(), ProtocolWithNonCallableMember)
        self.assertNotIsInstance(42, ProtocolWithNonCallableMember)

    def test_protocol_decorated_with_final_mixed_members(self):
        @final
        @runtime_checkable
        class ProtocolWithMixedMembers(Protocol):
            x: int
            def method(self) -> None: ...

        class Foo:
            x = 42
            def method(self) -> None: ...

        only_callable_members_please = (
            r"Protocols with non-method members don't support issubclass()"
        )

        with self.assertRaisesRegex(TypeError, only_callable_members_please):
            issubclass(Foo, ProtocolWithMixedMembers)

        with self.assertRaisesRegex(TypeError, only_callable_members_please):
            issubclass(int, ProtocolWithMixedMembers)

        self.assertIsInstance(Foo(), ProtocolWithMixedMembers)
        self.assertNotIsInstance(42, ProtocolWithMixedMembers)

    def test_protocol_issubclass_error_message(self):
        @runtime_checkable
        class Vec2D(Protocol):
            x: float
            y: float

            def square_norm(self) -> float:
                return self.x ** 2 + self.y ** 2

        self.assertEqual(Vec2D.__protocol_attrs__, {'x', 'y', 'square_norm'})
        expected_error_message = (
            "Protocols with non-method members don't support issubclass()."
            " Non-method members: 'x', 'y'."
        )
        with self.assertRaisesRegex(TypeError, re.escape(expected_error_message)):
            issubclass(int, Vec2D)

    def test_nonruntime_protocol_interaction_with_evil_classproperty(self):
        class classproperty:
            def __get__(self, instance, type):
                raise RuntimeError("NO")

        class Commentable(Protocol):
            evil = classproperty()

        # recognised as a protocol attr,
        # but not actually accessed by the protocol metaclass
        # (which would raise RuntimeError) for non-runtime protocols.
        # See gh-113320
        self.assertEqual(get_protocol_members(Commentable), {"evil"})

    def test_runtime_protocol_interaction_with_evil_classproperty(self):
        class CustomError(Exception): pass

        class classproperty:
            def __get__(self, instance, type):
                raise CustomError

        with self.assertRaises(TypeError) as cm:
            @runtime_checkable
            class Commentable(Protocol):
                evil = classproperty()

        exc = cm.exception
        self.assertEqual(
            exc.args[0],
            "Failed to determine whether protocol member 'evil' is a method member"
        )
        self.assertIs(type(exc.__cause__), CustomError)

    def test_extensions_runtimecheckable_on_typing_Protocol(self):
        @runtime_checkable
        class Functor(typing.Protocol):
            def foo(self) -> None: ...

        self.assertNotIsSubclass(object, Functor)

        class Bar:
            def foo(self): pass

        self.assertIsSubclass(Bar, Functor)


class Point2DGeneric(Generic[T], TypedDict):
    a: T
    b: T


class Bar(Foo):
    b: int


class BarGeneric(FooGeneric[T], total=False):
    b: int


class TypedDictTests(BaseTestCase):
    def test_basics_functional_syntax(self):
        Emp = TypedDict('Emp', {'name': str, 'id': int})
        self.assertIsSubclass(Emp, dict)
        self.assertIsSubclass(Emp, typing.MutableMapping)
        self.assertNotIsSubclass(Emp, collections.abc.Sequence)
        jim = Emp(name='Jim', id=1)
        self.assertIs(type(jim), dict)
        self.assertEqual(jim['name'], 'Jim')
        self.assertEqual(jim['id'], 1)
        self.assertEqual(Emp.__name__, 'Emp')
        self.assertEqual(Emp.__module__, __name__)
        self.assertEqual(Emp.__bases__, (dict,))
        self.assertEqual(Emp.__annotations__, {'name': str, 'id': int})
        self.assertEqual(Emp.__total__, True)

    @skipIf(sys.version_info < (3, 13), "Change in behavior in 3.13")
    def test_keywords_syntax_raises_on_3_13(self):
        with self.assertRaises(TypeError), self.assertWarns(DeprecationWarning):
            TypedDict('Emp', name=str, id=int)

    @skipIf(sys.version_info >= (3, 13), "3.13 removes support for kwargs")
    def test_basics_keywords_syntax(self):
        with self.assertWarns(DeprecationWarning):
            Emp = TypedDict('Emp', name=str, id=int)
        self.assertIsSubclass(Emp, dict)
        self.assertIsSubclass(Emp, typing.MutableMapping)
        self.assertNotIsSubclass(Emp, collections.abc.Sequence)
        jim = Emp(name='Jim', id=1)
        self.assertIs(type(jim), dict)
        self.assertEqual(jim['name'], 'Jim')
        self.assertEqual(jim['id'], 1)
        self.assertEqual(Emp.__name__, 'Emp')
        self.assertEqual(Emp.__module__, __name__)
        self.assertEqual(Emp.__bases__, (dict,))
        self.assertEqual(Emp.__annotations__, {'name': str, 'id': int})
        self.assertEqual(Emp.__total__, True)

    @skipIf(sys.version_info >= (3, 13), "3.13 removes support for kwargs")
    def test_typeddict_special_keyword_names(self):
        with self.assertWarns(DeprecationWarning):
            TD = TypedDict("TD", cls=type, self=object, typename=str, _typename=int,
                           fields=list, _fields=dict)
        self.assertEqual(TD.__name__, 'TD')
        self.assertEqual(TD.__annotations__, {'cls': type, 'self': object, 'typename': str,
                                              '_typename': int, 'fields': list, '_fields': dict})
        a = TD(cls=str, self=42, typename='foo', _typename=53,
               fields=[('bar', tuple)], _fields={'baz', set})
        self.assertEqual(a['cls'], str)
        self.assertEqual(a['self'], 42)
        self.assertEqual(a['typename'], 'foo')
        self.assertEqual(a['_typename'], 53)
        self.assertEqual(a['fields'], [('bar', tuple)])
        self.assertEqual(a['_fields'], {'baz', set})

    def test_typeddict_create_errors(self):
        with self.assertRaises(TypeError):
            TypedDict.__new__()
        with self.assertRaises(TypeError):
            TypedDict()
        with self.assertRaises(TypeError):
            TypedDict('Emp', [('name', str)], None)

    def test_typeddict_errors(self):
        Emp = TypedDict('Emp', {'name': str, 'id': int})
        self.assertEqual(TypedDict.__module__, 'typing_extensions')
        jim = Emp(name='Jim', id=1)
        with self.assertRaises(TypeError):
            isinstance({}, Emp)
        with self.assertRaises(TypeError):
            isinstance(jim, Emp)
        with self.assertRaises(TypeError):
            issubclass(dict, Emp)

        if not TYPING_3_11_0:
            with self.assertRaises(TypeError), self.assertWarns(DeprecationWarning):
                TypedDict('Hi', x=1)
            with self.assertRaises(TypeError):
                TypedDict('Hi', [('x', int), ('y', 1)])
        with self.assertRaises(TypeError):
            TypedDict('Hi', [('x', int)], y=int)

    def test_py36_class_syntax_usage(self):
        self.assertEqual(LabelPoint2D.__name__, 'LabelPoint2D')
        self.assertEqual(LabelPoint2D.__module__, __name__)
        self.assertEqual(LabelPoint2D.__annotations__, {'x': int, 'y': int, 'label': str})
        self.assertEqual(LabelPoint2D.__bases__, (dict,))
        self.assertEqual(LabelPoint2D.__total__, True)
        self.assertNotIsSubclass(LabelPoint2D, typing.Sequence)
        not_origin = Point2D(x=0, y=1)
        self.assertEqual(not_origin['x'], 0)
        self.assertEqual(not_origin['y'], 1)
        other = LabelPoint2D(x=0, y=1, label='hi')
        self.assertEqual(other['label'], 'hi')

    def test_pickle(self):
        global EmpD  # pickle wants to reference the class by name
        EmpD = TypedDict('EmpD', {'name': str, 'id': int})
        jane = EmpD({'name': 'jane', 'id': 37})
        for proto in range(pickle.HIGHEST_PROTOCOL + 1):
            z = pickle.dumps(jane, proto)
            jane2 = pickle.loads(z)
            self.assertEqual(jane2, jane)
            self.assertEqual(jane2, {'name': 'jane', 'id': 37})
            ZZ = pickle.dumps(EmpD, proto)
            EmpDnew = pickle.loads(ZZ)
            self.assertEqual(EmpDnew({'name': 'jane', 'id': 37}), jane)

    def test_pickle_generic(self):
        point = Point2DGeneric(a=5.0, b=3.0)
        for proto in range(pickle.HIGHEST_PROTOCOL + 1):
            z = pickle.dumps(point, proto)
            point2 = pickle.loads(z)
            self.assertEqual(point2, point)
            self.assertEqual(point2, {'a': 5.0, 'b': 3.0})
            ZZ = pickle.dumps(Point2DGeneric, proto)
            Point2DGenericNew = pickle.loads(ZZ)
            self.assertEqual(Point2DGenericNew({'a': 5.0, 'b': 3.0}), point)

    def test_optional(self):
        EmpD = TypedDict('EmpD', {'name': str, 'id': int})

        self.assertEqual(typing.Optional[EmpD], typing.Union[None, EmpD])
        self.assertNotEqual(typing.List[EmpD], typing.Tuple[EmpD])

    def test_total(self):
        D = TypedDict('D', {'x': int}, total=False)
        self.assertEqual(D(), {})
        self.assertEqual(D(x=1), {'x': 1})
        self.assertEqual(D.__total__, False)
        self.assertEqual(D.__required_keys__, frozenset())
        self.assertEqual(D.__optional_keys__, {'x'})

        self.assertEqual(Options(), {})
        self.assertEqual(Options(log_level=2), {'log_level': 2})
        self.assertEqual(Options.__total__, False)
        self.assertEqual(Options.__required_keys__, frozenset())
        self.assertEqual(Options.__optional_keys__, {'log_level', 'log_path'})

    def test_optional_keys(self):
        class Point2Dor3D(Point2D, total=False):
            z: int

        assert Point2Dor3D.__required_keys__ == frozenset(['x', 'y'])
        assert Point2Dor3D.__optional_keys__ == frozenset(['z'])

    def test_keys_inheritance(self):
        class BaseAnimal(TypedDict):
            name: str

        class Animal(BaseAnimal, total=False):
            voice: str
            tail: bool

        class Cat(Animal):
            fur_color: str

        assert BaseAnimal.__required_keys__ == frozenset(['name'])
        assert BaseAnimal.__optional_keys__ == frozenset([])
        assert BaseAnimal.__annotations__ == {'name': str}

        assert Animal.__required_keys__ == frozenset(['name'])
        assert Animal.__optional_keys__ == frozenset(['tail', 'voice'])
        assert Animal.__annotations__ == {
            'name': str,
            'tail': bool,
            'voice': str,
        }

        assert Cat.__required_keys__ == frozenset(['name', 'fur_color'])
        assert Cat.__optional_keys__ == frozenset(['tail', 'voice'])
        assert Cat.__annotations__ == {
            'fur_color': str,
            'name': str,
            'tail': bool,
            'voice': str,
        }

    def test_required_notrequired_keys(self):
        self.assertEqual(NontotalMovie.__required_keys__,
                         frozenset({"title"}))
        self.assertEqual(NontotalMovie.__optional_keys__,
                         frozenset({"year"}))

        self.assertEqual(TotalMovie.__required_keys__,
                         frozenset({"title"}))
        self.assertEqual(TotalMovie.__optional_keys__,
                         frozenset({"year"}))

        self.assertEqual(VeryAnnotated.__required_keys__,
                         frozenset())
        self.assertEqual(VeryAnnotated.__optional_keys__,
                         frozenset({"a"}))

        self.assertEqual(AnnotatedMovie.__required_keys__,
                         frozenset({"title"}))
        self.assertEqual(AnnotatedMovie.__optional_keys__,
                         frozenset({"year"}))

        self.assertEqual(WeirdlyQuotedMovie.__required_keys__,
                         frozenset({"title"}))
        self.assertEqual(WeirdlyQuotedMovie.__optional_keys__,
                         frozenset({"year"}))

        self.assertEqual(ChildTotalMovie.__required_keys__,
                         frozenset({"title"}))
        self.assertEqual(ChildTotalMovie.__optional_keys__,
                         frozenset({"year"}))

        self.assertEqual(ChildDeeplyAnnotatedMovie.__required_keys__,
                         frozenset({"title"}))
        self.assertEqual(ChildDeeplyAnnotatedMovie.__optional_keys__,
                         frozenset({"year"}))

    def test_multiple_inheritance(self):
        class One(TypedDict):
            one: int
        class Two(TypedDict):
            two: str
        class Untotal(TypedDict, total=False):
            untotal: str
        Inline = TypedDict('Inline', {'inline': bool})
        class Regular:
            pass

        class Child(One, Two):
            child: bool
        self.assertEqual(
            Child.__required_keys__,
            frozenset(['one', 'two', 'child']),
        )
        self.assertEqual(
            Child.__optional_keys__,
            frozenset([]),
        )
        self.assertEqual(
            Child.__annotations__,
            {'one': int, 'two': str, 'child': bool},
        )

        class ChildWithOptional(One, Untotal):
            child: bool
        self.assertEqual(
            ChildWithOptional.__required_keys__,
            frozenset(['one', 'child']),
        )
        self.assertEqual(
            ChildWithOptional.__optional_keys__,
            frozenset(['untotal']),
        )
        self.assertEqual(
            ChildWithOptional.__annotations__,
            {'one': int, 'untotal': str, 'child': bool},
        )

        class ChildWithTotalFalse(One, Untotal, total=False):
            child: bool
        self.assertEqual(
            ChildWithTotalFalse.__required_keys__,
            frozenset(['one']),
        )
        self.assertEqual(
            ChildWithTotalFalse.__optional_keys__,
            frozenset(['untotal', 'child']),
        )
        self.assertEqual(
            ChildWithTotalFalse.__annotations__,
            {'one': int, 'untotal': str, 'child': bool},
        )

        class ChildWithInlineAndOptional(Untotal, Inline):
            child: bool
        self.assertEqual(
            ChildWithInlineAndOptional.__required_keys__,
            frozenset(['inline', 'child']),
        )
        self.assertEqual(
            ChildWithInlineAndOptional.__optional_keys__,
            frozenset(['untotal']),
        )
        self.assertEqual(
            ChildWithInlineAndOptional.__annotations__,
            {'inline': bool, 'untotal': str, 'child': bool},
        )

        class Closed(TypedDict, closed=True):
            __extra_items__: None

        class Unclosed(TypedDict, closed=False):
            ...

        class ChildUnclosed(Closed, Unclosed):
            ...

        self.assertFalse(ChildUnclosed.__closed__)
        self.assertEqual(ChildUnclosed.__extra_items__, type(None))

        class ChildClosed(Unclosed, Closed):
            ...

        self.assertFalse(ChildClosed.__closed__)
        self.assertEqual(ChildClosed.__extra_items__, type(None))

        wrong_bases = [
            (One, Regular),
            (Regular, One),
            (One, Two, Regular),
            (Inline, Regular),
            (Untotal, Regular),
        ]
        for bases in wrong_bases:
            with self.subTest(bases=bases):
                with self.assertRaisesRegex(
                    TypeError,
                    'cannot inherit from both a TypedDict type and a non-TypedDict',
                ):
                    class Wrong(*bases):
                        pass

    def test_is_typeddict(self):
        self.assertIs(is_typeddict(Point2D), True)
        self.assertIs(is_typeddict(Point2Dor3D), True)
        self.assertIs(is_typeddict(Union[str, int]), False)
        # classes, not instances
        self.assertIs(is_typeddict(Point2D()), False)
        call_based = TypedDict('call_based', {'a': int})
        self.assertIs(is_typeddict(call_based), True)
        self.assertIs(is_typeddict(call_based()), False)

        T = TypeVar("T")
        class BarGeneric(TypedDict, Generic[T]):
            a: T
        self.assertIs(is_typeddict(BarGeneric), True)
        self.assertIs(is_typeddict(BarGeneric[int]), False)
        self.assertIs(is_typeddict(BarGeneric()), False)

        if hasattr(typing, "TypeAliasType"):
            ns = {"TypedDict": TypedDict}
            exec("""if True:
                class NewGeneric[T](TypedDict):
                    a: T
            """, ns)
            NewGeneric = ns["NewGeneric"]
            self.assertIs(is_typeddict(NewGeneric), True)
            self.assertIs(is_typeddict(NewGeneric[int]), False)
            self.assertIs(is_typeddict(NewGeneric()), False)

        # The TypedDict constructor is not itself a TypedDict
        self.assertIs(is_typeddict(TypedDict), False)
        if hasattr(typing, "TypedDict"):
            self.assertIs(is_typeddict(typing.TypedDict), False)

    def test_is_typeddict_against_typeddict_from_typing(self):
        Point = typing.TypedDict('Point', {'x': int, 'y': int})

        class PointDict2D(typing.TypedDict):
            x: int
            y: int

        class PointDict3D(PointDict2D, total=False):
            z: int

        assert is_typeddict(Point) is True
        assert is_typeddict(PointDict2D) is True
        assert is_typeddict(PointDict3D) is True

    @skipUnless(HAS_FORWARD_MODULE, "ForwardRef.__forward_module__ was added in 3.9")
    def test_get_type_hints_cross_module_subclass(self):
        self.assertNotIn("_DoNotImport", globals())
        self.assertEqual(
            {k: v.__name__ for k, v in get_type_hints(Bar).items()},
            {'a': "_DoNotImport", 'b': "int"}
        )

    def test_get_type_hints_generic(self):
        self.assertEqual(
            get_type_hints(BarGeneric),
            {'a': typing.Optional[T], 'b': int}
        )

        class FooBarGeneric(BarGeneric[int]):
            c: str

        self.assertEqual(
            get_type_hints(FooBarGeneric),
            {'a': typing.Optional[T], 'b': int, 'c': str}
        )

    @skipUnless(TYPING_3_12_0, "PEP 695 required")
    def test_pep695_generic_typeddict(self):
        ns = {"TypedDict": TypedDict}
        exec("""if True:
            class A[T](TypedDict):
                a: T
            """, ns)
        A = ns["A"]
        T, = A.__type_params__
        self.assertIsInstance(T, TypeVar)
        self.assertEqual(T.__name__, 'T')
        self.assertEqual(A.__bases__, (Generic, dict))
        self.assertEqual(A.__orig_bases__, (TypedDict, Generic[T]))
        self.assertEqual(A.__mro__, (A, Generic, dict, object))
        self.assertEqual(A.__parameters__, (T,))
        self.assertEqual(A[str].__parameters__, ())
        self.assertEqual(A[str].__args__, (str,))

    def test_generic_inheritance(self):
        class A(TypedDict, Generic[T]):
            a: T

        self.assertEqual(A.__bases__, (Generic, dict))
        self.assertEqual(A.__orig_bases__, (TypedDict, Generic[T]))
        self.assertEqual(A.__mro__, (A, Generic, dict, object))
        self.assertEqual(A.__parameters__, (T,))
        self.assertEqual(A[str].__parameters__, ())
        self.assertEqual(A[str].__args__, (str,))

        class A2(Generic[T], TypedDict):
            a: T

        self.assertEqual(A2.__bases__, (Generic, dict))
        self.assertEqual(A2.__orig_bases__, (Generic[T], TypedDict))
        self.assertEqual(A2.__mro__, (A2, Generic, dict, object))
        self.assertEqual(A2.__parameters__, (T,))
        self.assertEqual(A2[str].__parameters__, ())
        self.assertEqual(A2[str].__args__, (str,))

        class B(A[KT], total=False):
            b: KT

        self.assertEqual(B.__bases__, (Generic, dict))
        self.assertEqual(B.__orig_bases__, (A[KT],))
        self.assertEqual(B.__mro__, (B, Generic, dict, object))
        self.assertEqual(B.__parameters__, (KT,))
        self.assertEqual(B.__total__, False)
        self.assertEqual(B.__optional_keys__, frozenset(['b']))
        self.assertEqual(B.__required_keys__, frozenset(['a']))

        self.assertEqual(B[str].__parameters__, ())
        self.assertEqual(B[str].__args__, (str,))
        self.assertEqual(B[str].__origin__, B)

        class C(B[int]):
            c: int

        self.assertEqual(C.__bases__, (Generic, dict))
        self.assertEqual(C.__orig_bases__, (B[int],))
        self.assertEqual(C.__mro__, (C, Generic, dict, object))
        self.assertEqual(C.__parameters__, ())
        self.assertEqual(C.__total__, True)
        self.assertEqual(C.__optional_keys__, frozenset(['b']))
        self.assertEqual(C.__required_keys__, frozenset(['a', 'c']))
        assert C.__annotations__ == {
            'a': T,
            'b': KT,
            'c': int,
        }
        with self.assertRaises(TypeError):
            C[str]

        class Point3D(Point2DGeneric[T], Generic[T, KT]):
            c: KT

        self.assertEqual(Point3D.__bases__, (Generic, dict))
        self.assertEqual(Point3D.__orig_bases__, (Point2DGeneric[T], Generic[T, KT]))
        self.assertEqual(Point3D.__mro__, (Point3D, Generic, dict, object))
        self.assertEqual(Point3D.__parameters__, (T, KT))
        self.assertEqual(Point3D.__total__, True)
        self.assertEqual(Point3D.__optional_keys__, frozenset())
        self.assertEqual(Point3D.__required_keys__, frozenset(['a', 'b', 'c']))
        self.assertEqual(Point3D.__annotations__, {
            'a': T,
            'b': T,
            'c': KT,
        })
        self.assertEqual(Point3D[int, str].__origin__, Point3D)

        with self.assertRaises(TypeError):
            Point3D[int]

        with self.assertRaises(TypeError):
            class Point3D(Point2DGeneric[T], Generic[KT]):
                c: KT

    def test_implicit_any_inheritance(self):
        class A(TypedDict, Generic[T]):
            a: T

        class B(A[KT], total=False):
            b: KT

        class WithImplicitAny(B):
            c: int

        self.assertEqual(WithImplicitAny.__bases__, (Generic, dict,))
        self.assertEqual(WithImplicitAny.__mro__, (WithImplicitAny, Generic, dict, object))
        # Consistent with GenericTests.test_implicit_any
        self.assertEqual(WithImplicitAny.__parameters__, ())
        self.assertEqual(WithImplicitAny.__total__, True)
        self.assertEqual(WithImplicitAny.__optional_keys__, frozenset(['b']))
        self.assertEqual(WithImplicitAny.__required_keys__, frozenset(['a', 'c']))
        assert WithImplicitAny.__annotations__ == {
            'a': T,
            'b': KT,
            'c': int,
        }
        with self.assertRaises(TypeError):
            WithImplicitAny[str]

    @skipUnless(TYPING_3_9_0, "Was changed in 3.9")
    def test_non_generic_subscript(self):
        # For backward compatibility, subscription works
        # on arbitrary TypedDict types.
        # (But we don't attempt to backport this misfeature onto 3.8.)
        class TD(TypedDict):
            a: T
        A = TD[int]
        self.assertEqual(A.__origin__, TD)
        self.assertEqual(A.__parameters__, ())
        self.assertEqual(A.__args__, (int,))
        a = A(a=1)
        self.assertIs(type(a), dict)
        self.assertEqual(a, {'a': 1})

    def test_orig_bases(self):
        T = TypeVar('T')

        class Parent(TypedDict):
            pass

        class Child(Parent):
            pass

        class OtherChild(Parent):
            pass

        class MixedChild(Child, OtherChild, Parent):
            pass

        class GenericParent(TypedDict, Generic[T]):
            pass

        class GenericChild(GenericParent[int]):
            pass

        class OtherGenericChild(GenericParent[str]):
            pass

        class MixedGenericChild(GenericChild, OtherGenericChild, GenericParent[float]):
            pass

        class MultipleGenericBases(GenericParent[int], GenericParent[float]):
            pass

        CallTypedDict = TypedDict('CallTypedDict', {})

        self.assertEqual(Parent.__orig_bases__, (TypedDict,))
        self.assertEqual(Child.__orig_bases__, (Parent,))
        self.assertEqual(OtherChild.__orig_bases__, (Parent,))
        self.assertEqual(MixedChild.__orig_bases__, (Child, OtherChild, Parent,))
        self.assertEqual(GenericParent.__orig_bases__, (TypedDict, Generic[T]))
        self.assertEqual(GenericChild.__orig_bases__, (GenericParent[int],))
        self.assertEqual(OtherGenericChild.__orig_bases__, (GenericParent[str],))
        self.assertEqual(MixedGenericChild.__orig_bases__, (GenericChild, OtherGenericChild, GenericParent[float]))
        self.assertEqual(MultipleGenericBases.__orig_bases__, (GenericParent[int], GenericParent[float]))
        self.assertEqual(CallTypedDict.__orig_bases__, (TypedDict,))

    def test_zero_fields_typeddicts(self):
        T1 = TypedDict("T1", {})
        class T2(TypedDict): pass
        try:
            ns = {"TypedDict": TypedDict}
            exec("class T3[tvar](TypedDict): pass", ns)
            T3 = ns["T3"]
        except SyntaxError:
            class T3(TypedDict): pass
        S = TypeVar("S")
        class T4(TypedDict, Generic[S]): pass

        expected_warning = re.escape(
            "Failing to pass a value for the 'fields' parameter is deprecated "
            "and will be disallowed in Python 3.15. "
            "To create a TypedDict class with 0 fields "
            "using the functional syntax, "
            "pass an empty dictionary, e.g. `T5 = TypedDict('T5', {})`."
        )
        with self.assertWarnsRegex(DeprecationWarning, fr"^{expected_warning}$"):
            T5 = TypedDict('T5')

        expected_warning = re.escape(
            "Passing `None` as the 'fields' parameter is deprecated "
            "and will be disallowed in Python 3.15. "
            "To create a TypedDict class with 0 fields "
            "using the functional syntax, "
            "pass an empty dictionary, e.g. `T6 = TypedDict('T6', {})`."
        )
        with self.assertWarnsRegex(DeprecationWarning, fr"^{expected_warning}$"):
            T6 = TypedDict('T6', None)

        for klass in T1, T2, T3, T4, T5, T6:
            with self.subTest(klass=klass.__name__):
                self.assertEqual(klass.__annotations__, {})
                self.assertEqual(klass.__required_keys__, set())
                self.assertEqual(klass.__optional_keys__, set())
                self.assertIsInstance(klass(), dict)

    def test_readonly_inheritance(self):
        class Base1(TypedDict):
            a: ReadOnly[int]

        class Child1(Base1):
            b: str

        self.assertEqual(Child1.__readonly_keys__, frozenset({'a'}))
        self.assertEqual(Child1.__mutable_keys__, frozenset({'b'}))

        class Base2(TypedDict):
            a: ReadOnly[int]

        class Child2(Base2):
            b: str

        self.assertEqual(Child1.__readonly_keys__, frozenset({'a'}))
        self.assertEqual(Child1.__mutable_keys__, frozenset({'b'}))

    def test_make_mutable_key_readonly(self):
        class Base(TypedDict):
            a: int

        self.assertEqual(Base.__readonly_keys__, frozenset())
        self.assertEqual(Base.__mutable_keys__, frozenset({'a'}))

        class Child(Base):
            a: ReadOnly[int]  # type checker error, but allowed at runtime

        self.assertEqual(Child.__readonly_keys__, frozenset({'a'}))
        self.assertEqual(Child.__mutable_keys__, frozenset())

    def test_can_make_readonly_key_mutable(self):
        class Base(TypedDict):
            a: ReadOnly[int]

        class Child(Base):
            a: int

        self.assertEqual(Child.__readonly_keys__, frozenset())
        self.assertEqual(Child.__mutable_keys__, frozenset({'a'}))

    def test_combine_qualifiers(self):
        class AllTheThings(TypedDict):
            a: Annotated[Required[ReadOnly[int]], "why not"]
            b: Required[Annotated[ReadOnly[int], "why not"]]
            c: ReadOnly[NotRequired[Annotated[int, "why not"]]]
            d: NotRequired[Annotated[int, "why not"]]

        self.assertEqual(AllTheThings.__required_keys__, frozenset({'a', 'b'}))
        self.assertEqual(AllTheThings.__optional_keys__, frozenset({'c', 'd'}))
        self.assertEqual(AllTheThings.__readonly_keys__, frozenset({'a', 'b', 'c'}))
        self.assertEqual(AllTheThings.__mutable_keys__, frozenset({'d'}))

        self.assertEqual(
            get_type_hints(AllTheThings, include_extras=False),
            {'a': int, 'b': int, 'c': int, 'd': int},
        )
        self.assertEqual(
            get_type_hints(AllTheThings, include_extras=True),
            {
                'a': Annotated[Required[ReadOnly[int]], 'why not'],
                'b': Required[Annotated[ReadOnly[int], 'why not']],
                'c': ReadOnly[NotRequired[Annotated[int, 'why not']]],
                'd': NotRequired[Annotated[int, 'why not']],
            },
        )

    def test_extra_keys_non_readonly(self):
        class Base(TypedDict, closed=True):
            __extra_items__: str

        class Child(Base):
            a: NotRequired[int]

        self.assertEqual(Child.__required_keys__, frozenset({}))
        self.assertEqual(Child.__optional_keys__, frozenset({'a'}))
        self.assertEqual(Child.__readonly_keys__, frozenset({}))
        self.assertEqual(Child.__mutable_keys__, frozenset({'a'}))

    def test_extra_keys_readonly(self):
        class Base(TypedDict, closed=True):
            __extra_items__: ReadOnly[str]

        class Child(Base):
            a: NotRequired[str]

        self.assertEqual(Child.__required_keys__, frozenset({}))
        self.assertEqual(Child.__optional_keys__, frozenset({'a'}))
        self.assertEqual(Child.__readonly_keys__, frozenset({}))
        self.assertEqual(Child.__mutable_keys__, frozenset({'a'}))

    def test_extra_key_required(self):
        with self.assertRaisesRegex(
            TypeError,
            "Special key __extra_items__ does not support Required"
        ):
            TypedDict("A", {"__extra_items__": Required[int]}, closed=True)

        with self.assertRaisesRegex(
            TypeError,
            "Special key __extra_items__ does not support NotRequired"
        ):
            TypedDict("A", {"__extra_items__": NotRequired[int]}, closed=True)

    def test_regular_extra_items(self):
        class ExtraReadOnly(TypedDict):
            __extra_items__: ReadOnly[str]

        self.assertEqual(ExtraReadOnly.__required_keys__, frozenset({'__extra_items__'}))
        self.assertEqual(ExtraReadOnly.__optional_keys__, frozenset({}))
        self.assertEqual(ExtraReadOnly.__readonly_keys__, frozenset({'__extra_items__'}))
        self.assertEqual(ExtraReadOnly.__mutable_keys__, frozenset({}))
        self.assertEqual(ExtraReadOnly.__extra_items__, None)
        self.assertFalse(ExtraReadOnly.__closed__)

        class ExtraRequired(TypedDict):
            __extra_items__: Required[str]

        self.assertEqual(ExtraRequired.__required_keys__, frozenset({'__extra_items__'}))
        self.assertEqual(ExtraRequired.__optional_keys__, frozenset({}))
        self.assertEqual(ExtraRequired.__readonly_keys__, frozenset({}))
        self.assertEqual(ExtraRequired.__mutable_keys__, frozenset({'__extra_items__'}))
        self.assertEqual(ExtraRequired.__extra_items__, None)
        self.assertFalse(ExtraRequired.__closed__)

        class ExtraNotRequired(TypedDict):
            __extra_items__: NotRequired[str]

        self.assertEqual(ExtraNotRequired.__required_keys__, frozenset({}))
        self.assertEqual(ExtraNotRequired.__optional_keys__, frozenset({'__extra_items__'}))
        self.assertEqual(ExtraNotRequired.__readonly_keys__, frozenset({}))
        self.assertEqual(ExtraNotRequired.__mutable_keys__, frozenset({'__extra_items__'}))
        self.assertEqual(ExtraNotRequired.__extra_items__, None)
        self.assertFalse(ExtraNotRequired.__closed__)

    def test_closed_inheritance(self):
        class Base(TypedDict, closed=True):
            __extra_items__: ReadOnly[Union[str, None]]

        self.assertEqual(Base.__required_keys__, frozenset({}))
        self.assertEqual(Base.__optional_keys__, frozenset({}))
        self.assertEqual(Base.__readonly_keys__, frozenset({}))
        self.assertEqual(Base.__mutable_keys__, frozenset({}))
        self.assertEqual(Base.__annotations__, {})
        self.assertEqual(Base.__extra_items__, ReadOnly[Union[str, None]])
        self.assertTrue(Base.__closed__)

        class Child(Base):
            a: int
            __extra_items__: int

        self.assertEqual(Child.__required_keys__, frozenset({'a', "__extra_items__"}))
        self.assertEqual(Child.__optional_keys__, frozenset({}))
        self.assertEqual(Child.__readonly_keys__, frozenset({}))
        self.assertEqual(Child.__mutable_keys__, frozenset({'a', "__extra_items__"}))
        self.assertEqual(Child.__annotations__, {"__extra_items__": int, "a": int})
        self.assertEqual(Child.__extra_items__, ReadOnly[Union[str, None]])
        self.assertFalse(Child.__closed__)

        class GrandChild(Child, closed=True):
            __extra_items__: str

        self.assertEqual(GrandChild.__required_keys__, frozenset({'a', "__extra_items__"}))
        self.assertEqual(GrandChild.__optional_keys__, frozenset({}))
        self.assertEqual(GrandChild.__readonly_keys__, frozenset({}))
        self.assertEqual(GrandChild.__mutable_keys__, frozenset({'a', "__extra_items__"}))
        self.assertEqual(GrandChild.__annotations__, {"__extra_items__": int, "a": int})
        self.assertEqual(GrandChild.__extra_items__, str)
        self.assertTrue(GrandChild.__closed__)

    def test_implicit_extra_items(self):
        class Base(TypedDict):
            a: int

        self.assertEqual(Base.__extra_items__, None)
        self.assertFalse(Base.__closed__)

        class ChildA(Base, closed=True):
            ...

        self.assertEqual(ChildA.__extra_items__, Never)
        self.assertTrue(ChildA.__closed__)

        class ChildB(Base, closed=True):
            __extra_items__: None

        self.assertEqual(ChildB.__extra_items__, type(None))
        self.assertTrue(ChildB.__closed__)

    @skipIf(
        TYPING_3_13_0,
        "The keyword argument alternative to define a "
        "TypedDict type using the functional syntax is no longer supported"
    )
    def test_backwards_compatibility(self):
        with self.assertWarns(DeprecationWarning):
            TD = TypedDict("TD", closed=int)
        self.assertFalse(TD.__closed__)
        self.assertEqual(TD.__annotations__, {"closed": int})


class AnnotatedTests(BaseTestCase):

    def test_repr(self):
        if hasattr(typing, 'Annotated'):
            mod_name = 'typing'
        else:
            mod_name = "typing_extensions"
        self.assertEqual(
            repr(Annotated[int, 4, 5]),
            mod_name + ".Annotated[int, 4, 5]"
        )
        self.assertEqual(
            repr(Annotated[List[int], 4, 5]),
            mod_name + ".Annotated[typing.List[int], 4, 5]"
        )

    def test_flatten(self):
        A = Annotated[Annotated[int, 4], 5]
        self.assertEqual(A, Annotated[int, 4, 5])
        self.assertEqual(A.__metadata__, (4, 5))
        self.assertEqual(A.__origin__, int)

    def test_specialize(self):
        L = Annotated[List[T], "my decoration"]
        LI = Annotated[List[int], "my decoration"]
        self.assertEqual(L[int], Annotated[List[int], "my decoration"])
        self.assertEqual(L[int].__metadata__, ("my decoration",))
        self.assertEqual(L[int].__origin__, List[int])
        with self.assertRaises(TypeError):
            LI[int]
        with self.assertRaises(TypeError):
            L[int, float]

    def test_hash_eq(self):
        self.assertEqual(len({Annotated[int, 4, 5], Annotated[int, 4, 5]}), 1)
        self.assertNotEqual(Annotated[int, 4, 5], Annotated[int, 5, 4])
        self.assertNotEqual(Annotated[int, 4, 5], Annotated[str, 4, 5])
        self.assertNotEqual(Annotated[int, 4], Annotated[int, 4, 4])
        self.assertEqual(
            {Annotated[int, 4, 5], Annotated[int, 4, 5], Annotated[T, 4, 5]},
            {Annotated[int, 4, 5], Annotated[T, 4, 5]}
        )

    def test_instantiate(self):
        class C:
            classvar = 4

            def __init__(self, x):
                self.x = x

            def __eq__(self, other):
                if not isinstance(other, C):
                    return NotImplemented
                return other.x == self.x

        A = Annotated[C, "a decoration"]
        a = A(5)
        c = C(5)
        self.assertEqual(a, c)
        self.assertEqual(a.x, c.x)
        self.assertEqual(a.classvar, c.classvar)

    def test_instantiate_generic(self):
        MyCount = Annotated[typing_extensions.Counter[T], "my decoration"]
        self.assertEqual(MyCount([4, 4, 5]), {4: 2, 5: 1})
        self.assertEqual(MyCount[int]([4, 4, 5]), {4: 2, 5: 1})

    def test_cannot_instantiate_forward(self):
        A = Annotated["int", (5, 6)]
        with self.assertRaises(TypeError):
            A(5)

    def test_cannot_instantiate_type_var(self):
        A = Annotated[T, (5, 6)]
        with self.assertRaises(TypeError):
            A(5)

    def test_cannot_getattr_typevar(self):
        with self.assertRaises(AttributeError):
            Annotated[T, (5, 7)].x

    def test_attr_passthrough(self):
        class C:
            classvar = 4

        A = Annotated[C, "a decoration"]
        self.assertEqual(A.classvar, 4)
        A.x = 5
        self.assertEqual(C.x, 5)

    @skipIf(sys.version_info[:2] in ((3, 9), (3, 10)), "Waiting for bpo-46491 bugfix.")
    def test_special_form_containment(self):
        class C:
            classvar: Annotated[ClassVar[int], "a decoration"] = 4
            const: Annotated[Final[int], "Const"] = 4

        self.assertEqual(get_type_hints(C, globals())["classvar"], ClassVar[int])
        self.assertEqual(get_type_hints(C, globals())["const"], Final[int])

    def test_cannot_subclass(self):
        with self.assertRaisesRegex(TypeError, "Cannot subclass .*Annotated"):
            class C(Annotated):
                pass

    def test_cannot_check_instance(self):
        with self.assertRaises(TypeError):
            isinstance(5, Annotated[int, "positive"])

    def test_cannot_check_subclass(self):
        with self.assertRaises(TypeError):
            issubclass(int, Annotated[int, "positive"])

    def test_pickle(self):
        samples = [typing.Any, typing.Union[int, str],
                   typing.Optional[str], Tuple[int, ...],
                   typing.Callable[[str], bytes],
                   Self, LiteralString, Never]

        for t in samples:
            x = Annotated[t, "a"]

            for prot in range(pickle.HIGHEST_PROTOCOL + 1):
                with self.subTest(protocol=prot, type=t):
                    pickled = pickle.dumps(x, prot)
                    restored = pickle.loads(pickled)
                    self.assertEqual(x, restored)

        global _Annotated_test_G

        class _Annotated_test_G(Generic[T]):
            x = 1

        G = Annotated[_Annotated_test_G[int], "A decoration"]
        G.foo = 42
        G.bar = 'abc'

        for proto in range(pickle.HIGHEST_PROTOCOL + 1):
            z = pickle.dumps(G, proto)
            x = pickle.loads(z)
            self.assertEqual(x.foo, 42)
            self.assertEqual(x.bar, 'abc')
            self.assertEqual(x.x, 1)

    def test_subst(self):
        dec = "a decoration"
        dec2 = "another decoration"

        S = Annotated[T, dec2]
        self.assertEqual(S[int], Annotated[int, dec2])

        self.assertEqual(S[Annotated[int, dec]], Annotated[int, dec, dec2])
        L = Annotated[List[T], dec]

        self.assertEqual(L[int], Annotated[List[int], dec])
        with self.assertRaises(TypeError):
            L[int, int]

        self.assertEqual(S[L[int]], Annotated[List[int], dec, dec2])

        D = Annotated[Dict[KT, VT], dec]
        self.assertEqual(D[str, int], Annotated[Dict[str, int], dec])
        with self.assertRaises(TypeError):
            D[int]

        It = Annotated[int, dec]
        with self.assertRaises(TypeError):
            It[None]

        LI = L[int]
        with self.assertRaises(TypeError):
            LI[None]

    def test_annotated_in_other_types(self):
        X = List[Annotated[T, 5]]
        self.assertEqual(X[int], List[Annotated[int, 5]])

    def test_nested_annotated_with_unhashable_metadata(self):
        X = Annotated[
            List[Annotated[str, {"unhashable_metadata"}]],
            "metadata"
        ]
        self.assertEqual(X.__origin__, List[Annotated[str, {"unhashable_metadata"}]])
        self.assertEqual(X.__metadata__, ("metadata",))


class GetTypeHintsTests(BaseTestCase):
    def test_get_type_hints(self):
        def foobar(x: List['X']): ...
        X = Annotated[int, (1, 10)]
        self.assertEqual(
            get_type_hints(foobar, globals(), locals()),
            {'x': List[int]}
        )
        self.assertEqual(
            get_type_hints(foobar, globals(), locals(), include_extras=True),
            {'x': List[Annotated[int, (1, 10)]]}
        )
        BA = Tuple[Annotated[T, (1, 0)], ...]
        def barfoo(x: BA): ...
        self.assertEqual(get_type_hints(barfoo, globals(), locals())['x'], Tuple[T, ...])
        self.assertIs(
            get_type_hints(barfoo, globals(), locals(), include_extras=True)['x'],
            BA
        )
        def barfoo2(x: typing.Callable[..., Annotated[List[T], "const"]],
                    y: typing.Union[int, Annotated[T, "mutable"]]): ...
        self.assertEqual(
            get_type_hints(barfoo2, globals(), locals()),
            {'x': typing.Callable[..., List[T]], 'y': typing.Union[int, T]}
        )
        BA2 = typing.Callable[..., List[T]]
        def barfoo3(x: BA2): ...
        self.assertIs(
            get_type_hints(barfoo3, globals(), locals(), include_extras=True)["x"],
            BA2
        )

    def test_get_type_hints_refs(self):

        Const = Annotated[T, "Const"]

        class MySet(Generic[T]):

            def __ior__(self, other: "Const[MySet[T]]") -> "MySet[T]":
                ...

            def __iand__(self, other: Const["MySet[T]"]) -> "MySet[T]":
                ...

        self.assertEqual(
            get_type_hints(MySet.__iand__, globals(), locals()),
            {'other': MySet[T], 'return': MySet[T]}
        )

        self.assertEqual(
            get_type_hints(MySet.__iand__, globals(), locals(), include_extras=True),
            {'other': Const[MySet[T]], 'return': MySet[T]}
        )

        self.assertEqual(
            get_type_hints(MySet.__ior__, globals(), locals()),
            {'other': MySet[T], 'return': MySet[T]}
        )

    def test_get_type_hints_typeddict(self):
        assert get_type_hints(TotalMovie) == {'title': str, 'year': int}
        assert get_type_hints(TotalMovie, include_extras=True) == {
            'title': str,
            'year': NotRequired[int],
        }

        assert get_type_hints(AnnotatedMovie) == {'title': str, 'year': int}
        assert get_type_hints(AnnotatedMovie, include_extras=True) == {
            'title': Annotated[Required[str], "foobar"],
            'year': NotRequired[Annotated[int, 2000]],
        }

    def test_orig_bases(self):
        T = TypeVar('T')

        class Parent(TypedDict):
            pass

        class Child(Parent):
            pass

        class OtherChild(Parent):
            pass

        class MixedChild(Child, OtherChild, Parent):
            pass

        class GenericParent(TypedDict, Generic[T]):
            pass

        class GenericChild(GenericParent[int]):
            pass

        class OtherGenericChild(GenericParent[str]):
            pass

        class MixedGenericChild(GenericChild, OtherGenericChild, GenericParent[float]):
            pass

        class MultipleGenericBases(GenericParent[int], GenericParent[float]):
            pass

        CallTypedDict = TypedDict('CallTypedDict', {})

        self.assertEqual(Parent.__orig_bases__, (TypedDict,))
        self.assertEqual(Child.__orig_bases__, (Parent,))
        self.assertEqual(OtherChild.__orig_bases__, (Parent,))
        self.assertEqual(MixedChild.__orig_bases__, (Child, OtherChild, Parent,))
        self.assertEqual(GenericParent.__orig_bases__, (TypedDict, Generic[T]))
        self.assertEqual(GenericChild.__orig_bases__, (GenericParent[int],))
        self.assertEqual(OtherGenericChild.__orig_bases__, (GenericParent[str],))
        self.assertEqual(MixedGenericChild.__orig_bases__, (GenericChild, OtherGenericChild, GenericParent[float]))
        self.assertEqual(MultipleGenericBases.__orig_bases__, (GenericParent[int], GenericParent[float]))
        self.assertEqual(CallTypedDict.__orig_bases__, (TypedDict,))


class TypeAliasTests(BaseTestCase):
    def test_canonical_usage_with_variable_annotation(self):
        ns = {}
        exec('Alias: TypeAlias = Employee', globals(), ns)

    def test_canonical_usage_with_type_comment(self):
        Alias: TypeAlias = Employee  # noqa: F841

    def test_cannot_instantiate(self):
        with self.assertRaises(TypeError):
            TypeAlias()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(42, TypeAlias)

    def test_no_issubclass(self):
        with self.assertRaises(TypeError):
            issubclass(Employee, TypeAlias)

        with self.assertRaises(TypeError):
            issubclass(TypeAlias, Employee)

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(TypeAlias):
                pass

        with self.assertRaises(TypeError):
            class D(type(TypeAlias)):
                pass

    def test_repr(self):
        if hasattr(typing, 'TypeAlias'):
            self.assertEqual(repr(TypeAlias), 'typing.TypeAlias')
        else:
            self.assertEqual(repr(TypeAlias), 'typing_extensions.TypeAlias')

    def test_cannot_subscript(self):
        with self.assertRaises(TypeError):
            TypeAlias[int]

class ParamSpecTests(BaseTestCase):

    def test_basic_plain(self):
        P = ParamSpec('P')
        self.assertEqual(P, P)
        self.assertIsInstance(P, ParamSpec)
        self.assertEqual(P.__name__, 'P')
        # Should be hashable
        hash(P)

    def test_repr(self):
        P = ParamSpec('P')
        P_co = ParamSpec('P_co', covariant=True)
        P_contra = ParamSpec('P_contra', contravariant=True)
        P_infer = ParamSpec('P_infer', infer_variance=True)
        P_2 = ParamSpec('P_2')
        self.assertEqual(repr(P), '~P')
        self.assertEqual(repr(P_2), '~P_2')

        # Note: PEP 612 doesn't require these to be repr-ed correctly, but
        # just follow CPython.
        self.assertEqual(repr(P_co), '+P_co')
        self.assertEqual(repr(P_contra), '-P_contra')
        # On other versions we use typing.ParamSpec, but it is not aware of
        # infer_variance=. Not worth creating our own version of ParamSpec
        # for this.
        if hasattr(typing, 'TypeAliasType') or not hasattr(typing, 'ParamSpec'):
            self.assertEqual(repr(P_infer), 'P_infer')
        else:
            self.assertEqual(repr(P_infer), '~P_infer')

    def test_variance(self):
        P_co = ParamSpec('P_co', covariant=True)
        P_contra = ParamSpec('P_contra', contravariant=True)
        P_infer = ParamSpec('P_infer', infer_variance=True)

        self.assertIs(P_co.__covariant__, True)
        self.assertIs(P_co.__contravariant__, False)
        self.assertIs(P_co.__infer_variance__, False)

        self.assertIs(P_contra.__covariant__, False)
        self.assertIs(P_contra.__contravariant__, True)
        self.assertIs(P_contra.__infer_variance__, False)

        self.assertIs(P_infer.__covariant__, False)
        self.assertIs(P_infer.__contravariant__, False)
        self.assertIs(P_infer.__infer_variance__, True)

    def test_valid_uses(self):
        P = ParamSpec('P')
        T = TypeVar('T')
        C1 = typing.Callable[P, int]
        self.assertEqual(C1.__args__, (P, int))
        self.assertEqual(C1.__parameters__, (P,))
        C2 = typing.Callable[P, T]
        self.assertEqual(C2.__args__, (P, T))
        self.assertEqual(C2.__parameters__, (P, T))

        # Test collections.abc.Callable too.
        if sys.version_info[:2] >= (3, 9):
            # Note: no tests for Callable.__parameters__ here
            # because types.GenericAlias Callable is hardcoded to search
            # for tp_name "TypeVar" in C.  This was changed in 3.10.
            C3 = collections.abc.Callable[P, int]
            self.assertEqual(C3.__args__, (P, int))
            C4 = collections.abc.Callable[P, T]
            self.assertEqual(C4.__args__, (P, T))

        # ParamSpec instances should also have args and kwargs attributes.
        # Note: not in dir(P) because of __class__ hacks
        self.assertTrue(hasattr(P, 'args'))
        self.assertTrue(hasattr(P, 'kwargs'))

    @skipIf((3, 10, 0) <= sys.version_info[:3] <= (3, 10, 2), "Needs bpo-46676.")
    def test_args_kwargs(self):
        P = ParamSpec('P')
        P_2 = ParamSpec('P_2')
        # Note: not in dir(P) because of __class__ hacks
        self.assertTrue(hasattr(P, 'args'))
        self.assertTrue(hasattr(P, 'kwargs'))
        self.assertIsInstance(P.args, ParamSpecArgs)
        self.assertIsInstance(P.kwargs, ParamSpecKwargs)
        self.assertIs(P.args.__origin__, P)
        self.assertIs(P.kwargs.__origin__, P)
        self.assertEqual(P.args, P.args)
        self.assertEqual(P.kwargs, P.kwargs)
        self.assertNotEqual(P.args, P_2.args)
        self.assertNotEqual(P.kwargs, P_2.kwargs)
        self.assertNotEqual(P.args, P.kwargs)
        self.assertNotEqual(P.kwargs, P.args)
        self.assertNotEqual(P.args, P_2.kwargs)
        self.assertEqual(repr(P.args), "P.args")
        self.assertEqual(repr(P.kwargs), "P.kwargs")

    def test_user_generics(self):
        T = TypeVar("T")
        P = ParamSpec("P")
        P_2 = ParamSpec("P_2")

        class X(Generic[T, P]):
            pass

        class Y(Protocol[T, P]):
            pass

        for klass in X, Y:
            with self.subTest(klass=klass.__name__):
                G1 = klass[int, P_2]
                self.assertEqual(G1.__args__, (int, P_2))
                self.assertEqual(G1.__parameters__, (P_2,))

                G2 = klass[int, Concatenate[int, P_2]]
                self.assertEqual(G2.__args__, (int, Concatenate[int, P_2]))
                self.assertEqual(G2.__parameters__, (P_2,))

        # The following are some valid uses cases in PEP 612 that don't work:
        # These do not work in 3.9, _type_check blocks the list and ellipsis.
        # G3 = X[int, [int, bool]]
        # G4 = X[int, ...]
        # G5 = Z[[int, str, bool]]
        # Not working because this is special-cased in 3.10.
        # G6 = Z[int, str, bool]

        class Z(Generic[P]):
            pass

        class ProtoZ(Protocol[P]):
            pass

    def test_pickle(self):
        global P, P_co, P_contra, P_default
        P = ParamSpec('P')
        P_co = ParamSpec('P_co', covariant=True)
        P_contra = ParamSpec('P_contra', contravariant=True)
        P_default = ParamSpec('P_default', default=[int])
        for proto in range(pickle.HIGHEST_PROTOCOL):
            with self.subTest(f'Pickle protocol {proto}'):
                for paramspec in (P, P_co, P_contra, P_default):
                    z = pickle.loads(pickle.dumps(paramspec, proto))
                    self.assertEqual(z.__name__, paramspec.__name__)
                    self.assertEqual(z.__covariant__, paramspec.__covariant__)
                    self.assertEqual(z.__contravariant__, paramspec.__contravariant__)
                    self.assertEqual(z.__bound__, paramspec.__bound__)
                    self.assertEqual(z.__default__, paramspec.__default__)

    def test_eq(self):
        P = ParamSpec('P')
        self.assertEqual(P, P)
        self.assertEqual(hash(P), hash(P))
        # ParamSpec should compare by id similar to TypeVar in CPython
        self.assertNotEqual(ParamSpec('P'), P)
        self.assertIsNot(ParamSpec('P'), P)
        # Note: normally you don't test this as it breaks when there's
        # a hash collision. However, ParamSpec *must* guarantee that
        # as long as two objects don't have the same ID, their hashes
        # won't be the same.
        self.assertNotEqual(hash(ParamSpec('P')), hash(P))

    def test_isinstance_results_unaffected_by_presence_of_tracing_function(self):
        # See https://github.com/python/typing_extensions/issues/318

        code = textwrap.dedent(
            """\
            import sys, typing

            def trace_call(*args):
                return trace_call

            def run():
                sys.modules.pop("typing_extensions", None)
                from typing_extensions import ParamSpec
                return isinstance(ParamSpec("P"), typing.TypeVar)

            isinstance_result_1 = run()
            sys.setprofile(trace_call)
            isinstance_result_2 = run()
            sys.stdout.write(f"{isinstance_result_1} {isinstance_result_2}")
            """
        )

        # Run this in an isolated process or it pollutes the environment
        # and makes other tests fail:
        try:
            proc = subprocess.run(
                [sys.executable, "-c", code], check=True, capture_output=True, text=True,
            )
        except subprocess.CalledProcessError as exc:
            print("stdout", exc.stdout, sep="\n")
            print("stderr", exc.stderr, sep="\n")
            raise

        # Sanity checks that assert the test is working as expected
        self.assertIsInstance(proc.stdout, str)
        result1, result2 = proc.stdout.split(" ")
        self.assertIn(result1, {"True", "False"})
        self.assertIn(result2, {"True", "False"})

        # The actual test:
        self.assertEqual(result1, result2)


class ConcatenateTests(BaseTestCase):
    def test_basics(self):
        P = ParamSpec('P')

        class MyClass: ...

        c = Concatenate[MyClass, P]
        self.assertNotEqual(c, Concatenate)

    def test_valid_uses(self):
        P = ParamSpec('P')
        T = TypeVar('T')

        C1 = Callable[Concatenate[int, P], int]
        C2 = Callable[Concatenate[int, T, P], T]
        self.assertEqual(C1.__origin__, C2.__origin__)
        self.assertNotEqual(C1, C2)

        # Test collections.abc.Callable too.
        if sys.version_info[:2] >= (3, 9):
            C3 = collections.abc.Callable[Concatenate[int, P], int]
            C4 = collections.abc.Callable[Concatenate[int, T, P], T]
            self.assertEqual(C3.__origin__, C4.__origin__)
            self.assertNotEqual(C3, C4)

    def test_invalid_uses(self):
        P = ParamSpec('P')
        T = TypeVar('T')

        with self.assertRaisesRegex(
            TypeError,
            'Cannot take a Concatenate of no types',
        ):
            Concatenate[()]

        with self.assertRaisesRegex(
            TypeError,
            'The last parameter to Concatenate should be a ParamSpec variable',
        ):
            Concatenate[P, T]

        if not TYPING_3_11_0:
            with self.assertRaisesRegex(
                TypeError,
                'each arg must be a type',
            ):
                Concatenate[1, P]

    def test_basic_introspection(self):
        P = ParamSpec('P')
        C1 = Concatenate[int, P]
        C2 = Concatenate[int, T, P]
        self.assertEqual(C1.__origin__, Concatenate)
        self.assertEqual(C1.__args__, (int, P))
        self.assertEqual(C2.__origin__, Concatenate)
        self.assertEqual(C2.__args__, (int, T, P))

    def test_eq(self):
        P = ParamSpec('P')
        C1 = Concatenate[int, P]
        C2 = Concatenate[int, P]
        C3 = Concatenate[int, T, P]
        self.assertEqual(C1, C2)
        self.assertEqual(hash(C1), hash(C2))
        self.assertNotEqual(C1, C3)


class TypeGuardTests(BaseTestCase):
    def test_basics(self):
        TypeGuard[int]  # OK
        self.assertEqual(TypeGuard[int], TypeGuard[int])

        def foo(arg) -> TypeGuard[int]: ...
        self.assertEqual(gth(foo), {'return': TypeGuard[int]})

    def test_repr(self):
        if hasattr(typing, 'TypeGuard'):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(TypeGuard), f'{mod_name}.TypeGuard')
        cv = TypeGuard[int]
        self.assertEqual(repr(cv), f'{mod_name}.TypeGuard[int]')
        cv = TypeGuard[Employee]
        self.assertEqual(repr(cv), f'{mod_name}.TypeGuard[{__name__}.Employee]')
        cv = TypeGuard[Tuple[int]]
        self.assertEqual(repr(cv), f'{mod_name}.TypeGuard[typing.Tuple[int]]')

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(TypeGuard)):
                pass
        with self.assertRaises(TypeError):
            class D(type(TypeGuard[int])):
                pass

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            TypeGuard()
        with self.assertRaises(TypeError):
            type(TypeGuard)()
        with self.assertRaises(TypeError):
            type(TypeGuard[Optional[int]])()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, TypeGuard[int])
        with self.assertRaises(TypeError):
            issubclass(int, TypeGuard)


class TypeIsTests(BaseTestCase):
    def test_basics(self):
        TypeIs[int]  # OK
        self.assertEqual(TypeIs[int], TypeIs[int])

        def foo(arg) -> TypeIs[int]: ...
        self.assertEqual(gth(foo), {'return': TypeIs[int]})

    def test_repr(self):
        if hasattr(typing, 'TypeIs'):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(TypeIs), f'{mod_name}.TypeIs')
        cv = TypeIs[int]
        self.assertEqual(repr(cv), f'{mod_name}.TypeIs[int]')
        cv = TypeIs[Employee]
        self.assertEqual(repr(cv), f'{mod_name}.TypeIs[{__name__}.Employee]')
        cv = TypeIs[Tuple[int]]
        self.assertEqual(repr(cv), f'{mod_name}.TypeIs[typing.Tuple[int]]')

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(TypeIs)):
                pass
        with self.assertRaises(TypeError):
            class D(type(TypeIs[int])):
                pass

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            TypeIs()
        with self.assertRaises(TypeError):
            type(TypeIs)()
        with self.assertRaises(TypeError):
            type(TypeIs[Optional[int]])()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, TypeIs[int])
        with self.assertRaises(TypeError):
            issubclass(int, TypeIs)


class TypeExprTests(BaseTestCase):
    def test_basics(self):
        TypeExpr[int]  # OK
        self.assertEqual(TypeExpr[int], TypeExpr[int])

        def foo(arg) -> TypeExpr[int]: ...
        self.assertEqual(gth(foo), {'return': TypeExpr[int]})

    def test_repr(self):
        if hasattr(typing, 'TypeExpr'):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(TypeExpr), f'{mod_name}.TypeExpr')
        cv = TypeExpr[int]
        self.assertEqual(repr(cv), f'{mod_name}.TypeExpr[int]')
        cv = TypeExpr[Employee]
        self.assertEqual(repr(cv), f'{mod_name}.TypeExpr[{__name__}.Employee]')
        cv = TypeExpr[Tuple[int]]
        self.assertEqual(repr(cv), f'{mod_name}.TypeExpr[typing.Tuple[int]]')

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(TypeExpr)):
                pass
        with self.assertRaises(TypeError):
            class D(type(TypeExpr[int])):
                pass

    def test_call(self):
        objs = [
            1,
            "int",
            int,
            Tuple[int, str],
        ]
        for obj in objs:
            with self.subTest(obj=obj):
                self.assertIs(TypeExpr(obj), obj)

        with self.assertRaises(TypeError):
            TypeExpr()
        with self.assertRaises(TypeError):
            TypeExpr("too", "many")

    def test_cannot_init_type(self):
        with self.assertRaises(TypeError):
            type(TypeExpr)()
        with self.assertRaises(TypeError):
            type(TypeExpr[Optional[int]])()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, TypeExpr[int])
        with self.assertRaises(TypeError):
            issubclass(int, TypeExpr)


class LiteralStringTests(BaseTestCase):
    def test_basics(self):
        class Foo:
            def bar(self) -> LiteralString: ...
            def baz(self) -> "LiteralString": ...

        self.assertEqual(gth(Foo.bar), {'return': LiteralString})
        self.assertEqual(gth(Foo.baz), {'return': LiteralString})

    def test_get_origin(self):
        self.assertIsNone(get_origin(LiteralString))

    def test_repr(self):
        if hasattr(typing, 'LiteralString'):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(LiteralString), f'{mod_name}.LiteralString')

    def test_cannot_subscript(self):
        with self.assertRaises(TypeError):
            LiteralString[int]

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(LiteralString)):
                pass
        with self.assertRaises(TypeError):
            class D(LiteralString):
                pass

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            LiteralString()
        with self.assertRaises(TypeError):
            type(LiteralString)()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, LiteralString)
        with self.assertRaises(TypeError):
            issubclass(int, LiteralString)

    def test_alias(self):
        StringTuple = Tuple[LiteralString, LiteralString]
        class Alias:
            def return_tuple(self) -> StringTuple:
                return ("foo", "pep" + "675")

    def test_typevar(self):
        StrT = TypeVar("StrT", bound=LiteralString)
        self.assertIs(StrT.__bound__, LiteralString)

    def test_pickle(self):
        for proto in range(pickle.HIGHEST_PROTOCOL):
            pickled = pickle.dumps(LiteralString, protocol=proto)
            self.assertIs(LiteralString, pickle.loads(pickled))


class SelfTests(BaseTestCase):
    def test_basics(self):
        class Foo:
            def bar(self) -> Self: ...

        self.assertEqual(gth(Foo.bar), {'return': Self})

    def test_repr(self):
        if hasattr(typing, 'Self'):
            mod_name = 'typing'
        else:
            mod_name = 'typing_extensions'
        self.assertEqual(repr(Self), f'{mod_name}.Self')

    def test_cannot_subscript(self):
        with self.assertRaises(TypeError):
            Self[int]

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class C(type(Self)):
                pass

    def test_cannot_init(self):
        with self.assertRaises(TypeError):
            Self()
        with self.assertRaises(TypeError):
            type(Self)()

    def test_no_isinstance(self):
        with self.assertRaises(TypeError):
            isinstance(1, Self)
        with self.assertRaises(TypeError):
            issubclass(int, Self)

    def test_alias(self):
        TupleSelf = Tuple[Self, Self]
        class Alias:
            def return_tuple(self) -> TupleSelf:
                return (self, self)

    def test_pickle(self):
        for proto in range(pickle.HIGHEST_PROTOCOL):
            pickled = pickle.dumps(Self, protocol=proto)
            self.assertIs(Self, pickle.loads(pickled))


class UnpackTests(BaseTestCase):
    def test_basic_plain(self):
        Ts = TypeVarTuple('Ts')
        self.assertEqual(Unpack[Ts], Unpack[Ts])
        with self.assertRaises(TypeError):
            Unpack()

    def test_repr(self):
        Ts = TypeVarTuple('Ts')
        self.assertEqual(repr(Unpack[Ts]), f'{Unpack.__module__}.Unpack[Ts]')

    def test_cannot_subclass_vars(self):
        with self.assertRaises(TypeError):
            class V(Unpack[TypeVarTuple('Ts')]):
                pass

    def test_tuple(self):
        Ts = TypeVarTuple('Ts')
        Tuple[Unpack[Ts]]

    def test_union(self):
        Xs = TypeVarTuple('Xs')
        Ys = TypeVarTuple('Ys')
        self.assertEqual(
            Union[Unpack[Xs]],
            Unpack[Xs]
        )
        self.assertNotEqual(
            Union[Unpack[Xs]],
            Union[Unpack[Xs], Unpack[Ys]]
        )
        self.assertEqual(
            Union[Unpack[Xs], Unpack[Xs]],
            Unpack[Xs]
        )
        self.assertNotEqual(
            Union[Unpack[Xs], int],
            Union[Unpack[Xs]]
        )
        self.assertNotEqual(
            Union[Unpack[Xs], int],
            Union[int]
        )
        self.assertEqual(
            Union[Unpack[Xs], int].__args__,
            (Unpack[Xs], int)
        )
        self.assertEqual(
            Union[Unpack[Xs], int].__parameters__,
            (Xs,)
        )
        self.assertIs(
            Union[Unpack[Xs], int].__origin__,
            Union
        )

    def test_concatenation(self):
        Xs = TypeVarTuple('Xs')
        self.assertEqual(Tuple[int, Unpack[Xs]].__args__, (int, Unpack[Xs]))
        self.assertEqual(Tuple[Unpack[Xs], int].__args__, (Unpack[Xs], int))
        self.assertEqual(Tuple[int, Unpack[Xs], str].__args__,
                         (int, Unpack[Xs], str))
        class C(Generic[Unpack[Xs]]): pass
        class D(Protocol[Unpack[Xs]]): pass
        for klass in C, D:
            with self.subTest(klass=klass.__name__):
                self.assertEqual(klass[int, Unpack[Xs]].__args__, (int, Unpack[Xs]))
                self.assertEqual(klass[Unpack[Xs], int].__args__, (Unpack[Xs], int))
                self.assertEqual(klass[int, Unpack[Xs], str].__args__,
                                 (int, Unpack[Xs], str))

    def test_class(self):
        Ts = TypeVarTuple('Ts')

        class C(Generic[Unpack[Ts]]): pass
        class D(Protocol[Unpack[Ts]]): pass

        for klass in C, D:
            with self.subTest(klass=klass.__name__):
                self.assertEqual(klass[int].__args__, (int,))
                self.assertEqual(klass[int, str].__args__, (int, str))

        with self.assertRaises(TypeError):
            class C(Generic[Unpack[Ts], int]): pass

        with self.assertRaises(TypeError):
            class D(Protocol[Unpack[Ts], int]): pass

        T1 = TypeVar('T')
        T2 = TypeVar('T')
        class C(Generic[T1, T2, Unpack[Ts]]): pass
        class D(Protocol[T1, T2, Unpack[Ts]]): pass
        for klass in C, D:
            with self.subTest(klass=klass.__name__):
                self.assertEqual(klass[int, str].__args__, (int, str))
                self.assertEqual(klass[int, str, float].__args__, (int, str, float))
                self.assertEqual(
                    klass[int, str, float, bool].__args__, (int, str, float, bool)
                )
                # A bug was fixed in 3.11.1
                # (https://github.com/python/cpython/commit/74920aa27d0c57443dd7f704d6272cca9c507ab3)
                # That means this assertion doesn't pass on 3.11.0,
                # but it passes on all other Python versions
                if sys.version_info[:3] != (3, 11, 0):
                    with self.assertRaises(TypeError):
                        klass[int]


class TypeVarTupleTests(BaseTestCase):

    def test_basic_plain(self):
        Ts = TypeVarTuple('Ts')
        self.assertEqual(Ts, Ts)
        self.assertIsInstance(Ts, TypeVarTuple)
        Xs = TypeVarTuple('Xs')
        Ys = TypeVarTuple('Ys')
        self.assertNotEqual(Xs, Ys)

    def test_repr(self):
        Ts = TypeVarTuple('Ts')
        self.assertEqual(repr(Ts), 'Ts')

    def test_no_redefinition(self):
        self.assertNotEqual(TypeVarTuple('Ts'), TypeVarTuple('Ts'))

    def test_cannot_subclass_vars(self):
        with self.assertRaises(TypeError):
            class V(TypeVarTuple('Ts')):
                pass

    def test_cannot_subclass_var_itself(self):
        with self.assertRaises(TypeError):
            class V(TypeVarTuple):
                pass

    def test_cannot_instantiate_vars(self):
        Ts = TypeVarTuple('Ts')
        with self.assertRaises(TypeError):
            Ts()

    def test_tuple(self):
        Ts = TypeVarTuple('Ts')
        # Not legal at type checking time but we can't really check against it.
        Tuple[Ts]

    def test_args_and_parameters(self):
        Ts = TypeVarTuple('Ts')

        t = Tuple[tuple(Ts)]
        if sys.version_info >= (3, 11):
            self.assertEqual(t.__args__, (typing.Unpack[Ts],))
        else:
            self.assertEqual(t.__args__, (Unpack[Ts],))
        self.assertEqual(t.__parameters__, (Ts,))

    def test_pickle(self):
        global Ts, Ts_default  # pickle wants to reference the class by name
        Ts = TypeVarTuple('Ts')
        Ts_default = TypeVarTuple('Ts_default', default=Unpack[Tuple[int, str]])

        for proto in range(pickle.HIGHEST_PROTOCOL):
            for typevartuple in (Ts, Ts_default):
                z = pickle.loads(pickle.dumps(typevartuple, proto))
                self.assertEqual(z.__name__, typevartuple.__name__)
                self.assertEqual(z.__default__, typevartuple.__default__)


class FinalDecoratorTests(BaseTestCase):
    def test_final_unmodified(self):
        def func(x): ...
        self.assertIs(func, final(func))

    def test_dunder_final(self):
        @final
        def func(): ...
        @final
        class Cls: ...
        self.assertIs(True, func.__final__)
        self.assertIs(True, Cls.__final__)

        class Wrapper:
            __slots__ = ("func",)
            def __init__(self, func):
                self.func = func
            def __call__(self, *args, **kwargs):
                return self.func(*args, **kwargs)

        # Check that no error is thrown if the attribute
        # is not writable.
        @final
        @Wrapper
        def wrapped(): ...
        self.assertIsInstance(wrapped, Wrapper)
        self.assertIs(False, hasattr(wrapped, "__final__"))

        class Meta(type):
            @property
            def __final__(self): return "can't set me"
        @final
        class WithMeta(metaclass=Meta): ...
        self.assertEqual(WithMeta.__final__, "can't set me")

        # Builtin classes throw TypeError if you try to set an
        # attribute.
        final(int)
        self.assertIs(False, hasattr(int, "__final__"))

        # Make sure it works with common builtin decorators
        class Methods:
            @final
            @classmethod
            def clsmethod(cls): ...

            @final
            @staticmethod
            def stmethod(): ...

            # The other order doesn't work because property objects
            # don't allow attribute assignment.
            @property
            @final
            def prop(self): ...

            @final
            @lru_cache  # noqa: B019
            def cached(self): ...

        # Use getattr_static because the descriptor returns the
        # underlying function, which doesn't have __final__.
        self.assertIs(
            True,
            inspect.getattr_static(Methods, "clsmethod").__final__
        )
        self.assertIs(
            True,
            inspect.getattr_static(Methods, "stmethod").__final__
        )
        self.assertIs(True, Methods.prop.fget.__final__)
        self.assertIs(True, Methods.cached.__final__)


class RevealTypeTests(BaseTestCase):
    def test_reveal_type(self):
        obj = object()

        with contextlib.redirect_stderr(io.StringIO()) as stderr:
            self.assertIs(obj, reveal_type(obj))
            self.assertEqual("Runtime type is 'object'", stderr.getvalue().strip())


class DataclassTransformTests(BaseTestCase):
    def test_decorator(self):
        def create_model(*, frozen: bool = False, kw_only: bool = True):
            return lambda cls: cls

        decorated = dataclass_transform(kw_only_default=True, order_default=False)(create_model)

        class CustomerModel:
            id: int

        self.assertIs(decorated, create_model)
        self.assertEqual(
            decorated.__dataclass_transform__,
            {
                "eq_default": True,
                "order_default": False,
                "kw_only_default": True,
                "frozen_default": False,
                "field_specifiers": (),
                "kwargs": {},
            }
        )
        self.assertIs(
            decorated(frozen=True, kw_only=False)(CustomerModel),
            CustomerModel
        )

    def test_base_class(self):
        class ModelBase:
            def __init_subclass__(cls, *, frozen: bool = False): ...

        Decorated = dataclass_transform(
            eq_default=True,
            order_default=True,
            # Arbitrary unrecognized kwargs are accepted at runtime.
            make_everything_awesome=True,
        )(ModelBase)

        class CustomerModel(Decorated, frozen=True):
            id: int

        self.assertIs(Decorated, ModelBase)
        self.assertEqual(
            Decorated.__dataclass_transform__,
            {
                "eq_default": True,
                "order_default": True,
                "kw_only_default": False,
                "frozen_default": False,
                "field_specifiers": (),
                "kwargs": {"make_everything_awesome": True},
            }
        )
        self.assertIsSubclass(CustomerModel, Decorated)

    def test_metaclass(self):
        class Field: ...

        class ModelMeta(type):
            def __new__(
                cls, name, bases, namespace, *, init: bool = True,
            ):
                return super().__new__(cls, name, bases, namespace)

        Decorated = dataclass_transform(
            order_default=True, field_specifiers=(Field,)
        )(ModelMeta)

        class ModelBase(metaclass=Decorated): ...

        class CustomerModel(ModelBase, init=False):
            id: int

        self.assertIs(Decorated, ModelMeta)
        self.assertEqual(
            Decorated.__dataclass_transform__,
            {
                "eq_default": True,
                "order_default": True,
                "kw_only_default": False,
                "frozen_default": False,
                "field_specifiers": (Field,),
                "kwargs": {},
            }
        )
        self.assertIsInstance(CustomerModel, Decorated)


class AllTests(BaseTestCase):

    def test_drop_in_for_typing(self):
        # Check that the typing_extensions.__all__ is a superset of
        # typing.__all__.
        t_all = set(typing.__all__)
        te_all = set(typing_extensions.__all__)
        exceptions = {"ByteString"}
        self.assertGreaterEqual(te_all, t_all - exceptions)
        # Deprecated, to be removed in 3.14
        self.assertFalse(hasattr(typing_extensions, "ByteString"))
        # These were never included in `typing.__all__`,
        # and have been removed in Python 3.13
        self.assertNotIn('re', te_all)
        self.assertNotIn('io', te_all)

    def test_typing_extensions_includes_standard(self):
        a = typing_extensions.__all__
        self.assertIn('ClassVar', a)
        self.assertIn('Type', a)
        self.assertIn('ChainMap', a)
        self.assertIn('ContextManager', a)
        self.assertIn('Counter', a)
        self.assertIn('DefaultDict', a)
        self.assertIn('Deque', a)
        self.assertIn('NewType', a)
        self.assertIn('overload', a)
        self.assertIn('Text', a)
        self.assertIn('TYPE_CHECKING', a)
        self.assertIn('TypeAlias', a)
        self.assertIn('ParamSpec', a)
        self.assertIn("Concatenate", a)

        self.assertIn('Annotated', a)
        self.assertIn('get_type_hints', a)

        self.assertIn('Awaitable', a)
        self.assertIn('AsyncIterator', a)
        self.assertIn('AsyncIterable', a)
        self.assertIn('Coroutine', a)
        self.assertIn('AsyncContextManager', a)

        self.assertIn('AsyncGenerator', a)

        self.assertIn('Protocol', a)
        self.assertIn('runtime', a)

        # Check that all objects in `__all__` are present in the module
        for name in a:
            self.assertTrue(hasattr(typing_extensions, name))

    def test_all_names_in___all__(self):
        exclude = {
            'GenericMeta',
            'KT',
            'PEP_560',
            'T',
            'T_co',
            'T_contra',
            'VT',
        }
        actual_names = {
            name for name in dir(typing_extensions)
            if not name.startswith("_")
            and not isinstance(getattr(typing_extensions, name), types.ModuleType)
        }
        # Make sure all public names are in __all__
        self.assertEqual({*exclude, *typing_extensions.__all__},
                         actual_names)
        # Make sure all excluded names actually exist
        self.assertLessEqual(exclude, actual_names)

    def test_typing_extensions_defers_when_possible(self):
        exclude = set()
        if sys.version_info < (3, 10):
            exclude |= {'get_args', 'get_origin'}
        if sys.version_info < (3, 10, 1):
            exclude |= {"Literal"}
        if sys.version_info < (3, 11):
            exclude |= {'final', 'Any', 'NewType', 'overload'}
        if sys.version_info < (3, 12):
            exclude |= {
                'SupportsAbs', 'SupportsBytes',
                'SupportsComplex', 'SupportsFloat', 'SupportsIndex', 'SupportsInt',
                'SupportsRound', 'Unpack', 'dataclass_transform',
            }
        if sys.version_info < (3, 13):
            exclude |= {
                'NamedTuple', 'Protocol', 'runtime_checkable', 'Generator',
                'AsyncGenerator', 'ContextManager', 'AsyncContextManager',
                'ParamSpec', 'TypeVar', 'TypeVarTuple', 'get_type_hints',
            }
        if not typing_extensions._PEP_728_IMPLEMENTED:
            exclude |= {'TypedDict', 'is_typeddict'}
        for item in typing_extensions.__all__:
            if item not in exclude and hasattr(typing, item):
                self.assertIs(
                    getattr(typing_extensions, item),
                    getattr(typing, item))

    def test_typing_extensions_compiles_with_opt(self):
        file_path = typing_extensions.__file__
        try:
            subprocess.check_output(f'{sys.executable} -OO {file_path}',
                                    stderr=subprocess.STDOUT,
                                    shell=True)
        except subprocess.CalledProcessError:
            self.fail('Module does not compile with optimize=2 (-OO flag).')


class CoolEmployee(NamedTuple):
    name: str
    cool: int


class CoolEmployeeWithDefault(NamedTuple):
    name: str
    cool: int = 0


class XMeth(NamedTuple):
    x: int

    def double(self):
        return 2 * self.x


class NamedTupleTests(BaseTestCase):
    class NestedEmployee(NamedTuple):
        name: str
        cool: int

    def test_basics(self):
        Emp = NamedTuple('Emp', [('name', str), ('id', int)])
        self.assertIsSubclass(Emp, tuple)
        joe = Emp('Joe', 42)
        jim = Emp(name='Jim', id=1)
        self.assertIsInstance(joe, Emp)
        self.assertIsInstance(joe, tuple)
        self.assertEqual(joe.name, 'Joe')
        self.assertEqual(joe.id, 42)
        self.assertEqual(jim.name, 'Jim')
        self.assertEqual(jim.id, 1)
        self.assertEqual(Emp.__name__, 'Emp')
        self.assertEqual(Emp._fields, ('name', 'id'))
        self.assertEqual(Emp.__annotations__,
                         collections.OrderedDict([('name', str), ('id', int)]))

    def test_annotation_usage(self):
        tim = CoolEmployee('Tim', 9000)
        self.assertIsInstance(tim, CoolEmployee)
        self.assertIsInstance(tim, tuple)
        self.assertEqual(tim.name, 'Tim')
        self.assertEqual(tim.cool, 9000)
        self.assertEqual(CoolEmployee.__name__, 'CoolEmployee')
        self.assertEqual(CoolEmployee._fields, ('name', 'cool'))
        self.assertEqual(CoolEmployee.__annotations__,
                         collections.OrderedDict(name=str, cool=int))

    def test_annotation_usage_with_default(self):
        jelle = CoolEmployeeWithDefault('Jelle')
        self.assertIsInstance(jelle, CoolEmployeeWithDefault)
        self.assertIsInstance(jelle, tuple)
        self.assertEqual(jelle.name, 'Jelle')
        self.assertEqual(jelle.cool, 0)
        cooler_employee = CoolEmployeeWithDefault('Sjoerd', 1)
        self.assertEqual(cooler_employee.cool, 1)

        self.assertEqual(CoolEmployeeWithDefault.__name__, 'CoolEmployeeWithDefault')
        self.assertEqual(CoolEmployeeWithDefault._fields, ('name', 'cool'))
        self.assertEqual(CoolEmployeeWithDefault.__annotations__,
                         dict(name=str, cool=int))

        with self.assertRaisesRegex(
            TypeError,
            'Non-default namedtuple field y cannot follow default field x'
        ):
            class NonDefaultAfterDefault(NamedTuple):
                x: int = 3
                y: int

    def test_field_defaults(self):
        self.assertEqual(CoolEmployeeWithDefault._field_defaults, dict(cool=0))

    def test_annotation_usage_with_methods(self):
        self.assertEqual(XMeth(1).double(), 2)
        self.assertEqual(XMeth(42).x, XMeth(42)[0])
        self.assertEqual(str(XRepr(42)), '42 -> 1')
        self.assertEqual(XRepr(1, 2) + XRepr(3), 0)

        bad_overwrite_error_message = 'Cannot overwrite NamedTuple attribute'

        with self.assertRaisesRegex(AttributeError, bad_overwrite_error_message):
            class XMethBad(NamedTuple):
                x: int
                def _fields(self):
                    return 'no chance for this'

        with self.assertRaisesRegex(AttributeError, bad_overwrite_error_message):
            class XMethBad2(NamedTuple):
                x: int
                def _source(self):
                    return 'no chance for this as well'

    def test_multiple_inheritance(self):
        class A:
            pass
        with self.assertRaisesRegex(
            TypeError,
            'can only inherit from a NamedTuple type and Generic'
        ):
            class X(NamedTuple, A):
                x: int

        with self.assertRaisesRegex(
            TypeError,
            'can only inherit from a NamedTuple type and Generic'
        ):
            class Y(NamedTuple, tuple):
                x: int

        with self.assertRaisesRegex(TypeError, 'duplicate base class'):
            class Z(NamedTuple, NamedTuple):
                x: int

        class A(NamedTuple):
            x: int
        with self.assertRaisesRegex(
            TypeError,
            'can only inherit from a NamedTuple type and Generic'
        ):
            class XX(NamedTuple, A):
                y: str

    def test_generic(self):
        class X(NamedTuple, Generic[T]):
            x: T
        self.assertEqual(X.__bases__, (tuple, Generic))
        self.assertEqual(X.__orig_bases__, (NamedTuple, Generic[T]))
        self.assertEqual(X.__mro__, (X, tuple, Generic, object))

        class Y(Generic[T], NamedTuple):
            x: T
        self.assertEqual(Y.__bases__, (Generic, tuple))
        self.assertEqual(Y.__orig_bases__, (Generic[T], NamedTuple))
        self.assertEqual(Y.__mro__, (Y, Generic, tuple, object))

        for G in X, Y:
            with self.subTest(type=G):
                self.assertEqual(G.__parameters__, (T,))
                A = G[int]
                self.assertIs(A.__origin__, G)
                self.assertEqual(A.__args__, (int,))
                self.assertEqual(A.__parameters__, ())

                a = A(3)
                self.assertIs(type(a), G)
                self.assertIsInstance(a, G)
                self.assertEqual(a.x, 3)

                things = "arguments" if sys.version_info >= (3, 10) else "parameters"
                with self.assertRaisesRegex(TypeError, f'Too many {things}'):
                    G[int, str]

    @skipUnless(TYPING_3_9_0, "tuple.__class_getitem__ was added in 3.9")
    def test_non_generic_subscript_py39_plus(self):
        # For backward compatibility, subscription works
        # on arbitrary NamedTuple types.
        class Group(NamedTuple):
            key: T
            group: list[T]
        A = Group[int]
        self.assertEqual(A.__origin__, Group)
        self.assertEqual(A.__parameters__, ())
        self.assertEqual(A.__args__, (int,))
        a = A(1, [2])
        self.assertIs(type(a), Group)
        self.assertEqual(a, (1, [2]))

    @skipIf(TYPING_3_9_0, "Test isn't relevant to 3.9+")
    def test_non_generic_subscript_error_message_py38(self):
        class Group(NamedTuple):
            key: T
            group: List[T]

        with self.assertRaisesRegex(TypeError, 'not subscriptable'):
            Group[int]

        for attr in ('__args__', '__origin__', '__parameters__'):
            with self.subTest(attr=attr):
                self.assertFalse(hasattr(Group, attr))

    def test_namedtuple_keyword_usage(self):
        with self.assertWarnsRegex(
            DeprecationWarning,
            "Creating NamedTuple classes using keyword arguments is deprecated"
        ):
            LocalEmployee = NamedTuple("LocalEmployee", name=str, age=int)

        nick = LocalEmployee('Nick', 25)
        self.assertIsInstance(nick, tuple)
        self.assertEqual(nick.name, 'Nick')
        self.assertEqual(LocalEmployee.__name__, 'LocalEmployee')
        self.assertEqual(LocalEmployee._fields, ('name', 'age'))
        self.assertEqual(LocalEmployee.__annotations__, dict(name=str, age=int))

        with self.assertRaisesRegex(
            TypeError,
            "Either list of fields or keywords can be provided to NamedTuple, not both"
        ):
            NamedTuple('Name', [('x', int)], y=str)

        with self.assertRaisesRegex(
            TypeError,
            "Either list of fields or keywords can be provided to NamedTuple, not both"
        ):
            NamedTuple('Name', [], y=str)

        with self.assertRaisesRegex(
            TypeError,
            (
                r"Cannot pass `None` as the 'fields' parameter "
                r"and also specify fields using keyword arguments"
            )
        ):
            NamedTuple('Name', None, x=int)

    def test_namedtuple_special_keyword_names(self):
        with self.assertWarnsRegex(
            DeprecationWarning,
            "Creating NamedTuple classes using keyword arguments is deprecated"
        ):
            NT = NamedTuple("NT", cls=type, self=object, typename=str, fields=list)

        self.assertEqual(NT.__name__, 'NT')
        self.assertEqual(NT._fields, ('cls', 'self', 'typename', 'fields'))
        a = NT(cls=str, self=42, typename='foo', fields=[('bar', tuple)])
        self.assertEqual(a.cls, str)
        self.assertEqual(a.self, 42)
        self.assertEqual(a.typename, 'foo')
        self.assertEqual(a.fields, [('bar', tuple)])

    def test_empty_namedtuple(self):
        expected_warning = re.escape(
            "Failing to pass a value for the 'fields' parameter is deprecated "
            "and will be disallowed in Python 3.15. "
            "To create a NamedTuple class with 0 fields "
            "using the functional syntax, "
            "pass an empty list, e.g. `NT1 = NamedTuple('NT1', [])`."
        )
        with self.assertWarnsRegex(DeprecationWarning, fr"^{expected_warning}$"):
            NT1 = NamedTuple('NT1')

        expected_warning = re.escape(
            "Passing `None` as the 'fields' parameter is deprecated "
            "and will be disallowed in Python 3.15. "
            "To create a NamedTuple class with 0 fields "
            "using the functional syntax, "
            "pass an empty list, e.g. `NT2 = NamedTuple('NT2', [])`."
        )
        with self.assertWarnsRegex(DeprecationWarning, fr"^{expected_warning}$"):
            NT2 = NamedTuple('NT2', None)

        NT3 = NamedTuple('NT2', [])

        class CNT(NamedTuple):
            pass  # empty body

        for struct in NT1, NT2, NT3, CNT:
            with self.subTest(struct=struct):
                self.assertEqual(struct._fields, ())
                self.assertEqual(struct.__annotations__, {})
                self.assertIsInstance(struct(), struct)
                self.assertEqual(struct._field_defaults, {})

    def test_namedtuple_errors(self):
        with self.assertRaises(TypeError):
            NamedTuple.__new__()
        with self.assertRaises(TypeError):
            NamedTuple()
        with self.assertRaises(TypeError):
            NamedTuple('Emp', [('name', str)], None)
        with self.assertRaisesRegex(ValueError, 'cannot start with an underscore'):
            NamedTuple('Emp', [('_name', str)])
        with self.assertRaises(TypeError):
            NamedTuple(typename='Emp', name=str, id=int)

    def test_copy_and_pickle(self):
        global Emp  # pickle wants to reference the class by name
        Emp = NamedTuple('Emp', [('name', str), ('cool', int)])
        for cls in Emp, CoolEmployee, self.NestedEmployee:
            with self.subTest(cls=cls):
                jane = cls('jane', 37)
                for proto in range(pickle.HIGHEST_PROTOCOL + 1):
                    z = pickle.dumps(jane, proto)
                    jane2 = pickle.loads(z)
                    self.assertEqual(jane2, jane)
                    self.assertIsInstance(jane2, cls)

                jane2 = copy.copy(jane)
                self.assertEqual(jane2, jane)
                self.assertIsInstance(jane2, cls)

                jane2 = copy.deepcopy(jane)
                self.assertEqual(jane2, jane)
                self.assertIsInstance(jane2, cls)

    def test_docstring(self):
        self.assertIsInstance(NamedTuple.__doc__, str)

    @skipUnless(TYPING_3_9_0, "NamedTuple was a class on 3.8 and lower")
    def test_same_as_typing_NamedTuple_39_plus(self):
        self.assertEqual(
            set(dir(NamedTuple)) - {"__text_signature__"},
            set(dir(typing.NamedTuple))
        )
        self.assertIs(type(NamedTuple), type(typing.NamedTuple))

    @skipIf(TYPING_3_9_0, "tests are only relevant to <=3.8")
    def test_same_as_typing_NamedTuple_38_minus(self):
        self.assertEqual(
            self.NestedEmployee.__annotations__,
            self.NestedEmployee._field_types
        )

    def test_orig_bases(self):
        T = TypeVar('T')

        class SimpleNamedTuple(NamedTuple):
            pass

        class GenericNamedTuple(NamedTuple, Generic[T]):
            pass

        self.assertEqual(SimpleNamedTuple.__orig_bases__, (NamedTuple,))
        self.assertEqual(GenericNamedTuple.__orig_bases__, (NamedTuple, Generic[T]))

        CallNamedTuple = NamedTuple('CallNamedTuple', [])

        self.assertEqual(CallNamedTuple.__orig_bases__, (NamedTuple,))

    def test_setname_called_on_values_in_class_dictionary(self):
        class Vanilla:
            def __set_name__(self, owner, name):
                self.name = name

        class Foo(NamedTuple):
            attr = Vanilla()

        foo = Foo()
        self.assertEqual(len(foo), 0)
        self.assertNotIn('attr', Foo._fields)
        self.assertIsInstance(foo.attr, Vanilla)
        self.assertEqual(foo.attr.name, "attr")

        class Bar(NamedTuple):
            attr: Vanilla = Vanilla()

        bar = Bar()
        self.assertEqual(len(bar), 1)
        self.assertIn('attr', Bar._fields)
        self.assertIsInstance(bar.attr, Vanilla)
        self.assertEqual(bar.attr.name, "attr")

    @skipIf(
        TYPING_3_12_0,
        "__set_name__ behaviour changed on py312+ to use BaseException.add_note()"
    )
    def test_setname_raises_the_same_as_on_other_classes_py311_minus(self):
        class CustomException(BaseException): pass

        class Annoying:
            def __set_name__(self, owner, name):
                raise CustomException

        annoying = Annoying()

        with self.assertRaises(RuntimeError) as cm:
            class NormalClass:
                attr = annoying
        normal_exception = cm.exception

        with self.assertRaises(RuntimeError) as cm:
            class NamedTupleClass(NamedTuple):
                attr = annoying
        namedtuple_exception = cm.exception

        self.assertIs(type(namedtuple_exception), RuntimeError)
        self.assertIs(type(namedtuple_exception), type(normal_exception))
        self.assertEqual(len(namedtuple_exception.args), len(normal_exception.args))
        self.assertEqual(
            namedtuple_exception.args[0],
            normal_exception.args[0].replace("NormalClass", "NamedTupleClass")
        )

        self.assertIs(type(namedtuple_exception.__cause__), CustomException)
        self.assertIs(
            type(namedtuple_exception.__cause__), type(normal_exception.__cause__)
        )
        self.assertEqual(
            namedtuple_exception.__cause__.args, normal_exception.__cause__.args
        )

    @skipUnless(
        TYPING_3_12_0,
        "__set_name__ behaviour changed on py312+ to use BaseException.add_note()"
    )
    def test_setname_raises_the_same_as_on_other_classes_py312_plus(self):
        class CustomException(BaseException): pass

        class Annoying:
            def __set_name__(self, owner, name):
                raise CustomException

        annoying = Annoying()

        with self.assertRaises(CustomException) as cm:
            class NormalClass:
                attr = annoying
        normal_exception = cm.exception

        with self.assertRaises(CustomException) as cm:
            class NamedTupleClass(NamedTuple):
                attr = annoying
        namedtuple_exception = cm.exception

        expected_note = (
            "Error calling __set_name__ on 'Annoying' instance "
            "'attr' in 'NamedTupleClass'"
        )

        self.assertIs(type(namedtuple_exception), CustomException)
        self.assertIs(type(namedtuple_exception), type(normal_exception))
        self.assertEqual(namedtuple_exception.args, normal_exception.args)

        self.assertEqual(len(namedtuple_exception.__notes__), 1)
        self.assertEqual(
            len(namedtuple_exception.__notes__), len(normal_exception.__notes__)
        )

        self.assertEqual(namedtuple_exception.__notes__[0], expected_note)
        self.assertEqual(
            namedtuple_exception.__notes__[0],
            normal_exception.__notes__[0].replace("NormalClass", "NamedTupleClass")
        )

    def test_strange_errors_when_accessing_set_name_itself(self):
        class CustomException(Exception): pass

        class Meta(type):
            def __getattribute__(self, attr):
                if attr == "__set_name__":
                    raise CustomException
                return object.__getattribute__(self, attr)

        class VeryAnnoying(metaclass=Meta): pass

        very_annoying = VeryAnnoying()

        with self.assertRaises(CustomException):
            class Foo(NamedTuple):
                attr = very_annoying


class TypeVarTests(BaseTestCase):
    def test_basic_plain(self):
        T = TypeVar('T')
        # T equals itself.
        self.assertEqual(T, T)
        # T is an instance of TypeVar
        self.assertIsInstance(T, TypeVar)
        self.assertEqual(T.__name__, 'T')
        self.assertEqual(T.__constraints__, ())
        self.assertIs(T.__bound__, None)
        self.assertIs(T.__covariant__, False)
        self.assertIs(T.__contravariant__, False)
        self.assertIs(T.__infer_variance__, False)

    def test_attributes(self):
        T_bound = TypeVar('T_bound', bound=int)
        self.assertEqual(T_bound.__name__, 'T_bound')
        self.assertEqual(T_bound.__constraints__, ())
        self.assertIs(T_bound.__bound__, int)

        T_constraints = TypeVar('T_constraints', int, str)
        self.assertEqual(T_constraints.__name__, 'T_constraints')
        self.assertEqual(T_constraints.__constraints__, (int, str))
        self.assertIs(T_constraints.__bound__, None)

        T_co = TypeVar('T_co', covariant=True)
        self.assertEqual(T_co.__name__, 'T_co')
        self.assertIs(T_co.__covariant__, True)
        self.assertIs(T_co.__contravariant__, False)
        self.assertIs(T_co.__infer_variance__, False)

        T_contra = TypeVar('T_contra', contravariant=True)
        self.assertEqual(T_contra.__name__, 'T_contra')
        self.assertIs(T_contra.__covariant__, False)
        self.assertIs(T_contra.__contravariant__, True)
        self.assertIs(T_contra.__infer_variance__, False)

        T_infer = TypeVar('T_infer', infer_variance=True)
        self.assertEqual(T_infer.__name__, 'T_infer')
        self.assertIs(T_infer.__covariant__, False)
        self.assertIs(T_infer.__contravariant__, False)
        self.assertIs(T_infer.__infer_variance__, True)

    def test_typevar_instance_type_error(self):
        T = TypeVar('T')
        with self.assertRaises(TypeError):
            isinstance(42, T)

    def test_typevar_subclass_type_error(self):
        T = TypeVar('T')
        with self.assertRaises(TypeError):
            issubclass(int, T)
        with self.assertRaises(TypeError):
            issubclass(T, int)

    def test_constrained_error(self):
        with self.assertRaises(TypeError):
            X = TypeVar('X', int)
            X

    def test_union_unique(self):
        X = TypeVar('X')
        Y = TypeVar('Y')
        self.assertNotEqual(X, Y)
        self.assertEqual(Union[X], X)
        self.assertNotEqual(Union[X], Union[X, Y])
        self.assertEqual(Union[X, X], X)
        self.assertNotEqual(Union[X, int], Union[X])
        self.assertNotEqual(Union[X, int], Union[int])
        self.assertEqual(Union[X, int].__args__, (X, int))
        self.assertEqual(Union[X, int].__parameters__, (X,))
        self.assertIs(Union[X, int].__origin__, Union)

    if hasattr(types, "UnionType"):
        def test_or(self):
            X = TypeVar('X')
            # use a string because str doesn't implement
            # __or__/__ror__ itself
            self.assertEqual(X | "x", Union[X, "x"])
            self.assertEqual("x" | X, Union["x", X])
            # make sure the order is correct
            self.assertEqual(get_args(X | "x"), (X, typing.ForwardRef("x")))
            self.assertEqual(get_args("x" | X), (typing.ForwardRef("x"), X))

    def test_union_constrained(self):
        A = TypeVar('A', str, bytes)
        self.assertNotEqual(Union[A, str], Union[A])

    def test_repr(self):
        self.assertEqual(repr(T), '~T')
        self.assertEqual(repr(KT), '~KT')
        self.assertEqual(repr(VT), '~VT')
        self.assertEqual(repr(AnyStr), '~AnyStr')
        T_co = TypeVar('T_co', covariant=True)
        self.assertEqual(repr(T_co), '+T_co')
        T_contra = TypeVar('T_contra', contravariant=True)
        self.assertEqual(repr(T_contra), '-T_contra')

    def test_no_redefinition(self):
        self.assertNotEqual(TypeVar('T'), TypeVar('T'))
        self.assertNotEqual(TypeVar('T', int, str), TypeVar('T', int, str))

    def test_cannot_subclass(self):
        with self.assertRaises(TypeError):
            class V(TypeVar): pass
        T = TypeVar("T")
        with self.assertRaises(TypeError):
            class W(T): pass

    def test_cannot_instantiate_vars(self):
        with self.assertRaises(TypeError):
            TypeVar('A')()

    def test_bound_errors(self):
        with self.assertRaises(TypeError):
            TypeVar('X', bound=Union)
        with self.assertRaises(TypeError):
            TypeVar('X', str, float, bound=Employee)
        with self.assertRaisesRegex(TypeError,
                                    r"Bound must be a type\. Got \(1, 2\)\."):
            TypeVar('X', bound=(1, 2))

    # Technically we could run it on later versions of 3.8,
    # but that's not worth the effort.
    @skipUnless(TYPING_3_9_0, "Fix was not backported")
    def test_missing__name__(self):
        # See bpo-39942
        code = ("import typing\n"
                "T = typing.TypeVar('T')\n"
                )
        exec(code, {})

    def test_no_bivariant(self):
        with self.assertRaises(ValueError):
            TypeVar('T', covariant=True, contravariant=True)

    def test_cannot_combine_explicit_and_infer(self):
        with self.assertRaises(ValueError):
            TypeVar('T', covariant=True, infer_variance=True)
        with self.assertRaises(ValueError):
            TypeVar('T', contravariant=True, infer_variance=True)


class TypeVarLikeDefaultsTests(BaseTestCase):
    def test_typevar(self):
        T = typing_extensions.TypeVar('T', default=int)
        typing_T = typing.TypeVar('T')
        self.assertEqual(T.__default__, int)
        self.assertIsInstance(T, typing_extensions.TypeVar)
        self.assertIsInstance(T, typing.TypeVar)
        self.assertIsInstance(typing_T, typing.TypeVar)
        self.assertIsInstance(typing_T, typing_extensions.TypeVar)

        class A(Generic[T]): ...
        self.assertEqual(Optional[T].__args__, (T, type(None)))

    def test_typevar_none(self):
        U = typing_extensions.TypeVar('U')
        U_None = typing_extensions.TypeVar('U_None', default=None)
        self.assertIs(U.__default__, NoDefault)
        self.assertFalse(U.has_default())
        self.assertEqual(U_None.__default__, None)
        self.assertTrue(U_None.has_default())

    def test_paramspec(self):
        P = ParamSpec('P', default=[str, int])
        self.assertEqual(P.__default__, [str, int])
        self.assertTrue(P.has_default())
        self.assertIsInstance(P, ParamSpec)
        if hasattr(typing, "ParamSpec"):
            self.assertIsInstance(P, typing.ParamSpec)
            typing_P = typing.ParamSpec('P')
            self.assertIsInstance(typing_P, typing.ParamSpec)
            self.assertIsInstance(typing_P, ParamSpec)

        class A(Generic[P]): ...
        self.assertEqual(typing.Callable[P, None].__args__, (P, type(None)))

        P_default = ParamSpec('P_default', default=...)
        self.assertIs(P_default.__default__, ...)
        self.assertTrue(P_default.has_default())

    def test_paramspec_none(self):
        U = ParamSpec('U')
        U_None = ParamSpec('U_None', default=None)
        self.assertIs(U.__default__, NoDefault)
        self.assertFalse(U.has_default())
        self.assertIs(U_None.__default__, None)
        self.assertTrue(U_None.has_default())

    def test_typevartuple(self):
        Ts = TypeVarTuple('Ts', default=Unpack[Tuple[str, int]])
        self.assertEqual(Ts.__default__, Unpack[Tuple[str, int]])
        self.assertIsInstance(Ts, TypeVarTuple)
        self.assertTrue(Ts.has_default())
        if hasattr(typing, "TypeVarTuple"):
            self.assertIsInstance(Ts, typing.TypeVarTuple)
            typing_Ts = typing.TypeVarTuple('Ts')
            self.assertIsInstance(typing_Ts, typing.TypeVarTuple)
            self.assertIsInstance(typing_Ts, TypeVarTuple)

        class A(Generic[Unpack[Ts]]): ...
        self.assertEqual(Optional[Unpack[Ts]].__args__, (Unpack[Ts], type(None)))

    @skipIf(
        sys.version_info < (3, 11, 1),
        "Not yet backported for older versions of Python"
    )
    def test_typevartuple_specialization(self):
        T = TypeVar("T")
        Ts = TypeVarTuple('Ts', default=Unpack[Tuple[str, int]])
        self.assertEqual(Ts.__default__, Unpack[Tuple[str, int]])
        class A(Generic[T, Unpack[Ts]]): ...
        self.assertEqual(A[float].__args__, (float, str, int))
        self.assertEqual(A[float, range].__args__, (float, range))
        self.assertEqual(A[float, Unpack[tuple[int, ...]]].__args__, (float, Unpack[tuple[int, ...]]))

    @skipIf(
        sys.version_info < (3, 11, 1),
        "Not yet backported for older versions of Python"
    )
    def test_typevar_and_typevartuple_specialization(self):
        T = TypeVar("T")
        U = TypeVar("U", default=float)
        Ts = TypeVarTuple('Ts', default=Unpack[Tuple[str, int]])
        self.assertEqual(Ts.__default__, Unpack[Tuple[str, int]])
        class A(Generic[T, U, Unpack[Ts]]): ...
        self.assertEqual(A[int].__args__, (int, float, str, int))
        self.assertEqual(A[int, str].__args__, (int, str, str, int))
        self.assertEqual(A[int, str, range].__args__, (int, str, range))
        self.assertEqual(A[int, str, Unpack[tuple[int, ...]]].__args__, (int, str, Unpack[tuple[int, ...]]))

    def test_no_default_after_typevar_tuple(self):
        T = TypeVar("T", default=int)
        Ts = TypeVarTuple("Ts")
        Ts_default = TypeVarTuple("Ts_default", default=Unpack[Tuple[str, int]])

        with self.assertRaises(TypeError):
            class X(Generic[Unpack[Ts], T]): ...

        with self.assertRaises(TypeError):
            class Y(Generic[Unpack[Ts_default], T]): ...

    def test_typevartuple_none(self):
        U = TypeVarTuple('U')
        U_None = TypeVarTuple('U_None', default=None)
        self.assertIs(U.__default__, NoDefault)
        self.assertFalse(U.has_default())
        self.assertIs(U_None.__default__, None)
        self.assertTrue(U_None.has_default())

    def test_no_default_after_non_default(self):
        DefaultStrT = typing_extensions.TypeVar('DefaultStrT', default=str)
        T = TypeVar('T')

        with self.assertRaises(TypeError):
            Generic[DefaultStrT, T]

    def test_need_more_params(self):
        DefaultStrT = typing_extensions.TypeVar('DefaultStrT', default=str)
        T = typing_extensions.TypeVar('T')
        U = typing_extensions.TypeVar('U')

        class A(Generic[T, U, DefaultStrT]): ...
        A[int, bool]
        A[int, bool, str]

        with self.assertRaises(
            TypeError, msg="Too few arguments for .+; actual 1, expected at least 2"
        ):
            A[int]

    def test_pickle(self):
        global U, U_co, U_contra, U_default  # pickle wants to reference the class by name
        U = typing_extensions.TypeVar('U')
        U_co = typing_extensions.TypeVar('U_co', covariant=True)
        U_contra = typing_extensions.TypeVar('U_contra', contravariant=True)
        U_default = typing_extensions.TypeVar('U_default', default=int)
        for proto in range(pickle.HIGHEST_PROTOCOL):
            for typevar in (U, U_co, U_contra, U_default):
                z = pickle.loads(pickle.dumps(typevar, proto))
                self.assertEqual(z.__name__, typevar.__name__)
                self.assertEqual(z.__covariant__, typevar.__covariant__)
                self.assertEqual(z.__contravariant__, typevar.__contravariant__)
                self.assertEqual(z.__bound__, typevar.__bound__)
                self.assertEqual(z.__default__, typevar.__default__)

    def test_strange_defaults_are_allowed(self):
        # Leave it to type checkers to check whether strange default values
        # should be allowed or disallowed
        def not_a_type(): ...

        for typevarlike_cls in TypeVar, ParamSpec, TypeVarTuple:
            for default in not_a_type, 42, bytearray(), (int, not_a_type, 42):
                with self.subTest(typevarlike_cls=typevarlike_cls, default=default):
                    T = typevarlike_cls("T", default=default)
                    self.assertEqual(T.__default__, default)

    @skip_if_py313_beta_1
    def test_allow_default_after_non_default_in_alias(self):
        T_default = TypeVar('T_default', default=int)
        T = TypeVar('T')
        Ts = TypeVarTuple('Ts')

        a1 = Callable[[T_default], T]
        self.assertEqual(a1.__args__, (T_default, T))

        if sys.version_info >= (3, 9):
            a2 = dict[T_default, T]
            self.assertEqual(a2.__args__, (T_default, T))

        a3 = typing.Dict[T_default, T]
        self.assertEqual(a3.__args__, (T_default, T))

        a4 = Callable[[Unpack[Ts]], T]
        self.assertEqual(a4.__args__, (Unpack[Ts], T))

    @skipIf(
        typing_extensions.Protocol is typing.Protocol,
        "Test currently fails with the CPython version of Protocol and that's not our fault"
    )
    def test_generic_with_broken_eq(self):
        # See https://github.com/python/typing_extensions/pull/422 for context
        class BrokenEq(type):
            def __eq__(self, other):
                if other is typing_extensions.Protocol:
                    raise TypeError("I'm broken")
                return False

        class G(Generic[T], metaclass=BrokenEq):
            pass

        alias = G[int]
        self.assertIs(get_origin(alias), G)
        self.assertEqual(get_args(alias), (int,))

    @skipIf(
        sys.version_info < (3, 11, 1),
        "Not yet backported for older versions of Python"
    )
    def test_paramspec_specialization(self):
        T = TypeVar("T")
        P = ParamSpec('P', default=[str, int])
        self.assertEqual(P.__default__, [str, int])
        class A(Generic[T, P]): ...
        self.assertEqual(A[float].__args__, (float, (str, int)))
        self.assertEqual(A[float, [range]].__args__, (float, (range,)))

    @skipIf(
        sys.version_info < (3, 11, 1),
        "Not yet backported for older versions of Python"
    )
    def test_typevar_and_paramspec_specialization(self):
        T = TypeVar("T")
        U = TypeVar("U", default=float)
        P = ParamSpec('P', default=[str, int])
        self.assertEqual(P.__default__, [str, int])
        class A(Generic[T, U, P]): ...
        self.assertEqual(A[float].__args__, (float, float, (str, int)))
        self.assertEqual(A[float, int].__args__, (float, int, (str, int)))
        self.assertEqual(A[float, int, [range]].__args__, (float, int, (range,)))

    @skipIf(
        sys.version_info < (3, 11, 1),
        "Not yet backported for older versions of Python"
    )
    def test_paramspec_and_typevar_specialization(self):
        T = TypeVar("T")
        P = ParamSpec('P', default=[str, int])
        U = TypeVar("U", default=float)
        self.assertEqual(P.__default__, [str, int])
        class A(Generic[T, P, U]): ...
        self.assertEqual(A[float].__args__, (float, (str, int), float))
        self.assertEqual(A[float, [range]].__args__, (float, (range,), float))
        self.assertEqual(A[float, [range], int].__args__, (float, (range,), int))


class NoDefaultTests(BaseTestCase):
    @skip_if_py313_beta_1
    def test_pickling(self):
        for proto in range(pickle.HIGHEST_PROTOCOL + 1):
            s = pickle.dumps(NoDefault, proto)
            loaded = pickle.loads(s)
            self.assertIs(NoDefault, loaded)

    @skip_if_py313_beta_1
    def test_doc(self):
        self.assertIsInstance(NoDefault.__doc__, str)

    def test_constructor(self):
        self.assertIs(NoDefault, type(NoDefault)())
        with self.assertRaises(TypeError):
            type(NoDefault)(1)

    def test_repr(self):
        self.assertRegex(repr(NoDefault), r'typing(_extensions)?\.NoDefault')

    def test_no_call(self):
        with self.assertRaises(TypeError):
            NoDefault()

    @skip_if_py313_beta_1
    def test_immutable(self):
        with self.assertRaises(AttributeError):
            NoDefault.foo = 'bar'
        with self.assertRaises(AttributeError):
            NoDefault.foo

        # TypeError is consistent with the behavior of NoneType
        with self.assertRaises(TypeError):
            type(NoDefault).foo = 3
        with self.assertRaises(AttributeError):
            type(NoDefault).foo


class TypeVarInferVarianceTests(BaseTestCase):
    def test_typevar(self):
        T = typing_extensions.TypeVar('T')
        self.assertFalse(T.__infer_variance__)
        T_infer = typing_extensions.TypeVar('T_infer', infer_variance=True)
        self.assertTrue(T_infer.__infer_variance__)
        T_noinfer = typing_extensions.TypeVar('T_noinfer', infer_variance=False)
        self.assertFalse(T_noinfer.__infer_variance__)

    def test_pickle(self):
        global U, U_infer  # pickle wants to reference the class by name
        U = typing_extensions.TypeVar('U')
        U_infer = typing_extensions.TypeVar('U_infer', infer_variance=True)
        for proto in range(pickle.HIGHEST_PROTOCOL):
            for typevar in (U, U_infer):
                z = pickle.loads(pickle.dumps(typevar, proto))
                self.assertEqual(z.__name__, typevar.__name__)
                self.assertEqual(z.__covariant__, typevar.__covariant__)
                self.assertEqual(z.__contravariant__, typevar.__contravariant__)
                self.assertEqual(z.__bound__, typevar.__bound__)
                self.assertEqual(z.__infer_variance__, typevar.__infer_variance__)


class BufferTests(BaseTestCase):
    def test(self):
        self.assertIsInstance(memoryview(b''), Buffer)
        self.assertIsInstance(bytearray(), Buffer)
        self.assertIsInstance(b"x", Buffer)
        self.assertNotIsInstance(1, Buffer)

        self.assertIsSubclass(bytearray, Buffer)
        self.assertIsSubclass(memoryview, Buffer)
        self.assertIsSubclass(bytes, Buffer)
        self.assertNotIsSubclass(int, Buffer)

        class MyRegisteredBuffer:
            def __buffer__(self, flags: int) -> memoryview:
                return memoryview(b'')

        # On 3.12, collections.abc.Buffer does a structural compatibility check
        if TYPING_3_12_0:
            self.assertIsInstance(MyRegisteredBuffer(), Buffer)
            self.assertIsSubclass(MyRegisteredBuffer, Buffer)
        else:
            self.assertNotIsInstance(MyRegisteredBuffer(), Buffer)
            self.assertNotIsSubclass(MyRegisteredBuffer, Buffer)
        Buffer.register(MyRegisteredBuffer)
        self.assertIsInstance(MyRegisteredBuffer(), Buffer)
        self.assertIsSubclass(MyRegisteredBuffer, Buffer)

        class MySubclassedBuffer(Buffer):
            def __buffer__(self, flags: int) -> memoryview:
                return memoryview(b'')

        self.assertIsInstance(MySubclassedBuffer(), Buffer)
        self.assertIsSubclass(MySubclassedBuffer, Buffer)


class GetOriginalBasesTests(BaseTestCase):
    def test_basics(self):
        T = TypeVar('T')
        class A: pass
        class B(Generic[T]): pass
        class C(B[int]): pass
        class D(B[str], float): pass
        self.assertEqual(get_original_bases(A), (object,))
        self.assertEqual(get_original_bases(B), (Generic[T],))
        self.assertEqual(get_original_bases(C), (B[int],))
        self.assertEqual(get_original_bases(int), (object,))
        self.assertEqual(get_original_bases(D), (B[str], float))

        with self.assertRaisesRegex(TypeError, "Expected an instance of type"):
            get_original_bases(object())

    @skipUnless(TYPING_3_9_0, "PEP 585 is yet to be")
    def test_builtin_generics(self):
        class E(list[T]): pass
        class F(list[int]): pass

        self.assertEqual(get_original_bases(E), (list[T],))
        self.assertEqual(get_original_bases(F), (list[int],))

    @skipIf(
        sys.version_info[:3] == (3, 12, 0) and sys.version_info[3] in {"alpha", "beta"},
        "Early versions of py312 had a bug"
    )
    def test_concrete_subclasses_of_generic_classes(self):
        T = TypeVar("T")

        class FirstBase(Generic[T]): pass
        class SecondBase(Generic[T]): pass
        class First(FirstBase[int]): pass
        class Second(SecondBase[int]): pass
        class G(First, Second): pass
        self.assertEqual(get_original_bases(G), (First, Second))

        class First_(Generic[T]): pass
        class Second_(Generic[T]): pass
        class H(First_, Second_): pass
        self.assertEqual(get_original_bases(H), (First_, Second_))

    def test_namedtuples(self):
        # On 3.12, this should work well with typing.NamedTuple and typing_extensions.NamedTuple
        # On lower versions, it will only work fully with typing_extensions.NamedTuple
        if sys.version_info >= (3, 12):
            namedtuple_classes = (typing.NamedTuple, typing_extensions.NamedTuple)
        else:
            namedtuple_classes = (typing_extensions.NamedTuple,)

        for NamedTuple in namedtuple_classes:  # noqa: F402
            with self.subTest(cls=NamedTuple):
                class ClassBasedNamedTuple(NamedTuple):
                    x: int

                class GenericNamedTuple(NamedTuple, Generic[T]):
                    x: T

                CallBasedNamedTuple = NamedTuple("CallBasedNamedTuple", [("x", int)])

                self.assertIs(
                    get_original_bases(ClassBasedNamedTuple)[0], NamedTuple
                )
                self.assertEqual(
                    get_original_bases(GenericNamedTuple),
                    (NamedTuple, Generic[T])
                )
                self.assertIs(
                    get_original_bases(CallBasedNamedTuple)[0], NamedTuple
                )

    def test_typeddicts(self):
        # On 3.12, this should work well with typing.TypedDict and typing_extensions.TypedDict
        # On lower versions, it will only work fully with typing_extensions.TypedDict
        if sys.version_info >= (3, 12):
            typeddict_classes = (typing.TypedDict, typing_extensions.TypedDict)
        else:
            typeddict_classes = (typing_extensions.TypedDict,)

        for TypedDict in typeddict_classes:  # noqa: F402
            with self.subTest(cls=TypedDict):
                class ClassBasedTypedDict(TypedDict):
                    x: int

                class GenericTypedDict(TypedDict, Generic[T]):
                    x: T

                CallBasedTypedDict = TypedDict("CallBasedTypedDict", {"x": int})

                self.assertIs(
                    get_original_bases(ClassBasedTypedDict)[0],
                    TypedDict
                )
                self.assertEqual(
                    get_original_bases(GenericTypedDict),
                    (TypedDict, Generic[T])
                )
                self.assertIs(
                    get_original_bases(CallBasedTypedDict)[0],
                    TypedDict
                )


class TypeAliasTypeTests(BaseTestCase):
    def test_attributes(self):
        Simple = TypeAliasType("Simple", int)
        self.assertEqual(Simple.__name__, "Simple")
        self.assertIs(Simple.__value__, int)
        self.assertEqual(Simple.__type_params__, ())
        self.assertEqual(Simple.__parameters__, ())

        T = TypeVar("T")
        ListOrSetT = TypeAliasType("ListOrSetT", Union[List[T], Set[T]], type_params=(T,))
        self.assertEqual(ListOrSetT.__name__, "ListOrSetT")
        self.assertEqual(ListOrSetT.__value__, Union[List[T], Set[T]])
        self.assertEqual(ListOrSetT.__type_params__, (T,))
        self.assertEqual(ListOrSetT.__parameters__, (T,))

        Ts = TypeVarTuple("Ts")
        Variadic = TypeAliasType("Variadic", Tuple[int, Unpack[Ts]], type_params=(Ts,))
        self.assertEqual(Variadic.__name__, "Variadic")
        self.assertEqual(Variadic.__value__, Tuple[int, Unpack[Ts]])
        self.assertEqual(Variadic.__type_params__, (Ts,))
        self.assertEqual(Variadic.__parameters__, tuple(iter(Ts)))

    def test_cannot_set_attributes(self):
        Simple = TypeAliasType("Simple", int)
        with self.assertRaisesRegex(AttributeError, "readonly attribute"):
            Simple.__name__ = "NewName"
        with self.assertRaisesRegex(
            AttributeError,
            "attribute '__value__' of 'typing.TypeAliasType' objects is not writable",
        ):
            Simple.__value__ = str
        with self.assertRaisesRegex(
            AttributeError,
            "attribute '__type_params__' of 'typing.TypeAliasType' objects is not writable",
        ):
            Simple.__type_params__ = (T,)
        with self.assertRaisesRegex(
            AttributeError,
            "attribute '__parameters__' of 'typing.TypeAliasType' objects is not writable",
        ):
            Simple.__parameters__ = (T,)
        with self.assertRaisesRegex(
            AttributeError,
            "attribute '__module__' of 'typing.TypeAliasType' objects is not writable",
        ):
            Simple.__module__ = 42
        with self.assertRaisesRegex(
            AttributeError,
            "'typing.TypeAliasType' object has no attribute 'some_attribute'",
        ):
            Simple.some_attribute = "not allowed"

    def test_cannot_delete_attributes(self):
        Simple = TypeAliasType("Simple", int)
        with self.assertRaisesRegex(AttributeError, "readonly attribute"):
            del Simple.__name__
        with self.assertRaisesRegex(
            AttributeError,
            "attribute '__value__' of 'typing.TypeAliasType' objects is not writable",
        ):
            del Simple.__value__
        with self.assertRaisesRegex(
            AttributeError,
            "'typing.TypeAliasType' object has no attribute 'some_attribute'",
        ):
            del Simple.some_attribute

    def test_or(self):
        Alias = TypeAliasType("Alias", int)
        if sys.version_info >= (3, 10):
            self.assertEqual(Alias | int, Union[Alias, int])
            self.assertEqual(Alias | None, Union[Alias, None])
            self.assertEqual(Alias | (int | str), Union[Alias, int | str])
            self.assertEqual(Alias | list[float], Union[Alias, list[float]])
        else:
            with self.assertRaises(TypeError):
                Alias | int
        # Rejected on all versions
        with self.assertRaises(TypeError):
            Alias | "Ref"

    def test_getitem(self):
        ListOrSetT = TypeAliasType("ListOrSetT", Union[List[T], Set[T]], type_params=(T,))
        subscripted = ListOrSetT[int]
        self.assertEqual(get_args(subscripted), (int,))
        self.assertIs(get_origin(subscripted), ListOrSetT)
        with self.assertRaises(TypeError):
            subscripted[str]

        still_generic = ListOrSetT[Iterable[T]]
        self.assertEqual(get_args(still_generic), (Iterable[T],))
        self.assertIs(get_origin(still_generic), ListOrSetT)
        fully_subscripted = still_generic[float]
        self.assertEqual(get_args(fully_subscripted), (Iterable[float],))
        self.assertIs(get_origin(fully_subscripted), ListOrSetT)

    def test_pickle(self):
        global Alias
        Alias = TypeAliasType("Alias", int)
        for proto in range(pickle.HIGHEST_PROTOCOL + 1):
            with self.subTest(proto=proto):
                pickled = pickle.dumps(Alias, proto)
                unpickled = pickle.loads(pickled)
                self.assertIs(unpickled, Alias)

    def test_no_instance_subclassing(self):
        with self.assertRaises(TypeError):
            class MyAlias(TypeAliasType):
                pass


class DocTests(BaseTestCase):
    def test_annotation(self):

        def hi(to: Annotated[str, Doc("Who to say hi to")]) -> None: pass

        hints = get_type_hints(hi, include_extras=True)
        doc_info = hints["to"].__metadata__[0]
        self.assertEqual(doc_info.documentation, "Who to say hi to")
        self.assertIsInstance(doc_info, Doc)

    def test_repr(self):
        doc_info = Doc("Who to say hi to")
        self.assertEqual(repr(doc_info), "Doc('Who to say hi to')")

    def test_hashability(self):
        doc_info = Doc("Who to say hi to")
        self.assertIsInstance(hash(doc_info), int)
        self.assertNotEqual(hash(doc_info), hash(Doc("Who not to say hi to")))

    def test_equality(self):
        doc_info = Doc("Who to say hi to")
        # Equal to itself
        self.assertEqual(doc_info, doc_info)
        # Equal to another instance with the same string
        self.assertEqual(doc_info, Doc("Who to say hi to"))
        # Not equal to another instance with a different string
        self.assertNotEqual(doc_info, Doc("Who not to say hi to"))

    def test_pickle(self):
        doc_info = Doc("Who to say hi to")
        for proto in range(pickle.HIGHEST_PROTOCOL):
            pickled = pickle.dumps(doc_info, protocol=proto)
            self.assertEqual(doc_info, pickle.loads(pickled))


@skipUnless(
    hasattr(typing_extensions, "CapsuleType"),
    "CapsuleType is not available on all Python implementations"
)
class CapsuleTypeTests(BaseTestCase):
    def test_capsule_type(self):
        import _datetime
        self.assertIsInstance(_datetime.datetime_CAPI, typing_extensions.CapsuleType)


def times_three(fn):
    @functools.wraps(fn)
    def wrapper(a, b):
        return fn(a * 3, b * 3)

    return wrapper


class TestGetAnnotations(BaseTestCase):
    @classmethod
    def setUpClass(cls):
        with tempfile.TemporaryDirectory() as tempdir:
            sys.path.append(tempdir)
            Path(tempdir, "inspect_stock_annotations.py").write_text(STOCK_ANNOTATIONS)
            Path(tempdir, "inspect_stringized_annotations.py").write_text(STRINGIZED_ANNOTATIONS)
            Path(tempdir, "inspect_stringized_annotations_2.py").write_text(STRINGIZED_ANNOTATIONS_2)
            cls.inspect_stock_annotations = importlib.import_module("inspect_stock_annotations")
            cls.inspect_stringized_annotations = importlib.import_module("inspect_stringized_annotations")
            cls.inspect_stringized_annotations_2 = importlib.import_module("inspect_stringized_annotations_2")
        sys.path.pop()

    @classmethod
    def tearDownClass(cls):
        for modname in (
            "inspect_stock_annotations",
            "inspect_stringized_annotations",
            "inspect_stringized_annotations_2",
        ):
            delattr(cls, modname)
            del sys.modules[modname]

    def test_builtin_type(self):
        self.assertEqual(get_annotations(int), {})
        self.assertEqual(get_annotations(object), {})

    def test_format(self):
        def f1(a: int):
            pass

        def f2(a: "undefined"):  # noqa: F821
            pass

        self.assertEqual(
            get_annotations(f1, format=Format.VALUE), {"a": int}
        )
        self.assertEqual(get_annotations(f1, format=1), {"a": int})

        self.assertEqual(
            get_annotations(f2, format=Format.FORWARDREF),
            {"a": "undefined"},
        )
        self.assertEqual(get_annotations(f2, format=2), {"a": "undefined"})

        self.assertEqual(
            get_annotations(f1, format=Format.SOURCE),
            {"a": "int"},
        )
        self.assertEqual(get_annotations(f1, format=3), {"a": "int"})

        with self.assertRaises(ValueError):
            get_annotations(f1, format=0)

        with self.assertRaises(ValueError):
            get_annotations(f1, format=4)

    def test_custom_object_with_annotations(self):
        class C:
            def __init__(self, x: int = 0, y: str = ""):
                self.__annotations__ = {"x": int, "y": str}

        self.assertEqual(get_annotations(C()), {"x": int, "y": str})

    def test_custom_format_eval_str(self):
        def foo():
            pass

        with self.assertRaises(ValueError):
            get_annotations(
                foo, format=Format.FORWARDREF, eval_str=True
            )
            get_annotations(
                foo, format=Format.SOURCE, eval_str=True
            )

    def test_stock_annotations(self):
        def foo(a: int, b: str):
            pass

        for format in (Format.VALUE, Format.FORWARDREF):
            with self.subTest(format=format):
                self.assertEqual(
                    get_annotations(foo, format=format),
                    {"a": int, "b": str},
                )
        self.assertEqual(
            get_annotations(foo, format=Format.SOURCE),
            {"a": "int", "b": "str"},
        )

        foo.__annotations__ = {"a": "foo", "b": "str"}
        for format in Format:
            with self.subTest(format=format):
                self.assertEqual(
                    get_annotations(foo, format=format),
                    {"a": "foo", "b": "str"},
                )

        self.assertEqual(
            get_annotations(foo, eval_str=True, locals=locals()),
            {"a": foo, "b": str},
        )
        self.assertEqual(
            get_annotations(foo, eval_str=True, globals=locals()),
            {"a": foo, "b": str},
        )

    def test_stock_annotations_in_module(self):
        isa = self.inspect_stock_annotations

        for kwargs in [
            {},
            {"eval_str": False},
            {"format": Format.VALUE},
            {"format": Format.FORWARDREF},
            {"format": Format.VALUE, "eval_str": False},
            {"format": Format.FORWARDREF, "eval_str": False},
        ]:
            with self.subTest(**kwargs):
                self.assertEqual(
                    get_annotations(isa, **kwargs), {"a": int, "b": str}
                )
                self.assertEqual(
                    get_annotations(isa.MyClass, **kwargs),
                    {"a": int, "b": str},
                )
                self.assertEqual(
                    get_annotations(isa.function, **kwargs),
                    {"a": int, "b": str, "return": isa.MyClass},
                )
                self.assertEqual(
                    get_annotations(isa.function2, **kwargs),
                    {"a": int, "b": "str", "c": isa.MyClass, "return": isa.MyClass},
                )
                self.assertEqual(
                    get_annotations(isa.function3, **kwargs),
                    {"a": "int", "b": "str", "c": "MyClass"},
                )
                self.assertEqual(
                    get_annotations(inspect, **kwargs), {}
                )  # inspect module has no annotations
                self.assertEqual(
                    get_annotations(isa.UnannotatedClass, **kwargs), {}
                )
                self.assertEqual(
                    get_annotations(isa.unannotated_function, **kwargs), {}
                )

        for kwargs in [
            {"eval_str": True},
            {"format": Format.VALUE, "eval_str": True},
        ]:
            with self.subTest(**kwargs):
                self.assertEqual(
                    get_annotations(isa, **kwargs), {"a": int, "b": str}
                )
                self.assertEqual(
                    get_annotations(isa.MyClass, **kwargs),
                    {"a": int, "b": str},
                )
                self.assertEqual(
                    get_annotations(isa.function, **kwargs),
                    {"a": int, "b": str, "return": isa.MyClass},
                )
                self.assertEqual(
                    get_annotations(isa.function2, **kwargs),
                    {"a": int, "b": str, "c": isa.MyClass, "return": isa.MyClass},
                )
                self.assertEqual(
                    get_annotations(isa.function3, **kwargs),
                    {"a": int, "b": str, "c": isa.MyClass},
                )
                self.assertEqual(get_annotations(inspect, **kwargs), {})
                self.assertEqual(
                    get_annotations(isa.UnannotatedClass, **kwargs), {}
                )
                self.assertEqual(
                    get_annotations(isa.unannotated_function, **kwargs), {}
                )

        self.assertEqual(
            get_annotations(isa, format=Format.SOURCE),
            {"a": "int", "b": "str"},
        )
        self.assertEqual(
            get_annotations(isa.MyClass, format=Format.SOURCE),
            {"a": "int", "b": "str"},
        )
        mycls = "MyClass" if _PEP_649_OR_749_IMPLEMENTED else "inspect_stock_annotations.MyClass"
        self.assertEqual(
            get_annotations(isa.function, format=Format.SOURCE),
            {"a": "int", "b": "str", "return": mycls},
        )
        self.assertEqual(
            get_annotations(
                isa.function2, format=Format.SOURCE
            ),
            {"a": "int", "b": "str", "c": mycls, "return": mycls},
        )
        self.assertEqual(
            get_annotations(
                isa.function3, format=Format.SOURCE
            ),
            {"a": "int", "b": "str", "c": "MyClass"},
        )
        self.assertEqual(
            get_annotations(inspect, format=Format.SOURCE),
            {},
        )
        self.assertEqual(
            get_annotations(
                isa.UnannotatedClass, format=Format.SOURCE
            ),
            {},
        )
        self.assertEqual(
            get_annotations(
                isa.unannotated_function, format=Format.SOURCE
            ),
            {},
        )

    def test_stock_annotations_on_wrapper(self):
        isa = self.inspect_stock_annotations

        wrapped = times_three(isa.function)
        self.assertEqual(wrapped(1, "x"), isa.MyClass(3, "xxx"))
        self.assertIsNot(wrapped.__globals__, isa.function.__globals__)
        self.assertEqual(
            get_annotations(wrapped),
            {"a": int, "b": str, "return": isa.MyClass},
        )
        self.assertEqual(
            get_annotations(wrapped, format=Format.FORWARDREF),
            {"a": int, "b": str, "return": isa.MyClass},
        )
        mycls = "MyClass" if _PEP_649_OR_749_IMPLEMENTED else "inspect_stock_annotations.MyClass"
        self.assertEqual(
            get_annotations(wrapped, format=Format.SOURCE),
            {"a": "int", "b": "str", "return": mycls},
        )
        self.assertEqual(
            get_annotations(wrapped, eval_str=True),
            {"a": int, "b": str, "return": isa.MyClass},
        )
        self.assertEqual(
            get_annotations(wrapped, eval_str=False),
            {"a": int, "b": str, "return": isa.MyClass},
        )

    def test_stringized_annotations_in_module(self):
        isa = self.inspect_stringized_annotations
        for kwargs in [
            {},
            {"eval_str": False},
            {"format": Format.VALUE},
            {"format": Format.FORWARDREF},
            {"format": Format.SOURCE},
            {"format": Format.VALUE, "eval_str": False},
            {"format": Format.FORWARDREF, "eval_str": False},
            {"format": Format.SOURCE, "eval_str": False},
        ]:
            with self.subTest(**kwargs):
                self.assertEqual(
                    get_annotations(isa, **kwargs), {"a": "int", "b": "str"}
                )
                self.assertEqual(
                    get_annotations(isa.MyClass, **kwargs),
                    {"a": "int", "b": "str"},
                )
                self.assertEqual(
                    get_annotations(isa.function, **kwargs),
                    {"a": "int", "b": "str", "return": "MyClass"},
                )
                self.assertEqual(
                    get_annotations(isa.function2, **kwargs),
                    {"a": "int", "b": "'str'", "c": "MyClass", "return": "MyClass"},
                )
                self.assertEqual(
                    get_annotations(isa.function3, **kwargs),
                    {"a": "'int'", "b": "'str'", "c": "'MyClass'"},
                )
                self.assertEqual(
                    get_annotations(isa.UnannotatedClass, **kwargs), {}
                )
                self.assertEqual(
                    get_annotations(isa.unannotated_function, **kwargs), {}
                )

        for kwargs in [
            {"eval_str": True},
            {"format": Format.VALUE, "eval_str": True},
        ]:
            with self.subTest(**kwargs):
                self.assertEqual(
                    get_annotations(isa, **kwargs), {"a": int, "b": str}
                )
                self.assertEqual(
                    get_annotations(isa.MyClass, **kwargs),
                    {"a": int, "b": str},
                )
                self.assertEqual(
                    get_annotations(isa.function, **kwargs),
                    {"a": int, "b": str, "return": isa.MyClass},
                )
                self.assertEqual(
                    get_annotations(isa.function2, **kwargs),
                    {"a": int, "b": "str", "c": isa.MyClass, "return": isa.MyClass},
                )
                self.assertEqual(
                    get_annotations(isa.function3, **kwargs),
                    {"a": "int", "b": "str", "c": "MyClass"},
                )
                self.assertEqual(
                    get_annotations(isa.UnannotatedClass, **kwargs), {}
                )
                self.assertEqual(
                    get_annotations(isa.unannotated_function, **kwargs), {}
                )

    def test_stringized_annotations_in_empty_module(self):
        isa2 = self.inspect_stringized_annotations_2
        self.assertEqual(get_annotations(isa2), {})
        self.assertEqual(get_annotations(isa2, eval_str=True), {})
        self.assertEqual(get_annotations(isa2, eval_str=False), {})

    def test_stringized_annotations_on_wrapper(self):
        isa = self.inspect_stringized_annotations
        wrapped = times_three(isa.function)
        self.assertEqual(wrapped(1, "x"), isa.MyClass(3, "xxx"))
        self.assertIsNot(wrapped.__globals__, isa.function.__globals__)
        self.assertEqual(
            get_annotations(wrapped),
            {"a": "int", "b": "str", "return": "MyClass"},
        )
        self.assertEqual(
            get_annotations(wrapped, eval_str=True),
            {"a": int, "b": str, "return": isa.MyClass},
        )
        self.assertEqual(
            get_annotations(wrapped, eval_str=False),
            {"a": "int", "b": "str", "return": "MyClass"},
        )

    def test_stringized_annotations_on_class(self):
        isa = self.inspect_stringized_annotations
        # test that local namespace lookups work
        self.assertEqual(
            get_annotations(isa.MyClassWithLocalAnnotations),
            {"x": "mytype"},
        )
        self.assertEqual(
            get_annotations(isa.MyClassWithLocalAnnotations, eval_str=True),
            {"x": int},
        )

    def test_modify_annotations(self):
        def f(x: int):
            pass

        self.assertEqual(get_annotations(f), {"x": int})
        self.assertEqual(
            get_annotations(f, format=Format.FORWARDREF),
            {"x": int},
        )

        f.__annotations__["x"] = str
        self.assertEqual(get_annotations(f), {"x": str})


@skipIf(STRINGIZED_ANNOTATIONS_PEP_695 is None, "PEP 695 has yet to be")
class TestGetAnnotationsWithPEP695(BaseTestCase):
    @classmethod
    def setUpClass(cls):
        with tempfile.TemporaryDirectory() as tempdir:
            sys.path.append(tempdir)
            Path(tempdir, "inspect_stringized_annotations_pep_695.py").write_text(STRINGIZED_ANNOTATIONS_PEP_695)
            cls.inspect_stringized_annotations_pep_695 = importlib.import_module(
                "inspect_stringized_annotations_pep_695"
            )
        sys.path.pop()

    @classmethod
    def tearDownClass(cls):
        del cls.inspect_stringized_annotations_pep_695
        del sys.modules["inspect_stringized_annotations_pep_695"]

    def test_pep695_generic_class_with_future_annotations(self):
        ann_module695 = self.inspect_stringized_annotations_pep_695
        A_annotations = get_annotations(ann_module695.A, eval_str=True)
        A_type_params = ann_module695.A.__type_params__
        self.assertIs(A_annotations["x"], A_type_params[0])
        self.assertEqual(A_annotations["y"].__args__[0], Unpack[A_type_params[1]])
        self.assertIs(A_annotations["z"].__args__[0], A_type_params[2])

    def test_pep695_generic_class_with_future_annotations_and_local_shadowing(self):
        B_annotations = get_annotations(
            self.inspect_stringized_annotations_pep_695.B, eval_str=True
        )
        self.assertEqual(B_annotations, {"x": int, "y": str, "z": bytes})

    def test_pep695_generic_class_with_future_annotations_name_clash_with_global_vars(self):
        ann_module695 = self.inspect_stringized_annotations_pep_695
        C_annotations = get_annotations(ann_module695.C, eval_str=True)
        self.assertEqual(
            set(C_annotations.values()),
            set(ann_module695.C.__type_params__)
        )

    def test_pep_695_generic_function_with_future_annotations(self):
        ann_module695 = self.inspect_stringized_annotations_pep_695
        generic_func_annotations = get_annotations(
            ann_module695.generic_function, eval_str=True
        )
        func_t_params = ann_module695.generic_function.__type_params__
        self.assertEqual(
            generic_func_annotations.keys(), {"x", "y", "z", "zz", "return"}
        )
        self.assertIs(generic_func_annotations["x"], func_t_params[0])
        self.assertEqual(generic_func_annotations["y"], Unpack[func_t_params[1]])
        self.assertIs(generic_func_annotations["z"].__origin__, func_t_params[2])
        self.assertIs(generic_func_annotations["zz"].__origin__, func_t_params[2])

    def test_pep_695_generic_function_with_future_annotations_name_clash_with_global_vars(self):
        self.assertEqual(
            set(
                get_annotations(
                    self.inspect_stringized_annotations_pep_695.generic_function_2,
                    eval_str=True
                ).values()
            ),
            set(
                self.inspect_stringized_annotations_pep_695.generic_function_2.__type_params__
            )
        )

    def test_pep_695_generic_method_with_future_annotations(self):
        ann_module695 = self.inspect_stringized_annotations_pep_695
        generic_method_annotations = get_annotations(
            ann_module695.D.generic_method, eval_str=True
        )
        params = {
            param.__name__: param
            for param in ann_module695.D.generic_method.__type_params__
        }
        self.assertEqual(
            generic_method_annotations,
            {"x": params["Foo"], "y": params["Bar"], "return": None}
        )

    def test_pep_695_generic_method_with_future_annotations_name_clash_with_global_vars(self):
        self.assertEqual(
            set(
                get_annotations(
                    self.inspect_stringized_annotations_pep_695.D.generic_method_2,
                    eval_str=True
                ).values()
            ),
            set(
                self.inspect_stringized_annotations_pep_695.D.generic_method_2.__type_params__
            )
        )

    def test_pep_695_generic_method_with_future_annotations_name_clash_with_global_and_local_vars(self):
        self.assertEqual(
            get_annotations(
                self.inspect_stringized_annotations_pep_695.E, eval_str=True
            ),
            {"x": str},
        )

    def test_pep_695_generics_with_future_annotations_nested_in_function(self):
        results = self.inspect_stringized_annotations_pep_695.nested()

        self.assertEqual(
            set(results.F_annotations.values()),
            set(results.F.__type_params__)
        )
        self.assertEqual(
            set(results.F_meth_annotations.values()),
            set(results.F.generic_method.__type_params__)
        )
        self.assertNotEqual(
            set(results.F_meth_annotations.values()),
            set(results.F.__type_params__)
        )
        self.assertEqual(
            set(results.F_meth_annotations.values()).intersection(results.F.__type_params__),
            set()
        )

        self.assertEqual(results.G_annotations, {"x": str})

        self.assertEqual(
            set(results.generic_func_annotations.values()),
            set(results.generic_func.__type_params__)
        )


if __name__ == '__main__':
    main()

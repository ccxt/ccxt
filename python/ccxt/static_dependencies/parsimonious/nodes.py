"""Nodes that make up parse trees

Parsing spits out a tree of these, which you can then tell to walk itself and
spit out a useful value. Or you can walk it yourself; the structural attributes
are public.

"""
# TODO: If this is slow, think about using cElementTree or something.
from inspect import isfunction
from sys import version_info, exc_info

from .exceptions import VisitationError, UndefinedLabel


class Node(object):
    """A parse tree node

    Consider these immutable once constructed. As a side effect of a
    memory-saving strategy in the cache, multiple references to a single
    ``Node`` might be returned in a single parse tree. So, if you start
    messing with one, you'll see surprising parallel changes pop up elsewhere.

    My philosophy is that parse trees (and their nodes) should be
    representation-agnostic. That is, they shouldn't get all mixed up with what
    the final rendered form of a wiki page (or the intermediate representation
    of a programming language, or whatever) is going to be: you should be able
    to parse once and render several representations from the tree, one after
    another.

    """
    # I tried making this subclass list, but it got ugly. I had to construct
    # invalid ones and patch them up later, and there were other problems.
    __slots__ = ['expr',  # The expression that generated me
                 'full_text',  # The full text fed to the parser
                 'start', # The position in the text where that expr started matching
                 'end',   # The position after start where the expr first didn't
                          # match. [start:end] follow Python slice conventions.
                 'children']  # List of child parse tree nodes

    def __init__(self, expr, full_text, start, end, children=None):
        self.expr = expr
        self.full_text = full_text
        self.start = start
        self.end = end
        self.children = children or []

    @property
    def expr_name(self):
        # backwards compatibility
        return self.expr.name

    def __iter__(self):
        """Support looping over my children and doing tuple unpacks on me.

        It can be very handy to unpack nodes in arg lists; see
        :class:`PegVisitor` for an example.

        """
        return iter(self.children)

    @property
    def text(self):
        """Return the text this node matched."""
        return self.full_text[self.start:self.end]

    # From here down is just stuff for testing and debugging.

    def prettily(self, error=None):
        """Return a unicode, pretty-printed representation of me.

        :arg error: The node to highlight because an error occurred there

        """
        # TODO: If a Node appears multiple times in the tree, we'll point to
        # them all. Whoops.
        def indent(text):
            return '\n'.join(('    ' + line) for line in text.splitlines())
        ret = [u'<%s%s matching "%s">%s' % (
            self.__class__.__name__,
            (' called "%s"' % self.expr_name) if self.expr_name else '',
            self.text,
            '  <-- *** We were here. ***' if error is self else '')]
        for n in self:
            ret.append(indent(n.prettily(error=error)))
        return '\n'.join(ret)

    def __str__(self):
        """Return a compact, human-readable representation of me."""
        return self.prettily()

    def __eq__(self, other):
        """Support by-value deep comparison with other nodes for testing."""
        if not isinstance(other, Node):
            return NotImplemented

        return (self.expr == other.expr and
                self.full_text == other.full_text and
                self.start == other.start and
                self.end == other.end and
                self.children == other.children)

    def __ne__(self, other):
        return not self == other

    def __repr__(self, top_level=True):
        """Return a bit of code (though not an expression) that will recreate
        me."""
        # repr() of unicode flattens everything out to ASCII, so we don't need
        # to explicitly encode things afterward.
        ret = ["s = %r" % self.full_text] if top_level else []
        ret.append("%s(%r, s, %s, %s%s)" % (
            self.__class__.__name__,
            self.expr,
            self.start,
            self.end,
            (', children=[%s]' %
             ', '.join([c.__repr__(top_level=False) for c in self.children]))
            if self.children else ''))
        return '\n'.join(ret)


class RegexNode(Node):
    """Node returned from a ``Regex`` expression

    Grants access to the ``re.Match`` object, in case you want to access
    capturing groups, etc.

    """
    __slots__ = ['match']


class RuleDecoratorMeta(type):
    def __new__(metaclass, name, bases, namespace):
        def unvisit(name):
            """Remove any leading "visit_" from a method name."""
            return name[6:] if name.startswith('visit_') else name

        methods = [v for k, v in namespace.items() if
                   hasattr(v, '_rule') and isfunction(v)]
        if methods:
            from .grammar import Grammar  # circular import dodge

            methods.sort(key=(lambda x: x.func_code.co_firstlineno)
                             if version_info[0] < 3 else
                             (lambda x: x.__code__.co_firstlineno))
            # Possible enhancement: once we get the Grammar extensibility story
            # solidified, we can have @rules *add* to the default grammar
            # rather than pave over it.
            namespace['grammar'] = Grammar(
                '\n'.join('{name} = {expr}'.format(name=unvisit(m.__name__),
                                                   expr=m._rule)
                          for m in methods))
        return super(RuleDecoratorMeta,
                     metaclass).__new__(metaclass, name, bases, namespace)


class NodeVisitor(object, metaclass=RuleDecoratorMeta):
    """A shell for writing things that turn parse trees into something useful

    Performs a depth-first traversal of an AST. Subclass this, add methods for
    each expr you care about, instantiate, and call
    ``visit(top_node_of_parse_tree)``. It'll return the useful stuff. This API
    is very similar to that of ``ast.NodeVisitor``.

    These could easily all be static methods, but that would add at least as
    much weirdness at the call site as the ``()`` for instantiation. And this
    way, we support subclasses that require state: options, for example, or a
    symbol table constructed from a programming language's AST.

    We never transform the parse tree in place, because...

    * There are likely multiple references to the same ``Node`` object in a
      parse tree, and changes to one reference would surprise you elsewhere.
    * It makes it impossible to report errors: you'd end up with the "error"
      arrow pointing someplace in a half-transformed mishmash of nodes--and
      that's assuming you're even transforming the tree into another tree.
      Heaven forbid you're making it into a string or something else.

    """

    #: The :term:`default grammar`: the one recommended for use with this
    #: visitor. If you populate this, you will be able to call
    #: :meth:`NodeVisitor.parse()` as a shortcut.
    grammar = None

    #: Classes of exceptions you actually intend to raise during visitation
    #: and which should propagate out of the visitor. These will not be
    #: wrapped in a VisitationError when they arise.
    unwrapped_exceptions = ()

    # TODO: If we need to optimize this, we can go back to putting subclasses
    # in charge of visiting children; they know when not to bother. Or we can
    # mark nodes as not descent-worthy in the grammar.
    def visit(self, node):
        """Walk a parse tree, transforming it into another representation.

        Recursively descend a parse tree, dispatching to the method named after
        the rule in the :class:`~.grammar.Grammar` that produced
        each node. If, for example, a rule was... ::

            bold = '<b>'

        ...the ``visit_bold()`` method would be called. It is your
        responsibility to subclass :class:`NodeVisitor` and implement those
        methods.

        """
        method = getattr(self, 'visit_' + node.expr_name, self.generic_visit)

        # Call that method, and show where in the tree it failed if it blows
        # up.
        try:
            return method(node, [self.visit(n) for n in node])
        except (VisitationError, UndefinedLabel):
            # Don't catch and re-wrap already-wrapped exceptions.
            raise
        except Exception as exc:
            # implentors may define exception classes that should not be
            # wrapped.
            if isinstance(exc, self.unwrapped_exceptions):
                raise
            # Catch any exception, and tack on a parse tree so it's easier to
            # see where it went wrong.
            exc_class = type(exc)
            raise VisitationError(exc, exc_class, node)

    def generic_visit(self, node, visited_children):
        """Default visitor method

        :arg node: The node we're visiting
        :arg visited_children: The results of visiting the children of that
            node, in a list

        I'm not sure there's an implementation of this that makes sense across
        all (or even most) use cases, so we leave it to subclasses to implement
        for now.

        """
        raise NotImplementedError('No visitor method was defined for this expression: %s' %
                                  node.expr.as_rule())

    # Convenience methods:

    def parse(self, text, pos=0):
        """Parse some text with this Visitor's default grammar and return the
        result of visiting it.

        ``SomeVisitor().parse('some_string')`` is a shortcut for
        ``SomeVisitor().visit(some_grammar.parse('some_string'))``.

        """
        return self._parse_or_match(text, pos, 'parse')

    def match(self, text, pos=0):
        """Parse and visit some text with this Visitor's default grammar, but
        don't insist on parsing all the way to the end.

        ``SomeVisitor().match('some_string')`` is a shortcut for
        ``SomeVisitor().visit(some_grammar.match('some_string'))``.

        """
        return self._parse_or_match(text, pos, 'match')

    # Internal convenience methods to help you write your own visitors:

    def lift_child(self, node, children):
        """Lift the sole child of ``node`` up to replace the node."""
        first_child, = children
        return first_child

    # Private methods:

    def _parse_or_match(self, text, pos, method_name):
        """Execute a parse or match on the default grammar, followed by a
        visitation.

        Raise RuntimeError if there is no default grammar specified.

        """
        if not self.grammar:
            raise RuntimeError(
                "The {cls}.{method}() shortcut won't work because {cls} was "
                "never associated with a specific " "grammar. Fill out its "
                "`grammar` attribute, and try again.".format(
                    cls=self.__class__.__name__,
                    method=method_name))
        return self.visit(getattr(self.grammar, method_name)(text, pos=pos))


def rule(rule_string):
    """Decorate a NodeVisitor ``visit_*`` method to tie a grammar rule to it.

    The following will arrange for the ``visit_digit`` method to receive the
    results of the ``~"[0-9]"`` parse rule::

        @rule('~"[0-9]"')
        def visit_digit(self, node, visited_children):
            ...

    Notice that there is no "digit = " as part of the rule; that gets inferred
    from the method name.

    In cases where there is only one kind of visitor interested in a grammar,
    using ``@rule`` saves you having to look back and forth between the visitor
    and the grammar definition.

    On an implementation level, all ``@rule`` rules get stitched together into
    a :class:`~.Grammar` that becomes the NodeVisitor's
    :term:`default grammar`.

    Typically, the choice of a default rule for this grammar is simple: whatever
    ``@rule`` comes first in the class is the default. But the choice may become
    surprising if you divide the ``@rule`` calls among subclasses. At the
    moment, which method "comes first" is decided simply by comparing line
    numbers, so whatever method is on the smallest-numbered line will be the
    default. In a future release, this will change to pick the
    first ``@rule`` call on the basemost class that has one. That way, a
    subclass which does not override the default rule's ``visit_*`` method
    won't unintentionally change which rule is the default.

    """
    def decorator(method):
        method._rule = rule_string  # XXX: Maybe register them on a class var instead so we can just override a @rule'd visitor method on a subclass without blowing away the rule string that comes with it.
        return method
    return decorator

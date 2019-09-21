# -*- coding: utf-8 -*-
import json
import struct
import time
import sys
from collections import OrderedDict
from calendar import timegm
from binascii import hexlify, unhexlify
import hashlib
import string
import logging
# ecdsa signing
from static_dependencies import ecdsa

log = logging.getLogger(__name__)

default_prefix = "BTT"
class_idmap = {}
class_namemap = {}
object_type = {}

ops = {
    "transfer": 0,
    "order_create": 32,
    "order_cancel": 33,
    "proposal_withdraw": 18,
    "withdraw": 4,
    "withdraw_btc": 26
}

operations = ops

known_chains = {"BTT": {"chain_id": "0000000000000000000000000000000000000000000000000000000000000001", "core_symbol": "BTT", "prefix": "BTT"}}

timeformat = "%Y-%m-%dT%H:%M:%S%Z"


def _bytes(x):  # pragma: no branch
    """ Python3 and Python2 compatibility
    """
    if sys.version > "3":
        return bytes(x, "utf8")
    else:  # pragma: no cover
        return x.__bytes__()


def unicodify(data):
    r = []
    for s in data:
        o = ord(s)
        if (o <= 7) or (o == 11) or (o > 13 and o < 32):
            r.append("u%04x" % o)
        elif o == 8:
            r.append("b")
        elif o == 9:
            r.append("\t")
        elif o == 10:
            r.append("\n")
        elif o == 12:
            r.append("f")
        elif o == 13:
            r.append("\r")
        else:
            r.append(s)
    return bytes("".join(r), "utf-8")


# -- graphenebase.types --
def varint(n):
    """ Varint encoding
    """
    data = b""
    while n >= 0x80:
        data += bytes([(n & 0x7F) | 0x80])
        n >>= 7
    data += bytes([n])
    return data


def varintdecode(data):  # pragma: no cover
    """ Varint decoding
    """
    shift = 0
    result = 0
    for b in bytes(data):
        result |= (b & 0x7F) << shift
        if not (b & 0x80):
            break
        shift += 7
    return result


def variable_buffer(s):
    """ Encode variable length buffer
    """
    return varint(len(s)) + s


def JsonObj(data):
    """ Returns json object from data
    """
    return json.loads(str(data))


class Uint8:
    def __init__(self, d):
        self.data = int(d)

    def __bytes__(self):
        return struct.pack("<B", self.data)

    def __str__(self):
        return "%d" % self.data


class Int16:
    def __init__(self, d):
        self.data = int(d)

    def __bytes__(self):
        return struct.pack("<h", int(self.data))

    def __str__(self):
        return "%d" % self.data


class Uint16:
    def __init__(self, d):
        self.data = int(d)

    def __bytes__(self):
        return struct.pack("<H", self.data)

    def __str__(self):
        return "%d" % self.data


class Uint32:
    def __init__(self, d):
        self.data = int(d)

    def __bytes__(self):
        return struct.pack("<I", self.data)

    def __str__(self):
        return "%d" % self.data


class Uint64:
    def __init__(self, d):
        self.data = int(d)

    def __bytes__(self):
        return struct.pack("<Q", self.data)

    def __str__(self):
        return "%d" % self.data


class Uint128:
    def __init__(self, d):
        self.data = str(d)

    def __bytes__(self):
        base = 18446744073709551616
        a1 = int(int(self.data) // base)
        a2 = int(int(self.data) % base)
        return struct.pack("<QQ", a1, a2)

    def __str__(self):
        return "%s" % str(self.data)


class Varint32:
    def __init__(self, d):
        self.data = int(d)

    def __bytes__(self):
        return varint(self.data)

    def __str__(self):
        return "%d" % self.data


class Int64:
    def __init__(self, d):
        self.data = int(d)

    def __bytes__(self):
        return struct.pack("<q", self.data)

    def __str__(self):
        return "%d" % self.data


class String:
    def __init__(self, d):
        self.data = d

    def __bytes__(self):
        if self.data:
            d = unicodify(self.data)
        else:
            d = b""
        return varint(len(d)) + d

    def __str__(self):
        return "%s" % str(self.data)


class Bytes:
    def __init__(self, d):
        self.data = d

    def __bytes__(self):
        d = unhexlify(bytes(self.data, "utf-8"))
        return varint(len(d)) + d

    def __str__(self):
        return str(self.data)


class Hash(Bytes):
    def json(self):
        return str(self.data)

    def __bytes__(self):
        return unhexlify(bytes(self.data, "utf-8"))


class Ripemd160(Hash):
    def __init__(self, a):
        assert len(a) == 40, "Require 40 char long hex"
        super().__init__(a)


class Sha1(Hash):
    def __init__(self, a):
        assert len(a) == 40, "Require 40 char long hex"
        super().__init__(a)


class Sha256(Hash):
    def __init__(self, a):
        assert len(a) == 64, "Require 64 char long hex"
        super().__init__(a)


class Void:
    def __init__(self):
        pass

    def __bytes__(self):
        return b""

    def __str__(self):
        return ""


class Array:
    def __init__(self, d):
        self.data = d or []
        self.length = Varint32(len(self.data))

    def __bytes__(self):
        return bytes(self.length) + b"".join([bytes(a) for a in self.data])

    def __str__(self):
        r = []
        for a in self.data:
            try:
                r.append(JsonObj(a))
            except Exception:
                r.append(str(a))
        return json.dumps(r)


class PointInTime:
    def __init__(self, d):
        self.data = d

    def __bytes__(self):
        t = timegm(time.strptime((self.data + "UTC"), timeformat))
        return struct.pack("<I", t)

    def __str__(self):
        return self.data


class Signature:
    def __init__(self, d):
        self.data = d

    def __bytes__(self):
        return self.data

    def __str__(self):
        return json.dumps(hexlify(self.data).decode("ascii"))


class Bool(Uint8):  # Bool = Uint8
    def __init__(self, d):
        super().__init__(d)

    def __str__(self):
        return json.dumps(True) if self.data else json.dumps(False)


class Set(Array):  # Set = Array
    def __init__(self, d):
        super().__init__(d)


class Fixed_array:
    pass


class Optional:
    def __init__(self, d):
        self.data = d

    def __bytes__(self):
        if not bool(self.data):
            return bytes(Bool(0))
        else:
            return (
                bytes(Bool(1)) + bytes(self.data)
                if bytes(self.data)
                else bytes(Bool(0))
            )

    def __str__(self):
        return str(self.data)

    def isempty(self):
        if self.data is None:
            return True
        if not bool(str(self.data)):  # pragma: no cover
            return True
        return not bool(bytes(self.data))


class OptionalUint16:
    def __init__(self, d):
        self.data = d

    def __bytes__(self):
        if not bool(self.data):
            return bytes(Bool(0))
        else:
            return (
                bytes(Bool(1)) + bytes(Uint16(self.data))
                if bytes(Uint16(self.data))
                else bytes(Bool(0))
            )

    def __str__(self):
        return str(self.data)

    def isempty(self):
        if self.data is None:
            return True
        if not bool(str(self.data)):  # pragma: no cover
            return True
        return not bool(bytes(self.data))


class OptionalUint128:
    def __init__(self, d):
        self.data = d

    def __bytes__(self):
        if not bool(self.data):
            return bytes(Bool(0))
        else:
            return (
                bytes(Bool(1)) + bytes(Uint128(self.data))
                if bytes(Uint128(self.data))
                else bytes(Bool(0))
            )

    def __str__(self):
        return "%s" % str(self.data)

    def isempty(self):
        if self.data is None:
            return True
        if not bool(str(self.data)):  # pragma: no cover
            return True
        return not bool(bytes(self.data))


class OptionalPointInTime:
    def __init__(self, d):
        self.data = d

    def __bytes__(self):
        if not bool(self.data):
            return bytes(Bool(0))
        else:
            if self.data:
                return bytes(Bool(1)) + struct.pack("<I", timegm(time.strptime((self.data + "UTC"), timeformat)))
            else:
                return bytes(Bool(0))

    def __str__(self):
        return str(self.data)

    def isempty(self):
        if self.data is None:
            return True
        if not bool(str(self.data)):  # pragma: no cover
            return True
        return not bool(bytes(self.data))


class Static_variant:
    def __init__(self, d, type_id):
        self.data = d
        self.type_id = type_id

    def __bytes__(self):
        return varint(self.type_id) + bytes(self.data)

    def __str__(self):
        return json.dumps([self.type_id, self.data.json()])


class Map:
    def __init__(self, data):
        self.data = data

    def __bytes__(self):
        b = b""
        b += varint(len(self.data))
        for e in self.data:
            b += bytes(e[0]) + bytes(e[1])
        return b

    def __str__(self):
        r = []
        for e in self.data:
            r.append([str(e[0]), str(e[1])])
        return json.dumps(r)


class Id:
    def __init__(self, d):
        self.data = Varint32(d)

    def __bytes__(self):
        return bytes(self.data)

    def __str__(self):
        return str(self.data)


class VoteId:
    def __init__(self, vote):
        parts = vote.split(":")
        assert len(parts) == 2
        self.type = int(parts[0])
        self.instance = int(parts[1])

    def __bytes__(self):
        binary = (self.type & 0xFF) | (self.instance << 8)
        return struct.pack("<I", binary)

    def __str__(self):
        return "%d:%d" % (self.type, self.instance)


class ObjectId:
    """ Encodes protocol ids - serializes to the *instance* only!
    """

    object_types = object_type

    def __init__(self, object_str, type_verify=None):
        if len(object_str.split(".")) == 3:
            space, type, id = object_str.split(".")
            self.space = int(space)
            self.type = int(type)
            self.instance = Id(int(id))
            self.Id = object_str
            if type_verify:
                assert (
                    type_verify in self.object_types
                ), "Type {} is not defined!".format(type_verify)
                assert self.object_types[type_verify] == int(type), (
                    "Object id does not match object type! " + "Excpected %d, got %d" % (self.object_types[type_verify], int(type)))
        else:
            raise Exception("Object id is invalid")

    def __bytes__(self):
        return bytes(self.instance)  # only yield instance

    def __str__(self):
        return self.Id


class FullObjectId:
    """ Encodes object ids - serializes to a full object id
    """

    def __init__(self, object_str):
        if len(object_str.split(".")) == 3:
            space, type, id = object_str.split(".")
            self.space = int(space)
            self.type = int(type)
            self.id = int(id)
            self.instance = Id(int(id))
            self.Id = object_str
        else:
            raise ValueError("Object id is invalid")

    def __bytes__(self):
        return (self.space << 56 | self.type << 48 | self.id).to_bytes(
            8, byteorder="little", signed=False
        )

    def __str__(self):
        return self.Id


class Enum8(Uint8):
    # List needs to be provided by super class
    options = []

    def __init__(self, selection):
        if selection not in self.options or (
            isinstance(selection, int) and len(self.options) < selection
        ):
            raise ValueError(
                "Options are {}. Given '{}'".format(str(self.options), selection)
            )

        super(Enum8, self).__init__(self.options.index(selection))

    def __str__(self):
        return str(self.options[self.data])


# -- graphenebase.objects --
class GrapheneOperation(list):
    """ The superclass for an operation. This class i used to instanciate an
        operation, identify the operationid/name and serialize the operation
        into bytes.
    """

    module = "graphenebase.operations"
    fromlist = ["operations"]
    operations = operations

    def __init__(self, op, **kwargs):
        list.__init__(self, [0, GrapheneObject()])

        # Are we dealing with an actual operation as list of opid and payload?
        if isinstance(op, list) and len(op) == 2:
            self._setidanename(op[0])
            self.set(**op[1])

        # Here, we allow to only load the Operation as Template without data
        elif isinstance(op, str) or isinstance(op, int):
            self._setidanename(op)
            if kwargs:
                self.set(**kwargs)

        elif isinstance(op, GrapheneObject):
            self._loadGrapheneObject(op)

        else:
            raise ValueError("Unknown format for Operation({})".format(type(op)))

    @property
    def id(self):
        return self[0]

    @id.setter
    def id(self, value):
        assert isinstance(value, int)
        self[0] = value

    @property
    def operation(self):
        return self[1]

    @operation.setter
    def operation(self, value):
        assert isinstance(value, dict)
        self[1] = value

    @property
    def op(self):
        return self[1]

    def set(self, **data):
        try:
            klass = self.klass()
        except Exception:  # pragma: no cover
            raise NotImplementedError("Unimplemented Operation %s" % self.name)
        self.operation = klass(**data)

    def _setidanename(self, identifier):
        if isinstance(identifier, int):
            self.id = int(identifier)
            self.name = self.getOperationNameForId(self.id)
        else:
            assert identifier in self.ops
            self.id = self.getOperationIdForName(identifier)
            self.name = identifier

    @property
    def opId(self):
        return self.id

    @property
    def klass_name(self):
        return self.name[0].upper() + self.name[1:]  # klassname

    def _loadGrapheneObject(self, op):
        assert isinstance(op, GrapheneObject)
        self.operation = op
        self.name = op.__class__.__name__.lower()
        self.id = self.getOperationIdForName(self.name)

    def __bytes__(self):
        return bytes(Id(self.id)) + bytes(self.op)

    def __str__(self):
        return json.dumps(self.__json__())

    def __json__(self):
        return [self.id, self.op.json()]

    def _getklass(self, name):
        module = __import__(self.module, fromlist=self.fromlist)
        class_ = getattr(module, name)
        return class_

    def klass(self):
        return self._getklass(self.klass_name)

    @property
    def ops(self):
        if callable(self.operations):  # pragma: no cover
            # Legacy support
            return self.operations()
        else:
            return self.operations

    def getOperationIdForName(self, name):
        return self.ops[name]

    def getOperationNameForId(self, i):
        """ Convert an operation id into the corresponding string
        """
        for key in self.ops:
            if int(self.ops[key]) is int(i):
                return key
        raise ValueError("Unknown Operation ID %d" % i)

    toJson = __json__
    json = __json__


class GrapheneObject(OrderedDict):
    """ Core abstraction class

        This class is used for any JSON reflected object in Graphene.

        * ``instance.__json__()``: encodes data into json format
        * ``bytes(instance)``: encodes data into wire format
        * ``str(instances)``: dumps json object as string

    """

    def __init__(self, *args, **kwargs):

        if len(args) == 1 and isinstance(args[0], self.__class__):
            # In this case, there is only one argument which is already an
            # instance of a class that inherits Graphene Object, hence, we copy
            # data and are done
            # This basic allows to do
            #
            #    Asset(Asset(amount=1, asset_id="1.3.0"))
            self.data = args[0].data.copy()
            return

        if len(args) == 1 and isinstance(args[0], (dict, OrderedDict)):
            if hasattr(self, "detail"):
                super().__init__(self.detail(**args[0]))
            else:
                OrderedDict.__init__(self, args[0])
            return

        elif kwargs and hasattr(self, "detail"):
            # If I receive kwargs, I need detail() implemented!
            super().__init__(self.detail(*args, **kwargs))

    def __bytes__(self):
        if len(self) == 0:
            return bytes()
        b = b""
        for name, value in self.items():
            if(name == "operations"):
                b += bytes(Uint8(len(value.data)))
                b += bytes(Uint8(list(value.data)[0][0]))
                b += bytes(list(value.data)[0][1])
            elif(name == "dapp" or name == "proposal_transaction_id"):  # optional format
                if(value):
                    b += bytes(Uint8(1))
                    if isinstance(value, str):
                        b += bytes(String(value))
                    else:
                        b += bytes(value)
                else:
                    b += bytes(Uint8(0))
            elif(name == "validate_type"):
                b += bytes(Uint8(value))
            elif(name == "signatures"):
                pass
            else:
                if(value):
                    if isinstance(value, str):
                        b += bytes(value, "utf-8")
                    else:
                        b += bytes(value)
                else:
                    b += bytes(Uint8(0))
        return b

    def __json__(self):
        if len(self) == 0:
            return {}
        d = {}  # JSON output is *not* ordered
        for name, value in self.items():
            if (((isinstance(value, Optional) or isinstance(value, OptionalUint128) or isinstance(value, OptionalUint16)) and value.data is None) or (value is None) or (value == 'None')):
                continue
            if (isinstance(value, String) or isinstance(value, Uint128)):
                d.update({name: str(value)})
            else:
                try:
                    d.update({name: JsonObj(value)})
                except Exception:
                    d.update({name: value.__str__()})
        return d

    def __str__(self):
        return json.dumps(self.__json__())

    # Legacy support
    @property
    def data(self):  # pragma: no cover
        """ Read data explicitly (backwards compatibility)
        """
        return self

    @data.setter
    def data(self, data):  # pragma: no cover
        """ Set data through a setter (backwards compatibility)
        """
        self.update(data)

    toJson = __json__
    json = __json__


# Legacy
def isArgsThisClass(self, args):
    return len(args) == 1 and type(args[0]).__name__ == type(self).__name__


# Common Objects
class Asset(GrapheneObject):
    def detail(self, *args, **kwargs):
        return OrderedDict(
            [
                ("amount", Int64(kwargs["amount"])),
                ("asset_id", ObjectId(kwargs["asset_id"], "asset")),
            ]
        )


# -- operations  ---
def getOperationNameForId(i):
    """ Convert an operation id into the corresponding string
    """
    for key in operations:
        if int(operations[key]) is int(i):
            return key
    return "Unknown Operation ID %d" % i


def getOperationName(id):
    """ This method returns the name representation of an operation given
        its value as used in the API
    """
    if isinstance(id, str):
        # Some graphene chains (e.g. steem) do not encode the
        # operation_type as id but in its string form
        assert id in operations.keys(), "Unknown operation {}".format(id)
        return id
    elif isinstance(id, int):
        return getOperationNameForId(id)
    else:
        raise ValueError


def getOperationClassForId(op_id):
    """ Convert an operation id into the corresponding class
    """
    return class_idmap[op_id] if op_id in class_idmap else None


def getOperationIdForClass(name):
    """ Convert an operation classname into the corresponding id
    """
    return class_namemap[name] if name in class_namemap else None


# --  objects  --
class Operation(GrapheneOperation):
    """ Need to overwrite a few attributes to load proper operations from  bytetrade
    """
    operations = operations


# -- operations --
class Transfer(GrapheneObject):
    def __init__(self, *args, **kwargs):
        # Allow for overwrite of prefix
        if isArgsThisClass(self, args):
            self.data = args[0].data
        else:
            if len(args) == 1 and len(kwargs) == 0:
                kwargs = args[0]
            super().__init__(
                OrderedDict(
                    [
                        ("fee", Uint128(kwargs["fee"])),
                        ("from", String(kwargs["from"])),
                        ("to", String(kwargs["to"])),
                        ("asset_type", Uint32(kwargs["asset_type"])),
                        ("amount", Uint128(kwargs["amount"])),
                    ]
                )
            )


class Withdraw_Btc(GrapheneObject):
    def __init__(self, *args, **kwargs):
        # Allow for overwrite of prefix
        if isArgsThisClass(self, args):
            self.data = args[0].data
        else:
            if len(args) == 1 and len(kwargs) == 0:
                kwargs = args[0]
            super().__init__(
                OrderedDict(
                    [
                        ("fee", Uint128(kwargs["fee"])),
                        ("from", String(kwargs["from"])),
                        ("to_external_address", String(kwargs["to_external_address"])),
                        ("asset_type", Uint32(kwargs["asset_type"])),
                        ("amount", Uint128(kwargs["amount"])),
                        ("asset_fee", OptionalUint128(kwargs["asset_fee"])),
                    ]
                )
            )


class Withdraw(GrapheneObject):
    def __init__(self, *args, **kwargs):
        # Allow for overwrite of prefix
        if isArgsThisClass(self, args):
            self.data = args[0].data
        else:
            if len(args) == 1 and len(kwargs) == 0:
                kwargs = args[0]
            super().__init__(
                OrderedDict(
                    [
                        ("fee", Uint128(kwargs["fee"])),
                        ("from", String(kwargs["from"])),
                        ("to_external_address", String(kwargs["to_external_address"])),
                        ("asset_type", Uint32(kwargs["asset_type"])),
                        ("amount", Uint128(kwargs["amount"])),
                    ]
                )
            )


class Op_wrapper(GrapheneObject):
    def __init__(self, *args, **kwargs):
        if isArgsThisClass(self, args):
            self.data = args[0].data
        else:
            if len(args) == 1 and len(kwargs) == 0:
                kwargs = args[0]
            super().__init__(OrderedDict([("op", Operation(kwargs["op"]))]))


class Proposal_Withdraw(GrapheneObject):
    def __init__(self, *args, **kwargs):
        if isArgsThisClass(self, args):
            self.data = args[0].data
        else:
            if len(args) == 1 and len(kwargs) == 0:
                kwargs = args[0]

            super().__init__(
                OrderedDict(
                    [
                        ("fee", Uint128(kwargs["fee"])),
                        ("proposaler", String(kwargs["proposaler"])),
                        ("expiration_time", PointInTime(kwargs["expiration_time"])),
                        ("proposed_ops", Array([Op_wrapper(o) for o in kwargs["proposed_ops"]]))
                    ]
                )
            )


class Order_create(GrapheneObject):
    def __init__(self, *args, **kwargs):
        if isArgsThisClass(self, args):
            self.data = args[0].data
        else:
            if len(args) == 1 and len(kwargs) == 0:
                kwargs = args[0]
            super().__init__(
                OrderedDict(
                    [
                        ("fee", Uint128(kwargs["fee"])),
                        ("creator", String(kwargs["creator"])),
                        ("side", Uint8(kwargs["side"])),
                        ("order_type", Uint8(kwargs["order_type"])),
                        ("market_name", String(kwargs["market_name"])),
                        ("amount", Uint128(kwargs["amount"])),
                        ("price", Uint128(kwargs["price"])),
                        ("use_btt_as_fee", Bool(kwargs["use_btt_as_fee"])),
                        ("freeze_btt_fee", OptionalUint128(kwargs.get("freeze_btt_fee", None))),
                        ("now", PointInTime(kwargs["now"])),
                        ("expiration", PointInTime(kwargs["expiration"])),
                        ("custom_btt_fee_rate", OptionalUint16(kwargs.get("custom_btt_fee_rate", None))),
                        ("custom_no_btt_fee_rate", OptionalUint16(kwargs.get("custom_no_btt_fee_rate", None))),
                        ("money_id", Uint32(kwargs["money_id"])),
                        ("stock_id", Uint32(kwargs["stock_id"])),
                    ]
                )
            )


class Order_cancel(GrapheneObject):
    def __init__(self, *args, **kwargs):
        if isArgsThisClass(self, args):
            self.data = args[0].data
        else:
            if len(args) == 1 and len(kwargs) == 0:
                kwargs = args[0]
            super().__init__(
                OrderedDict(
                    [
                        ("fee", Uint128(kwargs["fee"])),
                        ("creator", String(kwargs["creator"])),
                        ("market_name", String(kwargs["market_name"])),
                        ("order_id", Ripemd160(kwargs["order_id"])),
                        ("money_id", Uint32(kwargs["money_id"])),
                        ("stock_id", Uint32(kwargs["stock_id"])),
                    ]
                )
            )


# -- graphenebase.base58 --
class Base58():
    """Base58 base class

    This class serves as an abstraction layer to deal with base58 encoded
    strings and their corresponding hex and binary representation throughout
    the library.

    :param data: Data to initialize object, e.g. pubkey data, address data, ...
    :type data: hex, wif, bip38 encrypted wif, base58 string
    :param str prefix: Prefix to use for Address/PubKey strings (defaults to
        ``GPH``)
    :return: Base58 object initialized with ``data``
    :rtype: Base58
    :raises ValueError: if data cannot be decoded

    * ``bytes(Base58)``: Returns the raw data
    * ``str(Base58)``:   Returns the readable ``Base58CheckEncoded`` data.
    * ``repr(Base58)``:  Gives the hex representation of the data.
    *  ``format(Base58,_format)`` Formats the instance according to
        ``_format``:
        * ``"wif"``: prefixed with ``0x00``. Yields a valid wif key
        * ``"bts"``: prefixed with ``BTS``
        * etc.

    """

    def __init__(self, data, prefix=None):
        self.prefix = prefix
        if isinstance(data, Base58):
            data = repr(data)
        if all(c in string.hexdigits for c in data):
            self._hex = data
        elif data[0] == "5" or data[0] == "6":
            self._hex = base58CheckDecode(data)
        elif data[0] == "K" or data[0] == "L":  # pragma: no cover
            raise NotImplementedError(
                "Private Keys starting with L or K are not supported!"
            )
        elif data[: len(self.prefix)] == self.prefix:
            self._hex = gphBase58CheckDecode(data[len(self.prefix):])
        else:
            raise ValueError("Error loading Base58 object: {}".format(data))

    def __format__(self, _format):
        """ Format output according to argument _format (wif,...)

            :param str _format: Format to use
            :return: formatted data according to _format
            :rtype: str

        """
        if _format.upper() == "WIF":
            return base58CheckEncode(0x80, self._hex)
        elif _format.upper() == "ENCWIF":
            return base58encode(self._hex)
        elif _format.upper() == "BTC":
            return base58CheckEncode(0x00, self._hex)
        else:
            return _format.upper() + str(self)

    def __repr__(self):
        """ Returns hex value of object

            :return: Hex string of instance's data
            :rtype: hex string
        """
        return self._hex

    def __str__(self):
        """ Return graphene-base58CheckEncoded string of data

            :return: Base58 encoded data
            :rtype: str
        """
        return gphBase58CheckEncode(self._hex)

    def __bytes__(self):
        """ Return raw bytes

            :return: Raw bytes of instance
            :rtype: bytes

        """
        return unhexlify(self._hex)


# https://github.com/tochev/python3-cryptocoins/raw/master/cryptocoins/base58.py
BASE58_ALPHABET = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def base58decode(base58_str):
    base58_text = _bytes(base58_str)
    n = 0
    leading_zeroes_count = 0
    for b in base58_text:
        n = n * 58 + BASE58_ALPHABET.find(b)
        if n == 0:
            leading_zeroes_count += 1
    res = bytearray()
    while n >= 256:
        div, mod = divmod(n, 256)
        res.insert(0, mod)
        n = div
    else:
        res.insert(0, n)
    return hexlify(bytearray(1) * leading_zeroes_count + res).decode("ascii")


def base58encode(hexstring):
    byteseq = unhexlify(_bytes(hexstring))
    n = 0
    leading_zeroes_count = 0
    for c in byteseq:
        n = n * 256 + c
        if n == 0:
            leading_zeroes_count += 1
    res = bytearray()
    while n >= 58:
        div, mod = divmod(n, 58)
        res.insert(0, BASE58_ALPHABET[mod])
        n = div
    else:
        res.insert(0, BASE58_ALPHABET[n])
    return (BASE58_ALPHABET[0:1] * leading_zeroes_count + res).decode("ascii")


def ripemd160(s):
    ripemd160 = hashlib.new("ripemd160")
    ripemd160.update(unhexlify(s))
    return ripemd160.digest()


def doublesha256(s):
    return hashlib.sha256(hashlib.sha256(unhexlify(s)).digest()).digest()


def b58encode(v):
    return base58encode(v)


def b58decode(v):
    return base58decode(v)


def base58CheckEncode(version, payload):
    s = ("%.2x" % version) + payload
    checksum = doublesha256(s)[:4]
    result = s + hexlify(checksum).decode("ascii")
    return base58encode(result)


def base58CheckDecode(s):
    s = unhexlify(base58decode(s))
    dec = hexlify(s[:-4]).decode("ascii")
    checksum = doublesha256(dec)[:4]
    assert s[-4:] == checksum
    return dec[2:]


def gphBase58CheckEncode(s):
    checksum = ripemd160(s)[:4]
    result = s + hexlify(checksum).decode("ascii")
    return base58encode(result)


def gphBase58CheckDecode(s):
    s = unhexlify(base58decode(s))
    dec = hexlify(s[:-4]).decode("ascii")
    checksum = ripemd160(dec)[:4]
    assert s[-4:] == checksum
    return dec

# -- graphenebase.account --


class Address():
    """ Address class

        This class serves as an address representation for Public Keys.

        :param str address: Base58 encoded address (defaults to ``None``)
        :param str pubkey: Base58 encoded pubkey (defaults to ``None``)
        :param str prefix: Network prefix (defaults to ``GPH``)

        Example::

           Address("GPHFN9r6VYzBK8EKtMewfNbfiGCr56pHDBFi")

    """
    def __init__(self, address, prefix=None):
        self.prefix = prefix
        self._address = Base58(address, prefix=self.prefix)

    @classmethod
    def from_pubkey(cls, pubkey, compressed=True, version=56, prefix=None):
        """ Load an address provided the public key.

            Version: 56 => PTS
        """
        # Ensure this is a public key
        pubkey = PublicKey(pubkey, prefix=prefix)
        if compressed:
            pubkey_plain = pubkey.compressed()
        else:
            pubkey_plain = pubkey.uncompressed()
        sha = hashlib.sha256(unhexlify(pubkey_plain)).hexdigest()
        rep = hexlify(ripemd160(sha)).decode("ascii")
        s = ("%.2x" % version) + rep
        result = s + hexlify(doublesha256(s)[:4]).decode("ascii")
        result = hexlify(ripemd160(result)).decode("ascii")
        return cls(result, prefix=pubkey.prefix)

    def __repr__(self):
        """ Gives the hex representation of the ``GrapheneBase58CheckEncoded``
            Graphene address.
        """
        return repr(self._address)

    def __str__(self):
        """ Returns the readable Graphene address. This call is equivalent to
            ``format(Address, "GPH")``
        """
        return format(self._address, self.prefix)

    def __format__(self, _format):
        """  May be issued to get valid "MUSE", "PLAY" or any other Graphene compatible
            address with corresponding prefix.
        """
        return format(self._address, _format)

    def __bytes__(self):
        """ Returns the raw content of the ``Base58CheckEncoded`` address """
        return bytes(self._address)


class GrapheneAddress(Address):
    """ Graphene Addresses are different. Hence we have a different class
    """
    @classmethod
    def from_pubkey(cls, pubkey, compressed=True, version=56, prefix=None):
        # Ensure this is a public key
        pubkey = PublicKey(pubkey, prefix=prefix)
        if compressed:
            pubkey_plain = pubkey.compressed()
        else:
            pubkey_plain = pubkey.uncompressed()

        """ Derive address using ``RIPEMD160(SHA512(x))`` """
        addressbin = ripemd160(hashlib.sha512(unhexlify(pubkey_plain)).hexdigest())
        result = Base58(hexlify(addressbin).decode("ascii"))
        return cls(result, prefix=pubkey.prefix)


class PublicKey():
    """ This class deals with Public Keys and inherits ``Address``.
        :param str pk: Base58 encoded public key
        :param str prefix: Network prefix (defaults to ``GPH``)

        Example:::

           PublicKey("GPH6UtYWWs3rkZGV8JA86qrgkG6tyFksgECefKE1MiH4HkLD8PFGL")

        .. note:: By default, graphene-based networks deal with **compressed**
                  public keys. If an **uncompressed** key is required, the
                  method ``unCompressed`` can be used::

                      PublicKey("xxxxx").unCompressed()
    """

    def __init__(self, pk, prefix=None):
        self.prefix = prefix
        if isinstance(pk, PublicKey):
            pk = format(pk, self.prefix)

        if str(pk).startswith("04"):
            # We only ever deal with compressed keys, so let's make it
            # compressed
            order = ecdsa.SECP256k1.order
            p = ecdsa.VerifyingKey.from_string(
                unhexlify(pk[2:]), curve=ecdsa.SECP256k1
            ).pubkey.point
            x_str = ecdsa.util.number_to_string(p.x(), order)
            pk = hexlify(chr(2 + (p.y() & 1)).encode("ascii") + x_str).decode("ascii")

        self._pk = Base58(pk, prefix=self.prefix)

    @property
    def pubkey(self):
        return self._pk

    @property
    def compressed_key(self):
        return PublicKey(self.compressed())

    def _derive_y_from_x(self, x, is_even):
        """ Derive y point from x point """
        curve = ecdsa.SECP256k1.curve
        # The curve equation over F_p is:
        #   y^2 = x^3 + ax + b
        a, b, p = curve.a(), curve.b(), curve.p()
        alpha = (pow(x, 3, p) + a * x + b) % p
        beta = ecdsa.numbertheory.square_root_mod_prime(alpha, p)
        if (beta % 2) == is_even:
            beta = p - beta
        return beta

    def compressed(self):
        """ returns the compressed key """
        return repr(self._pk)

    def uncompressed(self):
        """ Derive uncompressed key """
        public_key = repr(self._pk)
        prefix = public_key[0:2]
        assert prefix == "02" or prefix == "03"
        x = int(public_key[2:], 16)
        y = self._derive_y_from_x(x, (prefix == "02"))
        key = "04" + "%064x" % x + "%064x" % y
        return key

    def point(self):
        """ Return the point for the public key """
        string = unhexlify(self.unCompressed())
        return ecdsa.VerifyingKey.from_string(
            string[1:], curve=ecdsa.SECP256k1
        ).pubkey.point

    def child(self, offset256):
        """ Derive new public key from this key and a sha256 "offset" """
        a = bytes(self) + offset256
        s = hashlib.sha256(a).digest()
        return self.add(s)

    def add(self, digest256):
        """ Derive new public key from this key and a sha256 "digest" """
        return tweakaddPubkey(self, digest256)

    @classmethod
    def from_privkey(cls, privkey, prefix=None):
        """ Derive uncompressed public key """
        privkey = PrivateKey(privkey, prefix=prefix)
        secret = unhexlify(repr(privkey))
        order = ecdsa.SigningKey.from_string(
            secret, curve=ecdsa.SECP256k1
        ).curve.generator.order()
        p = ecdsa.SigningKey.from_string(
            secret, curve=ecdsa.SECP256k1
        ).verifying_key.pubkey.point
        x_str = ecdsa.util.number_to_string(p.x(), order)
        # y_str = ecdsa.util.number_to_string(p.y(), order)
        compressed = hexlify(chr(2 + (p.y() & 1)).encode("ascii") + x_str).decode(
            "ascii"
        )
        # uncompressed = hexlify(
        #    chr(4).encode('ascii') + x_str + y_str).decode('ascii')
        return cls(compressed, prefix=prefix)

    def __repr__(self):
        """ Gives the hex representation of the Graphene public key. """
        return repr(self._pk)

    def __str__(self):
        """ Returns the readable Graphene public key. This call is equivalent to
            ``format(PublicKey, "GPH")``
        """
        return format(self._pk, self.prefix)

    def __format__(self, _format):
        """ Formats the instance of:doc:`Base58 <base58>` according to
            ``_format``
        """
        return format(self._pk, _format)

    def __bytes__(self):
        """ Returns the raw public key (has length 33)"""
        return bytes(self._pk)

    def __lt__(self, other):
        """ For sorting of public keys (due to graphene),
            we actually sort according to addresses
        """
        assert isinstance(other, PublicKey)
        return repr(self.address) < repr(other.address)

    def unCompressed(self):
        """ Alias for self.uncompressed() - LEGACY"""
        return self.uncompressed()

    @property
    def address(self):
        """ Obtain a GrapheneAddress from a public key
        """
        return GrapheneAddress.from_pubkey(repr(self), prefix=self.prefix)


class PrivateKey():
    """ Derives the compressed and uncompressed public keys and
        constructs two instances of ``PublicKey``:

        :param str wif: Base58check-encoded wif key
        :param str prefix: Network prefix (defaults to ``GPH``)

        Example:::

            PrivateKey("5HqUkGuo62BfcJU5vNhTXKJRXuUi9QSE6jp8C3uBJ2BVHtB8WSd")

        Compressed vs. Uncompressed:

        * ``PrivateKey("w-i-f").pubkey``:
            Instance of ``PublicKey`` using compressed key.
        * ``PrivateKey("w-i-f").pubkey.address``:
            Instance of ``Address`` using compressed key.
        * ``PrivateKey("w-i-f").uncompressed``:
            Instance of ``PublicKey`` using uncompressed key.
        * ``PrivateKey("w-i-f").uncompressed.address``:
            Instance of ``Address`` using uncompressed key.

    """

    def __init__(self, wif=None, prefix=None):
        self.prefix = prefix
        if wif is None:
            import os

            self._wif = Base58(hexlify(os.urandom(32)).decode("ascii"))
        elif isinstance(wif, PrivateKey):
            self._wif = wif._wif
        elif isinstance(wif, Base58):
            self._wif = wif
        else:
            self._wif = Base58(wif)

        # test for valid key by trying to obtain a public key
        assert len(repr(self._wif)) == 64

    @property
    def address(self):
        return Address.from_pubkey(self.pubkey, prefix=self.prefix)

    @property
    def pubkey(self):
        return self.compressed

    @property
    def compressed(self):
        return PublicKey.from_privkey(self, prefix=self.prefix)

    @property
    def uncompressed(self):
        return PublicKey(self.pubkey.uncompressed(), prefix=self.prefix)

    def get_secret(self):
        """ Get sha256 digest of the wif key.
        """
        return hashlib.sha256(bytes(self)).digest()

    def derive_private_key(self, sequence):
        """ Derive new private key from this private key and an arbitrary
            sequence number
        """
        encoded = "%s %d" % (str(self), sequence)
        a = bytes(encoded, "ascii")
        s = hashlib.sha256(hashlib.sha512(a).digest()).digest()
        return PrivateKey(hexlify(s).decode("ascii"), prefix=self.pubkey.prefix)

    def child(self, offset256):
        """ Derive new private key from this key and a sha256 "offset"
        """
        a = bytes(self.pubkey) + offset256
        s = hashlib.sha256(a).digest()
        return self.derive_from_seed(s)

    def derive_from_seed(self, offset):
        """ Derive private key using "generate_from_seed" method.
            Here, the key itself serves as a `seed`, and `offset`
            is expected to be a sha256 digest.
        """
        seed = int(hexlify(bytes(self)).decode("ascii"), 16)
        z = int(hexlify(offset).decode("ascii"), 16)
        order = ecdsa.SECP256k1.order
        secexp = (seed + z) % order
        secret = "%0x" % secexp
        if len(secret) < 64:  # left-pad with zeroes
            secret = ("0" * (64 - len(secret))) + secret
        return PrivateKey(secret, prefix=self.pubkey.prefix)

    def __format__(self, _format):
        """ Formats the instance of:doc:`Base58 <base58>` according to
            ``_format``
        """
        return format(self._wif, _format)

    def __repr__(self):
        """ Gives the hex representation of the Graphene private key."""
        return repr(self._wif)

    def __str__(self):
        """ Returns the readable (uncompressed wif format) Graphene private key. This
            call is equivalent to ``format(PrivateKey, "WIF")``
        """
        return format(self._wif, "WIF")

    def __bytes__(self):  # pragma: no cover
        """ Returns the raw private key """
        return bytes(self._wif)


# -- graphenebase.signedtransactions --
SECP256K1_MODULE = None
SECP256K1_AVAILABLE = False
CRYPTOGRAPHY_AVAILABLE = False
GMPY2_MODULE = False

if not SECP256K1_MODULE:  # pragma: no branch
    try:
        import secp256k1
        SECP256K1_MODULE = "secp256k1"
        SECP256K1_AVAILABLE = True
    except ImportError:
        try:
            SECP256K1_MODULE = "cryptography"
            CRYPTOGRAPHY_AVAILABLE = True
        except ImportError:
            SECP256K1_MODULE = "ecdsa"

    try:  # pragma: no branch
        from cryptography.hazmat.backends import default_backend
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import ec
        from cryptography.hazmat.primitives.asymmetric.utils import (
            decode_dss_signature,
            encode_dss_signature,
        )
        CRYPTOGRAPHY_AVAILABLE = True
    except ImportError:
        CRYPTOGRAPHY_AVAILABLE = False
        print("Cryptography not available")


# -- graphenebase.ecdsa --
def _is_canonical(sig):
    sig = bytearray(sig)
    return (not(int(sig[0]) & 0x80) and not (sig[0] == 0 and not (int(sig[1]) & 0x80)) and not (int(sig[32]) & 0x80) and not (sig[32] == 0 and not (int(sig[33]) & 0x80)))


def compressedPubkey(pk):
    if SECP256K1_MODULE == "cryptography" and not isinstance(
        pk, ecdsa.keys.VerifyingKey
    ):
        order = ecdsa.SECP256k1.order
        x = pk.public_numbers().x
        y = pk.public_numbers().y
    else:  # pragma: no cover
        order = pk.curve.generator.order()
        p = pk.pubkey.point
        x = p.x()
        y = p.y()
    x_str = ecdsa.util.number_to_string(x, order)
    return _bytes(chr(2 + (y & 1))) + x_str


def recover_public_key(digest, signature, i, message=None):
    """ Recover the public key from the the signature
    """

    # See http: //www.secg.org/download/aid-780/sec1-v2.pdf section 4.1.6 primarily
    curve = ecdsa.SECP256k1.curve
    G = ecdsa.SECP256k1.generator
    order = ecdsa.SECP256k1.order
    yp = i % 2
    r, s = ecdsa.util.sigdecode_string(signature, order)
    # 1.1
    x = r + (i // 2) * order
    # 1.3. This actually calculates for either effectively 02||X or 03||X depending on 'k' instead of always for 02||X as specified.
    # This substitutes for the lack of reversing R later on. -R actually is defined to be just flipping the y-coordinate in the elliptic curve.
    alpha = ((x * x * x) + (curve.a() * x) + curve.b()) % curve.p()
    beta = ecdsa.numbertheory.square_root_mod_prime(alpha, curve.p())
    y = beta if (beta - yp) % 2 == 0 else curve.p() - beta
    # 1.4 Constructor of Point is supposed to check if nR is at infinity.
    R = ecdsa.ellipticcurve.Point(curve, x, y, order)
    # 1.5 Compute e
    e = ecdsa.util.string_to_number(digest)
    # 1.6 Compute Q = r^-1(sR - eG)
    Q = ecdsa.numbertheory.inverse_mod(r, order) * (s * R + (-e % order) * G)

    if SECP256K1_MODULE == "cryptography" and message is not None:
        if not isinstance(message, bytes):
            message = bytes(message, "utf-8")  # pragma: no cover
        sigder = encode_dss_signature(r, s)
        public_key = ec.EllipticCurvePublicNumbers(
            Q._Point__x, Q._Point__y, ec.SECP256K1()
        ).public_key(default_backend())
        public_key.verify(sigder, message, ec.ECDSA(hashes.SHA256()))
        return public_key
    else:
        # Not strictly necessary, but let's verify the message for paranoia's sake.
        if not ecdsa.VerifyingKey.from_public_point(
            Q, curve=ecdsa.SECP256k1
        ).verify_digest(
            signature, digest, sigdecode=ecdsa.util.sigdecode_string
        ):  # pragma: no cover
            return None  # pragma: no cover
        return ecdsa.VerifyingKey.from_public_point(
            Q, curve=ecdsa.SECP256k1
        )  # pragma: no cover


def recoverPubkeyParameter(message, digest, signature, pubkey):
    """ Use to derive a number that allows to easily recover the
        public key from the signature
    """
    if not isinstance(message, bytes):
        message = bytes(message, "utf-8")  # pragma: no cover
    for i in range(0, 4):
        if SECP256K1_MODULE == "secp256k1":  # pragma: no cover
            sig = pubkey.ecdsa_recoverable_deserialize(signature, i)
            p = secp256k1.PublicKey(pubkey.ecdsa_recover(message, sig))
            if p.serialize() == pubkey.serialize():
                return i
        elif SECP256K1_MODULE == "cryptography" and not isinstance(pubkey, PublicKey):
            p = recover_public_key(digest, signature, i, message)
            p_comp = hexlify(compressedPubkey(p))
            pubkey_comp = hexlify(compressedPubkey(pubkey))
            if p_comp == pubkey_comp:
                return i
        else:  # pragma: no cover
            p = recover_public_key(digest, signature, i)
            p_comp = hexlify(compressedPubkey(p))
            p_string = hexlify(p.to_string())
            if isinstance(pubkey, PublicKey):  # pragma: no cover
                pubkey_string = bytes(repr(pubkey), "ascii")
            else:  # pragma: no cover
                pubkey_string = hexlify(pubkey.to_string())
            if p_string == pubkey_string or p_comp == pubkey_string:  # pragma: no cover
                return i


def sign_message(message, wif, hashfn=hashlib.sha256):
    """ Sign a digest with a wif key

        :param str wif: Private key in
    """

    if not isinstance(message, bytes):
        message = bytes(message, "utf-8")

    digest = hashfn(message).digest()
    priv_key = PrivateKey(wif)
    p = bytes(priv_key)

    if SECP256K1_MODULE == "secp256k1":
        ndata = secp256k1.ffi.new("const int *ndata")
        ndata[0] = 0
        while True:
            ndata[0] += 1
            privkey = secp256k1.PrivateKey(p, raw=True)
            sig = secp256k1.ffi.new("secp256k1_ecdsa_recoverable_signature *")
            signed = secp256k1.lib.secp256k1_ecdsa_sign_recoverable(
                privkey.ctx, sig, digest, privkey.private_key, secp256k1.ffi.NULL, ndata
            )
            if not signed == 1:  # pragma: no cover
                raise AssertionError()
            signature, i = privkey.ecdsa_recoverable_serialize(sig)
            if _is_canonical(signature):
                i += 4  # compressed
                i += 27  # compact
                break
    elif SECP256K1_MODULE == "cryptography":
        cnt = 0
        private_key = ec.derive_private_key(
            int(repr(priv_key), 16), ec.SECP256K1(), default_backend()
        )
        public_key = private_key.public_key()
        while True:
            cnt += 1
            if not cnt % 20:  # pragma: no cover
                log.info(
                    "Still searching for a canonical signature. Tried %d times already!"
                    % cnt
                )
            order = ecdsa.SECP256k1.order
            # signer = private_key.signer(ec.ECDSA(hashes.SHA256()))
            # signer.update(message)
            # sigder = signer.finalize()
            sigder = private_key.sign(message, ec.ECDSA(hashes.SHA256()))
            r, s = decode_dss_signature(sigder)
            signature = ecdsa.util.sigencode_string(r, s, order)
            # Make sure signature is canonical!
            #
            sigder = bytearray(sigder)
            lenR = sigder[3]
            lenS = sigder[5 + lenR]
            if lenR is 32 and lenS is 32:
                # Derive the recovery parameter
                #
                i = recoverPubkeyParameter(message, digest, signature, public_key)
                i += 4  # compressed
                i += 27  # compact
                break
    else:  # pragma: no branch # pragma: no cover
        cnt = 0
        sk = ecdsa.SigningKey.from_string(p, curve=ecdsa.SECP256k1)
        while 1:
            cnt += 1
            if not cnt % 20:  # pragma: no branch
                log.info(
                    "Still searching for a canonical signature. Tried %d times already!"
                    % cnt
                )

            # Deterministic k
            #
            k = ecdsa.rfc6979.generate_k(
                sk.curve.generator.order(),
                sk.privkey.secret_multiplier,
                hashlib.sha256,
                hashlib.sha256(digest + struct.pack("d", time.time())).digest(),)

            # Sign message
            #
            sigder = sk.sign_digest(digest, sigencode=ecdsa.util.sigencode_der, k=k)

            # Reformating of signature
            #
            r, s = ecdsa.util.sigdecode_der(sigder, sk.curve.generator.order())
            signature = ecdsa.util.sigencode_string(r, s, sk.curve.generator.order())

            # Make sure signature is canonical!
            #
            sigder = bytearray(sigder)
            lenR = sigder[3]
            lenS = sigder[5 + lenR]
            if lenR is 32 and lenS is 32:
                # Derive the recovery parameter
                #
                i = recoverPubkeyParameter(
                    message, digest, signature, sk.get_verifying_key()
                )
                i += 4  # compressed
                i += 27  # compact
                break

    # pack signature
    #
    sigstr = struct.pack("<B", i)
    sigstr += signature

    return sigstr


def verify_message(message, signature, hashfn=hashlib.sha256):
    if not isinstance(message, bytes):
        message = bytes(message, "utf-8")
    if not isinstance(signature, bytes):  # pragma: no cover
        signature = bytes(signature, "utf-8")
    if not isinstance(message, bytes):
        raise AssertionError()
    if not isinstance(signature, bytes):
        raise AssertionError()
    digest = hashfn(message).digest()
    sig = signature[1:]
    # TODO: 4 means we use compressed keys.
    # Grapehen uses compressed keys by default even though it would still allow
    # uncompressed keys to be used. This library so far expects compressed keys
    # due to this line:
    recoverParameter = bytearray(signature)[0] - 4 - 27  # recover parameter only

    if SECP256K1_MODULE == "secp256k1":
        ALL_FLAGS = (
            secp256k1.lib.SECP256K1_CONTEXT_VERIFY | secp256k1.lib.SECP256K1_CONTEXT_SIGN)
        # Placeholder
        pub = secp256k1.PublicKey(flags=ALL_FLAGS)
        # Recover raw signature
        sig = pub.ecdsa_recoverable_deserialize(sig, recoverParameter)
        # Recover PublicKey
        verifyPub = secp256k1.PublicKey(pub.ecdsa_recover(message, sig))
        # Convert recoverable sig to normal sig
        normalSig = verifyPub.ecdsa_recoverable_convert(sig)
        # Verify
        verifyPub.ecdsa_verify(message, normalSig)
        phex = verifyPub.serialize(compressed=True)
    elif SECP256K1_MODULE == "cryptography":
        p = recover_public_key(digest, sig, recoverParameter, message)
        order = ecdsa.SECP256k1.order
        r, s = ecdsa.util.sigdecode_string(sig, order)
        sigder = encode_dss_signature(r, s)
        p.verify(sigder, message, ec.ECDSA(hashes.SHA256()))
        phex = compressedPubkey(p)
    else:  # pragma: no branch  # pragma: no cover
        p = recover_public_key(digest, sig, recoverParameter)
        # Will throw an exception of not valid
        p.verify_digest(sig, digest, sigdecode=ecdsa.util.sigdecode_string)
        phex = compressedPubkey(p)

    return phex

# def pointToPubkey(x, y, order=None):  # pragma: no cover
#     """ This code is untested und thus not commented in. Waiting for unit tests of
#         the original author.
#     """
#     order = order or ecdsa.SECP256k1.order
#     x_str = ecdsa.util.number_to_string(x, order)
#     return _bytes(chr(2 + (y & 1))) + x_str   # pragma: no cover
#


def tweakaddPubkey(pk, digest256, SECP256K1_MODULE=SECP256K1_MODULE):
    if SECP256K1_MODULE == "secp256k1":
        tmp_key = secp256k1.PublicKey(pubkey=bytes(pk), raw=True)
        new_key = tmp_key.tweak_add(digest256)  # <-- add
        raw_key = hexlify(new_key.serialize()).decode("ascii")
    else:
        raise Exception("Must have secp256k1 for `tweak_add`")
        # raw_key = ecmult(pk, 1, digest256, SECP256K1_MODULE)
    return PublicKey(raw_key, prefix=pk.prefix)


# -- signedtransactions --
class MissingSignatureForKey(Exception):
    pass


class Signed_Transaction(GrapheneObject):
    """ Create a signed transaction and offer method to create the
        signature

        :param num refNum: parameter ref_block_num (see ``getBlockParams``)
        :param num refPrefix: parameter ref_block_prefix (see
            ``getBlockParams``)
        :param str expiration: expiration date
        :param Array operations:  array of operations
    """
    known_chains = known_chains
    default_prefix = "BTT"
    operation_klass = Operation

    def detail(self, *args, **kwargs):
        if "signatures" not in kwargs:  # pragma: no branch
            kwargs["signatures"] = Array([])
        else:  # pragma: no cover
            kwargs["signatures"] = Array(
                [Signature(unhexlify(a)) for a in kwargs["signatures"]]
            )

        ops = kwargs.get("operations", [])
        opklass = self.getOperationKlass()
        if all([not isinstance(a, opklass) for a in ops]):
            kwargs["operations"] = Array([opklass(a) for a in ops])
        else:
            kwargs["operations"] = Array(ops)

        return OrderedDict(
            [
                ("timestamp", PointInTime(kwargs["timestamp"])),
                ("expiration", OptionalPointInTime(kwargs["expiration"])),
                ("operations", kwargs["operations"]),
                ("validate_type", kwargs["validate_type"]),
                ("dapp", kwargs["dapp"]),
                ("proposal_transaction_id", kwargs["proposal_transaction_id"]),
            ]
        )

    def getKnownChains(self):
        return self.known_chains

    def get_default_prefix(self):
        return self.default_prefix

    def getOperationKlass(self):
        return self.operation_klass

    @property
    def id(self):
        # Store signatures temporarily since they are not part of
        # transaction id
        sigs = self.data["signatures"]
        self.data.pop("signatures", None)

        # Generage Hash of the seriliazed version
        h = hashlib.sha256(bytes(self)).digest()

        # recover signatures
        self.data["signatures"] = sigs

        # Return properly truncated tx hash
        return hexlify(h[:20]).decode("ascii")

    #     def derSigToHexSig(self, s):
    #         """ Format DER to HEX signature
    #         """
    #         s, junk = ecdsa.der.remove_sequence(unhexlify(s))
    #         if junk:
    #             log.debug('JUNK: %s', hexlify(junk).decode('ascii'))
    #         assert(junk == b'')
    #         x, s = ecdsa.der.remove_integer(s)
    #         y, s = ecdsa.der.remove_integer(s)
    #         return '%064x%064x' % (x, y)

    def getChainParams(self, chain):
        # chain may be an identifier, the chainid, or the prefix
        # ultimately, we need to be able to identify the chain id
        def find_in_known_chains(identifier):
            chains = self.getKnownChains()
            for _id, chain in chains.items():
                if _id == identifier:
                    return chain
                for key, value in chain.items():
                    if value == identifier:
                        return chain

        # Which network are we on:
        my_chain = find_in_known_chains(chain)
        if my_chain:
            chain_params = my_chain
        elif isinstance(chain, dict):
            chain_params = chain
        else:
            raise ValueError("sign() only takes a string or a dict as chain!")
        if "chain_id" not in chain_params:
            raise ValueError("sign() needs a 'chain_id' in chain params!")
        return chain_params

    def deriveDigest(self, chain):
        chain_params = self.getChainParams(chain)
        # Chain ID
        self.chainid = chain_params["chain_id"]
        self.data["signatures"] = []

        # Get message to sign
        #   bytes(self) will give the wire formated data according to
        #   GrapheneObject and the data given in __init__()
        self.message = unhexlify(self.chainid) + bytes(self)
        self.digest = hashlib.sha256(self.message).digest()

    def verify(self, pubkeys=[], chain=None):
        if not chain:
            chain = self.get_default_prefix()
        chain_params = self.getChainParams(chain)
        self.deriveDigest(chain)
        signatures = self.data["signatures"].data
        pubKeysFound = []

        for signature in signatures:
            p = verify_message(self.message, bytes(signature))
            phex = hexlify(p).decode("ascii")
            pubKeysFound.append(phex)

        for pubkey in pubkeys:
            if not isinstance(pubkey, PublicKey):
                raise ValueError("Pubkeys must be array of 'PublicKey'")

            k = pubkey.unCompressed()[2:]
            if k not in pubKeysFound and repr(pubkey) not in pubKeysFound:
                k = PublicKey(PublicKey(k).compressed())
                f = format(k, chain_params["prefix"])
                raise MissingSignatureForKey("Signature for %s missing!" % f)
        return pubKeysFound

    def sign(self, wifkeys, chain=None):
        """ Sign the transaction with the provided private keys.

            :param array wifkeys: Array of wif keys
            :param str chain: identifier for the chain

        """
        if not chain:
            chain = self.get_default_prefix()
        self.deriveDigest(chain)

        # Get Unique private keys
        self.privkeys = []
        for item in wifkeys:
            if item not in self.privkeys:
                self.privkeys.append(item)

        # Sign the message with every private key given!
        sigs = []
        for wif in self.privkeys:
            signature = sign_message(self.message, wif)
            sigs.append(Signature(signature))

        self.data["signatures"] = Array(sigs)
        return self

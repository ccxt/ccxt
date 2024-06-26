"""
The purpose of this file is to test serialization for complex abi.
"""
import json
from typing import NamedTuple

from ..abi.v0 import AbiParser as AbiParserV0
from ..abi.v1 import AbiParser as AbiParserV1
from ..abi.v2 import AbiParser as AbiParserV2
from ..cairo.felt import encode_shortstring
from .factory import (
    serializer_for_event,
    serializer_for_function,
)
from .tuple_dataclass import TupleDataclass
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR
from tests.e2e.fixtures.misc import (
    ContractVersion,
    load_contract,
    read_contract,
)

dog = {"name": encode_shortstring("Cooper"), "species": encode_shortstring("dog")}
dog_serialized = [dog["name"], dog["species"]]

cat = {"name": encode_shortstring("Bob"), "species": encode_shortstring("cat")}
cat_serialized = [cat["name"], cat["species"]]

bird = {
    "name": encode_shortstring("Yacub"),
    "species": encode_shortstring("Parus major"),
}
bird_serialized = [bird["name"], bird["species"]]

ceo = {"name": encode_shortstring("Scrooge McDuck"), "pets": (dog, cat, bird)}
ceo_serialized = [ceo["name"], *dog_serialized, *cat_serialized, *bird_serialized]

company = {
    "id": 2**254 + 1234567890123457890,
    "name": encode_shortstring("McDuck Enterprises"),
    "address": encode_shortstring("Duckburg"),
    "owner": ceo,
    "company_structure": (1, (2, (3, 4, 5), 6, (7, 8), 9, (10,))),
}
company_serialized = [
    company["id"] % 2**128,
    company["id"] // 2**128,
    company["name"],
    company["address"],
    *ceo_serialized,
    *range(1, 11),
]


class School(NamedTuple):
    location: int
    name: int


class Education(NamedTuple):
    school: School
    level: int


university = School(
    location=encode_shortstring("Calisota"), name=encode_shortstring("Duckiversity")
)
university_serialized = [university.location, university.name]

education = Education(university, encode_shortstring("PhD"))
education_serialized = [*university_serialized, education.level]

person_gyro = {
    "name": encode_shortstring("Gyro Gearloose"),
    "education": education,
    "occupation": TupleDataclass.from_dict(
        {"company": company, "position": encode_shortstring("inventor")}
    ),
    "pets": (cat, dog),
}
person_gyro_serialized = [
    person_gyro["name"],
    *education_serialized,
    *company_serialized,
    person_gyro["occupation"].position,
    *cat_serialized,
    *dog_serialized,
]

person_donald = {
    "name": encode_shortstring("Donald Duck"),
    "education": education,
    "occupation": TupleDataclass.from_dict(
        {"company": company, "position": encode_shortstring("dunno")}
    ),
    "pets": (dog, dog),
}
person_donald_serialized = [
    person_donald["name"],
    *education_serialized,
    *company_serialized,
    person_donald["occupation"].position,
    *dog_serialized,
    *dog_serialized,
]

abi = json.loads(
    read_contract("complex_abi_abi.json", directory=CONTRACTS_COMPILED_V0_DIR)
)
parsed_abi = AbiParserV0(abi).parse()

abi_v1 = json.loads(
    load_contract(contract_name="ERC20", version=ContractVersion.V1)["sierra"]
)["abi"]
parsed_abi_v1 = AbiParserV1(abi_v1).parse()

abi_v2 = json.loads(
    load_contract(contract_name="NewSyntaxTestContract", version=ContractVersion.V2)[
        "sierra"
    ]
)["abi"]

parsed_abi_v2 = AbiParserV2(abi_v2).parse()


def test_fn_serialization():
    expected_serialized = [
        2,
        *person_donald_serialized,
        *person_gyro_serialized,
        *company_serialized,
    ]
    serializer = serializer_for_function(parsed_abi.functions["hire"])

    assert expected_serialized == serializer.serialize(
        [person_donald, person_gyro], company
    )
    assert ([person_donald, person_gyro], company) == serializer.deserialize(
        expected_serialized
    )


def test_event_serialization_v0():
    expected_serialized = [
        *person_gyro_serialized,
        *company_serialized,
    ]
    serializer = serializer_for_event(parsed_abi.events["PersonHired"])
    payload = {"person": person_gyro, "company": company}

    assert expected_serialized == serializer.serialize(payload)
    assert TupleDataclass.from_dict(payload) == serializer.deserialize(
        expected_serialized
    )


def test_event_serialization_v1():
    serializer = serializer_for_event(parsed_abi_v1.events["Approval"])

    approval = {"owner": 1, "spender": 2, "value": 3}
    serialized = serializer.serialize(approval)
    assert serialized == [1, 2, 3, 0]

    assert serializer.deserialize(serialized).as_dict() == approval


def test_event_serialization_v2():
    serializer = serializer_for_event(
        parsed_abi_v2.events[
            "contracts_v2::new_syntax_test_contract::"
            "NewSyntaxTestContract::CounterIncreased"
        ]
    )

    serialized = serializer.serialize({"amount": 5})
    assert serialized == [5]

    assert serializer.deserialize(serialized).as_dict() == {"amount": 5}

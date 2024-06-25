%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256


struct Pet {
    name: felt,
    species: felt,
}

struct BusinessOwner {
    name: felt,
    pets: (Pet, Pet, Pet),
}

struct Company {
    id: Uint256,
    name: felt,
    address: felt,
    owner: BusinessOwner,
    company_structure: (felt, (felt, (felt, felt, felt), felt, (felt, felt), felt, (felt))),
}

struct Person {
    name: felt,
    education: (school: (location: felt, name: felt), level: felt),
    occupation: (company: Company, position: felt),
    pets: (Pet, Pet),
}

@event
func PersonHired(
    person: Person,
    company: Company,
) {
}

@external
func hire{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
}(people_len: felt, people: Person*, company: Company) -> (people_len: felt, people: Person*, company: Company) {
    return (people_len, people, company);
}

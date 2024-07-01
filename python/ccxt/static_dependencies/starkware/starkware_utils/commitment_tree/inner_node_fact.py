from abc import abstractmethod
from typing import Tuple

from starkware.storage.storage import Fact


class InnerNodeFact(Fact):
    """
    Represents the fact of an inner node in a binary fact tree.
    """

    @abstractmethod
    def to_tuple(self) -> Tuple[int, ...]:
        """
        Returns a representation of the fact's preimage as a tuple.
        """

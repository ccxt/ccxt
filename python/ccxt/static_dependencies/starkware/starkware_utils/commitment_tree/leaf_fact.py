from abc import abstractmethod
from typing import TypeVar

from starkware.storage.storage import Fact


class LeafFact(Fact):
    """
    A fact that represents a leaf in a commitment tree.
    """

    @property
    @abstractmethod
    def is_empty(self) -> bool:
        """
        Returns true iff the fact represents a leaf that has no value or was deleted.
        """


TLeafFact = TypeVar("TLeafFact", bound=LeafFact)

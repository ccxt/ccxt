from enum import Enum


class DataAvailabilityMode(Enum):
    L1 = 0
    L2 = 1

    def assert_l1(self):
        assert self is DataAvailabilityMode.L1, "Only L1 storage is currently supported."

from typing import List


def is_subsequence(subsequence: List, sequence: List) -> bool:
    """
    Checks whether 'subsequence' is a subsequence of 'sequence'.
    """

    offset = 0
    for item in sequence:
        if offset == len(subsequence):
            return True

        if item == subsequence[offset]:
            offset = offset + 1

    return offset == len(subsequence)

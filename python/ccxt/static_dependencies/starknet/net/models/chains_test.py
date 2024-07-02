import pytest

from ..models.chains import chain_from_network


def test_no_chain_for_custom_network():
    with pytest.raises(
        ValueError, match="Chain is required when not using predefined networks."
    ):
        chain_from_network("some_custom_url")

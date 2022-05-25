import numbers  # noqa: E402

"use strict"

# ----------------------------------------------------------------------------


# ----------------------------------------------------------------------------


    keys = list(format.keys())
    for i in range(0, len(keys)):
        assert keys[i] in margin

    assert typeof marginModification["info"] == "object"
    if marginModification["type"] is not None:
        assert marginModification["type"] == "add" or marginModification["type"] == "reduce" or marginModification["type"] == "set"

    if marginModification["ampunt"] is not None:
        assert typeof marginModification["amount"] == "number"

    if marginModification["total"] is not None:
        assert typeof marginModification["total"] == "number"

    if marginModification["code"] is not None:
        assert typeof marginModification["code"] == "string"

    if marginModification["symbol"] is not None:
        assert typeof marginModification["symbol"] == "string"

    if marginModification["status"] is not None:
        assert exchange.in_array(marginModification["status"], ["ok", "pending", "canceled", "failed"]

}

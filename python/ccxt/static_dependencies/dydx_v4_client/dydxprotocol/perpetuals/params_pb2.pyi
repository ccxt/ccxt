from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Params(_message.Message):
    __slots__ = ["funding_rate_clamp_factor_ppm", "min_num_votes_per_sample", "premium_vote_clamp_factor_ppm"]
    FUNDING_RATE_CLAMP_FACTOR_PPM_FIELD_NUMBER: _ClassVar[int]
    MIN_NUM_VOTES_PER_SAMPLE_FIELD_NUMBER: _ClassVar[int]
    PREMIUM_VOTE_CLAMP_FACTOR_PPM_FIELD_NUMBER: _ClassVar[int]
    funding_rate_clamp_factor_ppm: int
    min_num_votes_per_sample: int
    premium_vote_clamp_factor_ppm: int
    def __init__(self, funding_rate_clamp_factor_ppm: _Optional[int] = ..., premium_vote_clamp_factor_ppm: _Optional[int] = ..., min_num_votes_per_sample: _Optional[int] = ...) -> None: ...

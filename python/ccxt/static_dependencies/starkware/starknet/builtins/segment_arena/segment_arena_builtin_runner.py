from starkware.cairo.lang.vm.builtin_runner import SimpleBuiltinRunner

ARENA_BUILTIN_SIZE = 3
# The size of the builtin segment at the time of its creation.
INITIAL_SEGMENT_SIZE = ARENA_BUILTIN_SIZE


class SegmentArenaBuiltinRunner(SimpleBuiltinRunner):
    def __init__(self, included: bool):
        super().__init__(
            name="segment_arena",
            included=included,
            ratio=None,
            cells_per_instance=ARENA_BUILTIN_SIZE,
            n_input_cells=ARENA_BUILTIN_SIZE,
        )

    def initialize_segments(self, runner):
        infos = runner.segments.add()
        # Initiate the segment with an empty SegmentArenaBuiltin.
        initial_values = [
            infos,
            0,  # n_segments.
            0,  # n_finalized.
        ]
        assert len(initial_values) == INITIAL_SEGMENT_SIZE
        segment_start = runner.segments.gen_arg(initial_values)
        self._base = segment_start + INITIAL_SEGMENT_SIZE

    def get_used_cells(self, runner):
        used = runner.segments.get_segment_used_size(self.base.segment_index)
        # The value returned from `get_segment_used_size` includes the initial values that were
        # written by `initialize_segments`. We reduce it, since the result of the function should
        # not include them.
        assert used >= INITIAL_SEGMENT_SIZE
        return used - INITIAL_SEGMENT_SIZE

    def get_memory_accesses(self, runner):
        return {}

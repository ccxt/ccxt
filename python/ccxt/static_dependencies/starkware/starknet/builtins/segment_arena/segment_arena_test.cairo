from starkware.cairo.common.alloc import alloc
from starkware.starknet.builtins.segment_arena.segment_arena import (
    SegmentArenaBuiltin,
    SegmentInfo,
    new_arena,
    validate_segment_arena,
)

// Creates a new segment using the segment arena.
func new_segment{segment_arena: SegmentArenaBuiltin*}() -> felt* {
    let prev_segment_arena = &segment_arena[-1];
    tempvar n_segments = prev_segment_arena.n_segments;
    tempvar infos = prev_segment_arena.infos;

    %{
        if 'segment_index_to_arena_index' not in globals():
            # A map from the relocatable value segment index to the index in the arena.
            segment_index_to_arena_index = {}

        # The segment is placed at the end of the arena.
        index = ids.n_segments

        # Create a segment or a temporary segment.
        start = segments.add_temp_segment() if index > 0 else segments.add()

        # Update 'SegmentInfo::start' and 'segment_index_to_arena_index'.
        ids.prev_segment_arena.infos[index].start = start
        segment_index_to_arena_index[start.segment_index] = index
    %}
    assert segment_arena[0] = SegmentArenaBuiltin(
        infos=infos, n_segments=n_segments + 1, n_finalized=prev_segment_arena.n_finalized
    );
    let segment_arena = &segment_arena[1];
    return infos[n_segments].start;
}

// Finalizes a given segment and returns the corresponding start.
func finalize_segment{segment_arena: SegmentArenaBuiltin*}(segment_end: felt*) -> felt* {
    let prev_segment_arena = &segment_arena[-1];
    tempvar n_segments = prev_segment_arena.n_segments;
    tempvar n_finalized = prev_segment_arena.n_finalized;

    // Guess the index of the segment.
    tempvar index = nondet %{ segment_index_to_arena_index[ids.segment_end.segment_index] %};

    // Write segment_end in the manager.
    tempvar infos: SegmentInfo* = prev_segment_arena.infos;
    tempvar segment_info: SegmentInfo* = &infos[index];
    // Writing n_finalized to 'finalization_index' guarantees 'segment_info.end' was not assigned
    // a value before.
    assert segment_info.finalization_index = n_finalized;
    assert segment_info.end = segment_end;

    assert segment_arena[0] = SegmentArenaBuiltin(
        infos=infos, n_segments=n_segments, n_finalized=n_finalized + 1
    );

    let segment_arena = &segment_arena[1];
    return segment_info.start;
}

func test_segment_arena() -> (felt*, SegmentInfo*) {
    alloc_locals;

    local segment_arena_start: SegmentArenaBuiltin* = new_arena();
    let segment_arena = segment_arena_start;

    with segment_arena {
        let segment0 = new_segment();
        let segment1 = new_segment();
        let segment2 = new_segment();

        assert segment0[0] = 1;
        assert segment0[1] = 2;

        assert segment1[0] = 3;
        assert segment1[1] = 4;

        assert segment2[0] = 5;

        assert finalize_segment(segment0 + 2) = segment0;
        assert finalize_segment(segment1 + 2) = segment1;

        let segment3 = new_segment();

        assert segment3[0] = 6;
        assert segment3[1] = 7;

        assert finalize_segment(segment3 + 2) = segment3;
        assert finalize_segment(segment2 + 1) = segment2;
    }
    validate_segment_arena(segment_arena=&segment_arena[-1]);
    return (segment0, segment_arena_start[-1].infos);
}

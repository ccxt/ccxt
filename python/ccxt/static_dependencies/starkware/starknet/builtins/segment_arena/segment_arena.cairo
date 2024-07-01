from starkware.cairo.common.alloc import alloc

// The segment arena builtin allows Sierra libfuncs to allocate memory segments and only track their
// ends (rather than both the start and the end). When the segment is finalized, the arena can
// provide the start pointer that corresponds to the segment (given its end).
//
// The builtin should be used as follows:
// * Every segment must be allocated and finalized exactly once. This can be achieved by using
//   linear types (the object holding the segment must not be duplicatable nor droppable).
// * Segment allocation:
//   * Allocates a new segment and updates `SegmentInfo::start` with the pointer.
//   * The segment should be temporary if `n_segments > 0`.
//   * Increases `n_segments` by 1.
// * Segment finalization:
//   * Guesses the index of the segment, in the range [0, n_segments).
//   * Writes the end of the segment in `SegmentInfo::end`.
//   * Copies the current value of `n_finalized` to `SegmentInfo::finalization_index`.
//   * Increases `n_finalized` by 1.
//   * Checks that the segment size is nonnegative (range-check on `end - start`).

// Represents the information about a single segment allocated by the arena.
struct SegmentInfo {
    // A pointer to the first element of this segment.
    start: felt*,
    // A pointer to the end of this segment (the first unused element).
    end: felt*,
    // A sequential id, assigned to the segment when it is finalized.
    // This value is used to guarantee that 'end' is not assigned twice.
    finalization_index: felt,
}

// Represents the status of the segment arena.
struct SegmentArenaBuiltin {
    // A pointer to a list of SegmentInfo. infos[i] contains information about the i-th segment
    // (ordered by construction).
    // The value is fixed during the execution of an entry point.
    infos: SegmentInfo*,
    // The number of segments that were created so far.
    n_segments: felt,
    // The number of segments that were finalized so far.
    n_finalized: felt,
}

// Constructs a new segment for the segment arena builtin and initializes it with an empty instance
// of `SegmentArenaBuiltin`.
func new_arena() -> SegmentArenaBuiltin* {
    let (segment_arena: SegmentArenaBuiltin*) = alloc();
    assert segment_arena[0] = SegmentArenaBuiltin(
        infos=cast(nondet %{ segments.add() %}, SegmentInfo*), n_segments=0, n_finalized=0
    );
    return &segment_arena[1];
}

// Validates the segment arena builtin.
//
// In particular, relocates the temporary segments such that the start of segment i is strictly
// larger than the end of segment i+1.
func validate_segment_arena(segment_arena: SegmentArenaBuiltin*) {
    tempvar n_segments = segment_arena.n_segments;
    tempvar n_finalized = segment_arena.n_finalized;
    // The following line should follow from the fact that every allocated segment
    // must be finalized exactly once.
    // We keep it both as a sanity check and since Sierra compilation is not proven yet.
    assert n_segments = n_finalized;

    if (n_segments == 0) {
        return ();
    }

    // The following call also implies that n_segments > 0.
    _verify_continuity(infos=segment_arena.infos, n_segments_minus_one=n_segments - 1);
    return ();
}

// Helper function for validate_segment_arena.
func _verify_continuity(infos: SegmentInfo*, n_segments_minus_one: felt) {
    if (n_segments_minus_one == 0) {
        // If there is only one segment left, there is no need to check anything.
        return ();
    }

    // Enforce an empty cell between two consecutive segments so that the start of a segment
    // is strictly bigger than the end of the previous segment.
    // This is required for proving the soundness of this construction, in the case where a segment
    // has length zero.

    // Note: the following code was copied from relocate_segment() for efficiency reasons.
    let src_ptr = infos[1].start;
    let dest_ptr = infos[0].end + 1;
    %{ memory.add_relocation_rule(src_ptr=ids.src_ptr, dest_ptr=ids.dest_ptr) %}
    assert src_ptr = dest_ptr;

    return _verify_continuity(infos=&infos[1], n_segments_minus_one=n_segments_minus_one - 1);
}

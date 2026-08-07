package ccxt

import "testing"

// End-to-end: `Core` is an exported field, and wrapper methods now return pointers
// for maybe-undefined scalars (PR #29640). So feeding a wrapper's *int64 result
// straight into a core call is reachable user code, not a hypothetical.
//
//	t, _ := ex.FetchTime()          // *int64, nil when undefined
//	ex.Core.FetchOHLCV(sym, tf, t)  // since = *int64
//
// The core binds that argument with GetArg, which must unwrap it.
func TestCoreOptionalArgAcceptsWrapperPointerResult(t *testing.T) {
	// present pointer, as returned by a successful wrapper call
	server := int64(1700000000000)
	since := &server

	// what the core does: since := GetArg(optionalArgs, 1, nil)
	got := GetArg([]any{"1m", since}, 1, nil)
	if got != any(server) {
		t.Fatalf("core bound since=%#v, want %v", got, server)
	}
	// and it must stay usable by the untyped shims the core body applies to it
	if v := Add(got, 1); v != any(server+1) {
		t.Errorf("Add(since,1) = %#v, want %v", v, server+1)
	}
	if IsTrue(IsEqual(got, nil)) {
		t.Errorf("a present since must not read as undefined")
	}

	// absent pointer, as returned when the wrapper says undefined
	var absent *int64
	got = GetArg([]any{"1m", absent}, 1, nil)
	if got != nil {
		t.Fatalf("core bound absent since=%#v, want nil (undefined)", got)
	}
	if !IsTrue(IsEqual(got, nil)) {
		t.Errorf("an absent since must read as undefined, so `if since == nil` guards fire")
	}
}

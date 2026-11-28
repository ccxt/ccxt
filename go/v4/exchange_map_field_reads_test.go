package ccxt

import "testing"

// the prediction caches and the base map fields are plain Go maps: a nil map and a missing key both answer absent
func getEventPanics(ex *PredictionExchange, key string) (panicked bool) {
	defer func() { panicked = recover() != nil }()
	ex.GetEvent(key)
	return false
}

// GetEvent throws BadSymbol on a miss (as on the base); a nil map and a missing key both miss
func TestPredictionCacheNilAndMissingKeyReads(t *testing.T) {
	ex := &PredictionExchange{}
	if !getEventPanics(ex, "e1") {
		t.Fatalf("nil caches: GetEvent must throw")
	}
	ex.Events = map[string]any{"e1": map[string]any{"id": "e1"}}
	ex.Events_by_slug = map[string]any{}
	if !getEventPanics(ex, "missing") {
		t.Fatalf("missing key: GetEvent must throw")
	}
	if got, ok := ex.GetEvent("e1").(map[string]any); !ok || got["id"] != "e1" {
		t.Fatalf("present key: GetEvent = %v", got)
	}
	if ex.HasOutcome("o1") || ex.HasOutcome(nil) {
		t.Fatalf("nil outcome caches must answer false")
	}
}

func TestFeaturesLocalNilAndMissingKey(t *testing.T) {
	var features map[string]any
	if _, ok := features["spot"]; ok {
		t.Fatalf("nil features map must miss")
	}
	if InOp(features, "spot") {
		t.Fatalf("InOp on a nil map must miss")
	}
	ex := &BaseExchange{}
	if ex.NetworkAliases != nil {
		t.Fatalf("zero NetworkAliases must be a nil map")
	}
	if got := ex.SafeString(ex.NetworkAliases, "ETH", "ETH"); got == nil || *got != "ETH" {
		t.Fatalf("missing alias must answer the default")
	}
}

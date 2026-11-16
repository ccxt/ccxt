package ccxt

import "testing"

// mockBodyForUrl serves static-response fixtures keyed by url fragment. Go maps
// do not keep insertion order, so a paginated request can encode its query in
// any order; a fixture keyed by the whole query must still match it.
func TestMockBodyForUrlMatchesQueryInAnyOrder(t *testing.T) {
	byUrl := map[string]any{
		"symbol=A&limit=3&end=200":          "newest",
		"symbol=A&limit=3&end=100":          "older",
		"symbol=A&start=50&limit=3&end=200": "bounded",
	}
	cases := map[string]string{
		"https://x.test/history?symbol=A&limit=3&end=200":          "newest",
		"https://x.test/history?end=200&symbol=A&limit=3":          "newest",
		"https://x.test/history?limit=3&end=100&symbol=A":          "older",
		"https://x.test/history?end=200&start=50&symbol=A&limit=3": "bounded",
		// the narrower "symbol=A&limit=3&end=200" key is a contiguous substring
		// of this reordered url, but the exact parameter set must still win
		"https://x.test/history?symbol=A&limit=3&end=200&start=50": "bounded",
	}
	for url, want := range cases {
		if got := mockBodyForUrl(byUrl, url); got != want {
			t.Errorf("%s: got %v, want %v", url, got, want)
		}
	}
}

func TestSameQueryInAnyOrderNeedsTheExactParameterSet(t *testing.T) {
	if !sameQueryInAnyOrder("https://x.test/p?b=2&a=1", "a=1&b=2") {
		t.Error("reordered parameters must match")
	}
	if sameQueryInAnyOrder("https://x.test/p?a=1&b=2&c=3", "a=1&b=2") {
		t.Error("an extra request parameter must not match a narrower key")
	}
	if sameQueryInAnyOrder("https://x.test/p?a=1&b=20", "a=1&b=2") {
		t.Error("a value prefix must not match")
	}
	if sameQueryInAnyOrder("https://x.test/p?a=1", "a=1") {
		t.Error("single-parameter keys keep the plain substring match")
	}
}

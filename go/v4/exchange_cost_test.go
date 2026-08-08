package ccxt

import "testing"

// The api leaves that carry a returnType are object leaves, so the cost inside
// them must survive whatever numeric type the transpiler emits. Before toCost
// existed, a bare rl.(float64) assertion silently fell back to 1 for every
// integer cost declared in an object leaf.
func TestToCostAcceptsEveryNumericLeafForm(t *testing.T) {
	cases := []struct {
		name  string
		value any
		want  float64
	}{
		{"int (bare number leaf transpiled as int)", 5, 5},
		{"int64", int64(20), 20},
		{"int32", int32(3), 3},
		{"float64", 0.1, 0.1},
		{"float32", float32(2.5), 2.5},
		{"string", "1.5", 1.5},
	}
	for _, c := range cases {
		got, ok := toCost(c.value)
		if !ok || got != c.want {
			t.Errorf("%s: toCost(%v) = %v, %v; want %v, true", c.name, c.value, got, ok, c.want)
		}
	}
	if _, ok := toCost(nil); ok {
		t.Errorf("toCost(nil) reported ok; want not ok so the cost stays at its default")
	}
	if _, ok := toCost(map[string]any{}); ok {
		t.Errorf("toCost(map) reported ok; want not ok")
	}
}

// A returnType key sitting next to the cost must not disturb the cost, and must
// never be mistaken for one.
func TestObjectLeafWithReturnTypeKeepsItsCost(t *testing.T) {
	leaves := []struct {
		name string
		leaf map[string]any
		want float64
	}{
		{"cost only, int", map[string]any{"cost": 2}, 2},
		{"cost with byLimit (binance dapiPublic depth)", map[string]any{"cost": 2, "byLimit": []any{[]any{50, 2}}}, 2},
		{"cost with returnType, int", map[string]any{"cost": 5, "returnType": "List"}, 5},
		{"cost with returnType, float", map[string]any{"cost": 0.5, "returnType": "Dict"}, 0.5},
	}
	for _, l := range leaves {
		cost := 1.0
		if rl, ok := l.leaf["cost"]; ok {
			if parsed, ok := toCost(rl); ok {
				cost = parsed
			}
		}
		if cost != l.want {
			t.Errorf("%s: cost = %v; want %v", l.name, cost, l.want)
		}
	}
}

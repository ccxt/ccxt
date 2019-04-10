package bitmex

// AUTOMATICALLY GENERATED, BUT NEEDS TO BE MODIFIED:
import (
    "testing"
)

func TestExchangeInit(t *testing.T) {
    x, err := Init()
    if err != nil {
        t.Fatal(err)
    }
    if x.Info.ID != "bitmex" {
        t.Fatal("Did not load ID bitmex correctly")
    }
}
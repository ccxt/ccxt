package bitmex

// AUTOMATICALLY GENERATED, BUT NEEDS TO BE MODIFIED:
import (
	"encoding/json"
	"io/ioutil"
	"net/url"
	"testing"

	"github.com/ccxt/ccxt/go/pkg/ccxt"
	. "github.com/smartystreets/goconvey/convey"
)

var p *url.Values

func init() {
	p = &url.Values{}
}

func setup(t *testing.T) *Exchange {
	keys, err := ioutil.ReadFile("../../../keys.json")
	So(err, ShouldBeNil)

	var configKeys map[string]ccxt.ExchangeConfig
	err = json.Unmarshal(keys, &configKeys)
	So(err, ShouldBeNil)

	config := configKeys["bitmex"]
	x, err := Init(config)
	So(err, ShouldBeNil)
	So(x.Config.APIKey, ShouldNotBeBlank)

	if x.Config.APIKey != config.APIKey {
		t.Fatal("Did not load bitmex APIKey correctly")
	}
	return x
}
func TestExchangeInit(t *testing.T) {
	x, err := Init(ccxt.ExchangeConfig{})
	if err != nil {
		t.Fatal(err)
	}
	if x.Info.ID != "bitmex" {
		t.Fatal("Did not load ID bitmex correctly")
	}
}

func TestExchangeInitPrivate(t *testing.T) {
	Convey("bitmex.InitPrivate()", t, func() {
		setup(t)
	})
}

func TestFetchBalance(t *testing.T) {
	Convey("bitmex.FetchBalance()", t, func() {
		x := setup(t)
		_, err := ccxt.LoadMarkets(x, false, p)
		So(err, ShouldBeNil)
		Convey("Fetching balance", func() {
			account, err := x.FetchBalance(p)
			So(err, ShouldBeNil)
			Convey("Account should have Free, Used & Total keys", func() {
				So(account.Free, ShouldNotBeEmpty)
				So(account.Used, ShouldNotBeEmpty)
				So(account.Total, ShouldNotBeEmpty)
			})
			Convey("Total account balance > 0", func() {
				So(account.Total["XBT"], ShouldBeGreaterThan, 0)
			})
		})
	})
}

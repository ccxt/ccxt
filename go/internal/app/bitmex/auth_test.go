package bitmex

// Samples from https://www.bitmex.com/app/apiKeysUsage#Full-sample-calculation
import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/ccxt/ccxt/go/internal/util"
	"github.com/ccxt/ccxt/go/pkg/ccxt"
)

var ex *Exchange

func init() {
	var err error
	ex, err = Init(ccxt.ExchangeConfig{
		APIKey: "LAqUlngMIQkIUjXMUreyu3qn",
		Secret: "chNOOS4KvNXR_Xq4k4c9qsfoKWvnDecLATCRlcBwyKDYnWgO",
	})
	if err != nil {
		panic(err)
	}
}

func TestAuthSign(t *testing.T) {
	const (
		verb = "GET"
		path = "/api/v1/instrument"
		data = ""
	)
	endpoint, err := url.Parse(ex.Info.URLs.WWW + path)
	if err != nil {
		t.Error(err)
	}
	req, _ := http.NewRequest(verb, endpoint.String(), strings.NewReader(data))
	err = ex.SignRequest(req, verb, endpoint, []byte(data))
	if err != nil {
		t.Error(err)
	}
	apiKey := req.Header.Get("api-key")
	if apiKey != ex.Config.APIKey {
		t.Errorf("Not Equal apiKey:\n%s\n%s", apiKey, ex.Config.APIKey)
	}
	expires := req.Header.Get("api-expires")
	result := req.Header.Get("api-signature")
	t.Logf("\nverb: %s\npath: %s\nexpires: %s\ndata: %s", verb, path, expires, data)
	// Calculate signature directly
	payload := verb + path + expires + data
	t.Log(payload)
	signature, err := util.HMAC(payload, ex.Config.Secret, "sha256", "hex")
	if err != nil {
		t.Error(err)
	}
	if result != signature {
		t.Errorf("Not Equal signatures:\n%s\n%s", signature, result)
	}
}

func TestSimpleGet(t *testing.T) {
	const (
		verb    = "GET"
		path    = "/api/v1/instrument"
		expires = 1518064236 // 2018-02-08T04:30:36Z
		data    = ""
		// HEX(HMAC_SHA256(apiSecret, "GET/api/v1/instrument1518064236"))
		// signature = HEX(HMAC_SHA256(apiSecret, verb + path + str(expires) + data))
		result = "c7682d435d0cfe87c16098df34ef2eb5a549d4c5a3c2b1f0f77b8af73423bf00"
	)
	payload := fmt.Sprintf("%s%s%d%s", verb, path, expires, data)
	signature, err := util.HMAC(payload, ex.Config.Secret, "sha256", "hex")
	if err != nil {
		t.Error(err)
	}
	if result != signature {
		t.Errorf("Not Equal signatures:\n%s\n%s", signature, result)
	}
}

func TestComplexGet(t *testing.T) {
	const (
		verb = "GET"
		// Note url-encoding on querystring - this is "/api/v1/instrument?filter={"symbol": "XBTM15"}"
		// Be sure to HMAC *exactly* what is sent on the wire
		path    = "/api/v1/instrument?filter=%7B%22symbol%22%3A+%22XBTM15%22%7D"
		expires = 1518064237 // 2018-02-08T04:30:37Z
		data    = ""
		// HEX(HMAC_SHA256(apiSecret, "GET/api/v1/instrument?filter=%7B%22symbol%22%3A+%22XBTM15%22%7D1518064237"))
		// signature = HEX(HMAC_SHA256(apiSecret, verb + path + str(expires) + data))
		result = "e2f422547eecb5b3cb29ade2127e21b858b235b386bfa45e1c1756eb3383919f"
	)
	payload := fmt.Sprintf("%s%s%d%s", verb, path, expires, data)
	signature, err := util.HMAC(payload, ex.Config.Secret, "sha256", "hex")
	if err != nil {
		t.Error(err)
	}
	if result != signature {
		t.Errorf("Not Equal signatures:\n%s\n%s", signature, result)
	}
}

func TestPost(t *testing.T) {
	const (
		verb    = "POST"
		path    = "/api/v1/order"
		expires = 1518064238 // 2018-02-08T04:30:38Z
		data    = `{"symbol":"XBTM15","price":219.0,"clOrdID":"mm_bitmex_1a/oemUeQ4CAJZgP3fjHsA","orderQty":98}`
		// HEX(HMAC_SHA256(apiSecret, "POST/api/v1/order1518064238{"symbol":"XBTM15","price":219.0,"clOrdID":"mm_bitmex_1a/oemUeQ4CAJZgP3fjHsA","orderQty":98}"))
		// signature = HEX(HMAC_SHA256(apiSecret, verb + path + str(expires) + data))
		result = "1749cd2ccae4aa49048ae09f0b95110cee706e0944e6a14ad0b3a8cb45bd336b"
	)
	payload := fmt.Sprintf("%s%s%d%s", verb, path, expires, data)
	signature, err := util.HMAC(payload, ex.Config.Secret, "sha256", "hex")
	if err != nil {
		t.Error(err)
	}
	if result != signature {
		t.Errorf("Not Equal signatures:\n%s\n%s", signature, result)
	}
}

type PostBody struct {
	Symbol   string  `json:"symbol"`
	Price    float64 `json:"price"`
	ClOrdID  string  `json:"clOrdID"`
	OrderQty float64 `json:"orderQty"`
}

func TestPostGo(t *testing.T) {
	const (
		verb    = "POST"
		path    = "/api/v1/order"
		expires = 1518064238 // 2018-02-08T04:30:38Z
		data    = `{"symbol":"XBTM15","price":219.0,"clOrdID":"mm_bitmex_1a/oemUeQ4CAJZgP3fjHsA","orderQty":98}`
		// HEX(HMAC_SHA256(apiSecret, "POST/api/v1/order1518064238{"symbol":"XBTM15","price":219.0,"clOrdID":"mm_bitmex_1a/oemUeQ4CAJZgP3fjHsA","orderQty":98}"))
		// signature = HEX(HMAC_SHA256(apiSecret, verb + path + str(expires) + data))
		result = "3143de661e8616047783407aa8b0371d200eec5b8d90b0b11657e5cef3ad1830"
	)
	timedate := "2018-02-08T04:30:38Z"
	apiExpires, err := time.Parse("2006-01-02T15:04:05Z", timedate)
	if err != nil {
		t.Error(err)
	}
	if apiExpires.Unix() != expires {
		t.Errorf("Not Equal expires:\n%d\n%d", apiExpires.Unix(), expires)
	}
	postBody := PostBody{
		Symbol:   "XBTM15",
		Price:    219.0,
		ClOrdID:  "mm_bitmex_1a/oemUeQ4CAJZgP3fjHsA",
		OrderQty: 98,
	}
	b, err := json.Marshal(&postBody)
	if err != nil {
		t.Error(err)
	}
	payload := fmt.Sprintf("%s%s%d%s", verb, path, apiExpires.Unix(), string(b))
	signature, err := util.HMAC(payload, ex.Config.Secret, "sha256", "hex")
	if err != nil {
		t.Error(err)
	}
	if result != signature {
		t.Errorf("Not Equal signatures:\n%s\n%s", signature, result)
	}
}

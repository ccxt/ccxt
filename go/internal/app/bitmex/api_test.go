package bitmex

// AUTOMATICALLY GENERATED, BUT NEEDS TO BE MODIFIED:
import (
    "bytes"
	"encoding/json"
    "os"
    "testing"

    "github.com/ccxt/ccxt/go/pkg/ccxt"
)

var info ccxt.ExchangeInfo
var c Exchange

func init() {
	f, err := os.Open("bitmex")
	if err != nil {
		panic(err)
	}
	defer f.Close()
	json.NewDecoder(f).Decode(&info)
}


func TestPublicGet[]Announcement(t *testing.T) {
    data, err := c.PublicGet[]Announcement()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Announcement(t *testing.T) {
    data, err := c.PublicGet[]Announcement()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Funding(t *testing.T) {
    data, err := c.PublicGet[]Funding()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Instrument(t *testing.T) {
    data, err := c.PublicGet[]Instrument()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Instrument(t *testing.T) {
    data, err := c.PublicGet[]Instrument()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Instrument(t *testing.T) {
    data, err := c.PublicGet[]Instrument()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Instrument(t *testing.T) {
    data, err := c.PublicGet[]Instrument()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Instrument(t *testing.T) {
    data, err := c.PublicGet[]Instrument()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Instrument(t *testing.T) {
    data, err := c.PublicGet[]Instrument()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Insurance(t *testing.T) {
    data, err := c.PublicGet[]Insurance()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Leaderboard(t *testing.T) {
    data, err := c.PublicGet[]Leaderboard()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGetLeaderboard(t *testing.T) {
    data, err := c.PublicGetLeaderboard()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Liquidation(t *testing.T) {
    data, err := c.PublicGet[]Liquidation()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]OrderBookL2(t *testing.T) {
    data, err := c.PublicGet[]OrderBookL2()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Quote(t *testing.T) {
    data, err := c.PublicGet[]Quote()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Quote(t *testing.T) {
    data, err := c.PublicGet[]Quote()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGetInterface{}(t *testing.T) {
    data, err := c.PublicGetInterface{}()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGetInterface{}(t *testing.T) {
    data, err := c.PublicGetInterface{}()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGetSettlement(t *testing.T) {
    data, err := c.PublicGetSettlement()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Stats(t *testing.T) {
    data, err := c.PublicGet[]Stats()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]StatsHistory(t *testing.T) {
    data, err := c.PublicGet[]StatsHistory()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]Trade(t *testing.T) {
    data, err := c.PublicGet[]Trade()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPublicGet[]TradeBin(t *testing.T) {
    data, err := c.PublicGet[]TradeBin()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}



func TestPrivateGetAPIKey(t *testing.T) {
    data, err := c.PrivateGetAPIKey()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]Chat(t *testing.T) {
    data, err := c.PrivateGet[]Chat()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]ChatChannel(t *testing.T) {
    data, err := c.PrivateGet[]ChatChannel()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetConnectedUsers(t *testing.T) {
    data, err := c.PrivateGetConnectedUsers()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]Execution(t *testing.T) {
    data, err := c.PrivateGet[]Execution()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]Execution(t *testing.T) {
    data, err := c.PrivateGet[]Execution()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]GlobalNotification(t *testing.T) {
    data, err := c.PrivateGet[]GlobalNotification()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]Order(t *testing.T) {
    data, err := c.PrivateGet[]Order()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]Position(t *testing.T) {
    data, err := c.PrivateGet[]Position()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetUser(t *testing.T) {
    data, err := c.PrivateGetUser()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetAffiliate(t *testing.T) {
    data, err := c.PrivateGetAffiliate()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetFloat64(t *testing.T) {
    data, err := c.PrivateGetFloat64()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetUserCommissionsBySymbol(t *testing.T) {
    data, err := c.PrivateGetUserCommissionsBySymbol()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetString(t *testing.T) {
    data, err := c.PrivateGetString()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]Execution(t *testing.T) {
    data, err := c.PrivateGet[]Execution()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetMargin(t *testing.T) {
    data, err := c.PrivateGetMargin()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetInterface{}(t *testing.T) {
    data, err := c.PrivateGetInterface{}()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGetWallet(t *testing.T) {
    data, err := c.PrivateGetWallet()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]Transaction(t *testing.T) {
    data, err := c.PrivateGet[]Transaction()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateGet[]Transaction(t *testing.T) {
    data, err := c.PrivateGet[]Transaction()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostAPIKey(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostAPIKey(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostAPIKey(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostAPIKey(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostAPIKey(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostAPIKey(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostChat(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostChat(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostOrder(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostOrder(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePost[]Order(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePost[]Order(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostInterface{}(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostInterface{}(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostPosition(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostPosition(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostPosition(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostPosition(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostPosition(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostPosition(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostPosition(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostPosition(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostTransaction(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostTransaction(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePost[]CommunicationToken(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePost[]CommunicationToken(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostAccessToken(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostAccessToken(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostTransaction(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostTransaction(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostInterface{}(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostInterface{}(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostUserPreferences(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostUserPreferences(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePostTransaction(t *testing.T) {
    // TODO: Fill POST body
    body := bytes.Buffer{}
    data, err := c.PrivatePostTransaction(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePutOrder(t *testing.T) {
    // TODO: Fill PUT body
    body := bytes.Buffer{}
    data, err := c.PrivatePutOrder(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivatePut[]Order(t *testing.T) {
    // TODO: Fill PUT body
    body := bytes.Buffer{}
    data, err := c.PrivatePut[]Order(body)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateDeleteInterface{}(t *testing.T) {
    data, err := c.PrivateDeleteInterface{}()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateDelete[]Order(t *testing.T) {
    data, err := c.PrivateDelete[]Order()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}
func TestPrivateDelete[]Order(t *testing.T) {
    data, err := c.PrivateDelete[]Order()
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

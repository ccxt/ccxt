package bitmex

// AUTOMATICALLY GENERATED, BUT NEEDS TO BE MODIFIED:
import (
	"bytes"
    "encoding/json"
	"io/ioutil"
	"net/url"
	"reflect"
	"testing"

	"github.com/ccxt/ccxt/go/internal/app/bitmex/models"
    "github.com/ccxt/ccxt/go/pkg/ccxt"
)

var c *Exchange

func init() {
    keys, err := ioutil.ReadFile("../../../keys.json")
	if err != nil {
		panic(err)
	}
	var configKeys map[string]ccxt.ExchangeConfig
	err = json.Unmarshal(keys, &configKeys)
	if err != nil {
		panic(err)
	}
	config := configKeys["bitmex"]
	c, err = Init(config)
    if err != nil {
	    panic(err)
    }
}

func TestPublicGetAnnouncement(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetAnnouncement(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetAnnouncementUrgent(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetAnnouncementUrgent(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetFunding(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetFunding(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetInstrument(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetInstrument(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetInstrumentActive(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetInstrumentActive(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetInstrumentActiveAndIndices(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetInstrumentActiveAndIndices(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetInstrumentActiveIntervals(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetInstrumentActiveIntervals(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.InstrumentInterval{})) {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetInstrumentCompositeIndex(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetInstrumentCompositeIndex(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetInstrumentIndices(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetInstrumentIndices(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetInsurance(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetInsurance(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetLeaderboard(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetLeaderboard(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetLeaderboardName(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetLeaderboardName(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Leaderboard{})) {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetLiquidation(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetLiquidation(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetOrderBookL2(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetOrderBookL2(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetQuote(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetQuote(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetQuoteBucketed(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetQuoteBucketed(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetSchema(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetSchema(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetSchemaWebsocketHelp(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetSchemaWebsocketHelp(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetSettlement(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetSettlement(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetStats(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetStats(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetStatsHistory(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetStatsHistory(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetTrade(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetTrade(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPublicGetTradeBucketed(t *testing.T) {
    params := url.Values{}
    data, err := c.PublicGetTradeBucketed(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetApiKey(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetApiKey(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetChat(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetChat(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetChatChannels(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetChatChannels(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetChatConnected(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetChatConnected(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.ConnectedUsers{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetExecution(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetExecution(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetExecutionTradeHistory(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetExecutionTradeHistory(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetGlobalNotification(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetGlobalNotification(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetOrder(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetOrder(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetPosition(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetPosition(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUser(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUser(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.User{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserAffiliateStatus(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserAffiliateStatus(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Affiliate{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserCheckReferralCode(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserCheckReferralCode(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == 0.0 {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserCommission(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserCommission(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.UserCommissionsBySymbol{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserDepositAddress(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserDepositAddress(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == "" {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserExecutionHistory(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserExecutionHistory(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserMargin(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserMargin(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Margin{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserMinWithdrawalFee(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserMinWithdrawalFee(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserWallet(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserWallet(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Wallet{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserWalletHistory(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserWalletHistory(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateGetUserWalletSummary(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateGetUserWalletSummary(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostApiKey(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostApiKey(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.APIKey{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostApiKeyDisable(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostApiKeyDisable(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.APIKey{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostApiKeyEnable(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostApiKeyEnable(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.APIKey{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostChat(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostChat(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Chat{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostOrder(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostOrder(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Order{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostOrderBulk(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostOrderBulk(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostOrderCancelAllAfter(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostOrderCancelAllAfter(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostPositionIsolate(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostPositionIsolate(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Position{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostPositionLeverage(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostPositionLeverage(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Position{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostPositionRiskLimit(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostPositionRiskLimit(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Position{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostPositionTransferMargin(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostPositionTransferMargin(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Position{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostUserCancelWithdrawal(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostUserCancelWithdrawal(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Transaction{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostUserCommunicationToken(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostUserCommunicationToken(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostUserConfirmEmail(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostUserConfirmEmail(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.AccessToken{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostUserConfirmWithdrawal(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostUserConfirmWithdrawal(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Transaction{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostUserLogout(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostUserLogout(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostUserPreferences(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostUserPreferences(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.UserPreferences{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePostUserRequestWithdrawal(t *testing.T) {
    // TODO: Fill POST body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePostUserRequestWithdrawal(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Transaction{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePutOrder(t *testing.T) {
    // TODO: Fill PUT body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePutOrder(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if reflect.DeepEqual(data, (models.Order{})) {
        t.Fatal("Did not return data")
    }
}

func TestPrivatePutOrderBulk(t *testing.T) {
    // TODO: Fill PUT body
    params := url.Values{}
    body := bytes.Buffer{}
    data, err := c.PrivatePutOrderBulk(&params, body)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateDeleteApiKey(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateDeleteApiKey(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateDeleteOrder(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateDeleteOrder(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}

func TestPrivateDeleteOrderAll(t *testing.T) {
    params := url.Values{}
    data, err := c.PrivateDeleteOrderAll(&params)
    t.Logf("%+v", data)
    if err != nil {
        t.Fatal(err)
    }
    if data == nil {
        t.Fatal("Did not return data")
    }
}


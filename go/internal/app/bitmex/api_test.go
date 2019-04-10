package bitmex

import (
	"bytes"
	"encoding/json"
	"os"
	"testing"

	"github.com/ccxt/ccxt/go/pkg/ccxt"
)

var info ccxt.ExchangeInfo
var c BitmexExchange

func init() {
	f, err := os.Open("bitmex")
	if err != nil {
		panic(err)
	}
	defer f.Close()
	json.NewDecoder(f).Decode(&info)
}

func TestPublicGetAnnouncement(t *testing.T) {
	data, err := c.PublicGetAnnouncement()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetAnnouncementUrgent(t *testing.T) {
	data, err := c.PublicGetAnnouncementUrgent()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetFunding(t *testing.T) {
	data, err := c.PublicGetFunding()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetInstrument(t *testing.T) {
	data, err := c.PublicGetInstrument()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetInstrumentActive(t *testing.T) {
	data, err := c.PublicGetInstrumentActive()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetInstrumentActiveAndIndices(t *testing.T) {
	data, err := c.PublicGetInstrumentActiveAndIndices()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetInstrumentActiveIntervals(t *testing.T) {
	data, err := c.PublicGetInstrumentActiveIntervals()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetInstrumentCompositeIndex(t *testing.T) {
	data, err := c.PublicGetInstrumentCompositeIndex()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetInstrumentIndices(t *testing.T) {
	data, err := c.PublicGetInstrumentIndices()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetInsurance(t *testing.T) {
	data, err := c.PublicGetInsurance()
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
func TestPublicGetLiquidation(t *testing.T) {
	data, err := c.PublicGetLiquidation()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetOrderBook(t *testing.T) {
	data, err := c.PublicGetOrderBook()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetOrderBookL2(t *testing.T) {
	data, err := c.PublicGetOrderBookL2()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetQuote(t *testing.T) {
	data, err := c.PublicGetQuote()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetQuoteBucketed(t *testing.T) {
	data, err := c.PublicGetQuoteBucketed()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetSchema(t *testing.T) {
	data, err := c.PublicGetSchema()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetSchemaWebsocketHelp(t *testing.T) {
	data, err := c.PublicGetSchemaWebsocketHelp()
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
func TestPublicGetStats(t *testing.T) {
	data, err := c.PublicGetStats()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetStatsHistory(t *testing.T) {
	data, err := c.PublicGetStatsHistory()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetTrade(t *testing.T) {
	data, err := c.PublicGetTrade()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPublicGetTradeBucketed(t *testing.T) {
	data, err := c.PublicGetTradeBucketed()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}

func TestPrivateGetApiKey(t *testing.T) {
	data, err := c.PrivateGetApiKey()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetChat(t *testing.T) {
	data, err := c.PrivateGetChat()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetChatChannels(t *testing.T) {
	data, err := c.PrivateGetChatChannels()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetChatConnected(t *testing.T) {
	data, err := c.PrivateGetChatConnected()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetExecution(t *testing.T) {
	data, err := c.PrivateGetExecution()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetExecutionTradeHistory(t *testing.T) {
	data, err := c.PrivateGetExecutionTradeHistory()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetNotification(t *testing.T) {
	data, err := c.PrivateGetNotification()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetOrder(t *testing.T) {
	data, err := c.PrivateGetOrder()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetPosition(t *testing.T) {
	data, err := c.PrivateGetPosition()
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
func TestPrivateGetUserAffiliateStatus(t *testing.T) {
	data, err := c.PrivateGetUserAffiliateStatus()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetUserCheckReferralCode(t *testing.T) {
	data, err := c.PrivateGetUserCheckReferralCode()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetUserCommission(t *testing.T) {
	data, err := c.PrivateGetUserCommission()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetUserDepositAddress(t *testing.T) {
	data, err := c.PrivateGetUserDepositAddress()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetUserMargin(t *testing.T) {
	data, err := c.PrivateGetUserMargin()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetUserMinWithdrawalFee(t *testing.T) {
	data, err := c.PrivateGetUserMinWithdrawalFee()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetUserWallet(t *testing.T) {
	data, err := c.PrivateGetUserWallet()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetUserWalletHistory(t *testing.T) {
	data, err := c.PrivateGetUserWalletHistory()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateGetUserWalletSummary(t *testing.T) {
	data, err := c.PrivateGetUserWalletSummary()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}

func TestPrivatePostApiKey(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostApiKey(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostApiKeyDisable(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostApiKeyDisable(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostApiKeyEnable(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostApiKeyEnable(body)
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
func TestPrivatePostOrderBulk(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostOrderBulk(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostOrderCancelAllAfter(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostOrderCancelAllAfter(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostOrderClosePosition(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostOrderClosePosition(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostPositionIsolate(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostPositionIsolate(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostPositionLeverage(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostPositionLeverage(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostPositionRiskLimit(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostPositionRiskLimit(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostPositionTransferMargin(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostPositionTransferMargin(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostUserCancelWithdrawal(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserCancelWithdrawal(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostUserConfirmEmail(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserConfirmEmail(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostUserConfirmEnableTFA(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserConfirmEnableTFA(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostUserConfirmWithdrawal(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserConfirmWithdrawal(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostUserDisableTFA(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserDisableTFA(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostUserLogout(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserLogout(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostUserLogoutAll(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserLogoutAll(body)
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
func TestPrivatePostUserRequestEnableTFA(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserRequestEnableTFA(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePostUserRequestWithdrawal(t *testing.T) {
	// TODO: Fill POST body
	body := bytes.Buffer{}
	data, err := c.PrivatePostUserRequestWithdrawal(body)
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
func TestPrivatePutOrderBulk(t *testing.T) {
	// TODO: Fill PUT body
	body := bytes.Buffer{}
	data, err := c.PrivatePutOrderBulk(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivatePutUser(t *testing.T) {
	// TODO: Fill PUT body
	body := bytes.Buffer{}
	data, err := c.PrivatePutUser(body)
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateDeleteApiKey(t *testing.T) {
	data, err := c.PrivateDeleteApiKey()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateDeleteOrder(t *testing.T) {
	data, err := c.PrivateDeleteOrder()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}
func TestPrivateDeleteOrderAll(t *testing.T) {
	data, err := c.PrivateDeleteOrderAll()
	if err != nil {
		t.Fatal(err)
	}
	if data == nil {
		t.Fatal("Did not return data")
	}
}

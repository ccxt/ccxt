package ccxt

import (
	"fmt"
	"math/big"
	"reflect"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
	"github.com/mitchellh/mapstructure"
	"github.com/vmihailenco/msgpack/v5"

	"github.com/elliottech/lighter-go/client"
	"github.com/elliottech/lighter-go/client/http"
	"github.com/elliottech/lighter-go/types"
	// "github.com/elliottech/lighter-go/types/txtypes"
)

// =====================================  Hyperliquid Structs ===================================== //
// OrderMessage Struct
// {
// "builder": "0xxxxxx",
// "grouping": "na",
// "orders": [
//
//	   {
//		  "a": 159,
//		  "b": true,
//		  "p": "26.25",
//		  "r": false,
//		  "s": "1000",
//		  "t": {
//			 "limit": {
//				"tif": "Ioc"
//			 }
//		  }
//	   }
//
// ],
// "type": "order"
// }
type TimeInForce struct {
	TIF string `mapstructure:"tif" msgpack:"tif"`
}

type TriggerSpec struct {
	IsMarket  bool   `mapstructure:"isMarket" msgpack:"isMarket"`
	TriggerPx string `mapstructure:"triggerPx" msgpack:"triggerPx"`
	TPSL      string `mapstructure:"tpsl" msgpack:"tpsl"`
}

type OrderKind struct {
	Limit   *TimeInForce `mapstructure:"limit" msgpack:"limit,omitempty"`
	Trigger *TriggerSpec `mapstructure:"trigger" msgpack:"trigger,omitempty"`
}

type OrderHyperliquid struct {
	A int       `mapstructure:"a" msgpack:"a"`
	B bool      `mapstructure:"b" msgpack:"b"`
	P string    `mapstructure:"p" msgpack:"p"`
	S string    `mapstructure:"s" msgpack:"s"`
	R bool      `mapstructure:"r" msgpack:"r"`
	T OrderKind `mapstructure:"t" msgpack:"t"`
	C string    `mapstructure:"c,omitempty" msgpack:"c,omitempty"` // optional client order id
}

type OrderMessage struct {
	Type     string                 `mapstructure:"type" msgpack:"type"`
	Orders   []OrderHyperliquid     `mapstructure:"orders" msgpack:"orders"`
	Grouping string                 `mapstructure:"grouping" msgpack:"grouping"`
	Builder  map[string]interface{} `mapstructure:"builder" msgpack:"builder,omitempty"`
}

// cancel
// {"type":"cancel","cancels":[{"a":10000,"o":9078231563}]}
type Cancel struct {
	A int `mapstructure:"a" msgpack:"a"`
	O int `mapstructure:"o" msgpack:"o"`
}
type CancelMessage struct {
	Type    string   `mapstructure:"type" msgpack:"type"`
	Cancels []Cancel `mapstructure:"cancels" msgpack:"cancels"`
}

// Transfer
// {"hyperliquidChain":"Mainnet","signatureChainId":"0x66eee","type":"usdClassTransfer","amount":"100000","toPerp":false,"nonce":1737458035944}
type TransferMessage struct {
	HyperliquidChain string `mapstructure:"hyperliquidChain" msgpack:"hyperliquidChain"`
	SignatureChainID string `mapstructure:"signatureChainId" msgpack:"signatureChainId"`
	Type             string `mapstructure:"type" msgpack:"type"`
	Amount           string `mapstructure:"amount" msgpack:"amount"`
	ToPerp           bool   `mapstructure:"toPerp" msgpack:"toPerp"`
	Nonce            int64  `mapstructure:"nonce" msgpack:"nonce"`
}
type SubAccountTransferMessage struct {
	Type           string `mapstructure:"type" msgpack:"type"`
	SubAccountUser string `mapstructure:"subAccountUser" msgpack:"subAccountUser"`
	IsDeposit      bool   `mapstructure:"isDeposit" msgpack:"isDeposit"`
	Usd            int    `mapstructure:"usd" msgpack:"usd"`
}

// withdraw
// {"hyperliquidChain":"Mainnet","signatureChainId":"0x66eee","destination":"0xc950889d14a3717f541ec246bc253d7a9e98c78f","amount":"100000","time":1737458231937,"type":"withdraw3"}
type WithdrawMessage struct {
	HyperliquidChain string `mapstructure:"hyperliquidChain" msgpack:"hyperliquidChain"`
	SignatureChainID string `mapstructure:"signatureChainId" msgpack:"signatureChainId"`
	Destination      string `mapstructure:"destination" msgpack:"destination"`
	Amount           string `mapstructure:"amount" msgpack:"amount"`
	Time             int64  `mapstructure:"time" msgpack:"time"`
	Type             string `mapstructure:"type" msgpack:"type"`
}

// editOrder
// {"type":"batchModify","modifies":[{"oid":8553833906,"order":{"a":5,"b":true,"p":"151","s":"0.2","r":false,"t":{"limit":{"tif":"Gtc"}}}}]}
type Modify struct {
	OID   int              `mapstructure:"oid" msgpack:"oid"`
	Order OrderHyperliquid `mapstructure:"order" msgpack:"order"`
}

// EditOrderMessage represents the batch modification message.
type EditOrderMessage struct {
	Type     string   `mapstructure:"type" msgpack:"type"`
	Modifies []Modify `mapstructure:"modifies" msgpack:"modifies"`
}

// =====================================  Hyperliquid Structs ===================================== //

func ethEncodeStructuredData(primaryType string, domain apitypes.TypedDataDomain, messageTypes map[string][]apitypes.Type, messageData map[string]interface{}) (string, error) {
	// domain {"chainId":1337,"name":"Exchange","verifyingContract":"0x0000000000000000000000000000000000000000","version":"1"}
	// agent: {"Agent":[{"name":"source","type":"string"},{"name":"connectionId","type":"bytes32"}]}
	// phantom: {"source":"a","connectionId":{"0":81,"1":132,"2":60,"3":100,"4":202,"5":146,"6":114,"7":128,"8":99,"9":200,"10":106,"11":37,"12":220,"13":61,"14":150,"15":236,"16":173,"17":119,"18":83,"19":11,"20":205,"21":91,"22":222,"23":149,"24":201,"25":182,"26":71,"27":103,"28":74,"29":0,"30":223,"31":202}}

	var domainTypesList []apitypes.Type = []apitypes.Type{
		{Name: "name", Type: "string"},
		{Name: "version", Type: "string"},
		{Name: "chainId", Type: "uint256"},
		{Name: "verifyingContract", Type: "address"},
		// {Name: "salt", Type: "bytes32"},
	}

	messageTypes["EIP712Domain"] = domainTypesList

	typedData := apitypes.TypedData{
		Domain:      domain,
		Types:       messageTypes,
		PrimaryType: primaryType, // Set this to the primary type used in the message
		Message:     messageData,
	}

	encodedDomain, err := typedData.HashStruct("EIP712Domain", domain.Map())
	if err != nil {
		return "", err
	}

	encodedData, err := typedData.HashStruct(typedData.PrimaryType, typedData.Message)
	if err != nil {
		return "", err
	}

	domainHex := hexutil.Encode(encodedDomain) // comes with 0x, remove
	domainHex = strings.TrimPrefix(domainHex, "0x")
	dataHex := hexutil.Encode(encodedData)
	dataHex = strings.TrimPrefix(dataHex, "0x")

	encodedHex := "1901" + domainHex + dataHex
	return encodedHex, nil
}

func (this *Exchange) EthEncodeStructuredData(domain2 interface{}, messageTypes2 interface{}, messageData2 interface{}) []uint8 {
	// domain {"chainId":1337,"name":"Exchange","verifyingContract":"0x0000000000000000000000000000000000000000","version":"1"}
	// agent: {"Agent":[{"name":"source","type":"string"},{"name":"connectionId","type":"bytes32"}]}
	// phantom: {"source":"a","connectionId":{"0":81,"1":132,"2":60,"3":100,"4":202,"5":146,"6":114,"7":128,"8":99,"9":200,"10":106,"11":37,"12":220,"13":61,"14":150,"15":236,"16":173,"17":119,"18":83,"19":11,"20":205,"21":91,"22":222,"23":149,"24":201,"25":182,"26":71,"27":103,"28":74,"29":0,"30":223,"31":202}}
	if this.Id != "hyperliquid" {
		return []uint8{}
	}
	domain := domain2.(map[string]interface{})
	messageTypes := messageTypes2.(map[string]interface{})
	messageData := messageData2.(map[string]interface{})

	val, ok := messageData["nonce"]
	if ok {
		// messageData["nonce"] = uint64(val.(int64))
		messageData["nonce"] = (*math.HexOrDecimal256)(big.NewInt(val.(int64)))
	}

	val, ok = messageData["time"]
	if ok {
		// messageData["time"] = uint64(val.(int64))
		messageData["time"] = (*math.HexOrDecimal256)(big.NewInt(val.(int64)))
	}

	domainTyped := apitypes.TypedDataDomain{
		Name:              this.SafeString(domain, "name", "").(string),
		Version:           this.SafeString(domain, "version", "").(string),
		ChainId:           (*math.HexOrDecimal256)(big.NewInt(this.SafeInteger(domain, "chainId").(int64))),
		VerifyingContract: this.SafeString(domain, "verifyingContract", "").(string),
	}

	messageTypesTyped := map[string][]apitypes.Type{}

	primaryType := "" // check this what is the primary type
	for key, value := range messageTypes {
		primaryType = key
		types := value.([]interface{})
		messageTypesTyped[key] = make([]apitypes.Type, len(types))
		for i, type_ := range types {
			typeMap := type_.(map[string]interface{})
			messageTypesTyped[key][i] = apitypes.Type{
				Name: typeMap["name"].(string),
				Type: typeMap["type"].(string),
			}
		}
	}

	hexData, err := ethEncodeStructuredData(primaryType, domainTyped, messageTypesTyped, messageData)
	if err != nil {
		// log.Fatalf("Error encoding data: %v", err)
		str, _ := fmt.Printf("Binary Data: %x\n", hexData)
		panic(str)
	}
	return this.Base16ToBinary(hexData)
}

func (this *Exchange) EthAbiEncode(types interface{}, args interface{}) interface{} {
	byteArray := []uint8{}
	return byteArray
}

func ConvertInt64ToBigInt(data interface{}) interface{} { // these functions change in place the object, no bueno
	switch v := data.(type) {
	case map[string]interface{}:
		for key, value := range v {
			v[key] = ConvertInt64ToBigInt(value)
		}
		return v
	case []interface{}:
		for i, item := range v {
			v[i] = ConvertInt64ToBigInt(item)
		}
		return v
	case int64:
		// return uint8(v)
		return int(v)
	default:
		return v // Leave other types unchanged
	}

}

// func ConvertInt64ToBigInt(data interface{}) interface{} {
// 	switch v := data.(type) {
// 	case map[string]interface{}:
// 		newMap := make(map[string]interface{}, len(v))
// 		for key, value := range v {
// 			newMap[key] = ConvertInt64ToBigInt(value)
// 		}
// 		return newMap
// 	case []interface{}:
// 		newSlice := make([]interface{}, len(v))
// 		for i, item := range v {
// 			newSlice[i] = ConvertInt64ToBigInt(item)
// 		}
// 		return newSlice
// 	case int64:
// 		return uint8(v)
// 	default:
// 		return v // Leave other types unchanged
// 	}
// }

func DeepExtend(objs ...interface{}) map[string]interface{} { //tmp duplicated implementation
	var outObj interface{}
	for _, x := range objs {
		if x == nil {
			continue
		}
		if reflect.TypeOf(x).Kind() == reflect.Map {
			if outObj == nil || reflect.TypeOf(outObj).Kind() != reflect.Map {
				outObj = make(map[string]interface{})
			}
			dictX := x.(map[string]interface{})
			for k := range dictX {
				arg1 := outObj.(map[string]interface{})[k]
				arg2 := dictX[k]
				if arg1 != nil && arg2 != nil && reflect.TypeOf(arg1).Kind() == reflect.Map && reflect.TypeOf(arg2).Kind() == reflect.Map {
					outObj.(map[string]interface{})[k] = DeepExtend(arg1, arg2)
				} else {
					if arg2 != nil {
						outObj.(map[string]interface{})[k] = arg2
					} else {
						outObj.(map[string]interface{})[k] = arg1
					}
				}
			}
		} else {
			outObj = x
		}
	}
	return outObj.(map[string]interface{})
}

func ConvertInt64ToInt(data interface{}) interface{} { // these functions change in place the object, no bueno
	switch v := data.(type) {
	case map[string]interface{}:
		for key, value := range v {
			v[key] = ConvertInt64ToInt(value)
		}
		return v
	case []interface{}:
		for i, item := range v {
			v[i] = ConvertInt64ToInt(item)
		}
		return v
	case int64:
		return int(v)
	default:
		return v // Leave other types unchanged
	}
}

// func ConvertInt64ToInt(data interface{}) interface{} { // "good"
// 	switch v := data.(type) {
// 	case map[string]interface{}:
// 		newMap := make(map[string]interface{}, len(v))
// 		for key, value := range v {
// 			newMap[key] = ConvertInt64ToInt(value)
// 		}
// 		return newMap
// 	case []interface{}:
// 		newSlice := make([]interface{}, len(v))
// 		for i, item := range v {
// 			newSlice[i] = ConvertInt64ToInt(item)
// 		}
// 		return newSlice
// 	case int64:
// 		return int(v)
// 	default:
// 		return v // Leave other types unchanged
// 	}
// }

func (this *Exchange) Packb(data interface{}) []uint8 {

	var dataObj interface{} = nil
	dataJson := this.Json(data)
	dataObj = this.ParseJson(dataJson)

	// if subDict, ok := data.(map[string]interface{}); ok {
	// 	dataObj = DeepExtend(subDict, map[string]interface{}{}) // create a new only to avoid changing the original
	// } else {
	// 	dataObj = data
	// }
	converted := ConvertInt64ToBigInt(dataObj)

	if this.Id != "hyperliquid" {
		p, err := msgpack.Marshal(converted)
		if err != nil {
			panic(err)
		}
		return p
	}

	typeA := this.SafeString(converted, "type", "").(string)

	switch typeA {
	case "order":
		var orderMsg OrderMessage

		err := mapstructure.Decode(converted, &orderMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(orderMsg)

		if err != nil {
			panic(err)
		}
		return packed
	case "cancel":
		var cancelMsg CancelMessage

		err := mapstructure.Decode(converted, &cancelMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(cancelMsg)

		if err != nil {
			panic(err)
		}
		return packed
	case "withdraw3":
		var withdrawMsg WithdrawMessage

		err := mapstructure.Decode(converted, &withdrawMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(withdrawMsg)
		if err != nil {
			panic(err)
		}
		return packed
	case "batchModify":
		var editMsg EditOrderMessage

		err := mapstructure.Decode(converted, &editMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(editMsg)
		if err != nil {
			panic(err)
		}
		return packed
	case "subAccountTransfer":
		var subAccountTransferMsg SubAccountTransferMessage

		err := mapstructure.Decode(converted, &subAccountTransferMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(subAccountTransferMsg)
		if err != nil {
			panic(err)
		}
		return packed
	}
	return nil
}

// it's necessary to load lighter library in python
// we create client with the given api credential in this function
func (this *Exchange) LoadLighterLibrary(path interface{}, chainId interface{}, privateKey interface{}, apiKeyIndex interface{}, accountIndex interface{}) interface{} {
	return this.loadLighterLibrary(path.(string), uint32(chainId.(int)), privateKey.(string), uint8(apiKeyIndex.(float64)), int64(accountIndex.(float64)))
}

func (this *Exchange) loadLighterLibrary(path string, chainId uint32, privateKey string, apiKeyIndex uint8, accountIndex int64) interface{} {
	url := this.ImplodeHostname(GetValue(GetValue(this.Urls, "api"), "public")).(string)

	httpClient := http.NewClient(url)

	txClient, err := client.CreateClient(httpClient, privateKey, chainId, apiKeyIndex, accountIndex)
	if err != nil {
		panic(err)
	}
	return txClient
}

func (this *Exchange) LighterSignCreateGroupedOrders(signer interface{}, grouping_type interface{}, orders interface{}, nonce interface{}, api_key_index interface{}, account_index interface{}) interface{} {
	return this.lighterSignCreateGroupedOrders(signer.(*client.TxClient), grouping_type.(int64), orders.([]interface{}), nonce.(int64), api_key_index.(int64), account_index.(int64))
}

func (this *Exchange) lighterSignCreateGroupedOrders(signer *client.TxClient, grouping_type int64, orders []interface{}, nonce int64, api_key_index int64, account_index int64) interface{} {
	return []any{nil, nil}
}

func (this *Exchange) LighterSignCreateOrder(signer interface{}, request interface{}) interface{} {
	return this.lighterSignCreateOrder(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignCreateOrder(signer *client.TxClient, request map[string]interface{}) interface{} {
	marketIndex := int16(request["market_index"].(int64))
	clientOrderIndex := int64(request["client_order_index"].(int))
	baseAmount := request["base_amount"].(int64)
	price := uint32(request["avg_execution_price"].(int64))
	isAsk := uint8(request["is_ask"].(int))
	orderType := uint8(request["order_type"].(int))
	timeInForce := uint8(request["time_in_force"].(int))
	reduceOnly := uint8(request["reduce_only"].(int))
	// triggerPrice := uint32(request["trigger_price"]).(int64))
	triggerPrice := uint32(0)
	orderExpiry := int64(request["order_expiry"].(int))
	nonce := request["nonce"].(int64)

	if orderExpiry == -1 {
		orderExpiry = time.Now().Add(time.Hour * 24 * 28).UnixMilli() // 28 days
	}

	tx := &types.CreateOrderTxReq{
		MarketIndex:      marketIndex,
		ClientOrderIndex: clientOrderIndex,
		BaseAmount:       baseAmount,
		Price:            price,
		IsAsk:            isAsk,
		Type:             orderType,
		TimeInForce:      timeInForce,
		ReduceOnly:       reduceOnly,
		TriggerPrice:     triggerPrice,
		OrderExpiry:      orderExpiry,
	}
	ops := &types.TransactOpts{
		Nonce: &nonce,
	}

	txInfo, err := signer.GetCreateOrderTransaction(tx, ops)
	if err != nil {
		panic(err)
	}

	txInfoStr, err := txInfo.GetTxInfo()
	if err != nil {
		panic(err)
	}

	res := make([]interface{}, 0)
	res = append(res, txInfo.GetTxType())
	res = append(res, txInfoStr)
	fmt.Println(txInfo.GetTxType(), txInfoStr, res, GetValue(res, 0), GetValue(res, 1))

	return res
}

func (this *Exchange) LighterSignCancelOrder(signer interface{}, request interface{}) interface{} {
	return this.lighterSignCancelOrder(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignCancelOrder(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return []any{nil, nil}
}

func (this *Exchange) LighterSignWithdraw(signer interface{}, request interface{}) interface{} {
	return this.lighterSignWithdraw(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignWithdraw(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return []any{nil, nil}
}

func (this *Exchange) LighterSignCreateSubAccount(signer interface{}, request interface{}) interface{} {
	return this.lighterSignCreateSubAccount(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignCreateSubAccount(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return []any{nil, nil}
}

func (this *Exchange) LighterSignCancelAllOrders(signer interface{}, request interface{}) interface{} {
	return this.lighterSignCancelAllOrders(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignCancelAllOrders(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return []any{nil, nil}
}

func (this *Exchange) LighterSignModifyOrder(signer interface{}, request interface{}) interface{} {
	return this.lighterSignModifyOrder(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignModifyOrder(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return []any{nil, nil}
}

func (this *Exchange) LighterSignTransfer(signer interface{}, request interface{}) interface{} {
	return this.lighterSignTransfer(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignTransfer(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return []any{nil, nil}
}

func (this *Exchange) LighterSignUpdateLeverage(signer interface{}, request interface{}) interface{} {
	return this.lighterSignUpdateLeverage(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignUpdateLeverage(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return []any{nil, nil}
}

func (this *Exchange) LighterCreateAuthToken(signer interface{}, request interface{}) interface{} {
	return this.lighterCreateAuthToken(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterCreateAuthToken(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return nil
}

func (this *Exchange) LighterSignUpdateMargin(signer interface{}, request interface{}) interface{} {
	return this.lighterSignUpdateMargin(signer.(*client.TxClient), request.(map[string]interface{}))
}

func (this *Exchange) lighterSignUpdateMargin(signer *client.TxClient, request map[string]interface{}) interface{} {
	// TODO
	return []any{nil, nil}
}

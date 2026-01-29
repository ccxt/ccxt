package ccxt

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"reflect"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
	"github.com/mitchellh/mapstructure"
	"github.com/vmihailenco/msgpack/v5"
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

// Vault transfer message

type VaultTransferMessage struct {
	Type         string `mapstructure:"type" msgpack:"type"`
	VaultAddress string `mapstructure:"vaultAddress" msgpack:"vaultAddress"`
	IsDeposit    bool   `mapstructure:"isDeposit" msgpack:"isDeposit"`
	Usd          int    `mapstructure:"usd" msgpack:"usd"`
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

// CreateSubAccount message

type CreateSubAccountMessage struct {
	Type string `mapstructure:"type" msgpack:"type"`
	Name string `mapstructure:"name" msgpack:"name"`
}

// UpdateLeverage message

type UpdateLeverageMessage struct {
	Type     string `mapstructure:"type" msgpack:"type"`
	Asset    int    `mapstructure:"asset" msgpack:"asset"`
	IsCross  bool   `mapstructure:"isCross" msgpack:"isCross"`
	Leverage int    `mapstructure:"leverage" msgpack:"leverage"`
}

// UpdateIsolatedMargin message

type UpdateIsolatedMarginMessage struct {
	Type  string `mapstructure:"type" msgpack:"type"`
	Asset int    `mapstructure:"asset" msgpack:"asset"`
	IsBuy bool   `mapstructure:"isBuy" msgpack:"isBuy"`
	Ntli  int    `mapstructure:"Ntli" msgpack:"Ntli"`
}

type ReserveRequestWeightMessage struct {
	Type   string `mapstructure:"type" msgpack:"type"`
	Weight int    `mapstructure:"weight" msgpack:"weight"`
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

	useDynamicStruct := true // Set to false for hardcoded struct-based approach
	if useDynamicStruct {
		return this.EthEncodeStructuredDataDynamically(domain2, messageTypes2, messageData2)
	}

	// Legacy struct-based approach

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

func (this *Exchange) EthEncodeStructuredDataDynamically(domain2 interface{}, messageTypes2 interface{}, messageData2 interface{}) []uint8 {
	domain := domain2.(map[string]interface{})
	messageTypes := messageTypes2.(map[string]interface{})
	messageData := messageData2.(map[string]interface{})

	td, err := BuildTypedDataFromJS("", domain, messageTypes, messageData)
	if err != nil {
		panic(fmt.Sprintf("Error building typed data: %v", err))
	}
	digest, err := this.EncodeTypedData(td)
	if err != nil {
		panic(fmt.Sprintf("Error computing digest: %v", err))
	}

	hexData := hexutil.Encode(digest[:])
	hexData = strings.TrimPrefix(hexData, "0x")
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
	case "createSubAccount":
		var createSubAccountMsg CreateSubAccountMessage

		err := mapstructure.Decode(converted, &createSubAccountMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(createSubAccountMsg)
		if err != nil {
			panic(err)
		}
		return packed
	case "updateLeverage":
		var leverageMsg UpdateLeverageMessage

		err := mapstructure.Decode(converted, &leverageMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(leverageMsg)
		if err != nil {
			panic(err)
		}
		return packed
	case "updateIsolatedMargin":
		var isolatedMarginMsg UpdateIsolatedMarginMessage

		err := mapstructure.Decode(converted, &isolatedMarginMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(isolatedMarginMsg)
		if err != nil {
			panic(err)
		}
		return packed
	case "vaultTransfer":
		var vaultTransferMsg VaultTransferMessage

		err := mapstructure.Decode(converted, &vaultTransferMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(vaultTransferMsg)
		if err != nil {
			panic(err)
		}
		return packed
	case "reserveRequestWeight":
		var reserveRequestWeightMsg ReserveRequestWeightMessage

		err := mapstructure.Decode(converted, &reserveRequestWeightMsg)
		if err != nil {
			panic(err)
		}

		packed, err := msgpack.Marshal(reserveRequestWeightMsg)
		if err != nil {
			panic(err)
		}
		return packed
	}
	return nil
}
func (this *Exchange) EthGetAddressFromPrivateKey(privateKey interface{}) string {
	// Convert interface{} to string
	privateKeyStr, ok := privateKey.(string)
	if !ok {
		panic("privateKey must be a string")
	}

	// Remove "0x" prefix if present
	cleanPrivateKey := strings.TrimPrefix(privateKeyStr, "0x")

	// Parse the hex string to bytes
	privateKeyBytes, err := hexutil.Decode("0x" + cleanPrivateKey)
	if err != nil {
		panic(fmt.Sprintf("failed to decode private key: %v", err))
	}

	// Convert bytes to ECDSA private key
	privKey, err := crypto.ToECDSA(privateKeyBytes)
	if err != nil {
		panic(fmt.Sprintf("failed to parse private key: %v", err))
	}

	// Get the uncompressed public key (remove the 0x04 prefix to get just the coordinates)
	publicKeyBytes := crypto.FromECDSAPub(&privKey.PublicKey)
	if publicKeyBytes == nil {
		panic("failed to get public key bytes")
	}

	// Remove the first byte (0x04 prefix) - we only want the 64 bytes (X + Y coordinates)
	publicKeyWithoutPrefix := publicKeyBytes[1:]

	// Hash the public key with Keccak256
	addressHash := crypto.Keccak256(publicKeyWithoutPrefix)

	// Take the last 20 bytes (40 hex chars) as the address
	addressBytes := addressHash[len(addressHash)-20:]

	// Convert to hex and add 0x prefix
	return "0x" + hexutil.Encode(addressBytes)[2:]
}

// ============================= EIP-712 Dynamic Helper Functions ============================= //

// BuildTypedDataFromJS creates an EIP-712 TypedData instance from generic JSON-like maps.
// The inputs mirror the MetaMask/ethers.js shape: domain, types, primaryType, and message.
// This avoids having to define Go structs for each payload.
func BuildTypedDataFromJS(primaryType string, domain map[string]interface{}, rawTypes map[string]interface{}, rawMessage map[string]interface{}) (apitypes.TypedData, error) {
	typedTypes, inferredPrimary, err := toTypedDataTypes(rawTypes, domain)
	if err != nil {
		return apitypes.TypedData{}, err
	}
	if primaryType == "" {
		primaryType = inferredPrimary
	}
	if primaryType == "" {
		return apitypes.TypedData{}, fmt.Errorf("primaryType is required")
	}

	domainTyped, err := toTypedDataDomain(domain)
	if err != nil {
		return apitypes.TypedData{}, err
	}

	normalizedMsg, err := normalizeTypedMessage(typedTypes, primaryType, rawMessage)
	if err != nil {
		return apitypes.TypedData{}, err
	}

	return apitypes.TypedData{
		Domain:      domainTyped,
		Types:       typedTypes,
		PrimaryType: primaryType,
		Message:     normalizedMsg,
	}, nil
}

// EncodeTypedData returns the EIP-712 digest "\x19\x01" + domainSeparator + hashStruct(message)
func (this *Exchange) EncodeTypedData(td apitypes.TypedData) ([]byte, error) {
	domainSeparator, err := td.HashStruct("EIP712Domain", td.Domain.Map())
	if err != nil {
		return []byte{}, err
	}
	typedDataHash, err := td.HashStruct(td.PrimaryType, td.Message)
	if err != nil {
		return []byte{}, err
	}
	prefix := []byte{0x19, 0x01}
	rawData := append(append(prefix, domainSeparator...), typedDataHash...)
	return rawData, nil
}

func toTypedDataTypes(rawTypes map[string]interface{}, domain map[string]interface{}) (map[string][]apitypes.Type, string, error) {
	typed := make(map[string][]apitypes.Type, len(rawTypes))
	inferred := ""
	// the first key in the map is the primary type, but the order is not guaranteed
	// so we need to check for the primary type explicitly
	if _, ok := rawTypes["OrderWithBuilderFee"]; ok {
		inferred = "OrderWithBuilderFee"
	} else if _, ok := rawTypes["Order"]; ok {
		inferred = "Order"
	} else {
		for typeName := range rawTypes {
			if inferred == "" {
				inferred = typeName
			}
		}
	}

	for typeName, fieldsAny := range rawTypes {
		fields, ok := fieldsAny.([]interface{})
		if !ok {
			return nil, "", fmt.Errorf("types[%s] must be array", typeName)
		}
		typedFields := make([]apitypes.Type, len(fields))
		for i, fAny := range fields {
			fMap, ok := fAny.(map[string]interface{})
			if !ok {
				return nil, "", fmt.Errorf("types[%s][%d] must be object", typeName, i)
			}
			nameVal, _ := fMap["name"].(string)
			typeVal, _ := fMap["type"].(string)
			typedFields[i] = apitypes.Type{Name: nameVal, Type: typeVal}
		}
		typed[typeName] = typedFields
	}

	// Add EIP712Domain type based on what's actually in the domain
	if _, exists := typed["EIP712Domain"]; !exists {
		domainFields := []apitypes.Type{}
		if _, ok := domain["name"]; ok {
			domainFields = append(domainFields, apitypes.Type{Name: "name", Type: "string"})
		}
		if _, ok := domain["version"]; ok {
			domainFields = append(domainFields, apitypes.Type{Name: "version", Type: "string"})
		}
		if _, ok := domain["chainId"]; ok {
			domainFields = append(domainFields, apitypes.Type{Name: "chainId", Type: "uint256"})
		}
		if _, ok := domain["verifyingContract"]; ok {
			domainFields = append(domainFields, apitypes.Type{Name: "verifyingContract", Type: "address"})
		}
		typed["EIP712Domain"] = domainFields
	}

	return typed, inferred, nil
}

func toTypedDataDomain(domain map[string]interface{}) (apitypes.TypedDataDomain, error) {
	var d apitypes.TypedDataDomain
	if domain == nil {
		return d, nil
	}
	if v, ok := domain["name"].(string); ok {
		d.Name = v
	}
	if v, ok := domain["version"].(string); ok {
		d.Version = v
	}
	if v, ok := domain["verifyingContract"].(string); ok {
		d.VerifyingContract = v
	}
	if v, ok := domain["chainId"]; ok {
		bi, err := toBigInt(v)
		if err != nil {
			return d, fmt.Errorf("chainId: %w", err)
		}
		d.ChainId = (*math.HexOrDecimal256)(bi)
	}
	return d, nil
}

func normalizeTypedMessage(types map[string][]apitypes.Type, primaryType string, value interface{}) (apitypes.TypedDataMessage, error) {
	structVal, err := normalizeStruct(types, primaryType, value)
	if err != nil {
		return nil, err
	}
	return structVal, nil
}

func normalizeStruct(types map[string][]apitypes.Type, typeName string, value interface{}) (apitypes.TypedDataMessage, error) {
	obj, ok := value.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("value for %s must be object", typeName)
	}
	fields, ok := types[typeName]
	if !ok {
		return nil, fmt.Errorf("type %s not found in types", typeName)
	}
	out := make(apitypes.TypedDataMessage)

	// Include all fields from type definition - ALL fields must be present
	for _, f := range fields {
		raw, exists := obj[f.Name]

		// If field doesn't exist or is nil, provide default zero value
		if !exists || raw == nil {
			defaultVal := getDefaultValueForType(f.Type)
			out[f.Name] = defaultVal
			continue
		}

		conv, err := normalizeValue(types, f.Type, raw)
		if err != nil {
			return nil, fmt.Errorf("field %s (type %s, value %v): %w", f.Name, f.Type, raw, err)
		}
		out[f.Name] = conv
	}
	return out, nil
}

func getDefaultValueForType(typeName string) interface{} {
	// Handle arrays
	if strings.HasSuffix(typeName, "[]") {
		return []interface{}{}
	}

	// Handle integers
	if strings.HasPrefix(typeName, "uint") || strings.HasPrefix(typeName, "int") {
		return big.NewInt(0)
	}

	// Handle address
	if typeName == "address" {
		return common.HexToAddress("0x0000000000000000000000000000000000000000")
	}

	// Handle bool
	if typeName == "bool" {
		return false
	}

	// Handle bytes
	if strings.HasPrefix(typeName, "bytes") {
		if typeName == "bytes" {
			return []byte{}
		}
		// Fixed size bytes (bytes32, etc)
		return []byte{}
	}

	// Handle string
	if typeName == "string" {
		return ""
	}

	// For custom types/structs, return empty map
	return make(map[string]interface{})
}

func normalizeValue(types map[string][]apitypes.Type, typeName string, value interface{}) (interface{}, error) {
	if strings.HasSuffix(typeName, "[]") {
		base := strings.TrimSuffix(typeName, "[]")

		// Handle empty arrays or nil
		if value == nil {
			if _, isStruct := types[base]; isStruct {
				return []apitypes.TypedDataMessage{}, nil
			}
			return []interface{}{}, nil
		}

		arr, ok := value.([]interface{})
		if !ok {
			return nil, fmt.Errorf("expected array for %s", typeName)
		}

		// Check if the base type is a struct
		if _, isStruct := types[base]; isStruct {
			// For array of structs, return as []apitypes.TypedDataMessage
			out := make([]apitypes.TypedDataMessage, len(arr))
			for i, v := range arr {
				structVal, err := normalizeStruct(types, base, v)
				if err != nil {
					return nil, fmt.Errorf("index %d: %w", i, err)
				}
				out[i] = structVal
			}
			return out, nil
		}

		// For array of primitives
		out := make([]interface{}, len(arr))
		for i, v := range arr {
			conv, err := normalizeValue(types, base, v)
			if err != nil {
				return nil, fmt.Errorf("index %d: %w", i, err)
			}
			out[i] = conv
		}
		return out, nil
	}

	if _, isStruct := types[typeName]; isStruct {
		return normalizeStruct(types, typeName, value)
	}

	switch {
	case strings.HasPrefix(typeName, "uint") || strings.HasPrefix(typeName, "int"):
		bi, err := toBigInt(value)
		if err != nil {
			return nil, err
		}
		// For smaller integer types (not 256-bit), validate they fit in range
		// and return the big.Int (the library will validate the range)
		return bi, nil
	case typeName == "address":
		if s, ok := value.(string); ok {
			addr := common.HexToAddress(s)
			return addr.Bytes(), nil
		}
		if addr, ok := value.(common.Address); ok {
			return addr.Bytes(), nil
		}
		return value, nil
	case strings.HasPrefix(typeName, "bytes") && typeName != "bytes":
		if s, ok := value.(string); ok {
			b, err := hex.DecodeString(strings.TrimPrefix(s, "0x"))
			if err != nil {
				return nil, fmt.Errorf("decode %s: %w", typeName, err)
			}
			return b, nil
		}
		// Handle byte slices that are already decoded
		if b, ok := value.([]byte); ok {
			return b, nil
		}
		return value, nil
	default:
		return value, nil
	}
}

func toBigInt(v interface{}) (*big.Int, error) {
	switch n := v.(type) {
	case nil:
		return nil, fmt.Errorf("nil int value")
	case *big.Int:
		return n, nil
	case json.Number:
		return parseBigIntString(n.String())
	case string:
		return parseBigIntString(n)
	case int:
		return big.NewInt(int64(n)), nil
	case int64:
		return big.NewInt(n), nil
	case uint64:
		return new(big.Int).SetUint64(n), nil
	case float64:
		return big.NewInt(int64(n)), nil
	default:
		return nil, fmt.Errorf("unsupported int type %T", v)
	}
}

func parseBigIntString(s string) (*big.Int, error) {
	radix := 10
	if strings.HasPrefix(s, "0x") || strings.HasPrefix(s, "0X") {
		radix = 16
		s = s[2:]
	}
	bi, ok := new(big.Int).SetString(s, radix)
	if !ok {
		return nil, fmt.Errorf("invalid integer string")
	}
	return bi, nil
}

package ccxt

import (
	"encoding/hex"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
	"github.com/vmihailenco/msgpack/v5"
)

func ethEncodeStructuredData(primaryType string, domain apitypes.TypedDataDomain, messageTypes map[string][]apitypes.Type, messageData map[string]interface{}) ([]byte, error) {
	// domain {"chainId":1337,"name":"Exchange","verifyingContract":"0x0000000000000000000000000000000000000000","version":"1"}
	// agent: {"Agent":[{"name":"source","type":"string"},{"name":"connectionId","type":"bytes32"}]}
	// phantom: {"source":"a","connectionId":{"0":81,"1":132,"2":60,"3":100,"4":202,"5":146,"6":114,"7":128,"8":99,"9":200,"10":106,"11":37,"12":220,"13":61,"14":150,"15":236,"16":173,"17":119,"18":83,"19":11,"20":205,"21":91,"22":222,"23":149,"24":201,"25":182,"26":71,"27":103,"28":74,"29":0,"30":223,"31":202}}
	typedData := apitypes.TypedData{
		Domain:      domain,
		Types:       messageTypes,
		PrimaryType: primaryType, // Set this to the primary type used in the message
		Message:     messageData,
	}

	// Encode the structured data
	encodedData, err := typedData.HashStruct(typedData.PrimaryType, typedData.Message)
	if err != nil {
		return nil, err
	}

	// // Convert to hex
	hexData := hex.EncodeToString(encodedData)

	// // Slice the last 132 characters
	// if len(hexData) < 132 {
	// 	return nil, fmt.Errorf("encoded data is shorter than 132 characters")
	// }
	// slicedHex := hexData[len(hexData)-132:]

	// Convert hex to binary
	binaryData, err := hex.DecodeString(hexData)
	if err != nil {
		return nil, err
	}

	return binaryData, nil
}

func (this *Exchange) EthEncodeStructuredData(domain2 interface{}, messageTypes2 interface{}, messageData2 interface{}) []uint8 {
	// domain {"chainId":1337,"name":"Exchange","verifyingContract":"0x0000000000000000000000000000000000000000","version":"1"}
	// agent: {"Agent":[{"name":"source","type":"string"},{"name":"connectionId","type":"bytes32"}]}
	// phantom: {"source":"a","connectionId":{"0":81,"1":132,"2":60,"3":100,"4":202,"5":146,"6":114,"7":128,"8":99,"9":200,"10":106,"11":37,"12":220,"13":61,"14":150,"15":236,"16":173,"17":119,"18":83,"19":11,"20":205,"21":91,"22":222,"23":149,"24":201,"25":182,"26":71,"27":103,"28":74,"29":0,"30":223,"31":202}}
	domain := domain2.(map[string]interface{})
	messageTypes := messageTypes2.(map[string]interface{})
	// messageTypesKeys := base.Keys(messageTypes)
	messageData := messageData2.(map[string]interface{})

	domainTyped := apitypes.TypedDataDomain{
		Name:              this.SafeString(domain, "name").(string),
		Version:           this.SafeString(domain, "version").(string),
		ChainId:           (*math.HexOrDecimal256)(big.NewInt(this.SafeInteger(domain, "chainId").(int64))),
		VerifyingContract: this.SafeString(domain, "verifyingContract").(string),
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

	binaryData, err := ethEncodeStructuredData(primaryType, domainTyped, messageTypesTyped, messageData)
	if err != nil {
		// log.Fatalf("Error encoding data: %v", err)
		str, _ := fmt.Printf("Binary Data: %x\n", binaryData)
		panic(str)
	}
	return binaryData
}

func (this *Exchange) Packb(data2 interface{}) []uint8 {
	data := data2.(map[string]interface{})
	packed, err := msgpack.Marshal(data)
	if err != nil {
		panic(err)
	}
	return packed
}

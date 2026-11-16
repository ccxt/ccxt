package ccxt

import (
	"bytes"
	csha "crypto/sha256"
	"encoding/hex"
	"strings"
	"testing"
)

// Expected bytes are what vmihailenco/msgpack v5.4.1 emits through Packb today.
var packbCases = []struct{ name, id, json, hex string }{
	{"nil", "polymarket", "null", "c0"},
	{"true", "polymarket", "true", "c3"},
	{"false", "polymarket", "false", "c2"},
	{"int 0", "polymarket", "0", "00"},
	{"int 1", "polymarket", "1", "01"},
	{"int 127", "polymarket", "127", "7f"},
	{"int 128", "polymarket", "128", "cc80"},
	{"int 255", "polymarket", "255", "ccff"},
	{"int 256", "polymarket", "256", "cd0100"},
	{"int 65535", "polymarket", "65535", "cdffff"},
	{"int 65536", "polymarket", "65536", "ce00010000"},
	{"int 4294967295", "polymarket", "4294967295", "ceffffffff"},
	{"int 4294967296", "polymarket", "4294967296", "cf0000000100000000"},
	{"int 1700000000000", "polymarket", "1700000000000", "cf0000018bcfe56800"},
	{"int 9007199254740991", "polymarket", "9007199254740991", "cf001fffffffffffff"},
	{"int -1", "polymarket", "-1", "ff"},
	{"int -32", "polymarket", "-32", "e0"},
	{"int -33", "polymarket", "-33", "d0df"},
	{"int -128", "polymarket", "-128", "d080"},
	{"int -129", "polymarket", "-129", "d1ff7f"},
	{"int -32768", "polymarket", "-32768", "d18000"},
	{"int -32769", "polymarket", "-32769", "d2ffff7fff"},
	{"int -2147483648", "polymarket", "-2147483648", "d280000000"},
	{"int -2147483649", "polymarket", "-2147483649", "d3ffffffff7fffffff"},
	{"int -1700000000000", "polymarket", "-1700000000000", "d3fffffe74301a9800"},
	{"float 1.5", "polymarket", "1.5", "cb3ff8000000000000"},
	{"float 0.1", "polymarket", "0.1", "cb3fb999999999999a"},
	{"float -2.25", "polymarket", "-2.25", "cbc002000000000000"},
	{"str len 0", "polymarket", "\"\"", "a0"},
	{"str len 1", "polymarket", "\"a\"", "a161"},
	{"str len 31", "polymarket", "\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"", "bf61616161616161616161616161616161616161616161616161616161616161"},
	{"str len 32", "polymarket", "\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"", "d9206161616161616161616161616161616161616161616161616161616161616161"},
	{"str len 255", "polymarket", "\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"", "d9ff616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161"},
	{"str len 256", "polymarket", "\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"", "da010061616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161"},
	{"str utf8", "polymarket", "\"héllo €𝄞\"", "ae68c3a96c6c6f20e282acf09d849e"},
	{"array len 0", "polymarket", "[]", "90"},
	{"array len 15", "polymarket", "[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]", "9f000102030405060708090a0b0c0d0e"},
	{"array len 16", "polymarket", "[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]", "dc0010000102030405060708090a0b0c0d0e0f"},
	{"map len 0", "polymarket", "{}", "80"},
	{"array mixed", "polymarket", "[\"op\",1,\"0xabc\",[1700000000000,\"x\"],null,false]", "96a26f7001a5307861626392cf0000018bcfe56800a178c0c2"},
	{"int 9223372036854775807", "polymarket", "9223372036854775807", "cf7fffffffffffffff"},
	{"int -9223372036854775808", "polymarket", "-9223372036854775808", "d38000000000000000"},
	{"int 2^63 becomes string", "polymarket", "9223372036854775808", "b339323233333732303336383534373735383038"},
	{"float 1e+21", "polymarket", "1e+21", "cb444b1ae4d6e2ef50"},
	{"map len 1", "polymarket", "{\"k\":-200}", "81a16bd1ff38"},
	{"nested single-key maps", "polymarket", "{\"a\":[1,{\"c\":[true,\"x\",{}]},null]}", "81a161930181a16393c3a17880c0"},
	{"polymarket createOrders", "polymarket", "[\"createOrders\",[[12,true,\"0.55\",\"100\",\"GTC\",false,false,\"0xabc\"],[13,false,\"0.4\",\"5\",\"IOC\",true]]]", "92ac6372656174654f726465727392980cc3a4302e3535a3313030a3475443c2c2a53078616263960dc2a3302e34a135a3494f43c3"},
	{"polymarket cancelOrders", "polymarket", "[\"cancelOrders\",[1700000000123,4294967296]]", "92ac63616e63656c4f726465727392cf0000018bcfe5687bcf0000000100000000"},
	{"polymarket autoCancel", "polymarket", "[\"autoCancel\",[1700000060000]]", "92aa6175746f43616e63656c91cf0000018bcfe65260"},
	{"polymarket cancelAll empty", "polymarket", "[\"cancelAll\",[]]", "92a963616e63656c416c6c90"},
	{"polymarket modifyOrders", "polymarket", "[\"modifyOrders\",[[\"0xdead\",\"0.51\",\"7\"]]]", "92ac6d6f646966794f72646572739193a6307864656164a4302e3531a137"},
	{"hyperliquid order", "hyperliquid", "{\"type\":\"order\",\"orders\":[{\"a\":4,\"b\":true,\"p\":\"1100.5\",\"s\":\"0.2\",\"r\":false,\"t\":{\"limit\":{\"tif\":\"Gtc\"}},\"c\":\"0x1234567890abcdef1234567890abcdef\"}],\"grouping\":\"na\",\"builder\":{\"b\":\"0x6530512a6c89c7cfcebc3ba7fcd9ada5f30827a6\",\"f\":10}}", "84a474797065a56f72646572a66f72646572739187a16104a162c3a170a6313130302e35a173a3302e32a172c2a17481a56c696d697481a3746966a3477463a163d92230783132333435363738393061626364656631323334353637383930616263646566a867726f7570696e67a26e61a76275696c64657282a162d92a307836353330353132613663383963376366636562633362613766636439616461356633303832376136a1660a"},
	{"hyperliquid trigger order", "hyperliquid", "{\"type\":\"order\",\"orders\":[{\"a\":10005,\"b\":false,\"p\":\"0\",\"s\":\"1\",\"r\":true,\"t\":{\"trigger\":{\"isMarket\":true,\"triggerPx\":\"1900\",\"tpsl\":\"sl\"}}}],\"grouping\":\"normalTpsl\"}", "83a474797065a56f72646572a66f72646572739186a161cd2715a162c2a170a130a173a131a172c3a17481a77472696767657283a869734d61726b6574c3a9747269676765725078a431393030a47470736ca2736ca867726f7570696e67aa6e6f726d616c5470736c"},
	{"hyperliquid cancel", "hyperliquid", "{\"type\":\"cancel\",\"cancels\":[{\"a\":0,\"o\":123456789012}]}", "82a474797065a663616e63656ca763616e63656c739182a16100a16fcf0000001cbe991a14"},
	{"hyperliquid cancelByCloid", "hyperliquid", "{\"type\":\"cancelByCloid\",\"cancels\":[{\"asset\":3,\"cloid\":\"0x1234567890abcdef1234567890abcdef\"}]}", "82a474797065ad63616e63656c4279436c6f6964a763616e63656c739182a5617373657403a5636c6f6964d92230783132333435363738393061626364656631323334353637383930616263646566"},
	{"hyperliquid batchModify", "hyperliquid", "{\"type\":\"batchModify\",\"modifies\":[{\"oid\":70000,\"order\":{\"a\":1,\"b\":true,\"p\":\"2000\",\"s\":\"0.01\",\"r\":false,\"t\":{\"limit\":{\"tif\":\"Alo\"}}}}]}", "82a474797065ab62617463684d6f64696679a86d6f6469666965739182a36f6964ce00011170a56f7264657286a16101a162c3a170a432303030a173a4302e3031a172c2a17481a56c696d697481a3746966a3416c6f"},
	{"hyperliquid updateLeverage", "hyperliquid", "{\"type\":\"updateLeverage\",\"asset\":1,\"isCross\":true,\"leverage\":20}", "84a474797065ae7570646174654c65766572616765a5617373657401a7697343726f7373c3a86c6576657261676514"},
	{"hyperliquid updateIsolatedMargin", "hyperliquid", "{\"type\":\"updateIsolatedMargin\",\"asset\":1,\"isBuy\":true,\"ntli\":-5000000}", "84a474797065b475706461746549736f6c617465644d617267696ea5617373657401a56973427579c3a44e746c69d2ffb3b4c0"},
	{"hyperliquid vaultTransfer", "hyperliquid", "{\"type\":\"vaultTransfer\",\"vaultAddress\":\"0xdfc24b077bc1425ad1dea75bcb6f8158e10df303\",\"isDeposit\":true,\"usd\":5000000}", "84a474797065ad7661756c745472616e73666572ac7661756c7441646472657373d92a307864666332346230373762633134323561643164656137356263623666383135386531306466333033a969734465706f736974c3a3757364ce004c4b40"},
	{"hyperliquid scheduleCancel", "hyperliquid", "{\"type\":\"scheduleCancel\",\"time\":1700000000000}", "82a474797065ae7363686564756c6543616e63656ca474696d65cf0000018bcfe56800"},
	{"hyperliquid twapOrder", "hyperliquid", "{\"type\":\"twapOrder\",\"twap\":{\"a\":0,\"b\":true,\"s\":\"1\",\"r\":false,\"m\":30,\"t\":false}}", "82a474797065a9747761704f72646572a47477617086a16100a162c3a173a131a172c2a16d1ea174c2"},
	{"hl order no c no builder", "hyperliquid", "{\"type\":\"order\",\"orders\":[{\"a\":4,\"b\":true,\"p\":\"1\",\"s\":\"2\",\"r\":false,\"t\":{\"limit\":{\"tif\":\"Ioc\"}}}],\"grouping\":\"na\"}", "83a474797065a56f72646572a66f72646572739186a16104a162c3a170a131a173a132a172c2a17481a56c696d697481a3746966a3496f63a867726f7570696e67a26e61"},
	{"hl order empty c", "hyperliquid", "{\"type\":\"order\",\"orders\":[{\"a\":4,\"b\":true,\"p\":\"1\",\"s\":\"2\",\"r\":false,\"t\":{\"limit\":{\"tif\":\"Ioc\"}},\"c\":\"\"}],\"grouping\":\"na\",\"builder\":null}", "83a474797065a56f72646572a66f72646572739186a16104a162c3a170a131a173a132a172c2a17481a56c696d697481a3746966a3496f63a867726f7570696e67a26e61"},
	{"hl order empty list", "hyperliquid", "{\"type\":\"order\",\"orders\":[],\"grouping\":\"na\"}", "83a474797065a56f72646572a66f726465727390a867726f7570696e67a26e61"},
	{"hl cancel fast", "hyperliquid", "{\"type\":\"cancel\",\"cancels\":[{\"a\":10000,\"o\":9078231563}],\"f\":true}", "83a474797065a663616e63656ca763616e63656c739182a161cd2710a16fcf000000021d1ad20ba166c3"},
	{"hl cancel f false kept", "hyperliquid", "{\"type\":\"cancel\",\"cancels\":[{\"a\":1,\"o\":2}],\"f\":false}", "83a474797065a663616e63656ca763616e63656c739182a16101a16f02a166c2"},
	{"hl cancelByCloid fast", "hyperliquid", "{\"type\":\"cancelByCloid\",\"cancels\":[{\"asset\":3,\"cloid\":\"0x01\"}],\"f\":true}", "83a474797065ad63616e63656c4279436c6f6964a763616e63656c739182a5617373657403a5636c6f6964a430783031a166c3"},
	{"hl withdraw3 int64 time", "hyperliquid", "{\"hyperliquidChain\":\"Mainnet\",\"signatureChainId\":\"0x66eee\",\"destination\":\"0xc950889d14a3717f541ec246bc253d7a9e98c78f\",\"amount\":\"100000\",\"time\":1737458231937,\"type\":\"withdraw3\"}", "86b068797065726c6971756964436861696ea74d61696e6e6574b07369676e6174757265436861696e4964a730783636656565ab64657374696e6174696f6ed92a307863393530383839643134613337313766353431656332343662633235336437613965393863373866a6616d6f756e74a6313030303030a474696d65d3000001948894aa81a474797065a9776974686472617733"},
	{"hl withdraw3 small time", "hyperliquid", "{\"type\":\"withdraw3\",\"time\":5,\"amount\":\"1\"}", "86b068797065726c6971756964436861696ea0b07369676e6174757265436861696e4964a0ab64657374696e6174696f6ea0a6616d6f756e74a131a474696d65d30000000000000005a474797065a9776974686472617733"},
	{"hl subAccountTransfer", "hyperliquid", "{\"type\":\"subAccountTransfer\",\"subAccountUser\":\"0xabc\",\"isDeposit\":false,\"usd\":-1}", "84a474797065b27375624163636f756e745472616e73666572ae7375624163636f756e7455736572a53078616263a969734465706f736974c2a3757364ff"},
	{"hl createSubAccount", "hyperliquid", "{\"type\":\"createSubAccount\",\"name\":\"x\"}", "82a474797065b06372656174655375624163636f756e74a46e616d65a178"},
	{"hl reserveRequestWeight", "hyperliquid", "{\"type\":\"reserveRequestWeight\",\"weight\":65536}", "82a474797065b47265736572766552657175657374576569676874a6776569676874ce00010000"},
	{"hl setReferrer", "hyperliquid", "{\"type\":\"setReferrer\",\"code\":\"ABC\"}", "82a474797065ab7365745265666572726572a4636f6465a3414243"},
	{"hl agentSetAbstraction", "hyperliquid", "{\"type\":\"agentSetAbstraction\",\"abstraction\":\"unifiedAccount\"}", "82a474797065b36167656e745365744162737472616374696f6eab6162737472616374696f6eae756e69666965644163636f756e74"},
	{"hl twapCancel", "hyperliquid", "{\"type\":\"twapCancel\",\"a\":3,\"t\":1234567}", "83a474797065aa7477617043616e63656ca16103a174ce0012d687"},
	{"hl createVault", "hyperliquid", "{\"type\":\"createVault\",\"name\":\"v\",\"description\":\"dddddddddddddddddddddddddddddddddddddddd\",\"initialUsd\":100000000,\"nonce\":1700000000000}", "85a474797065ab6372656174655661756c74a46e616d65a176ab6465736372697074696f6ed92864646464646464646464646464646464646464646464646464646464646464646464646464646464aa696e697469616c557364ce05f5e100a56e6f6e6365cf0000018bcfe56800"},
	{"hl subAccountSpotTransfer", "hyperliquid", "{\"type\":\"subAccountSpotTransfer\",\"subAccountUser\":\"0xabc\",\"isDeposit\":true,\"token\":\"USDC:0x6d\",\"amount\":\"1.5\"}", "85a474797065b67375624163636f756e7453706f745472616e73666572ae7375624163636f756e7455736572a53078616263a969734465706f736974c3a5746f6b656ea9555344433a30783664a6616d6f756e74a3312e35"},
	{"hl updateIsolatedMargin exact key", "hyperliquid", "{\"type\":\"updateIsolatedMargin\",\"asset\":1,\"isBuy\":true,\"Ntli\":-33}", "84a474797065b475706461746549736f6c617465644d617267696ea5617373657401a56973427579c3a44e746c69d0df"},
	{"hl unknown type", "hyperliquid", "{\"type\":\"nope\",\"x\":1}", ""},
}

var packbBigCases = []struct {
	name, kind string
	n, size    int
	sha        string
}{
	{"str len 65535", "s", 65535, 65538, "ae606c3d6aaca8b43b24feb4aae3e5ab4088edb6d99d254d366f00e08f287c3d"},
	{"str len 65536", "s", 65536, 65541, "5f97d047d40a13f57389f8c7817f5afd69fe1e7739a305850eb23c5adb54674a"},
	{"array len 65535", "a", 65535, 196224, "8c336eb0f76e5433623ce52adf0fa4704a7410cacd206d5442c835b7bd294f04"},
	{"array len 65536", "a", 65536, 196229, "659da62605120aecab3feb7ceb9f912947719200e22ea46c7705c99cb10cacfa"},
}

func packbWith(id string, v any) []byte {
	ex := newTestExchange()
	ex.Id = id
	return ex.Packb(v)
}

func TestPackbBytes(t *testing.T) {
	for _, c := range packbCases {
		got := hex.EncodeToString(packbWith(c.id, ParseJSON(c.json)))
		if got != c.hex {
			t.Errorf("%s: got %s want %s", c.name, got, c.hex)
		}
	}
	for _, c := range packbBigCases {
		var v any = strings.Repeat("a", c.n)
		if c.kind == "a" {
			a := make([]any, c.n)
			for i := range a {
				a[i] = i
			}
			v = a
		}
		got := packbWith("polymarket", v)
		sum := csha.Sum256(got)
		if len(got) != c.size || hex.EncodeToString(sum[:]) != c.sha {
			t.Errorf("%s: got %d bytes sha %x", c.name, len(got), sum)
		}
	}
}

// Go map iteration order is random, so multi-key maps are checked by header and entries.
func TestPackbMapEntries(t *testing.T) {
	for _, n := range []int{15, 16} {
		m := map[string]any{}
		for i := 0; i < n; i++ {
			m[string(rune('A'+i))] = i
		}
		got := packbWith("polymarket", m)
		head := []byte{0x8f}
		if n == 16 {
			head = []byte{0xde, 0x00, 0x10}
		}
		if !bytes.HasPrefix(got, head) || len(got) != len(head)+3*n {
			t.Fatalf("map %d: %x", n, got)
		}
		for i := 0; i < n; i++ {
			if !bytes.Contains(got, []byte{0xa1, byte('A' + i), byte(i)}) {
				t.Errorf("map %d: entry %d missing in %x", n, i, got)
			}
		}
	}
}

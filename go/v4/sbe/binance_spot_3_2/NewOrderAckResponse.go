// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type NewOrderAckResponse struct {
	OrderId       int64
	OrderListId   int64
	TransactTime  int64
	Symbol        []uint8
	ClientOrderId []uint8
}

func (n *NewOrderAckResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := n.RangeCheck(n.SbeSchemaVersion(), n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, n.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.OrderListId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (n *NewOrderAckResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !n.OrderIdInActingVersion(actingVersion) {
		n.OrderId = n.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderId); err != nil {
			return err
		}
	}
	if !n.OrderListIdInActingVersion(actingVersion) {
		n.OrderListId = n.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderListId); err != nil {
			return err
		}
	}
	if !n.TransactTimeInActingVersion(actingVersion) {
		n.TransactTime = n.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TransactTime); err != nil {
			return err
		}
	}
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}

	if n.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(n.Symbol) < int(SymbolLength) {
			n.Symbol = make([]uint8, SymbolLength)
		}
		n.Symbol = n.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, n.Symbol); err != nil {
			return err
		}
	}

	if n.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(n.ClientOrderId) < int(ClientOrderIdLength) {
			n.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		n.ClientOrderId = n.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, n.ClientOrderId); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := n.RangeCheck(actingVersion, n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (n *NewOrderAckResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.OrderIdInActingVersion(actingVersion) {
		if n.OrderId < n.OrderIdMinValue() || n.OrderId > n.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on n.OrderId (%v < %v > %v)", n.OrderIdMinValue(), n.OrderId, n.OrderIdMaxValue())
		}
	}
	if n.OrderListIdInActingVersion(actingVersion) {
		if n.OrderListId != n.OrderListIdNullValue() && (n.OrderListId < n.OrderListIdMinValue() || n.OrderListId > n.OrderListIdMaxValue()) {
			return fmt.Errorf("Range check failed on n.OrderListId (%v < %v > %v)", n.OrderListIdMinValue(), n.OrderListId, n.OrderListIdMaxValue())
		}
	}
	if n.TransactTimeInActingVersion(actingVersion) {
		if n.TransactTime < n.TransactTimeMinValue() || n.TransactTime > n.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on n.TransactTime (%v < %v > %v)", n.TransactTimeMinValue(), n.TransactTime, n.TransactTimeMaxValue())
		}
	}
	if !utf8.Valid(n.Symbol[:]) {
		return errors.New("n.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(n.ClientOrderId[:]) {
		return errors.New("n.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func NewOrderAckResponseInit(n *NewOrderAckResponse) {
	n.OrderListId = math.MinInt64
	return
}

func (*NewOrderAckResponse) SbeBlockLength() (blockLength uint16) {
	return 24
}

func (*NewOrderAckResponse) SbeTemplateId() (templateId uint16) {
	return 300
}

func (*NewOrderAckResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*NewOrderAckResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderAckResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*NewOrderAckResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*NewOrderAckResponse) OrderIdId() uint16 {
	return 1
}

func (*NewOrderAckResponse) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderAckResponse) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderAckResponse) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderAckResponse) OrderIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*NewOrderAckResponse) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderAckResponse) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderAckResponse) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderAckResponse) OrderListIdId() uint16 {
	return 2
}

func (*NewOrderAckResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderAckResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderAckResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderAckResponse) OrderListIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderAckResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderAckResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderAckResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderAckResponse) TransactTimeId() uint16 {
	return 3
}

func (*NewOrderAckResponse) TransactTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderAckResponse) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactTimeSinceVersion()
}

func (*NewOrderAckResponse) TransactTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderAckResponse) TransactTimeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*NewOrderAckResponse) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderAckResponse) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderAckResponse) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderAckResponse) SymbolMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*NewOrderAckResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderAckResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderAckResponse) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderAckResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderAckResponse) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderAckResponse) ClientOrderIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*NewOrderAckResponse) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderAckResponse) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderAckResponse) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderAckResponse) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderAckResponse) ClientOrderIdHeaderLength() uint64 {
	return 1
}

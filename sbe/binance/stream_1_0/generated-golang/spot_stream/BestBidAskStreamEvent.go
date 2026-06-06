// Generated SBE (Simple Binary Encoding) message codec

package spot_stream

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type BestBidAskStreamEvent struct {
	EventTime     int64
	BookUpdateId  int64
	PriceExponent int8
	QtyExponent   int8
	BidPrice      int64
	BidQty        int64
	AskPrice      int64
	AskQty        int64
	Symbol        []uint8
}

func (b *BestBidAskStreamEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := b.RangeCheck(b.SbeSchemaVersion(), b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, b.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.BookUpdateId); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, b.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, b.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.BidPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.BidQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.AskPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, b.AskQty); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(b.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, b.Symbol); err != nil {
		return err
	}
	return nil
}

func (b *BestBidAskStreamEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !b.EventTimeInActingVersion(actingVersion) {
		b.EventTime = b.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.EventTime); err != nil {
			return err
		}
	}
	if !b.BookUpdateIdInActingVersion(actingVersion) {
		b.BookUpdateId = b.BookUpdateIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.BookUpdateId); err != nil {
			return err
		}
	}
	if !b.PriceExponentInActingVersion(actingVersion) {
		b.PriceExponent = b.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &b.PriceExponent); err != nil {
			return err
		}
	}
	if !b.QtyExponentInActingVersion(actingVersion) {
		b.QtyExponent = b.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &b.QtyExponent); err != nil {
			return err
		}
	}
	if !b.BidPriceInActingVersion(actingVersion) {
		b.BidPrice = b.BidPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.BidPrice); err != nil {
			return err
		}
	}
	if !b.BidQtyInActingVersion(actingVersion) {
		b.BidQty = b.BidQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.BidQty); err != nil {
			return err
		}
	}
	if !b.AskPriceInActingVersion(actingVersion) {
		b.AskPrice = b.AskPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.AskPrice); err != nil {
			return err
		}
	}
	if !b.AskQtyInActingVersion(actingVersion) {
		b.AskQty = b.AskQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &b.AskQty); err != nil {
			return err
		}
	}
	if actingVersion > b.SbeSchemaVersion() && blockLength > b.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-b.SbeBlockLength()))
	}

	if b.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(b.Symbol) < int(SymbolLength) {
			b.Symbol = make([]uint8, SymbolLength)
		}
		b.Symbol = b.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, b.Symbol); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := b.RangeCheck(actingVersion, b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (b *BestBidAskStreamEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if b.EventTimeInActingVersion(actingVersion) {
		if b.EventTime < b.EventTimeMinValue() || b.EventTime > b.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on b.EventTime (%v < %v > %v)", b.EventTimeMinValue(), b.EventTime, b.EventTimeMaxValue())
		}
	}
	if b.BookUpdateIdInActingVersion(actingVersion) {
		if b.BookUpdateId < b.BookUpdateIdMinValue() || b.BookUpdateId > b.BookUpdateIdMaxValue() {
			return fmt.Errorf("Range check failed on b.BookUpdateId (%v < %v > %v)", b.BookUpdateIdMinValue(), b.BookUpdateId, b.BookUpdateIdMaxValue())
		}
	}
	if b.PriceExponentInActingVersion(actingVersion) {
		if b.PriceExponent < b.PriceExponentMinValue() || b.PriceExponent > b.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on b.PriceExponent (%v < %v > %v)", b.PriceExponentMinValue(), b.PriceExponent, b.PriceExponentMaxValue())
		}
	}
	if b.QtyExponentInActingVersion(actingVersion) {
		if b.QtyExponent < b.QtyExponentMinValue() || b.QtyExponent > b.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on b.QtyExponent (%v < %v > %v)", b.QtyExponentMinValue(), b.QtyExponent, b.QtyExponentMaxValue())
		}
	}
	if b.BidPriceInActingVersion(actingVersion) {
		if b.BidPrice < b.BidPriceMinValue() || b.BidPrice > b.BidPriceMaxValue() {
			return fmt.Errorf("Range check failed on b.BidPrice (%v < %v > %v)", b.BidPriceMinValue(), b.BidPrice, b.BidPriceMaxValue())
		}
	}
	if b.BidQtyInActingVersion(actingVersion) {
		if b.BidQty < b.BidQtyMinValue() || b.BidQty > b.BidQtyMaxValue() {
			return fmt.Errorf("Range check failed on b.BidQty (%v < %v > %v)", b.BidQtyMinValue(), b.BidQty, b.BidQtyMaxValue())
		}
	}
	if b.AskPriceInActingVersion(actingVersion) {
		if b.AskPrice < b.AskPriceMinValue() || b.AskPrice > b.AskPriceMaxValue() {
			return fmt.Errorf("Range check failed on b.AskPrice (%v < %v > %v)", b.AskPriceMinValue(), b.AskPrice, b.AskPriceMaxValue())
		}
	}
	if b.AskQtyInActingVersion(actingVersion) {
		if b.AskQty < b.AskQtyMinValue() || b.AskQty > b.AskQtyMaxValue() {
			return fmt.Errorf("Range check failed on b.AskQty (%v < %v > %v)", b.AskQtyMinValue(), b.AskQty, b.AskQtyMaxValue())
		}
	}
	if !utf8.Valid(b.Symbol[:]) {
		return errors.New("b.Symbol failed UTF-8 validation")
	}
	return nil
}

func BestBidAskStreamEventInit(b *BestBidAskStreamEvent) {
	return
}

func (*BestBidAskStreamEvent) SbeBlockLength() (blockLength uint16) {
	return 50
}

func (*BestBidAskStreamEvent) SbeTemplateId() (templateId uint16) {
	return 10001
}

func (*BestBidAskStreamEvent) SbeSchemaId() (schemaId uint16) {
	return 1
}

func (*BestBidAskStreamEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 0
}

func (*BestBidAskStreamEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BestBidAskStreamEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*BestBidAskStreamEvent) EventTimeId() uint16 {
	return 1
}

func (*BestBidAskStreamEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.EventTimeSinceVersion()
}

func (*BestBidAskStreamEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*BestBidAskStreamEvent) EventTimeMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BestBidAskStreamEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*BestBidAskStreamEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*BestBidAskStreamEvent) BookUpdateIdId() uint16 {
	return 2
}

func (*BestBidAskStreamEvent) BookUpdateIdSinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) BookUpdateIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BookUpdateIdSinceVersion()
}

func (*BestBidAskStreamEvent) BookUpdateIdDeprecated() uint16 {
	return 0
}

func (*BestBidAskStreamEvent) BookUpdateIdMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) BookUpdateIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BestBidAskStreamEvent) BookUpdateIdMaxValue() int64 {
	return math.MaxInt64
}

func (*BestBidAskStreamEvent) BookUpdateIdNullValue() int64 {
	return math.MinInt64
}

func (*BestBidAskStreamEvent) PriceExponentId() uint16 {
	return 3
}

func (*BestBidAskStreamEvent) PriceExponentSinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PriceExponentSinceVersion()
}

func (*BestBidAskStreamEvent) PriceExponentDeprecated() uint16 {
	return 0
}

func (*BestBidAskStreamEvent) PriceExponentMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BestBidAskStreamEvent) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BestBidAskStreamEvent) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*BestBidAskStreamEvent) QtyExponentId() uint16 {
	return 4
}

func (*BestBidAskStreamEvent) QtyExponentSinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.QtyExponentSinceVersion()
}

func (*BestBidAskStreamEvent) QtyExponentDeprecated() uint16 {
	return 0
}

func (*BestBidAskStreamEvent) QtyExponentMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BestBidAskStreamEvent) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BestBidAskStreamEvent) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*BestBidAskStreamEvent) BidPriceId() uint16 {
	return 5
}

func (*BestBidAskStreamEvent) BidPriceSinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) BidPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidPriceSinceVersion()
}

func (*BestBidAskStreamEvent) BidPriceDeprecated() uint16 {
	return 0
}

func (*BestBidAskStreamEvent) BidPriceMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) BidPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BestBidAskStreamEvent) BidPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*BestBidAskStreamEvent) BidPriceNullValue() int64 {
	return math.MinInt64
}

func (*BestBidAskStreamEvent) BidQtyId() uint16 {
	return 6
}

func (*BestBidAskStreamEvent) BidQtySinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) BidQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidQtySinceVersion()
}

func (*BestBidAskStreamEvent) BidQtyDeprecated() uint16 {
	return 0
}

func (*BestBidAskStreamEvent) BidQtyMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) BidQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BestBidAskStreamEvent) BidQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*BestBidAskStreamEvent) BidQtyNullValue() int64 {
	return math.MinInt64
}

func (*BestBidAskStreamEvent) AskPriceId() uint16 {
	return 7
}

func (*BestBidAskStreamEvent) AskPriceSinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) AskPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskPriceSinceVersion()
}

func (*BestBidAskStreamEvent) AskPriceDeprecated() uint16 {
	return 0
}

func (*BestBidAskStreamEvent) AskPriceMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) AskPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BestBidAskStreamEvent) AskPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*BestBidAskStreamEvent) AskPriceNullValue() int64 {
	return math.MinInt64
}

func (*BestBidAskStreamEvent) AskQtyId() uint16 {
	return 8
}

func (*BestBidAskStreamEvent) AskQtySinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) AskQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskQtySinceVersion()
}

func (*BestBidAskStreamEvent) AskQtyDeprecated() uint16 {
	return 0
}

func (*BestBidAskStreamEvent) AskQtyMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) AskQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BestBidAskStreamEvent) AskQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*BestBidAskStreamEvent) AskQtyNullValue() int64 {
	return math.MinInt64
}

func (*BestBidAskStreamEvent) SymbolMetaAttribute(meta int) string {
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

func (*BestBidAskStreamEvent) SymbolSinceVersion() uint16 {
	return 0
}

func (b *BestBidAskStreamEvent) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SymbolSinceVersion()
}

func (*BestBidAskStreamEvent) SymbolDeprecated() uint16 {
	return 0
}

func (BestBidAskStreamEvent) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (BestBidAskStreamEvent) SymbolHeaderLength() uint64 {
	return 1
}

// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type BookTickerSymbolResponse struct {
	PriceExponent int8
	QtyExponent   int8
	BidPrice      int64
	BidQty        int64
	AskPrice      int64
	AskQty        int64
	Symbol        []uint8
}

func (b *BookTickerSymbolResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := b.RangeCheck(b.SbeSchemaVersion(), b.SbeSchemaVersion()); err != nil {
			return err
		}
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

func (b *BookTickerSymbolResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

func (b *BookTickerSymbolResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
		if b.BidPrice != b.BidPriceNullValue() && (b.BidPrice < b.BidPriceMinValue() || b.BidPrice > b.BidPriceMaxValue()) {
			return fmt.Errorf("Range check failed on b.BidPrice (%v < %v > %v)", b.BidPriceMinValue(), b.BidPrice, b.BidPriceMaxValue())
		}
	}
	if b.BidQtyInActingVersion(actingVersion) {
		if b.BidQty < b.BidQtyMinValue() || b.BidQty > b.BidQtyMaxValue() {
			return fmt.Errorf("Range check failed on b.BidQty (%v < %v > %v)", b.BidQtyMinValue(), b.BidQty, b.BidQtyMaxValue())
		}
	}
	if b.AskPriceInActingVersion(actingVersion) {
		if b.AskPrice != b.AskPriceNullValue() && (b.AskPrice < b.AskPriceMinValue() || b.AskPrice > b.AskPriceMaxValue()) {
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

func BookTickerSymbolResponseInit(b *BookTickerSymbolResponse) {
	b.BidPrice = math.MinInt64
	b.AskPrice = math.MinInt64
	return
}

func (*BookTickerSymbolResponse) SbeBlockLength() (blockLength uint16) {
	return 34
}

func (*BookTickerSymbolResponse) SbeTemplateId() (templateId uint16) {
	return 211
}

func (*BookTickerSymbolResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*BookTickerSymbolResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*BookTickerSymbolResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BookTickerSymbolResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*BookTickerSymbolResponse) PriceExponentId() uint16 {
	return 1
}

func (*BookTickerSymbolResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (b *BookTickerSymbolResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PriceExponentSinceVersion()
}

func (*BookTickerSymbolResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*BookTickerSymbolResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*BookTickerSymbolResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BookTickerSymbolResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BookTickerSymbolResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*BookTickerSymbolResponse) QtyExponentId() uint16 {
	return 2
}

func (*BookTickerSymbolResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (b *BookTickerSymbolResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.QtyExponentSinceVersion()
}

func (*BookTickerSymbolResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*BookTickerSymbolResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*BookTickerSymbolResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BookTickerSymbolResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BookTickerSymbolResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*BookTickerSymbolResponse) BidPriceId() uint16 {
	return 3
}

func (*BookTickerSymbolResponse) BidPriceSinceVersion() uint16 {
	return 0
}

func (b *BookTickerSymbolResponse) BidPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidPriceSinceVersion()
}

func (*BookTickerSymbolResponse) BidPriceDeprecated() uint16 {
	return 0
}

func (*BookTickerSymbolResponse) BidPriceMetaAttribute(meta int) string {
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

func (*BookTickerSymbolResponse) BidPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BookTickerSymbolResponse) BidPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*BookTickerSymbolResponse) BidPriceNullValue() int64 {
	return math.MinInt64
}

func (*BookTickerSymbolResponse) BidQtyId() uint16 {
	return 4
}

func (*BookTickerSymbolResponse) BidQtySinceVersion() uint16 {
	return 0
}

func (b *BookTickerSymbolResponse) BidQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidQtySinceVersion()
}

func (*BookTickerSymbolResponse) BidQtyDeprecated() uint16 {
	return 0
}

func (*BookTickerSymbolResponse) BidQtyMetaAttribute(meta int) string {
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

func (*BookTickerSymbolResponse) BidQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BookTickerSymbolResponse) BidQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*BookTickerSymbolResponse) BidQtyNullValue() int64 {
	return math.MinInt64
}

func (*BookTickerSymbolResponse) AskPriceId() uint16 {
	return 5
}

func (*BookTickerSymbolResponse) AskPriceSinceVersion() uint16 {
	return 0
}

func (b *BookTickerSymbolResponse) AskPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskPriceSinceVersion()
}

func (*BookTickerSymbolResponse) AskPriceDeprecated() uint16 {
	return 0
}

func (*BookTickerSymbolResponse) AskPriceMetaAttribute(meta int) string {
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

func (*BookTickerSymbolResponse) AskPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BookTickerSymbolResponse) AskPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*BookTickerSymbolResponse) AskPriceNullValue() int64 {
	return math.MinInt64
}

func (*BookTickerSymbolResponse) AskQtyId() uint16 {
	return 6
}

func (*BookTickerSymbolResponse) AskQtySinceVersion() uint16 {
	return 0
}

func (b *BookTickerSymbolResponse) AskQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskQtySinceVersion()
}

func (*BookTickerSymbolResponse) AskQtyDeprecated() uint16 {
	return 0
}

func (*BookTickerSymbolResponse) AskQtyMetaAttribute(meta int) string {
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

func (*BookTickerSymbolResponse) AskQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BookTickerSymbolResponse) AskQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*BookTickerSymbolResponse) AskQtyNullValue() int64 {
	return math.MinInt64
}

func (*BookTickerSymbolResponse) SymbolMetaAttribute(meta int) string {
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

func (*BookTickerSymbolResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (b *BookTickerSymbolResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SymbolSinceVersion()
}

func (*BookTickerSymbolResponse) SymbolDeprecated() uint16 {
	return 0
}

func (BookTickerSymbolResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (BookTickerSymbolResponse) SymbolHeaderLength() uint64 {
	return 1
}

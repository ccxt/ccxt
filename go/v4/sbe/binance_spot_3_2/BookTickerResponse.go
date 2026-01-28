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

type BookTickerResponse struct {
	Tickers []BookTickerResponseTickers
}
type BookTickerResponseTickers struct {
	PriceExponent int8
	QtyExponent   int8
	BidPrice      int64
	BidQty        int64
	AskPrice      int64
	AskQty        int64
	Symbol        []uint8
}

func (b *BookTickerResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := b.RangeCheck(b.SbeSchemaVersion(), b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var TickersBlockLength uint16 = 34
	if err := _m.WriteUint16(_w, TickersBlockLength); err != nil {
		return err
	}
	var TickersNumInGroup uint32 = uint32(len(b.Tickers))
	if err := _m.WriteUint32(_w, TickersNumInGroup); err != nil {
		return err
	}
	for i := range b.Tickers {
		if err := b.Tickers[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (b *BookTickerResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > b.SbeSchemaVersion() && blockLength > b.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-b.SbeBlockLength()))
	}

	if b.TickersInActingVersion(actingVersion) {
		var TickersBlockLength uint16
		if err := _m.ReadUint16(_r, &TickersBlockLength); err != nil {
			return err
		}
		var TickersNumInGroup uint32
		if err := _m.ReadUint32(_r, &TickersNumInGroup); err != nil {
			return err
		}
		if cap(b.Tickers) < int(TickersNumInGroup) {
			b.Tickers = make([]BookTickerResponseTickers, TickersNumInGroup)
		}
		b.Tickers = b.Tickers[:TickersNumInGroup]
		for i := range b.Tickers {
			if err := b.Tickers[i].Decode(_m, _r, actingVersion, uint(TickersBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := b.RangeCheck(actingVersion, b.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (b *BookTickerResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range b.Tickers {
		if err := b.Tickers[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func BookTickerResponseInit(b *BookTickerResponse) {
	return
}

func (b *BookTickerResponseTickers) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (b *BookTickerResponseTickers) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	return nil
}

func (b *BookTickerResponseTickers) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func BookTickerResponseTickersInit(b *BookTickerResponseTickers) {
	b.BidPrice = math.MinInt64
	b.AskPrice = math.MinInt64
	return
}

func (*BookTickerResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*BookTickerResponse) SbeTemplateId() (templateId uint16) {
	return 212
}

func (*BookTickerResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*BookTickerResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*BookTickerResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*BookTickerResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*BookTickerResponseTickers) PriceExponentId() uint16 {
	return 1
}

func (*BookTickerResponseTickers) PriceExponentSinceVersion() uint16 {
	return 0
}

func (b *BookTickerResponseTickers) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.PriceExponentSinceVersion()
}

func (*BookTickerResponseTickers) PriceExponentDeprecated() uint16 {
	return 0
}

func (*BookTickerResponseTickers) PriceExponentMetaAttribute(meta int) string {
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

func (*BookTickerResponseTickers) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BookTickerResponseTickers) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BookTickerResponseTickers) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*BookTickerResponseTickers) QtyExponentId() uint16 {
	return 2
}

func (*BookTickerResponseTickers) QtyExponentSinceVersion() uint16 {
	return 0
}

func (b *BookTickerResponseTickers) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.QtyExponentSinceVersion()
}

func (*BookTickerResponseTickers) QtyExponentDeprecated() uint16 {
	return 0
}

func (*BookTickerResponseTickers) QtyExponentMetaAttribute(meta int) string {
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

func (*BookTickerResponseTickers) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*BookTickerResponseTickers) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*BookTickerResponseTickers) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*BookTickerResponseTickers) BidPriceId() uint16 {
	return 3
}

func (*BookTickerResponseTickers) BidPriceSinceVersion() uint16 {
	return 0
}

func (b *BookTickerResponseTickers) BidPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidPriceSinceVersion()
}

func (*BookTickerResponseTickers) BidPriceDeprecated() uint16 {
	return 0
}

func (*BookTickerResponseTickers) BidPriceMetaAttribute(meta int) string {
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

func (*BookTickerResponseTickers) BidPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BookTickerResponseTickers) BidPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*BookTickerResponseTickers) BidPriceNullValue() int64 {
	return math.MinInt64
}

func (*BookTickerResponseTickers) BidQtyId() uint16 {
	return 4
}

func (*BookTickerResponseTickers) BidQtySinceVersion() uint16 {
	return 0
}

func (b *BookTickerResponseTickers) BidQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.BidQtySinceVersion()
}

func (*BookTickerResponseTickers) BidQtyDeprecated() uint16 {
	return 0
}

func (*BookTickerResponseTickers) BidQtyMetaAttribute(meta int) string {
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

func (*BookTickerResponseTickers) BidQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BookTickerResponseTickers) BidQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*BookTickerResponseTickers) BidQtyNullValue() int64 {
	return math.MinInt64
}

func (*BookTickerResponseTickers) AskPriceId() uint16 {
	return 5
}

func (*BookTickerResponseTickers) AskPriceSinceVersion() uint16 {
	return 0
}

func (b *BookTickerResponseTickers) AskPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskPriceSinceVersion()
}

func (*BookTickerResponseTickers) AskPriceDeprecated() uint16 {
	return 0
}

func (*BookTickerResponseTickers) AskPriceMetaAttribute(meta int) string {
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

func (*BookTickerResponseTickers) AskPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BookTickerResponseTickers) AskPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*BookTickerResponseTickers) AskPriceNullValue() int64 {
	return math.MinInt64
}

func (*BookTickerResponseTickers) AskQtyId() uint16 {
	return 6
}

func (*BookTickerResponseTickers) AskQtySinceVersion() uint16 {
	return 0
}

func (b *BookTickerResponseTickers) AskQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.AskQtySinceVersion()
}

func (*BookTickerResponseTickers) AskQtyDeprecated() uint16 {
	return 0
}

func (*BookTickerResponseTickers) AskQtyMetaAttribute(meta int) string {
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

func (*BookTickerResponseTickers) AskQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*BookTickerResponseTickers) AskQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*BookTickerResponseTickers) AskQtyNullValue() int64 {
	return math.MinInt64
}

func (*BookTickerResponseTickers) SymbolMetaAttribute(meta int) string {
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

func (*BookTickerResponseTickers) SymbolSinceVersion() uint16 {
	return 0
}

func (b *BookTickerResponseTickers) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.SymbolSinceVersion()
}

func (*BookTickerResponseTickers) SymbolDeprecated() uint16 {
	return 0
}

func (BookTickerResponseTickers) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (BookTickerResponseTickers) SymbolHeaderLength() uint64 {
	return 1
}

func (*BookTickerResponse) TickersId() uint16 {
	return 100
}

func (*BookTickerResponse) TickersSinceVersion() uint16 {
	return 0
}

func (b *BookTickerResponse) TickersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.TickersSinceVersion()
}

func (*BookTickerResponse) TickersDeprecated() uint16 {
	return 0
}

func (*BookTickerResponseTickers) SbeBlockLength() (blockLength uint) {
	return 34
}

func (*BookTickerResponseTickers) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

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

type PriceTickerSymbolResponse struct {
	PriceExponent int8
	Price         int64
	Symbol        []uint8
}

func (p *PriceTickerSymbolResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := p.RangeCheck(p.SbeSchemaVersion(), p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, p.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.Price); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(p.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, p.Symbol); err != nil {
		return err
	}
	return nil
}

func (p *PriceTickerSymbolResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !p.PriceExponentInActingVersion(actingVersion) {
		p.PriceExponent = p.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &p.PriceExponent); err != nil {
			return err
		}
	}
	if !p.PriceInActingVersion(actingVersion) {
		p.Price = p.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.Price); err != nil {
			return err
		}
	}
	if actingVersion > p.SbeSchemaVersion() && blockLength > p.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-p.SbeBlockLength()))
	}

	if p.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(p.Symbol) < int(SymbolLength) {
			p.Symbol = make([]uint8, SymbolLength)
		}
		p.Symbol = p.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, p.Symbol); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := p.RangeCheck(actingVersion, p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (p *PriceTickerSymbolResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if p.PriceExponentInActingVersion(actingVersion) {
		if p.PriceExponent < p.PriceExponentMinValue() || p.PriceExponent > p.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on p.PriceExponent (%v < %v > %v)", p.PriceExponentMinValue(), p.PriceExponent, p.PriceExponentMaxValue())
		}
	}
	if p.PriceInActingVersion(actingVersion) {
		if p.Price != p.PriceNullValue() && (p.Price < p.PriceMinValue() || p.Price > p.PriceMaxValue()) {
			return fmt.Errorf("Range check failed on p.Price (%v < %v > %v)", p.PriceMinValue(), p.Price, p.PriceMaxValue())
		}
	}
	if !utf8.Valid(p.Symbol[:]) {
		return errors.New("p.Symbol failed UTF-8 validation")
	}
	return nil
}

func PriceTickerSymbolResponseInit(p *PriceTickerSymbolResponse) {
	p.Price = math.MinInt64
	return
}

func (*PriceTickerSymbolResponse) SbeBlockLength() (blockLength uint16) {
	return 9
}

func (*PriceTickerSymbolResponse) SbeTemplateId() (templateId uint16) {
	return 209
}

func (*PriceTickerSymbolResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*PriceTickerSymbolResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*PriceTickerSymbolResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*PriceTickerSymbolResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*PriceTickerSymbolResponse) PriceExponentId() uint16 {
	return 1
}

func (*PriceTickerSymbolResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (p *PriceTickerSymbolResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.PriceExponentSinceVersion()
}

func (*PriceTickerSymbolResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*PriceTickerSymbolResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*PriceTickerSymbolResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*PriceTickerSymbolResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*PriceTickerSymbolResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*PriceTickerSymbolResponse) PriceId() uint16 {
	return 2
}

func (*PriceTickerSymbolResponse) PriceSinceVersion() uint16 {
	return 0
}

func (p *PriceTickerSymbolResponse) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.PriceSinceVersion()
}

func (*PriceTickerSymbolResponse) PriceDeprecated() uint16 {
	return 0
}

func (*PriceTickerSymbolResponse) PriceMetaAttribute(meta int) string {
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

func (*PriceTickerSymbolResponse) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PriceTickerSymbolResponse) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*PriceTickerSymbolResponse) PriceNullValue() int64 {
	return math.MinInt64
}

func (*PriceTickerSymbolResponse) SymbolMetaAttribute(meta int) string {
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

func (*PriceTickerSymbolResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (p *PriceTickerSymbolResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.SymbolSinceVersion()
}

func (*PriceTickerSymbolResponse) SymbolDeprecated() uint16 {
	return 0
}

func (PriceTickerSymbolResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (PriceTickerSymbolResponse) SymbolHeaderLength() uint64 {
	return 1
}

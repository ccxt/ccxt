// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type PriceTickerResponse struct {
	Tickers []PriceTickerResponseTickers
}
type PriceTickerResponseTickers struct {
	PriceExponent int8
	Price         int64
	Symbol        []uint8
}

func (p *PriceTickerResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := p.RangeCheck(p.SbeSchemaVersion(), p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var TickersBlockLength uint16 = 9
	if err := _m.WriteUint16(_w, TickersBlockLength); err != nil {
		return err
	}
	var TickersNumInGroup uint32 = uint32(len(p.Tickers))
	if err := _m.WriteUint32(_w, TickersNumInGroup); err != nil {
		return err
	}
	for i := range p.Tickers {
		if err := p.Tickers[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (p *PriceTickerResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > p.SbeSchemaVersion() && blockLength > p.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-p.SbeBlockLength()))
	}

	if p.TickersInActingVersion(actingVersion) {
		var TickersBlockLength uint16
		if err := _m.ReadUint16(_r, &TickersBlockLength); err != nil {
			return err
		}
		var TickersNumInGroup uint32
		if err := _m.ReadUint32(_r, &TickersNumInGroup); err != nil {
			return err
		}
		if cap(p.Tickers) < int(TickersNumInGroup) {
			p.Tickers = make([]PriceTickerResponseTickers, TickersNumInGroup)
		}
		p.Tickers = p.Tickers[:TickersNumInGroup]
		for i := range p.Tickers {
			if err := p.Tickers[i].Decode(_m, _r, actingVersion, uint(TickersBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := p.RangeCheck(actingVersion, p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (p *PriceTickerResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range p.Tickers {
		if err := p.Tickers[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func PriceTickerResponseInit(p *PriceTickerResponse) {
	return
}

func (p *PriceTickerResponseTickers) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (p *PriceTickerResponseTickers) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	return nil
}

func (p *PriceTickerResponseTickers) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func PriceTickerResponseTickersInit(p *PriceTickerResponseTickers) {
	p.Price = math.MinInt64
	return
}

func (*PriceTickerResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*PriceTickerResponse) SbeTemplateId() (templateId uint16) {
	return 210
}

func (*PriceTickerResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*PriceTickerResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*PriceTickerResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*PriceTickerResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*PriceTickerResponseTickers) PriceExponentId() uint16 {
	return 1
}

func (*PriceTickerResponseTickers) PriceExponentSinceVersion() uint16 {
	return 0
}

func (p *PriceTickerResponseTickers) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.PriceExponentSinceVersion()
}

func (*PriceTickerResponseTickers) PriceExponentDeprecated() uint16 {
	return 0
}

func (*PriceTickerResponseTickers) PriceExponentMetaAttribute(meta int) string {
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

func (*PriceTickerResponseTickers) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*PriceTickerResponseTickers) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*PriceTickerResponseTickers) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*PriceTickerResponseTickers) PriceId() uint16 {
	return 2
}

func (*PriceTickerResponseTickers) PriceSinceVersion() uint16 {
	return 0
}

func (p *PriceTickerResponseTickers) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.PriceSinceVersion()
}

func (*PriceTickerResponseTickers) PriceDeprecated() uint16 {
	return 0
}

func (*PriceTickerResponseTickers) PriceMetaAttribute(meta int) string {
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

func (*PriceTickerResponseTickers) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PriceTickerResponseTickers) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*PriceTickerResponseTickers) PriceNullValue() int64 {
	return math.MinInt64
}

func (*PriceTickerResponseTickers) SymbolMetaAttribute(meta int) string {
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

func (*PriceTickerResponseTickers) SymbolSinceVersion() uint16 {
	return 0
}

func (p *PriceTickerResponseTickers) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.SymbolSinceVersion()
}

func (*PriceTickerResponseTickers) SymbolDeprecated() uint16 {
	return 0
}

func (PriceTickerResponseTickers) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (PriceTickerResponseTickers) SymbolHeaderLength() uint64 {
	return 1
}

func (*PriceTickerResponse) TickersId() uint16 {
	return 100
}

func (*PriceTickerResponse) TickersSinceVersion() uint16 {
	return 0
}

func (p *PriceTickerResponse) TickersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.TickersSinceVersion()
}

func (*PriceTickerResponse) TickersDeprecated() uint16 {
	return 0
}

func (*PriceTickerResponseTickers) SbeBlockLength() (blockLength uint) {
	return 9
}

func (*PriceTickerResponseTickers) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type PriceFilter struct {
	FilterType    FilterTypeEnum
	PriceExponent int8
	MinPrice      int64
	MaxPrice      int64
	TickSize      int64
}

func (p *PriceFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := p.RangeCheck(p.SbeSchemaVersion(), p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, p.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.MinPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.MaxPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.TickSize); err != nil {
		return err
	}
	return nil
}

func (p *PriceFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	p.FilterType = FilterType.PriceFilter
	if !p.PriceExponentInActingVersion(actingVersion) {
		p.PriceExponent = p.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &p.PriceExponent); err != nil {
			return err
		}
	}
	if !p.MinPriceInActingVersion(actingVersion) {
		p.MinPrice = p.MinPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.MinPrice); err != nil {
			return err
		}
	}
	if !p.MaxPriceInActingVersion(actingVersion) {
		p.MaxPrice = p.MaxPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.MaxPrice); err != nil {
			return err
		}
	}
	if !p.TickSizeInActingVersion(actingVersion) {
		p.TickSize = p.TickSizeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.TickSize); err != nil {
			return err
		}
	}
	if actingVersion > p.SbeSchemaVersion() && blockLength > p.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-p.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := p.RangeCheck(actingVersion, p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (p *PriceFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := p.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if p.PriceExponentInActingVersion(actingVersion) {
		if p.PriceExponent < p.PriceExponentMinValue() || p.PriceExponent > p.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on p.PriceExponent (%v < %v > %v)", p.PriceExponentMinValue(), p.PriceExponent, p.PriceExponentMaxValue())
		}
	}
	if p.MinPriceInActingVersion(actingVersion) {
		if p.MinPrice < p.MinPriceMinValue() || p.MinPrice > p.MinPriceMaxValue() {
			return fmt.Errorf("Range check failed on p.MinPrice (%v < %v > %v)", p.MinPriceMinValue(), p.MinPrice, p.MinPriceMaxValue())
		}
	}
	if p.MaxPriceInActingVersion(actingVersion) {
		if p.MaxPrice < p.MaxPriceMinValue() || p.MaxPrice > p.MaxPriceMaxValue() {
			return fmt.Errorf("Range check failed on p.MaxPrice (%v < %v > %v)", p.MaxPriceMinValue(), p.MaxPrice, p.MaxPriceMaxValue())
		}
	}
	if p.TickSizeInActingVersion(actingVersion) {
		if p.TickSize < p.TickSizeMinValue() || p.TickSize > p.TickSizeMaxValue() {
			return fmt.Errorf("Range check failed on p.TickSize (%v < %v > %v)", p.TickSizeMinValue(), p.TickSize, p.TickSizeMaxValue())
		}
	}
	return nil
}

func PriceFilterInit(p *PriceFilter) {
	p.FilterType = FilterType.PriceFilter
	return
}

func (*PriceFilter) SbeBlockLength() (blockLength uint16) {
	return 25
}

func (*PriceFilter) SbeTemplateId() (templateId uint16) {
	return 1
}

func (*PriceFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*PriceFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*PriceFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*PriceFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*PriceFilter) FilterTypeId() uint16 {
	return 1
}

func (*PriceFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (p *PriceFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.FilterTypeSinceVersion()
}

func (*PriceFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*PriceFilter) FilterTypeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "constant"
	}
	return ""
}

func (*PriceFilter) PriceExponentId() uint16 {
	return 2
}

func (*PriceFilter) PriceExponentSinceVersion() uint16 {
	return 0
}

func (p *PriceFilter) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.PriceExponentSinceVersion()
}

func (*PriceFilter) PriceExponentDeprecated() uint16 {
	return 0
}

func (*PriceFilter) PriceExponentMetaAttribute(meta int) string {
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

func (*PriceFilter) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*PriceFilter) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*PriceFilter) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*PriceFilter) MinPriceId() uint16 {
	return 3
}

func (*PriceFilter) MinPriceSinceVersion() uint16 {
	return 0
}

func (p *PriceFilter) MinPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.MinPriceSinceVersion()
}

func (*PriceFilter) MinPriceDeprecated() uint16 {
	return 0
}

func (*PriceFilter) MinPriceMetaAttribute(meta int) string {
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

func (*PriceFilter) MinPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PriceFilter) MinPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*PriceFilter) MinPriceNullValue() int64 {
	return math.MinInt64
}

func (*PriceFilter) MaxPriceId() uint16 {
	return 4
}

func (*PriceFilter) MaxPriceSinceVersion() uint16 {
	return 0
}

func (p *PriceFilter) MaxPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.MaxPriceSinceVersion()
}

func (*PriceFilter) MaxPriceDeprecated() uint16 {
	return 0
}

func (*PriceFilter) MaxPriceMetaAttribute(meta int) string {
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

func (*PriceFilter) MaxPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PriceFilter) MaxPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*PriceFilter) MaxPriceNullValue() int64 {
	return math.MinInt64
}

func (*PriceFilter) TickSizeId() uint16 {
	return 5
}

func (*PriceFilter) TickSizeSinceVersion() uint16 {
	return 0
}

func (p *PriceFilter) TickSizeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.TickSizeSinceVersion()
}

func (*PriceFilter) TickSizeDeprecated() uint16 {
	return 0
}

func (*PriceFilter) TickSizeMetaAttribute(meta int) string {
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

func (*PriceFilter) TickSizeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PriceFilter) TickSizeMaxValue() int64 {
	return math.MaxInt64
}

func (*PriceFilter) TickSizeNullValue() int64 {
	return math.MinInt64
}

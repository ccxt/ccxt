// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type PercentPriceFilter struct {
	FilterType         FilterTypeEnum
	MultiplierExponent int8
	MultiplierUp       int64
	MultiplierDown     int64
	AvgPriceMins       int32
}

func (p *PercentPriceFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := p.RangeCheck(p.SbeSchemaVersion(), p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, p.MultiplierExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.MultiplierUp); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.MultiplierDown); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, p.AvgPriceMins); err != nil {
		return err
	}
	return nil
}

func (p *PercentPriceFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	p.FilterType = FilterType.PercentPrice
	if !p.MultiplierExponentInActingVersion(actingVersion) {
		p.MultiplierExponent = p.MultiplierExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &p.MultiplierExponent); err != nil {
			return err
		}
	}
	if !p.MultiplierUpInActingVersion(actingVersion) {
		p.MultiplierUp = p.MultiplierUpNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.MultiplierUp); err != nil {
			return err
		}
	}
	if !p.MultiplierDownInActingVersion(actingVersion) {
		p.MultiplierDown = p.MultiplierDownNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.MultiplierDown); err != nil {
			return err
		}
	}
	if !p.AvgPriceMinsInActingVersion(actingVersion) {
		p.AvgPriceMins = p.AvgPriceMinsNullValue()
	} else {
		if err := _m.ReadInt32(_r, &p.AvgPriceMins); err != nil {
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

func (p *PercentPriceFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := p.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if p.MultiplierExponentInActingVersion(actingVersion) {
		if p.MultiplierExponent < p.MultiplierExponentMinValue() || p.MultiplierExponent > p.MultiplierExponentMaxValue() {
			return fmt.Errorf("Range check failed on p.MultiplierExponent (%v < %v > %v)", p.MultiplierExponentMinValue(), p.MultiplierExponent, p.MultiplierExponentMaxValue())
		}
	}
	if p.MultiplierUpInActingVersion(actingVersion) {
		if p.MultiplierUp < p.MultiplierUpMinValue() || p.MultiplierUp > p.MultiplierUpMaxValue() {
			return fmt.Errorf("Range check failed on p.MultiplierUp (%v < %v > %v)", p.MultiplierUpMinValue(), p.MultiplierUp, p.MultiplierUpMaxValue())
		}
	}
	if p.MultiplierDownInActingVersion(actingVersion) {
		if p.MultiplierDown < p.MultiplierDownMinValue() || p.MultiplierDown > p.MultiplierDownMaxValue() {
			return fmt.Errorf("Range check failed on p.MultiplierDown (%v < %v > %v)", p.MultiplierDownMinValue(), p.MultiplierDown, p.MultiplierDownMaxValue())
		}
	}
	if p.AvgPriceMinsInActingVersion(actingVersion) {
		if p.AvgPriceMins < p.AvgPriceMinsMinValue() || p.AvgPriceMins > p.AvgPriceMinsMaxValue() {
			return fmt.Errorf("Range check failed on p.AvgPriceMins (%v < %v > %v)", p.AvgPriceMinsMinValue(), p.AvgPriceMins, p.AvgPriceMinsMaxValue())
		}
	}
	return nil
}

func PercentPriceFilterInit(p *PercentPriceFilter) {
	p.FilterType = FilterType.PercentPrice
	return
}

func (*PercentPriceFilter) SbeBlockLength() (blockLength uint16) {
	return 21
}

func (*PercentPriceFilter) SbeTemplateId() (templateId uint16) {
	return 2
}

func (*PercentPriceFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*PercentPriceFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*PercentPriceFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*PercentPriceFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*PercentPriceFilter) FilterTypeId() uint16 {
	return 1
}

func (*PercentPriceFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.FilterTypeSinceVersion()
}

func (*PercentPriceFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*PercentPriceFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*PercentPriceFilter) MultiplierExponentId() uint16 {
	return 2
}

func (*PercentPriceFilter) MultiplierExponentSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceFilter) MultiplierExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.MultiplierExponentSinceVersion()
}

func (*PercentPriceFilter) MultiplierExponentDeprecated() uint16 {
	return 0
}

func (*PercentPriceFilter) MultiplierExponentMetaAttribute(meta int) string {
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

func (*PercentPriceFilter) MultiplierExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*PercentPriceFilter) MultiplierExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*PercentPriceFilter) MultiplierExponentNullValue() int8 {
	return math.MinInt8
}

func (*PercentPriceFilter) MultiplierUpId() uint16 {
	return 3
}

func (*PercentPriceFilter) MultiplierUpSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceFilter) MultiplierUpInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.MultiplierUpSinceVersion()
}

func (*PercentPriceFilter) MultiplierUpDeprecated() uint16 {
	return 0
}

func (*PercentPriceFilter) MultiplierUpMetaAttribute(meta int) string {
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

func (*PercentPriceFilter) MultiplierUpMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PercentPriceFilter) MultiplierUpMaxValue() int64 {
	return math.MaxInt64
}

func (*PercentPriceFilter) MultiplierUpNullValue() int64 {
	return math.MinInt64
}

func (*PercentPriceFilter) MultiplierDownId() uint16 {
	return 4
}

func (*PercentPriceFilter) MultiplierDownSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceFilter) MultiplierDownInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.MultiplierDownSinceVersion()
}

func (*PercentPriceFilter) MultiplierDownDeprecated() uint16 {
	return 0
}

func (*PercentPriceFilter) MultiplierDownMetaAttribute(meta int) string {
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

func (*PercentPriceFilter) MultiplierDownMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PercentPriceFilter) MultiplierDownMaxValue() int64 {
	return math.MaxInt64
}

func (*PercentPriceFilter) MultiplierDownNullValue() int64 {
	return math.MinInt64
}

func (*PercentPriceFilter) AvgPriceMinsId() uint16 {
	return 5
}

func (*PercentPriceFilter) AvgPriceMinsSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceFilter) AvgPriceMinsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.AvgPriceMinsSinceVersion()
}

func (*PercentPriceFilter) AvgPriceMinsDeprecated() uint16 {
	return 0
}

func (*PercentPriceFilter) AvgPriceMinsMetaAttribute(meta int) string {
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

func (*PercentPriceFilter) AvgPriceMinsMinValue() int32 {
	return math.MinInt32 + 1
}

func (*PercentPriceFilter) AvgPriceMinsMaxValue() int32 {
	return math.MaxInt32
}

func (*PercentPriceFilter) AvgPriceMinsNullValue() int32 {
	return math.MinInt32
}

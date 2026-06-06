// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type PercentPriceBySideFilter struct {
	FilterType         FilterTypeEnum
	MultiplierExponent int8
	BidMultiplierUp    int64
	BidMultiplierDown  int64
	AskMultiplierUp    int64
	AskMultiplierDown  int64
	AvgPriceMins       int32
}

func (p *PercentPriceBySideFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := p.RangeCheck(p.SbeSchemaVersion(), p.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, p.MultiplierExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.BidMultiplierUp); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.BidMultiplierDown); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.AskMultiplierUp); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, p.AskMultiplierDown); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, p.AvgPriceMins); err != nil {
		return err
	}
	return nil
}

func (p *PercentPriceBySideFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	p.FilterType = FilterType.PercentPriceBySide
	if !p.MultiplierExponentInActingVersion(actingVersion) {
		p.MultiplierExponent = p.MultiplierExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &p.MultiplierExponent); err != nil {
			return err
		}
	}
	if !p.BidMultiplierUpInActingVersion(actingVersion) {
		p.BidMultiplierUp = p.BidMultiplierUpNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.BidMultiplierUp); err != nil {
			return err
		}
	}
	if !p.BidMultiplierDownInActingVersion(actingVersion) {
		p.BidMultiplierDown = p.BidMultiplierDownNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.BidMultiplierDown); err != nil {
			return err
		}
	}
	if !p.AskMultiplierUpInActingVersion(actingVersion) {
		p.AskMultiplierUp = p.AskMultiplierUpNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.AskMultiplierUp); err != nil {
			return err
		}
	}
	if !p.AskMultiplierDownInActingVersion(actingVersion) {
		p.AskMultiplierDown = p.AskMultiplierDownNullValue()
	} else {
		if err := _m.ReadInt64(_r, &p.AskMultiplierDown); err != nil {
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

func (p *PercentPriceBySideFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := p.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if p.MultiplierExponentInActingVersion(actingVersion) {
		if p.MultiplierExponent < p.MultiplierExponentMinValue() || p.MultiplierExponent > p.MultiplierExponentMaxValue() {
			return fmt.Errorf("Range check failed on p.MultiplierExponent (%v < %v > %v)", p.MultiplierExponentMinValue(), p.MultiplierExponent, p.MultiplierExponentMaxValue())
		}
	}
	if p.BidMultiplierUpInActingVersion(actingVersion) {
		if p.BidMultiplierUp < p.BidMultiplierUpMinValue() || p.BidMultiplierUp > p.BidMultiplierUpMaxValue() {
			return fmt.Errorf("Range check failed on p.BidMultiplierUp (%v < %v > %v)", p.BidMultiplierUpMinValue(), p.BidMultiplierUp, p.BidMultiplierUpMaxValue())
		}
	}
	if p.BidMultiplierDownInActingVersion(actingVersion) {
		if p.BidMultiplierDown < p.BidMultiplierDownMinValue() || p.BidMultiplierDown > p.BidMultiplierDownMaxValue() {
			return fmt.Errorf("Range check failed on p.BidMultiplierDown (%v < %v > %v)", p.BidMultiplierDownMinValue(), p.BidMultiplierDown, p.BidMultiplierDownMaxValue())
		}
	}
	if p.AskMultiplierUpInActingVersion(actingVersion) {
		if p.AskMultiplierUp < p.AskMultiplierUpMinValue() || p.AskMultiplierUp > p.AskMultiplierUpMaxValue() {
			return fmt.Errorf("Range check failed on p.AskMultiplierUp (%v < %v > %v)", p.AskMultiplierUpMinValue(), p.AskMultiplierUp, p.AskMultiplierUpMaxValue())
		}
	}
	if p.AskMultiplierDownInActingVersion(actingVersion) {
		if p.AskMultiplierDown < p.AskMultiplierDownMinValue() || p.AskMultiplierDown > p.AskMultiplierDownMaxValue() {
			return fmt.Errorf("Range check failed on p.AskMultiplierDown (%v < %v > %v)", p.AskMultiplierDownMinValue(), p.AskMultiplierDown, p.AskMultiplierDownMaxValue())
		}
	}
	if p.AvgPriceMinsInActingVersion(actingVersion) {
		if p.AvgPriceMins < p.AvgPriceMinsMinValue() || p.AvgPriceMins > p.AvgPriceMinsMaxValue() {
			return fmt.Errorf("Range check failed on p.AvgPriceMins (%v < %v > %v)", p.AvgPriceMinsMinValue(), p.AvgPriceMins, p.AvgPriceMinsMaxValue())
		}
	}
	return nil
}

func PercentPriceBySideFilterInit(p *PercentPriceBySideFilter) {
	p.FilterType = FilterType.PercentPriceBySide
	return
}

func (*PercentPriceBySideFilter) SbeBlockLength() (blockLength uint16) {
	return 37
}

func (*PercentPriceBySideFilter) SbeTemplateId() (templateId uint16) {
	return 3
}

func (*PercentPriceBySideFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*PercentPriceBySideFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*PercentPriceBySideFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*PercentPriceBySideFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*PercentPriceBySideFilter) FilterTypeId() uint16 {
	return 1
}

func (*PercentPriceBySideFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceBySideFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.FilterTypeSinceVersion()
}

func (*PercentPriceBySideFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*PercentPriceBySideFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*PercentPriceBySideFilter) MultiplierExponentId() uint16 {
	return 2
}

func (*PercentPriceBySideFilter) MultiplierExponentSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceBySideFilter) MultiplierExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.MultiplierExponentSinceVersion()
}

func (*PercentPriceBySideFilter) MultiplierExponentDeprecated() uint16 {
	return 0
}

func (*PercentPriceBySideFilter) MultiplierExponentMetaAttribute(meta int) string {
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

func (*PercentPriceBySideFilter) MultiplierExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*PercentPriceBySideFilter) MultiplierExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*PercentPriceBySideFilter) MultiplierExponentNullValue() int8 {
	return math.MinInt8
}

func (*PercentPriceBySideFilter) BidMultiplierUpId() uint16 {
	return 3
}

func (*PercentPriceBySideFilter) BidMultiplierUpSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceBySideFilter) BidMultiplierUpInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.BidMultiplierUpSinceVersion()
}

func (*PercentPriceBySideFilter) BidMultiplierUpDeprecated() uint16 {
	return 0
}

func (*PercentPriceBySideFilter) BidMultiplierUpMetaAttribute(meta int) string {
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

func (*PercentPriceBySideFilter) BidMultiplierUpMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PercentPriceBySideFilter) BidMultiplierUpMaxValue() int64 {
	return math.MaxInt64
}

func (*PercentPriceBySideFilter) BidMultiplierUpNullValue() int64 {
	return math.MinInt64
}

func (*PercentPriceBySideFilter) BidMultiplierDownId() uint16 {
	return 4
}

func (*PercentPriceBySideFilter) BidMultiplierDownSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceBySideFilter) BidMultiplierDownInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.BidMultiplierDownSinceVersion()
}

func (*PercentPriceBySideFilter) BidMultiplierDownDeprecated() uint16 {
	return 0
}

func (*PercentPriceBySideFilter) BidMultiplierDownMetaAttribute(meta int) string {
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

func (*PercentPriceBySideFilter) BidMultiplierDownMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PercentPriceBySideFilter) BidMultiplierDownMaxValue() int64 {
	return math.MaxInt64
}

func (*PercentPriceBySideFilter) BidMultiplierDownNullValue() int64 {
	return math.MinInt64
}

func (*PercentPriceBySideFilter) AskMultiplierUpId() uint16 {
	return 5
}

func (*PercentPriceBySideFilter) AskMultiplierUpSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceBySideFilter) AskMultiplierUpInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.AskMultiplierUpSinceVersion()
}

func (*PercentPriceBySideFilter) AskMultiplierUpDeprecated() uint16 {
	return 0
}

func (*PercentPriceBySideFilter) AskMultiplierUpMetaAttribute(meta int) string {
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

func (*PercentPriceBySideFilter) AskMultiplierUpMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PercentPriceBySideFilter) AskMultiplierUpMaxValue() int64 {
	return math.MaxInt64
}

func (*PercentPriceBySideFilter) AskMultiplierUpNullValue() int64 {
	return math.MinInt64
}

func (*PercentPriceBySideFilter) AskMultiplierDownId() uint16 {
	return 6
}

func (*PercentPriceBySideFilter) AskMultiplierDownSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceBySideFilter) AskMultiplierDownInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.AskMultiplierDownSinceVersion()
}

func (*PercentPriceBySideFilter) AskMultiplierDownDeprecated() uint16 {
	return 0
}

func (*PercentPriceBySideFilter) AskMultiplierDownMetaAttribute(meta int) string {
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

func (*PercentPriceBySideFilter) AskMultiplierDownMinValue() int64 {
	return math.MinInt64 + 1
}

func (*PercentPriceBySideFilter) AskMultiplierDownMaxValue() int64 {
	return math.MaxInt64
}

func (*PercentPriceBySideFilter) AskMultiplierDownNullValue() int64 {
	return math.MinInt64
}

func (*PercentPriceBySideFilter) AvgPriceMinsId() uint16 {
	return 7
}

func (*PercentPriceBySideFilter) AvgPriceMinsSinceVersion() uint16 {
	return 0
}

func (p *PercentPriceBySideFilter) AvgPriceMinsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= p.AvgPriceMinsSinceVersion()
}

func (*PercentPriceBySideFilter) AvgPriceMinsDeprecated() uint16 {
	return 0
}

func (*PercentPriceBySideFilter) AvgPriceMinsMetaAttribute(meta int) string {
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

func (*PercentPriceBySideFilter) AvgPriceMinsMinValue() int32 {
	return math.MinInt32 + 1
}

func (*PercentPriceBySideFilter) AvgPriceMinsMaxValue() int32 {
	return math.MaxInt32
}

func (*PercentPriceBySideFilter) AvgPriceMinsNullValue() int32 {
	return math.MinInt32
}

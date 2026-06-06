// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type LotSizeFilter struct {
	FilterType  FilterTypeEnum
	QtyExponent int8
	MinQty      int64
	MaxQty      int64
	StepSize    int64
}

func (l *LotSizeFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := l.RangeCheck(l.SbeSchemaVersion(), l.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, l.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, l.MinQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, l.MaxQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, l.StepSize); err != nil {
		return err
	}
	return nil
}

func (l *LotSizeFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	l.FilterType = FilterType.LotSize
	if !l.QtyExponentInActingVersion(actingVersion) {
		l.QtyExponent = l.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &l.QtyExponent); err != nil {
			return err
		}
	}
	if !l.MinQtyInActingVersion(actingVersion) {
		l.MinQty = l.MinQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &l.MinQty); err != nil {
			return err
		}
	}
	if !l.MaxQtyInActingVersion(actingVersion) {
		l.MaxQty = l.MaxQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &l.MaxQty); err != nil {
			return err
		}
	}
	if !l.StepSizeInActingVersion(actingVersion) {
		l.StepSize = l.StepSizeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &l.StepSize); err != nil {
			return err
		}
	}
	if actingVersion > l.SbeSchemaVersion() && blockLength > l.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-l.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := l.RangeCheck(actingVersion, l.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (l *LotSizeFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := l.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if l.QtyExponentInActingVersion(actingVersion) {
		if l.QtyExponent < l.QtyExponentMinValue() || l.QtyExponent > l.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on l.QtyExponent (%v < %v > %v)", l.QtyExponentMinValue(), l.QtyExponent, l.QtyExponentMaxValue())
		}
	}
	if l.MinQtyInActingVersion(actingVersion) {
		if l.MinQty < l.MinQtyMinValue() || l.MinQty > l.MinQtyMaxValue() {
			return fmt.Errorf("Range check failed on l.MinQty (%v < %v > %v)", l.MinQtyMinValue(), l.MinQty, l.MinQtyMaxValue())
		}
	}
	if l.MaxQtyInActingVersion(actingVersion) {
		if l.MaxQty < l.MaxQtyMinValue() || l.MaxQty > l.MaxQtyMaxValue() {
			return fmt.Errorf("Range check failed on l.MaxQty (%v < %v > %v)", l.MaxQtyMinValue(), l.MaxQty, l.MaxQtyMaxValue())
		}
	}
	if l.StepSizeInActingVersion(actingVersion) {
		if l.StepSize < l.StepSizeMinValue() || l.StepSize > l.StepSizeMaxValue() {
			return fmt.Errorf("Range check failed on l.StepSize (%v < %v > %v)", l.StepSizeMinValue(), l.StepSize, l.StepSizeMaxValue())
		}
	}
	return nil
}

func LotSizeFilterInit(l *LotSizeFilter) {
	l.FilterType = FilterType.LotSize
	return
}

func (*LotSizeFilter) SbeBlockLength() (blockLength uint16) {
	return 25
}

func (*LotSizeFilter) SbeTemplateId() (templateId uint16) {
	return 4
}

func (*LotSizeFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*LotSizeFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*LotSizeFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*LotSizeFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*LotSizeFilter) FilterTypeId() uint16 {
	return 1
}

func (*LotSizeFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (l *LotSizeFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.FilterTypeSinceVersion()
}

func (*LotSizeFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*LotSizeFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*LotSizeFilter) QtyExponentId() uint16 {
	return 2
}

func (*LotSizeFilter) QtyExponentSinceVersion() uint16 {
	return 0
}

func (l *LotSizeFilter) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.QtyExponentSinceVersion()
}

func (*LotSizeFilter) QtyExponentDeprecated() uint16 {
	return 0
}

func (*LotSizeFilter) QtyExponentMetaAttribute(meta int) string {
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

func (*LotSizeFilter) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*LotSizeFilter) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*LotSizeFilter) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*LotSizeFilter) MinQtyId() uint16 {
	return 3
}

func (*LotSizeFilter) MinQtySinceVersion() uint16 {
	return 0
}

func (l *LotSizeFilter) MinQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.MinQtySinceVersion()
}

func (*LotSizeFilter) MinQtyDeprecated() uint16 {
	return 0
}

func (*LotSizeFilter) MinQtyMetaAttribute(meta int) string {
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

func (*LotSizeFilter) MinQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*LotSizeFilter) MinQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*LotSizeFilter) MinQtyNullValue() int64 {
	return math.MinInt64
}

func (*LotSizeFilter) MaxQtyId() uint16 {
	return 4
}

func (*LotSizeFilter) MaxQtySinceVersion() uint16 {
	return 0
}

func (l *LotSizeFilter) MaxQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.MaxQtySinceVersion()
}

func (*LotSizeFilter) MaxQtyDeprecated() uint16 {
	return 0
}

func (*LotSizeFilter) MaxQtyMetaAttribute(meta int) string {
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

func (*LotSizeFilter) MaxQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*LotSizeFilter) MaxQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*LotSizeFilter) MaxQtyNullValue() int64 {
	return math.MinInt64
}

func (*LotSizeFilter) StepSizeId() uint16 {
	return 5
}

func (*LotSizeFilter) StepSizeSinceVersion() uint16 {
	return 0
}

func (l *LotSizeFilter) StepSizeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= l.StepSizeSinceVersion()
}

func (*LotSizeFilter) StepSizeDeprecated() uint16 {
	return 0
}

func (*LotSizeFilter) StepSizeMetaAttribute(meta int) string {
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

func (*LotSizeFilter) StepSizeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*LotSizeFilter) StepSizeMaxValue() int64 {
	return math.MaxInt64
}

func (*LotSizeFilter) StepSizeNullValue() int64 {
	return math.MinInt64
}

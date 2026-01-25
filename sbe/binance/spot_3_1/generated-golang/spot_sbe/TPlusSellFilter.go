// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type TPlusSellFilter struct {
	FilterType FilterTypeEnum
	EndTime    int64
}

func (t *TPlusSellFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, t.EndTime); err != nil {
		return err
	}
	return nil
}

func (t *TPlusSellFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	t.FilterType = FilterType.TPlusSell
	if !t.EndTimeInActingVersion(actingVersion) {
		t.EndTime = t.EndTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.EndTime); err != nil {
			return err
		}
	}
	if actingVersion > t.SbeSchemaVersion() && blockLength > t.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-t.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := t.RangeCheck(actingVersion, t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (t *TPlusSellFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := t.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if t.EndTimeInActingVersion(actingVersion) {
		if t.EndTime != t.EndTimeNullValue() && (t.EndTime < t.EndTimeMinValue() || t.EndTime > t.EndTimeMaxValue()) {
			return fmt.Errorf("Range check failed on t.EndTime (%v < %v > %v)", t.EndTimeMinValue(), t.EndTime, t.EndTimeMaxValue())
		}
	}
	return nil
}

func TPlusSellFilterInit(t *TPlusSellFilter) {
	t.FilterType = FilterType.TPlusSell
	t.EndTime = math.MinInt64
	return
}

func (*TPlusSellFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*TPlusSellFilter) SbeTemplateId() (templateId uint16) {
	return 14
}

func (*TPlusSellFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*TPlusSellFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*TPlusSellFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TPlusSellFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TPlusSellFilter) FilterTypeId() uint16 {
	return 1
}

func (*TPlusSellFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (t *TPlusSellFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FilterTypeSinceVersion()
}

func (*TPlusSellFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*TPlusSellFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*TPlusSellFilter) EndTimeId() uint16 {
	return 2
}

func (*TPlusSellFilter) EndTimeSinceVersion() uint16 {
	return 0
}

func (t *TPlusSellFilter) EndTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.EndTimeSinceVersion()
}

func (*TPlusSellFilter) EndTimeDeprecated() uint16 {
	return 0
}

func (*TPlusSellFilter) EndTimeMetaAttribute(meta int) string {
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

func (*TPlusSellFilter) EndTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TPlusSellFilter) EndTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*TPlusSellFilter) EndTimeNullValue() int64 {
	return math.MinInt64
}

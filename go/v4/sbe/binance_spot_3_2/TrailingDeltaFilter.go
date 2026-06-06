// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type TrailingDeltaFilter struct {
	FilterType            FilterTypeEnum
	MinTrailingAboveDelta int64
	MaxTrailingAboveDelta int64
	MinTrailingBelowDelta int64
	MaxTrailingBelowDelta int64
}

func (t *TrailingDeltaFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := t.RangeCheck(t.SbeSchemaVersion(), t.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, t.MinTrailingAboveDelta); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.MaxTrailingAboveDelta); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.MinTrailingBelowDelta); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, t.MaxTrailingBelowDelta); err != nil {
		return err
	}
	return nil
}

func (t *TrailingDeltaFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	t.FilterType = FilterType.TrailingDelta
	if !t.MinTrailingAboveDeltaInActingVersion(actingVersion) {
		t.MinTrailingAboveDelta = t.MinTrailingAboveDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.MinTrailingAboveDelta); err != nil {
			return err
		}
	}
	if !t.MaxTrailingAboveDeltaInActingVersion(actingVersion) {
		t.MaxTrailingAboveDelta = t.MaxTrailingAboveDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.MaxTrailingAboveDelta); err != nil {
			return err
		}
	}
	if !t.MinTrailingBelowDeltaInActingVersion(actingVersion) {
		t.MinTrailingBelowDelta = t.MinTrailingBelowDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.MinTrailingBelowDelta); err != nil {
			return err
		}
	}
	if !t.MaxTrailingBelowDeltaInActingVersion(actingVersion) {
		t.MaxTrailingBelowDelta = t.MaxTrailingBelowDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &t.MaxTrailingBelowDelta); err != nil {
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

func (t *TrailingDeltaFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := t.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if t.MinTrailingAboveDeltaInActingVersion(actingVersion) {
		if t.MinTrailingAboveDelta < t.MinTrailingAboveDeltaMinValue() || t.MinTrailingAboveDelta > t.MinTrailingAboveDeltaMaxValue() {
			return fmt.Errorf("Range check failed on t.MinTrailingAboveDelta (%v < %v > %v)", t.MinTrailingAboveDeltaMinValue(), t.MinTrailingAboveDelta, t.MinTrailingAboveDeltaMaxValue())
		}
	}
	if t.MaxTrailingAboveDeltaInActingVersion(actingVersion) {
		if t.MaxTrailingAboveDelta < t.MaxTrailingAboveDeltaMinValue() || t.MaxTrailingAboveDelta > t.MaxTrailingAboveDeltaMaxValue() {
			return fmt.Errorf("Range check failed on t.MaxTrailingAboveDelta (%v < %v > %v)", t.MaxTrailingAboveDeltaMinValue(), t.MaxTrailingAboveDelta, t.MaxTrailingAboveDeltaMaxValue())
		}
	}
	if t.MinTrailingBelowDeltaInActingVersion(actingVersion) {
		if t.MinTrailingBelowDelta < t.MinTrailingBelowDeltaMinValue() || t.MinTrailingBelowDelta > t.MinTrailingBelowDeltaMaxValue() {
			return fmt.Errorf("Range check failed on t.MinTrailingBelowDelta (%v < %v > %v)", t.MinTrailingBelowDeltaMinValue(), t.MinTrailingBelowDelta, t.MinTrailingBelowDeltaMaxValue())
		}
	}
	if t.MaxTrailingBelowDeltaInActingVersion(actingVersion) {
		if t.MaxTrailingBelowDelta < t.MaxTrailingBelowDeltaMinValue() || t.MaxTrailingBelowDelta > t.MaxTrailingBelowDeltaMaxValue() {
			return fmt.Errorf("Range check failed on t.MaxTrailingBelowDelta (%v < %v > %v)", t.MaxTrailingBelowDeltaMinValue(), t.MaxTrailingBelowDelta, t.MaxTrailingBelowDeltaMaxValue())
		}
	}
	return nil
}

func TrailingDeltaFilterInit(t *TrailingDeltaFilter) {
	t.FilterType = FilterType.TrailingDelta
	return
}

func (*TrailingDeltaFilter) SbeBlockLength() (blockLength uint16) {
	return 32
}

func (*TrailingDeltaFilter) SbeTemplateId() (templateId uint16) {
	return 13
}

func (*TrailingDeltaFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*TrailingDeltaFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*TrailingDeltaFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*TrailingDeltaFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*TrailingDeltaFilter) FilterTypeId() uint16 {
	return 1
}

func (*TrailingDeltaFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (t *TrailingDeltaFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FilterTypeSinceVersion()
}

func (*TrailingDeltaFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*TrailingDeltaFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*TrailingDeltaFilter) MinTrailingAboveDeltaId() uint16 {
	return 2
}

func (*TrailingDeltaFilter) MinTrailingAboveDeltaSinceVersion() uint16 {
	return 0
}

func (t *TrailingDeltaFilter) MinTrailingAboveDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.MinTrailingAboveDeltaSinceVersion()
}

func (*TrailingDeltaFilter) MinTrailingAboveDeltaDeprecated() uint16 {
	return 0
}

func (*TrailingDeltaFilter) MinTrailingAboveDeltaMetaAttribute(meta int) string {
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

func (*TrailingDeltaFilter) MinTrailingAboveDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TrailingDeltaFilter) MinTrailingAboveDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*TrailingDeltaFilter) MinTrailingAboveDeltaNullValue() int64 {
	return math.MinInt64
}

func (*TrailingDeltaFilter) MaxTrailingAboveDeltaId() uint16 {
	return 3
}

func (*TrailingDeltaFilter) MaxTrailingAboveDeltaSinceVersion() uint16 {
	return 0
}

func (t *TrailingDeltaFilter) MaxTrailingAboveDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.MaxTrailingAboveDeltaSinceVersion()
}

func (*TrailingDeltaFilter) MaxTrailingAboveDeltaDeprecated() uint16 {
	return 0
}

func (*TrailingDeltaFilter) MaxTrailingAboveDeltaMetaAttribute(meta int) string {
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

func (*TrailingDeltaFilter) MaxTrailingAboveDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TrailingDeltaFilter) MaxTrailingAboveDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*TrailingDeltaFilter) MaxTrailingAboveDeltaNullValue() int64 {
	return math.MinInt64
}

func (*TrailingDeltaFilter) MinTrailingBelowDeltaId() uint16 {
	return 4
}

func (*TrailingDeltaFilter) MinTrailingBelowDeltaSinceVersion() uint16 {
	return 0
}

func (t *TrailingDeltaFilter) MinTrailingBelowDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.MinTrailingBelowDeltaSinceVersion()
}

func (*TrailingDeltaFilter) MinTrailingBelowDeltaDeprecated() uint16 {
	return 0
}

func (*TrailingDeltaFilter) MinTrailingBelowDeltaMetaAttribute(meta int) string {
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

func (*TrailingDeltaFilter) MinTrailingBelowDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TrailingDeltaFilter) MinTrailingBelowDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*TrailingDeltaFilter) MinTrailingBelowDeltaNullValue() int64 {
	return math.MinInt64
}

func (*TrailingDeltaFilter) MaxTrailingBelowDeltaId() uint16 {
	return 5
}

func (*TrailingDeltaFilter) MaxTrailingBelowDeltaSinceVersion() uint16 {
	return 0
}

func (t *TrailingDeltaFilter) MaxTrailingBelowDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.MaxTrailingBelowDeltaSinceVersion()
}

func (*TrailingDeltaFilter) MaxTrailingBelowDeltaDeprecated() uint16 {
	return 0
}

func (*TrailingDeltaFilter) MaxTrailingBelowDeltaMetaAttribute(meta int) string {
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

func (*TrailingDeltaFilter) MaxTrailingBelowDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*TrailingDeltaFilter) MaxTrailingBelowDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*TrailingDeltaFilter) MaxTrailingBelowDeltaNullValue() int64 {
	return math.MinInt64
}

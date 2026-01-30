// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type MaxPositionFilter struct {
	FilterType  FilterTypeEnum
	QtyExponent int8
	MaxPosition int64
}

func (m *MaxPositionFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, m.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, m.MaxPosition); err != nil {
		return err
	}
	return nil
}

func (m *MaxPositionFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MaxPosition
	if !m.QtyExponentInActingVersion(actingVersion) {
		m.QtyExponent = m.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &m.QtyExponent); err != nil {
			return err
		}
	}
	if !m.MaxPositionInActingVersion(actingVersion) {
		m.MaxPosition = m.MaxPositionNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MaxPosition); err != nil {
			return err
		}
	}
	if actingVersion > m.SbeSchemaVersion() && blockLength > m.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-m.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := m.RangeCheck(actingVersion, m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (m *MaxPositionFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.QtyExponentInActingVersion(actingVersion) {
		if m.QtyExponent < m.QtyExponentMinValue() || m.QtyExponent > m.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on m.QtyExponent (%v < %v > %v)", m.QtyExponentMinValue(), m.QtyExponent, m.QtyExponentMaxValue())
		}
	}
	if m.MaxPositionInActingVersion(actingVersion) {
		if m.MaxPosition < m.MaxPositionMinValue() || m.MaxPosition > m.MaxPositionMaxValue() {
			return fmt.Errorf("Range check failed on m.MaxPosition (%v < %v > %v)", m.MaxPositionMinValue(), m.MaxPosition, m.MaxPositionMaxValue())
		}
	}
	return nil
}

func MaxPositionFilterInit(m *MaxPositionFilter) {
	m.FilterType = FilterType.MaxPosition
	return
}

func (*MaxPositionFilter) SbeBlockLength() (blockLength uint16) {
	return 9
}

func (*MaxPositionFilter) SbeTemplateId() (templateId uint16) {
	return 12
}

func (*MaxPositionFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MaxPositionFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MaxPositionFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MaxPositionFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MaxPositionFilter) FilterTypeId() uint16 {
	return 1
}

func (*MaxPositionFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MaxPositionFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MaxPositionFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MaxPositionFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*MaxPositionFilter) QtyExponentId() uint16 {
	return 2
}

func (*MaxPositionFilter) QtyExponentSinceVersion() uint16 {
	return 0
}

func (m *MaxPositionFilter) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.QtyExponentSinceVersion()
}

func (*MaxPositionFilter) QtyExponentDeprecated() uint16 {
	return 0
}

func (*MaxPositionFilter) QtyExponentMetaAttribute(meta int) string {
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

func (*MaxPositionFilter) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*MaxPositionFilter) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*MaxPositionFilter) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*MaxPositionFilter) MaxPositionId() uint16 {
	return 3
}

func (*MaxPositionFilter) MaxPositionSinceVersion() uint16 {
	return 0
}

func (m *MaxPositionFilter) MaxPositionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MaxPositionSinceVersion()
}

func (*MaxPositionFilter) MaxPositionDeprecated() uint16 {
	return 0
}

func (*MaxPositionFilter) MaxPositionMetaAttribute(meta int) string {
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

func (*MaxPositionFilter) MaxPositionMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MaxPositionFilter) MaxPositionMaxValue() int64 {
	return math.MaxInt64
}

func (*MaxPositionFilter) MaxPositionNullValue() int64 {
	return math.MinInt64
}

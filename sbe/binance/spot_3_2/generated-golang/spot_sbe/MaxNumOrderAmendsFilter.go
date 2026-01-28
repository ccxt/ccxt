// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type MaxNumOrderAmendsFilter struct {
	FilterType        FilterTypeEnum
	MaxNumOrderAmends int64
}

func (m *MaxNumOrderAmendsFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, m.MaxNumOrderAmends); err != nil {
		return err
	}
	return nil
}

func (m *MaxNumOrderAmendsFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MaxNumOrderAmends
	if !m.MaxNumOrderAmendsInActingVersion(actingVersion) {
		m.MaxNumOrderAmends = m.MaxNumOrderAmendsNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MaxNumOrderAmends); err != nil {
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

func (m *MaxNumOrderAmendsFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.MaxNumOrderAmendsInActingVersion(actingVersion) {
		if m.MaxNumOrderAmends < m.MaxNumOrderAmendsMinValue() || m.MaxNumOrderAmends > m.MaxNumOrderAmendsMaxValue() {
			return fmt.Errorf("Range check failed on m.MaxNumOrderAmends (%v < %v > %v)", m.MaxNumOrderAmendsMinValue(), m.MaxNumOrderAmends, m.MaxNumOrderAmendsMaxValue())
		}
	}
	return nil
}

func MaxNumOrderAmendsFilterInit(m *MaxNumOrderAmendsFilter) {
	m.FilterType = FilterType.MaxNumOrderAmends
	return
}

func (*MaxNumOrderAmendsFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*MaxNumOrderAmendsFilter) SbeTemplateId() (templateId uint16) {
	return 20
}

func (*MaxNumOrderAmendsFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MaxNumOrderAmendsFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MaxNumOrderAmendsFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MaxNumOrderAmendsFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MaxNumOrderAmendsFilter) FilterTypeId() uint16 {
	return 1
}

func (*MaxNumOrderAmendsFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MaxNumOrderAmendsFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MaxNumOrderAmendsFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MaxNumOrderAmendsFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*MaxNumOrderAmendsFilter) MaxNumOrderAmendsId() uint16 {
	return 2
}

func (*MaxNumOrderAmendsFilter) MaxNumOrderAmendsSinceVersion() uint16 {
	return 0
}

func (m *MaxNumOrderAmendsFilter) MaxNumOrderAmendsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MaxNumOrderAmendsSinceVersion()
}

func (*MaxNumOrderAmendsFilter) MaxNumOrderAmendsDeprecated() uint16 {
	return 0
}

func (*MaxNumOrderAmendsFilter) MaxNumOrderAmendsMetaAttribute(meta int) string {
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

func (*MaxNumOrderAmendsFilter) MaxNumOrderAmendsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MaxNumOrderAmendsFilter) MaxNumOrderAmendsMaxValue() int64 {
	return math.MaxInt64
}

func (*MaxNumOrderAmendsFilter) MaxNumOrderAmendsNullValue() int64 {
	return math.MinInt64
}

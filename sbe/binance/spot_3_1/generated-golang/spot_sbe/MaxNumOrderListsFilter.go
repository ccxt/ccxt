// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type MaxNumOrderListsFilter struct {
	FilterType       FilterTypeEnum
	MaxNumOrderLists int64
}

func (m *MaxNumOrderListsFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, m.MaxNumOrderLists); err != nil {
		return err
	}
	return nil
}

func (m *MaxNumOrderListsFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MaxNumOrderLists
	if !m.MaxNumOrderListsInActingVersion(actingVersion) {
		m.MaxNumOrderLists = m.MaxNumOrderListsNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MaxNumOrderLists); err != nil {
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

func (m *MaxNumOrderListsFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.MaxNumOrderListsInActingVersion(actingVersion) {
		if m.MaxNumOrderLists < m.MaxNumOrderListsMinValue() || m.MaxNumOrderLists > m.MaxNumOrderListsMaxValue() {
			return fmt.Errorf("Range check failed on m.MaxNumOrderLists (%v < %v > %v)", m.MaxNumOrderListsMinValue(), m.MaxNumOrderLists, m.MaxNumOrderListsMaxValue())
		}
	}
	return nil
}

func MaxNumOrderListsFilterInit(m *MaxNumOrderListsFilter) {
	m.FilterType = FilterType.MaxNumOrderLists
	return
}

func (*MaxNumOrderListsFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*MaxNumOrderListsFilter) SbeTemplateId() (templateId uint16) {
	return 18
}

func (*MaxNumOrderListsFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MaxNumOrderListsFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*MaxNumOrderListsFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MaxNumOrderListsFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MaxNumOrderListsFilter) FilterTypeId() uint16 {
	return 1
}

func (*MaxNumOrderListsFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MaxNumOrderListsFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MaxNumOrderListsFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MaxNumOrderListsFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*MaxNumOrderListsFilter) MaxNumOrderListsId() uint16 {
	return 2
}

func (*MaxNumOrderListsFilter) MaxNumOrderListsSinceVersion() uint16 {
	return 0
}

func (m *MaxNumOrderListsFilter) MaxNumOrderListsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MaxNumOrderListsSinceVersion()
}

func (*MaxNumOrderListsFilter) MaxNumOrderListsDeprecated() uint16 {
	return 0
}

func (*MaxNumOrderListsFilter) MaxNumOrderListsMetaAttribute(meta int) string {
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

func (*MaxNumOrderListsFilter) MaxNumOrderListsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MaxNumOrderListsFilter) MaxNumOrderListsMaxValue() int64 {
	return math.MaxInt64
}

func (*MaxNumOrderListsFilter) MaxNumOrderListsNullValue() int64 {
	return math.MinInt64
}

// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type MaxNumOrdersFilter struct {
	FilterType   FilterTypeEnum
	MaxNumOrders int64
}

func (m *MaxNumOrdersFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, m.MaxNumOrders); err != nil {
		return err
	}
	return nil
}

func (m *MaxNumOrdersFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MaxNumOrders
	if !m.MaxNumOrdersInActingVersion(actingVersion) {
		m.MaxNumOrders = m.MaxNumOrdersNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MaxNumOrders); err != nil {
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

func (m *MaxNumOrdersFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.MaxNumOrdersInActingVersion(actingVersion) {
		if m.MaxNumOrders < m.MaxNumOrdersMinValue() || m.MaxNumOrders > m.MaxNumOrdersMaxValue() {
			return fmt.Errorf("Range check failed on m.MaxNumOrders (%v < %v > %v)", m.MaxNumOrdersMinValue(), m.MaxNumOrders, m.MaxNumOrdersMaxValue())
		}
	}
	return nil
}

func MaxNumOrdersFilterInit(m *MaxNumOrdersFilter) {
	m.FilterType = FilterType.MaxNumOrders
	return
}

func (*MaxNumOrdersFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*MaxNumOrdersFilter) SbeTemplateId() (templateId uint16) {
	return 9
}

func (*MaxNumOrdersFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MaxNumOrdersFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*MaxNumOrdersFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MaxNumOrdersFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MaxNumOrdersFilter) FilterTypeId() uint16 {
	return 1
}

func (*MaxNumOrdersFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MaxNumOrdersFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MaxNumOrdersFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MaxNumOrdersFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*MaxNumOrdersFilter) MaxNumOrdersId() uint16 {
	return 2
}

func (*MaxNumOrdersFilter) MaxNumOrdersSinceVersion() uint16 {
	return 0
}

func (m *MaxNumOrdersFilter) MaxNumOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MaxNumOrdersSinceVersion()
}

func (*MaxNumOrdersFilter) MaxNumOrdersDeprecated() uint16 {
	return 0
}

func (*MaxNumOrdersFilter) MaxNumOrdersMetaAttribute(meta int) string {
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

func (*MaxNumOrdersFilter) MaxNumOrdersMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MaxNumOrdersFilter) MaxNumOrdersMaxValue() int64 {
	return math.MaxInt64
}

func (*MaxNumOrdersFilter) MaxNumOrdersNullValue() int64 {
	return math.MinInt64
}

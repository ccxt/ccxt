// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type MaxNumIcebergOrdersFilter struct {
	FilterType          FilterTypeEnum
	MaxNumIcebergOrders int64
}

func (m *MaxNumIcebergOrdersFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, m.MaxNumIcebergOrders); err != nil {
		return err
	}
	return nil
}

func (m *MaxNumIcebergOrdersFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MaxNumIcebergOrders
	if !m.MaxNumIcebergOrdersInActingVersion(actingVersion) {
		m.MaxNumIcebergOrders = m.MaxNumIcebergOrdersNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MaxNumIcebergOrders); err != nil {
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

func (m *MaxNumIcebergOrdersFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.MaxNumIcebergOrdersInActingVersion(actingVersion) {
		if m.MaxNumIcebergOrders < m.MaxNumIcebergOrdersMinValue() || m.MaxNumIcebergOrders > m.MaxNumIcebergOrdersMaxValue() {
			return fmt.Errorf("Range check failed on m.MaxNumIcebergOrders (%v < %v > %v)", m.MaxNumIcebergOrdersMinValue(), m.MaxNumIcebergOrders, m.MaxNumIcebergOrdersMaxValue())
		}
	}
	return nil
}

func MaxNumIcebergOrdersFilterInit(m *MaxNumIcebergOrdersFilter) {
	m.FilterType = FilterType.MaxNumIcebergOrders
	return
}

func (*MaxNumIcebergOrdersFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*MaxNumIcebergOrdersFilter) SbeTemplateId() (templateId uint16) {
	return 11
}

func (*MaxNumIcebergOrdersFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MaxNumIcebergOrdersFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MaxNumIcebergOrdersFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MaxNumIcebergOrdersFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MaxNumIcebergOrdersFilter) FilterTypeId() uint16 {
	return 1
}

func (*MaxNumIcebergOrdersFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MaxNumIcebergOrdersFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MaxNumIcebergOrdersFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MaxNumIcebergOrdersFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*MaxNumIcebergOrdersFilter) MaxNumIcebergOrdersId() uint16 {
	return 2
}

func (*MaxNumIcebergOrdersFilter) MaxNumIcebergOrdersSinceVersion() uint16 {
	return 0
}

func (m *MaxNumIcebergOrdersFilter) MaxNumIcebergOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MaxNumIcebergOrdersSinceVersion()
}

func (*MaxNumIcebergOrdersFilter) MaxNumIcebergOrdersDeprecated() uint16 {
	return 0
}

func (*MaxNumIcebergOrdersFilter) MaxNumIcebergOrdersMetaAttribute(meta int) string {
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

func (*MaxNumIcebergOrdersFilter) MaxNumIcebergOrdersMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MaxNumIcebergOrdersFilter) MaxNumIcebergOrdersMaxValue() int64 {
	return math.MaxInt64
}

func (*MaxNumIcebergOrdersFilter) MaxNumIcebergOrdersNullValue() int64 {
	return math.MinInt64
}

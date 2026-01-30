// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type MaxNumAlgoOrdersFilter struct {
	FilterType       FilterTypeEnum
	MaxNumAlgoOrders int64
}

func (m *MaxNumAlgoOrdersFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, m.MaxNumAlgoOrders); err != nil {
		return err
	}
	return nil
}

func (m *MaxNumAlgoOrdersFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MaxNumAlgoOrders
	if !m.MaxNumAlgoOrdersInActingVersion(actingVersion) {
		m.MaxNumAlgoOrders = m.MaxNumAlgoOrdersNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MaxNumAlgoOrders); err != nil {
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

func (m *MaxNumAlgoOrdersFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.MaxNumAlgoOrdersInActingVersion(actingVersion) {
		if m.MaxNumAlgoOrders < m.MaxNumAlgoOrdersMinValue() || m.MaxNumAlgoOrders > m.MaxNumAlgoOrdersMaxValue() {
			return fmt.Errorf("Range check failed on m.MaxNumAlgoOrders (%v < %v > %v)", m.MaxNumAlgoOrdersMinValue(), m.MaxNumAlgoOrders, m.MaxNumAlgoOrdersMaxValue())
		}
	}
	return nil
}

func MaxNumAlgoOrdersFilterInit(m *MaxNumAlgoOrdersFilter) {
	m.FilterType = FilterType.MaxNumAlgoOrders
	return
}

func (*MaxNumAlgoOrdersFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*MaxNumAlgoOrdersFilter) SbeTemplateId() (templateId uint16) {
	return 10
}

func (*MaxNumAlgoOrdersFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MaxNumAlgoOrdersFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MaxNumAlgoOrdersFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MaxNumAlgoOrdersFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MaxNumAlgoOrdersFilter) FilterTypeId() uint16 {
	return 1
}

func (*MaxNumAlgoOrdersFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MaxNumAlgoOrdersFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MaxNumAlgoOrdersFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MaxNumAlgoOrdersFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*MaxNumAlgoOrdersFilter) MaxNumAlgoOrdersId() uint16 {
	return 2
}

func (*MaxNumAlgoOrdersFilter) MaxNumAlgoOrdersSinceVersion() uint16 {
	return 0
}

func (m *MaxNumAlgoOrdersFilter) MaxNumAlgoOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MaxNumAlgoOrdersSinceVersion()
}

func (*MaxNumAlgoOrdersFilter) MaxNumAlgoOrdersDeprecated() uint16 {
	return 0
}

func (*MaxNumAlgoOrdersFilter) MaxNumAlgoOrdersMetaAttribute(meta int) string {
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

func (*MaxNumAlgoOrdersFilter) MaxNumAlgoOrdersMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MaxNumAlgoOrdersFilter) MaxNumAlgoOrdersMaxValue() int64 {
	return math.MaxInt64
}

func (*MaxNumAlgoOrdersFilter) MaxNumAlgoOrdersNullValue() int64 {
	return math.MinInt64
}

// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type MarketLotSizeFilter struct {
	FilterType  FilterTypeEnum
	QtyExponent int8
	MinQty      int64
	MaxQty      int64
	StepSize    int64
}

func (m *MarketLotSizeFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, m.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, m.MinQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, m.MaxQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, m.StepSize); err != nil {
		return err
	}
	return nil
}

func (m *MarketLotSizeFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MarketLotSize
	if !m.QtyExponentInActingVersion(actingVersion) {
		m.QtyExponent = m.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &m.QtyExponent); err != nil {
			return err
		}
	}
	if !m.MinQtyInActingVersion(actingVersion) {
		m.MinQty = m.MinQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MinQty); err != nil {
			return err
		}
	}
	if !m.MaxQtyInActingVersion(actingVersion) {
		m.MaxQty = m.MaxQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MaxQty); err != nil {
			return err
		}
	}
	if !m.StepSizeInActingVersion(actingVersion) {
		m.StepSize = m.StepSizeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.StepSize); err != nil {
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

func (m *MarketLotSizeFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.QtyExponentInActingVersion(actingVersion) {
		if m.QtyExponent < m.QtyExponentMinValue() || m.QtyExponent > m.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on m.QtyExponent (%v < %v > %v)", m.QtyExponentMinValue(), m.QtyExponent, m.QtyExponentMaxValue())
		}
	}
	if m.MinQtyInActingVersion(actingVersion) {
		if m.MinQty < m.MinQtyMinValue() || m.MinQty > m.MinQtyMaxValue() {
			return fmt.Errorf("Range check failed on m.MinQty (%v < %v > %v)", m.MinQtyMinValue(), m.MinQty, m.MinQtyMaxValue())
		}
	}
	if m.MaxQtyInActingVersion(actingVersion) {
		if m.MaxQty < m.MaxQtyMinValue() || m.MaxQty > m.MaxQtyMaxValue() {
			return fmt.Errorf("Range check failed on m.MaxQty (%v < %v > %v)", m.MaxQtyMinValue(), m.MaxQty, m.MaxQtyMaxValue())
		}
	}
	if m.StepSizeInActingVersion(actingVersion) {
		if m.StepSize < m.StepSizeMinValue() || m.StepSize > m.StepSizeMaxValue() {
			return fmt.Errorf("Range check failed on m.StepSize (%v < %v > %v)", m.StepSizeMinValue(), m.StepSize, m.StepSizeMaxValue())
		}
	}
	return nil
}

func MarketLotSizeFilterInit(m *MarketLotSizeFilter) {
	m.FilterType = FilterType.MarketLotSize
	return
}

func (*MarketLotSizeFilter) SbeBlockLength() (blockLength uint16) {
	return 25
}

func (*MarketLotSizeFilter) SbeTemplateId() (templateId uint16) {
	return 8
}

func (*MarketLotSizeFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MarketLotSizeFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MarketLotSizeFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MarketLotSizeFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MarketLotSizeFilter) FilterTypeId() uint16 {
	return 1
}

func (*MarketLotSizeFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MarketLotSizeFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MarketLotSizeFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MarketLotSizeFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*MarketLotSizeFilter) QtyExponentId() uint16 {
	return 2
}

func (*MarketLotSizeFilter) QtyExponentSinceVersion() uint16 {
	return 0
}

func (m *MarketLotSizeFilter) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.QtyExponentSinceVersion()
}

func (*MarketLotSizeFilter) QtyExponentDeprecated() uint16 {
	return 0
}

func (*MarketLotSizeFilter) QtyExponentMetaAttribute(meta int) string {
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

func (*MarketLotSizeFilter) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*MarketLotSizeFilter) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*MarketLotSizeFilter) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*MarketLotSizeFilter) MinQtyId() uint16 {
	return 3
}

func (*MarketLotSizeFilter) MinQtySinceVersion() uint16 {
	return 0
}

func (m *MarketLotSizeFilter) MinQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MinQtySinceVersion()
}

func (*MarketLotSizeFilter) MinQtyDeprecated() uint16 {
	return 0
}

func (*MarketLotSizeFilter) MinQtyMetaAttribute(meta int) string {
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

func (*MarketLotSizeFilter) MinQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MarketLotSizeFilter) MinQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*MarketLotSizeFilter) MinQtyNullValue() int64 {
	return math.MinInt64
}

func (*MarketLotSizeFilter) MaxQtyId() uint16 {
	return 4
}

func (*MarketLotSizeFilter) MaxQtySinceVersion() uint16 {
	return 0
}

func (m *MarketLotSizeFilter) MaxQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MaxQtySinceVersion()
}

func (*MarketLotSizeFilter) MaxQtyDeprecated() uint16 {
	return 0
}

func (*MarketLotSizeFilter) MaxQtyMetaAttribute(meta int) string {
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

func (*MarketLotSizeFilter) MaxQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MarketLotSizeFilter) MaxQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*MarketLotSizeFilter) MaxQtyNullValue() int64 {
	return math.MinInt64
}

func (*MarketLotSizeFilter) StepSizeId() uint16 {
	return 5
}

func (*MarketLotSizeFilter) StepSizeSinceVersion() uint16 {
	return 0
}

func (m *MarketLotSizeFilter) StepSizeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.StepSizeSinceVersion()
}

func (*MarketLotSizeFilter) StepSizeDeprecated() uint16 {
	return 0
}

func (*MarketLotSizeFilter) StepSizeMetaAttribute(meta int) string {
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

func (*MarketLotSizeFilter) StepSizeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MarketLotSizeFilter) StepSizeMaxValue() int64 {
	return math.MaxInt64
}

func (*MarketLotSizeFilter) StepSizeNullValue() int64 {
	return math.MinInt64
}

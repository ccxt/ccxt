// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type MinNotionalFilter struct {
	FilterType    FilterTypeEnum
	PriceExponent int8
	MinNotional   int64
	ApplyToMarket BoolEnumEnum
	AvgPriceMins  int32
}

func (m *MinNotionalFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := m.RangeCheck(m.SbeSchemaVersion(), m.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, m.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, m.MinNotional); err != nil {
		return err
	}
	if err := m.ApplyToMarket.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, m.AvgPriceMins); err != nil {
		return err
	}
	return nil
}

func (m *MinNotionalFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	m.FilterType = FilterType.MinNotional
	if !m.PriceExponentInActingVersion(actingVersion) {
		m.PriceExponent = m.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &m.PriceExponent); err != nil {
			return err
		}
	}
	if !m.MinNotionalInActingVersion(actingVersion) {
		m.MinNotional = m.MinNotionalNullValue()
	} else {
		if err := _m.ReadInt64(_r, &m.MinNotional); err != nil {
			return err
		}
	}
	if m.ApplyToMarketInActingVersion(actingVersion) {
		if err := m.ApplyToMarket.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !m.AvgPriceMinsInActingVersion(actingVersion) {
		m.AvgPriceMins = m.AvgPriceMinsNullValue()
	} else {
		if err := _m.ReadInt32(_r, &m.AvgPriceMins); err != nil {
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

func (m *MinNotionalFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := m.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.PriceExponentInActingVersion(actingVersion) {
		if m.PriceExponent < m.PriceExponentMinValue() || m.PriceExponent > m.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on m.PriceExponent (%v < %v > %v)", m.PriceExponentMinValue(), m.PriceExponent, m.PriceExponentMaxValue())
		}
	}
	if m.MinNotionalInActingVersion(actingVersion) {
		if m.MinNotional < m.MinNotionalMinValue() || m.MinNotional > m.MinNotionalMaxValue() {
			return fmt.Errorf("Range check failed on m.MinNotional (%v < %v > %v)", m.MinNotionalMinValue(), m.MinNotional, m.MinNotionalMaxValue())
		}
	}
	if err := m.ApplyToMarket.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if m.AvgPriceMinsInActingVersion(actingVersion) {
		if m.AvgPriceMins < m.AvgPriceMinsMinValue() || m.AvgPriceMins > m.AvgPriceMinsMaxValue() {
			return fmt.Errorf("Range check failed on m.AvgPriceMins (%v < %v > %v)", m.AvgPriceMinsMinValue(), m.AvgPriceMins, m.AvgPriceMinsMaxValue())
		}
	}
	return nil
}

func MinNotionalFilterInit(m *MinNotionalFilter) {
	m.FilterType = FilterType.MinNotional
	return
}

func (*MinNotionalFilter) SbeBlockLength() (blockLength uint16) {
	return 14
}

func (*MinNotionalFilter) SbeTemplateId() (templateId uint16) {
	return 5
}

func (*MinNotionalFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*MinNotionalFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*MinNotionalFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*MinNotionalFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*MinNotionalFilter) FilterTypeId() uint16 {
	return 1
}

func (*MinNotionalFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (m *MinNotionalFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.FilterTypeSinceVersion()
}

func (*MinNotionalFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*MinNotionalFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*MinNotionalFilter) PriceExponentId() uint16 {
	return 2
}

func (*MinNotionalFilter) PriceExponentSinceVersion() uint16 {
	return 0
}

func (m *MinNotionalFilter) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.PriceExponentSinceVersion()
}

func (*MinNotionalFilter) PriceExponentDeprecated() uint16 {
	return 0
}

func (*MinNotionalFilter) PriceExponentMetaAttribute(meta int) string {
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

func (*MinNotionalFilter) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*MinNotionalFilter) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*MinNotionalFilter) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*MinNotionalFilter) MinNotionalId() uint16 {
	return 3
}

func (*MinNotionalFilter) MinNotionalSinceVersion() uint16 {
	return 0
}

func (m *MinNotionalFilter) MinNotionalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.MinNotionalSinceVersion()
}

func (*MinNotionalFilter) MinNotionalDeprecated() uint16 {
	return 0
}

func (*MinNotionalFilter) MinNotionalMetaAttribute(meta int) string {
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

func (*MinNotionalFilter) MinNotionalMinValue() int64 {
	return math.MinInt64 + 1
}

func (*MinNotionalFilter) MinNotionalMaxValue() int64 {
	return math.MaxInt64
}

func (*MinNotionalFilter) MinNotionalNullValue() int64 {
	return math.MinInt64
}

func (*MinNotionalFilter) ApplyToMarketId() uint16 {
	return 4
}

func (*MinNotionalFilter) ApplyToMarketSinceVersion() uint16 {
	return 0
}

func (m *MinNotionalFilter) ApplyToMarketInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.ApplyToMarketSinceVersion()
}

func (*MinNotionalFilter) ApplyToMarketDeprecated() uint16 {
	return 0
}

func (*MinNotionalFilter) ApplyToMarketMetaAttribute(meta int) string {
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

func (*MinNotionalFilter) AvgPriceMinsId() uint16 {
	return 5
}

func (*MinNotionalFilter) AvgPriceMinsSinceVersion() uint16 {
	return 0
}

func (m *MinNotionalFilter) AvgPriceMinsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.AvgPriceMinsSinceVersion()
}

func (*MinNotionalFilter) AvgPriceMinsDeprecated() uint16 {
	return 0
}

func (*MinNotionalFilter) AvgPriceMinsMetaAttribute(meta int) string {
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

func (*MinNotionalFilter) AvgPriceMinsMinValue() int32 {
	return math.MinInt32 + 1
}

func (*MinNotionalFilter) AvgPriceMinsMaxValue() int32 {
	return math.MaxInt32
}

func (*MinNotionalFilter) AvgPriceMinsNullValue() int32 {
	return math.MinInt32
}

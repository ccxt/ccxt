// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type ExchangeMaxNumOrdersFilter struct {
	FilterType   FilterTypeEnum
	MaxNumOrders int64
}

func (e *ExchangeMaxNumOrdersFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, e.MaxNumOrders); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeMaxNumOrdersFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	e.FilterType = FilterType.ExchangeMaxNumOrders
	if !e.MaxNumOrdersInActingVersion(actingVersion) {
		e.MaxNumOrders = e.MaxNumOrdersNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.MaxNumOrders); err != nil {
			return err
		}
	}
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := e.RangeCheck(actingVersion, e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExchangeMaxNumOrdersFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := e.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.MaxNumOrdersInActingVersion(actingVersion) {
		if e.MaxNumOrders < e.MaxNumOrdersMinValue() || e.MaxNumOrders > e.MaxNumOrdersMaxValue() {
			return fmt.Errorf("Range check failed on e.MaxNumOrders (%v < %v > %v)", e.MaxNumOrdersMinValue(), e.MaxNumOrders, e.MaxNumOrdersMaxValue())
		}
	}
	return nil
}

func ExchangeMaxNumOrdersFilterInit(e *ExchangeMaxNumOrdersFilter) {
	e.FilterType = FilterType.ExchangeMaxNumOrders
	return
}

func (*ExchangeMaxNumOrdersFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*ExchangeMaxNumOrdersFilter) SbeTemplateId() (templateId uint16) {
	return 15
}

func (*ExchangeMaxNumOrdersFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ExchangeMaxNumOrdersFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeMaxNumOrdersFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ExchangeMaxNumOrdersFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ExchangeMaxNumOrdersFilter) FilterTypeId() uint16 {
	return 1
}

func (*ExchangeMaxNumOrdersFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (e *ExchangeMaxNumOrdersFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.FilterTypeSinceVersion()
}

func (*ExchangeMaxNumOrdersFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*ExchangeMaxNumOrdersFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*ExchangeMaxNumOrdersFilter) MaxNumOrdersId() uint16 {
	return 2
}

func (*ExchangeMaxNumOrdersFilter) MaxNumOrdersSinceVersion() uint16 {
	return 0
}

func (e *ExchangeMaxNumOrdersFilter) MaxNumOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.MaxNumOrdersSinceVersion()
}

func (*ExchangeMaxNumOrdersFilter) MaxNumOrdersDeprecated() uint16 {
	return 0
}

func (*ExchangeMaxNumOrdersFilter) MaxNumOrdersMetaAttribute(meta int) string {
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

func (*ExchangeMaxNumOrdersFilter) MaxNumOrdersMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExchangeMaxNumOrdersFilter) MaxNumOrdersMaxValue() int64 {
	return math.MaxInt64
}

func (*ExchangeMaxNumOrdersFilter) MaxNumOrdersNullValue() int64 {
	return math.MinInt64
}

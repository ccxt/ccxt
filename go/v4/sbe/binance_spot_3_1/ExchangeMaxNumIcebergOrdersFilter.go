// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type ExchangeMaxNumIcebergOrdersFilter struct {
	FilterType          FilterTypeEnum
	MaxNumIcebergOrders int64
}

func (e *ExchangeMaxNumIcebergOrdersFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, e.MaxNumIcebergOrders); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeMaxNumIcebergOrdersFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	e.FilterType = FilterType.ExchangeMaxNumIcebergOrders
	if !e.MaxNumIcebergOrdersInActingVersion(actingVersion) {
		e.MaxNumIcebergOrders = e.MaxNumIcebergOrdersNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.MaxNumIcebergOrders); err != nil {
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

func (e *ExchangeMaxNumIcebergOrdersFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := e.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.MaxNumIcebergOrdersInActingVersion(actingVersion) {
		if e.MaxNumIcebergOrders < e.MaxNumIcebergOrdersMinValue() || e.MaxNumIcebergOrders > e.MaxNumIcebergOrdersMaxValue() {
			return fmt.Errorf("Range check failed on e.MaxNumIcebergOrders (%v < %v > %v)", e.MaxNumIcebergOrdersMinValue(), e.MaxNumIcebergOrders, e.MaxNumIcebergOrdersMaxValue())
		}
	}
	return nil
}

func ExchangeMaxNumIcebergOrdersFilterInit(e *ExchangeMaxNumIcebergOrdersFilter) {
	e.FilterType = FilterType.ExchangeMaxNumIcebergOrders
	return
}

func (*ExchangeMaxNumIcebergOrdersFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*ExchangeMaxNumIcebergOrdersFilter) SbeTemplateId() (templateId uint16) {
	return 17
}

func (*ExchangeMaxNumIcebergOrdersFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ExchangeMaxNumIcebergOrdersFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*ExchangeMaxNumIcebergOrdersFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ExchangeMaxNumIcebergOrdersFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ExchangeMaxNumIcebergOrdersFilter) FilterTypeId() uint16 {
	return 1
}

func (*ExchangeMaxNumIcebergOrdersFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (e *ExchangeMaxNumIcebergOrdersFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.FilterTypeSinceVersion()
}

func (*ExchangeMaxNumIcebergOrdersFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*ExchangeMaxNumIcebergOrdersFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*ExchangeMaxNumIcebergOrdersFilter) MaxNumIcebergOrdersId() uint16 {
	return 2
}

func (*ExchangeMaxNumIcebergOrdersFilter) MaxNumIcebergOrdersSinceVersion() uint16 {
	return 0
}

func (e *ExchangeMaxNumIcebergOrdersFilter) MaxNumIcebergOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.MaxNumIcebergOrdersSinceVersion()
}

func (*ExchangeMaxNumIcebergOrdersFilter) MaxNumIcebergOrdersDeprecated() uint16 {
	return 0
}

func (*ExchangeMaxNumIcebergOrdersFilter) MaxNumIcebergOrdersMetaAttribute(meta int) string {
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

func (*ExchangeMaxNumIcebergOrdersFilter) MaxNumIcebergOrdersMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExchangeMaxNumIcebergOrdersFilter) MaxNumIcebergOrdersMaxValue() int64 {
	return math.MaxInt64
}

func (*ExchangeMaxNumIcebergOrdersFilter) MaxNumIcebergOrdersNullValue() int64 {
	return math.MinInt64
}

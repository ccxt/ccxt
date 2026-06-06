// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type ExchangeMaxNumOrderListsFilter struct {
	FilterType       FilterTypeEnum
	MaxNumOrderLists int64
}

func (e *ExchangeMaxNumOrderListsFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, e.MaxNumOrderLists); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeMaxNumOrderListsFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	e.FilterType = FilterType.ExchangeMaxNumOrderLists
	if !e.MaxNumOrderListsInActingVersion(actingVersion) {
		e.MaxNumOrderLists = e.MaxNumOrderListsNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.MaxNumOrderLists); err != nil {
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

func (e *ExchangeMaxNumOrderListsFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := e.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.MaxNumOrderListsInActingVersion(actingVersion) {
		if e.MaxNumOrderLists < e.MaxNumOrderListsMinValue() || e.MaxNumOrderLists > e.MaxNumOrderListsMaxValue() {
			return fmt.Errorf("Range check failed on e.MaxNumOrderLists (%v < %v > %v)", e.MaxNumOrderListsMinValue(), e.MaxNumOrderLists, e.MaxNumOrderListsMaxValue())
		}
	}
	return nil
}

func ExchangeMaxNumOrderListsFilterInit(e *ExchangeMaxNumOrderListsFilter) {
	e.FilterType = FilterType.ExchangeMaxNumOrderLists
	return
}

func (*ExchangeMaxNumOrderListsFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*ExchangeMaxNumOrderListsFilter) SbeTemplateId() (templateId uint16) {
	return 19
}

func (*ExchangeMaxNumOrderListsFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ExchangeMaxNumOrderListsFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*ExchangeMaxNumOrderListsFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ExchangeMaxNumOrderListsFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ExchangeMaxNumOrderListsFilter) FilterTypeId() uint16 {
	return 1
}

func (*ExchangeMaxNumOrderListsFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (e *ExchangeMaxNumOrderListsFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.FilterTypeSinceVersion()
}

func (*ExchangeMaxNumOrderListsFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*ExchangeMaxNumOrderListsFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*ExchangeMaxNumOrderListsFilter) MaxNumOrderListsId() uint16 {
	return 2
}

func (*ExchangeMaxNumOrderListsFilter) MaxNumOrderListsSinceVersion() uint16 {
	return 0
}

func (e *ExchangeMaxNumOrderListsFilter) MaxNumOrderListsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.MaxNumOrderListsSinceVersion()
}

func (*ExchangeMaxNumOrderListsFilter) MaxNumOrderListsDeprecated() uint16 {
	return 0
}

func (*ExchangeMaxNumOrderListsFilter) MaxNumOrderListsMetaAttribute(meta int) string {
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

func (*ExchangeMaxNumOrderListsFilter) MaxNumOrderListsMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExchangeMaxNumOrderListsFilter) MaxNumOrderListsMaxValue() int64 {
	return math.MaxInt64
}

func (*ExchangeMaxNumOrderListsFilter) MaxNumOrderListsNullValue() int64 {
	return math.MinInt64
}

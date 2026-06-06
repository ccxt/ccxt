// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type ExchangeMaxNumAlgoOrdersFilter struct {
	FilterType       FilterTypeEnum
	MaxNumAlgoOrders int64
}

func (e *ExchangeMaxNumAlgoOrdersFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, e.MaxNumAlgoOrders); err != nil {
		return err
	}
	return nil
}

func (e *ExchangeMaxNumAlgoOrdersFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	e.FilterType = FilterType.ExchangeMaxNumAlgoOrders
	if !e.MaxNumAlgoOrdersInActingVersion(actingVersion) {
		e.MaxNumAlgoOrders = e.MaxNumAlgoOrdersNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.MaxNumAlgoOrders); err != nil {
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

func (e *ExchangeMaxNumAlgoOrdersFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := e.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.MaxNumAlgoOrdersInActingVersion(actingVersion) {
		if e.MaxNumAlgoOrders < e.MaxNumAlgoOrdersMinValue() || e.MaxNumAlgoOrders > e.MaxNumAlgoOrdersMaxValue() {
			return fmt.Errorf("Range check failed on e.MaxNumAlgoOrders (%v < %v > %v)", e.MaxNumAlgoOrdersMinValue(), e.MaxNumAlgoOrders, e.MaxNumAlgoOrdersMaxValue())
		}
	}
	return nil
}

func ExchangeMaxNumAlgoOrdersFilterInit(e *ExchangeMaxNumAlgoOrdersFilter) {
	e.FilterType = FilterType.ExchangeMaxNumAlgoOrders
	return
}

func (*ExchangeMaxNumAlgoOrdersFilter) SbeBlockLength() (blockLength uint16) {
	return 8
}

func (*ExchangeMaxNumAlgoOrdersFilter) SbeTemplateId() (templateId uint16) {
	return 16
}

func (*ExchangeMaxNumAlgoOrdersFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ExchangeMaxNumAlgoOrdersFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*ExchangeMaxNumAlgoOrdersFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ExchangeMaxNumAlgoOrdersFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ExchangeMaxNumAlgoOrdersFilter) FilterTypeId() uint16 {
	return 1
}

func (*ExchangeMaxNumAlgoOrdersFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (e *ExchangeMaxNumAlgoOrdersFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.FilterTypeSinceVersion()
}

func (*ExchangeMaxNumAlgoOrdersFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*ExchangeMaxNumAlgoOrdersFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*ExchangeMaxNumAlgoOrdersFilter) MaxNumAlgoOrdersId() uint16 {
	return 2
}

func (*ExchangeMaxNumAlgoOrdersFilter) MaxNumAlgoOrdersSinceVersion() uint16 {
	return 0
}

func (e *ExchangeMaxNumAlgoOrdersFilter) MaxNumAlgoOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.MaxNumAlgoOrdersSinceVersion()
}

func (*ExchangeMaxNumAlgoOrdersFilter) MaxNumAlgoOrdersDeprecated() uint16 {
	return 0
}

func (*ExchangeMaxNumAlgoOrdersFilter) MaxNumAlgoOrdersMetaAttribute(meta int) string {
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

func (*ExchangeMaxNumAlgoOrdersFilter) MaxNumAlgoOrdersMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExchangeMaxNumAlgoOrdersFilter) MaxNumAlgoOrdersMaxValue() int64 {
	return math.MaxInt64
}

func (*ExchangeMaxNumAlgoOrdersFilter) MaxNumAlgoOrdersNullValue() int64 {
	return math.MinInt64
}

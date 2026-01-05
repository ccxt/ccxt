// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"io/ioutil"
	"math"
)

type NotionalFilter struct {
	FilterType       FilterTypeEnum
	PriceExponent    int8
	MinNotional      int64
	ApplyMinToMarket BoolEnumEnum
	MaxNotional      int64
	ApplyMaxToMarket BoolEnumEnum
	AvgPriceMins     int32
}

func (n *NotionalFilter) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := n.RangeCheck(n.SbeSchemaVersion(), n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, n.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.MinNotional); err != nil {
		return err
	}
	if err := n.ApplyMinToMarket.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.MaxNotional); err != nil {
		return err
	}
	if err := n.ApplyMaxToMarket.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, n.AvgPriceMins); err != nil {
		return err
	}
	return nil
}

func (n *NotionalFilter) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	n.FilterType = FilterType.Notional
	if !n.PriceExponentInActingVersion(actingVersion) {
		n.PriceExponent = n.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &n.PriceExponent); err != nil {
			return err
		}
	}
	if !n.MinNotionalInActingVersion(actingVersion) {
		n.MinNotional = n.MinNotionalNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.MinNotional); err != nil {
			return err
		}
	}
	if n.ApplyMinToMarketInActingVersion(actingVersion) {
		if err := n.ApplyMinToMarket.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !n.MaxNotionalInActingVersion(actingVersion) {
		n.MaxNotional = n.MaxNotionalNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.MaxNotional); err != nil {
			return err
		}
	}
	if n.ApplyMaxToMarketInActingVersion(actingVersion) {
		if err := n.ApplyMaxToMarket.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !n.AvgPriceMinsInActingVersion(actingVersion) {
		n.AvgPriceMins = n.AvgPriceMinsNullValue()
	} else {
		if err := _m.ReadInt32(_r, &n.AvgPriceMins); err != nil {
			return err
		}
	}
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}
	if doRangeCheck {
		if err := n.RangeCheck(actingVersion, n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (n *NotionalFilter) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if err := n.FilterType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.PriceExponentInActingVersion(actingVersion) {
		if n.PriceExponent < n.PriceExponentMinValue() || n.PriceExponent > n.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on n.PriceExponent (%v < %v > %v)", n.PriceExponentMinValue(), n.PriceExponent, n.PriceExponentMaxValue())
		}
	}
	if n.MinNotionalInActingVersion(actingVersion) {
		if n.MinNotional < n.MinNotionalMinValue() || n.MinNotional > n.MinNotionalMaxValue() {
			return fmt.Errorf("Range check failed on n.MinNotional (%v < %v > %v)", n.MinNotionalMinValue(), n.MinNotional, n.MinNotionalMaxValue())
		}
	}
	if err := n.ApplyMinToMarket.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.MaxNotionalInActingVersion(actingVersion) {
		if n.MaxNotional < n.MaxNotionalMinValue() || n.MaxNotional > n.MaxNotionalMaxValue() {
			return fmt.Errorf("Range check failed on n.MaxNotional (%v < %v > %v)", n.MaxNotionalMinValue(), n.MaxNotional, n.MaxNotionalMaxValue())
		}
	}
	if err := n.ApplyMaxToMarket.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.AvgPriceMinsInActingVersion(actingVersion) {
		if n.AvgPriceMins < n.AvgPriceMinsMinValue() || n.AvgPriceMins > n.AvgPriceMinsMaxValue() {
			return fmt.Errorf("Range check failed on n.AvgPriceMins (%v < %v > %v)", n.AvgPriceMinsMinValue(), n.AvgPriceMins, n.AvgPriceMinsMaxValue())
		}
	}
	return nil
}

func NotionalFilterInit(n *NotionalFilter) {
	n.FilterType = FilterType.Notional
	return
}

func (*NotionalFilter) SbeBlockLength() (blockLength uint16) {
	return 23
}

func (*NotionalFilter) SbeTemplateId() (templateId uint16) {
	return 6
}

func (*NotionalFilter) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*NotionalFilter) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NotionalFilter) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*NotionalFilter) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*NotionalFilter) FilterTypeId() uint16 {
	return 1
}

func (*NotionalFilter) FilterTypeSinceVersion() uint16 {
	return 0
}

func (n *NotionalFilter) FilterTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.FilterTypeSinceVersion()
}

func (*NotionalFilter) FilterTypeDeprecated() uint16 {
	return 0
}

func (*NotionalFilter) FilterTypeMetaAttribute(meta int) string {
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

func (*NotionalFilter) PriceExponentId() uint16 {
	return 2
}

func (*NotionalFilter) PriceExponentSinceVersion() uint16 {
	return 0
}

func (n *NotionalFilter) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceExponentSinceVersion()
}

func (*NotionalFilter) PriceExponentDeprecated() uint16 {
	return 0
}

func (*NotionalFilter) PriceExponentMetaAttribute(meta int) string {
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

func (*NotionalFilter) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NotionalFilter) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NotionalFilter) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*NotionalFilter) MinNotionalId() uint16 {
	return 3
}

func (*NotionalFilter) MinNotionalSinceVersion() uint16 {
	return 0
}

func (n *NotionalFilter) MinNotionalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MinNotionalSinceVersion()
}

func (*NotionalFilter) MinNotionalDeprecated() uint16 {
	return 0
}

func (*NotionalFilter) MinNotionalMetaAttribute(meta int) string {
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

func (*NotionalFilter) MinNotionalMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NotionalFilter) MinNotionalMaxValue() int64 {
	return math.MaxInt64
}

func (*NotionalFilter) MinNotionalNullValue() int64 {
	return math.MinInt64
}

func (*NotionalFilter) ApplyMinToMarketId() uint16 {
	return 4
}

func (*NotionalFilter) ApplyMinToMarketSinceVersion() uint16 {
	return 0
}

func (n *NotionalFilter) ApplyMinToMarketInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ApplyMinToMarketSinceVersion()
}

func (*NotionalFilter) ApplyMinToMarketDeprecated() uint16 {
	return 0
}

func (*NotionalFilter) ApplyMinToMarketMetaAttribute(meta int) string {
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

func (*NotionalFilter) MaxNotionalId() uint16 {
	return 5
}

func (*NotionalFilter) MaxNotionalSinceVersion() uint16 {
	return 0
}

func (n *NotionalFilter) MaxNotionalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MaxNotionalSinceVersion()
}

func (*NotionalFilter) MaxNotionalDeprecated() uint16 {
	return 0
}

func (*NotionalFilter) MaxNotionalMetaAttribute(meta int) string {
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

func (*NotionalFilter) MaxNotionalMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NotionalFilter) MaxNotionalMaxValue() int64 {
	return math.MaxInt64
}

func (*NotionalFilter) MaxNotionalNullValue() int64 {
	return math.MinInt64
}

func (*NotionalFilter) ApplyMaxToMarketId() uint16 {
	return 6
}

func (*NotionalFilter) ApplyMaxToMarketSinceVersion() uint16 {
	return 0
}

func (n *NotionalFilter) ApplyMaxToMarketInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ApplyMaxToMarketSinceVersion()
}

func (*NotionalFilter) ApplyMaxToMarketDeprecated() uint16 {
	return 0
}

func (*NotionalFilter) ApplyMaxToMarketMetaAttribute(meta int) string {
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

func (*NotionalFilter) AvgPriceMinsId() uint16 {
	return 7
}

func (*NotionalFilter) AvgPriceMinsSinceVersion() uint16 {
	return 0
}

func (n *NotionalFilter) AvgPriceMinsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.AvgPriceMinsSinceVersion()
}

func (*NotionalFilter) AvgPriceMinsDeprecated() uint16 {
	return 0
}

func (*NotionalFilter) AvgPriceMinsMetaAttribute(meta int) string {
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

func (*NotionalFilter) AvgPriceMinsMinValue() int32 {
	return math.MinInt32 + 1
}

func (*NotionalFilter) AvgPriceMinsMaxValue() int32 {
	return math.MaxInt32
}

func (*NotionalFilter) AvgPriceMinsNullValue() int32 {
	return math.MinInt32
}

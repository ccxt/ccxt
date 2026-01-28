// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type NewOrderResultResponse struct {
	PriceExponent           int8
	QtyExponent             int8
	OrderId                 int64
	OrderListId             int64
	TransactTime            int64
	Price                   int64
	OrigQty                 int64
	ExecutedQty             int64
	CummulativeQuoteQty     int64
	Status                  OrderStatusEnum
	TimeInForce             TimeInForceEnum
	OrderType               OrderTypeEnum
	Side                    OrderSideEnum
	StopPrice               int64
	TrailingDelta           int64
	TrailingTime            int64
	WorkingTime             int64
	IcebergQty              int64
	StrategyId              int64
	StrategyType            int32
	OrderCapacity           OrderCapacityEnum
	WorkingFloor            FloorEnum
	SelfTradePreventionMode SelfTradePreventionModeEnum
	TradeGroupId            int64
	PreventedQuantity       int64
	UsedSor                 BoolEnumEnum
	OrigQuoteOrderQty       int64
	PegPriceType            PegPriceTypeEnum
	PegOffsetType           PegOffsetTypeEnum
	PegOffsetValue          uint8
	PeggedPrice             int64
	Symbol                  []uint8
	ClientOrderId           []uint8
}

func (n *NewOrderResultResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := n.RangeCheck(n.SbeSchemaVersion(), n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, n.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, n.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.OrderListId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.OrigQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.ExecutedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.CummulativeQuoteQty); err != nil {
		return err
	}
	if err := n.Status.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.TimeInForce.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.OrderType.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.Side.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.StopPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TrailingDelta); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TrailingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.WorkingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.IcebergQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.StrategyId); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, n.StrategyType); err != nil {
		return err
	}
	if err := n.OrderCapacity.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.WorkingFloor.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.SelfTradePreventionMode.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TradeGroupId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.PreventedQuantity); err != nil {
		return err
	}
	if err := n.UsedSor.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.OrigQuoteOrderQty); err != nil {
		return err
	}
	if err := n.PegPriceType.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.PegOffsetType.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, n.PegOffsetValue); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.PeggedPrice); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (n *NewOrderResultResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !n.PriceExponentInActingVersion(actingVersion) {
		n.PriceExponent = n.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &n.PriceExponent); err != nil {
			return err
		}
	}
	if !n.QtyExponentInActingVersion(actingVersion) {
		n.QtyExponent = n.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &n.QtyExponent); err != nil {
			return err
		}
	}
	if !n.OrderIdInActingVersion(actingVersion) {
		n.OrderId = n.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderId); err != nil {
			return err
		}
	}
	if !n.OrderListIdInActingVersion(actingVersion) {
		n.OrderListId = n.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderListId); err != nil {
			return err
		}
	}
	if !n.TransactTimeInActingVersion(actingVersion) {
		n.TransactTime = n.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TransactTime); err != nil {
			return err
		}
	}
	if !n.PriceInActingVersion(actingVersion) {
		n.Price = n.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.Price); err != nil {
			return err
		}
	}
	if !n.OrigQtyInActingVersion(actingVersion) {
		n.OrigQty = n.OrigQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrigQty); err != nil {
			return err
		}
	}
	if !n.ExecutedQtyInActingVersion(actingVersion) {
		n.ExecutedQty = n.ExecutedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.ExecutedQty); err != nil {
			return err
		}
	}
	if !n.CummulativeQuoteQtyInActingVersion(actingVersion) {
		n.CummulativeQuoteQty = n.CummulativeQuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.CummulativeQuoteQty); err != nil {
			return err
		}
	}
	if n.StatusInActingVersion(actingVersion) {
		if err := n.Status.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.TimeInForceInActingVersion(actingVersion) {
		if err := n.TimeInForce.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.OrderTypeInActingVersion(actingVersion) {
		if err := n.OrderType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.SideInActingVersion(actingVersion) {
		if err := n.Side.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !n.StopPriceInActingVersion(actingVersion) {
		n.StopPrice = n.StopPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.StopPrice); err != nil {
			return err
		}
	}
	if !n.TrailingDeltaInActingVersion(actingVersion) {
		n.TrailingDelta = n.TrailingDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TrailingDelta); err != nil {
			return err
		}
	}
	if !n.TrailingTimeInActingVersion(actingVersion) {
		n.TrailingTime = n.TrailingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TrailingTime); err != nil {
			return err
		}
	}
	if !n.WorkingTimeInActingVersion(actingVersion) {
		n.WorkingTime = n.WorkingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.WorkingTime); err != nil {
			return err
		}
	}
	if !n.IcebergQtyInActingVersion(actingVersion) {
		n.IcebergQty = n.IcebergQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.IcebergQty); err != nil {
			return err
		}
	}
	if !n.StrategyIdInActingVersion(actingVersion) {
		n.StrategyId = n.StrategyIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.StrategyId); err != nil {
			return err
		}
	}
	if !n.StrategyTypeInActingVersion(actingVersion) {
		n.StrategyType = n.StrategyTypeNullValue()
	} else {
		if err := _m.ReadInt32(_r, &n.StrategyType); err != nil {
			return err
		}
	}
	if n.OrderCapacityInActingVersion(actingVersion) {
		if err := n.OrderCapacity.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.WorkingFloorInActingVersion(actingVersion) {
		if err := n.WorkingFloor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.SelfTradePreventionModeInActingVersion(actingVersion) {
		if err := n.SelfTradePreventionMode.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !n.TradeGroupIdInActingVersion(actingVersion) {
		n.TradeGroupId = n.TradeGroupIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TradeGroupId); err != nil {
			return err
		}
	}
	if !n.PreventedQuantityInActingVersion(actingVersion) {
		n.PreventedQuantity = n.PreventedQuantityNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.PreventedQuantity); err != nil {
			return err
		}
	}
	if n.UsedSorInActingVersion(actingVersion) {
		if err := n.UsedSor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !n.OrigQuoteOrderQtyInActingVersion(actingVersion) {
		n.OrigQuoteOrderQty = n.OrigQuoteOrderQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrigQuoteOrderQty); err != nil {
			return err
		}
	}
	if n.PegPriceTypeInActingVersion(actingVersion) {
		if err := n.PegPriceType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.PegOffsetTypeInActingVersion(actingVersion) {
		if err := n.PegOffsetType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !n.PegOffsetValueInActingVersion(actingVersion) {
		n.PegOffsetValue = n.PegOffsetValueNullValue()
	} else {
		if err := _m.ReadUint8(_r, &n.PegOffsetValue); err != nil {
			return err
		}
	}
	if !n.PeggedPriceInActingVersion(actingVersion) {
		n.PeggedPrice = n.PeggedPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.PeggedPrice); err != nil {
			return err
		}
	}
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}

	if n.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(n.Symbol) < int(SymbolLength) {
			n.Symbol = make([]uint8, SymbolLength)
		}
		n.Symbol = n.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, n.Symbol); err != nil {
			return err
		}
	}

	if n.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(n.ClientOrderId) < int(ClientOrderIdLength) {
			n.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		n.ClientOrderId = n.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, n.ClientOrderId); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := n.RangeCheck(actingVersion, n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (n *NewOrderResultResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.PriceExponentInActingVersion(actingVersion) {
		if n.PriceExponent < n.PriceExponentMinValue() || n.PriceExponent > n.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on n.PriceExponent (%v < %v > %v)", n.PriceExponentMinValue(), n.PriceExponent, n.PriceExponentMaxValue())
		}
	}
	if n.QtyExponentInActingVersion(actingVersion) {
		if n.QtyExponent < n.QtyExponentMinValue() || n.QtyExponent > n.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on n.QtyExponent (%v < %v > %v)", n.QtyExponentMinValue(), n.QtyExponent, n.QtyExponentMaxValue())
		}
	}
	if n.OrderIdInActingVersion(actingVersion) {
		if n.OrderId < n.OrderIdMinValue() || n.OrderId > n.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on n.OrderId (%v < %v > %v)", n.OrderIdMinValue(), n.OrderId, n.OrderIdMaxValue())
		}
	}
	if n.OrderListIdInActingVersion(actingVersion) {
		if n.OrderListId != n.OrderListIdNullValue() && (n.OrderListId < n.OrderListIdMinValue() || n.OrderListId > n.OrderListIdMaxValue()) {
			return fmt.Errorf("Range check failed on n.OrderListId (%v < %v > %v)", n.OrderListIdMinValue(), n.OrderListId, n.OrderListIdMaxValue())
		}
	}
	if n.TransactTimeInActingVersion(actingVersion) {
		if n.TransactTime < n.TransactTimeMinValue() || n.TransactTime > n.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on n.TransactTime (%v < %v > %v)", n.TransactTimeMinValue(), n.TransactTime, n.TransactTimeMaxValue())
		}
	}
	if n.PriceInActingVersion(actingVersion) {
		if n.Price < n.PriceMinValue() || n.Price > n.PriceMaxValue() {
			return fmt.Errorf("Range check failed on n.Price (%v < %v > %v)", n.PriceMinValue(), n.Price, n.PriceMaxValue())
		}
	}
	if n.OrigQtyInActingVersion(actingVersion) {
		if n.OrigQty < n.OrigQtyMinValue() || n.OrigQty > n.OrigQtyMaxValue() {
			return fmt.Errorf("Range check failed on n.OrigQty (%v < %v > %v)", n.OrigQtyMinValue(), n.OrigQty, n.OrigQtyMaxValue())
		}
	}
	if n.ExecutedQtyInActingVersion(actingVersion) {
		if n.ExecutedQty < n.ExecutedQtyMinValue() || n.ExecutedQty > n.ExecutedQtyMaxValue() {
			return fmt.Errorf("Range check failed on n.ExecutedQty (%v < %v > %v)", n.ExecutedQtyMinValue(), n.ExecutedQty, n.ExecutedQtyMaxValue())
		}
	}
	if n.CummulativeQuoteQtyInActingVersion(actingVersion) {
		if n.CummulativeQuoteQty < n.CummulativeQuoteQtyMinValue() || n.CummulativeQuoteQty > n.CummulativeQuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on n.CummulativeQuoteQty (%v < %v > %v)", n.CummulativeQuoteQtyMinValue(), n.CummulativeQuoteQty, n.CummulativeQuoteQtyMaxValue())
		}
	}
	if err := n.Status.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.TimeInForce.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.OrderType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.Side.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.StopPriceInActingVersion(actingVersion) {
		if n.StopPrice != n.StopPriceNullValue() && (n.StopPrice < n.StopPriceMinValue() || n.StopPrice > n.StopPriceMaxValue()) {
			return fmt.Errorf("Range check failed on n.StopPrice (%v < %v > %v)", n.StopPriceMinValue(), n.StopPrice, n.StopPriceMaxValue())
		}
	}
	if n.TrailingDeltaInActingVersion(actingVersion) {
		if n.TrailingDelta != n.TrailingDeltaNullValue() && (n.TrailingDelta < n.TrailingDeltaMinValue() || n.TrailingDelta > n.TrailingDeltaMaxValue()) {
			return fmt.Errorf("Range check failed on n.TrailingDelta (%v < %v > %v)", n.TrailingDeltaMinValue(), n.TrailingDelta, n.TrailingDeltaMaxValue())
		}
	}
	if n.TrailingTimeInActingVersion(actingVersion) {
		if n.TrailingTime != n.TrailingTimeNullValue() && (n.TrailingTime < n.TrailingTimeMinValue() || n.TrailingTime > n.TrailingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on n.TrailingTime (%v < %v > %v)", n.TrailingTimeMinValue(), n.TrailingTime, n.TrailingTimeMaxValue())
		}
	}
	if n.WorkingTimeInActingVersion(actingVersion) {
		if n.WorkingTime != n.WorkingTimeNullValue() && (n.WorkingTime < n.WorkingTimeMinValue() || n.WorkingTime > n.WorkingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on n.WorkingTime (%v < %v > %v)", n.WorkingTimeMinValue(), n.WorkingTime, n.WorkingTimeMaxValue())
		}
	}
	if n.IcebergQtyInActingVersion(actingVersion) {
		if n.IcebergQty != n.IcebergQtyNullValue() && (n.IcebergQty < n.IcebergQtyMinValue() || n.IcebergQty > n.IcebergQtyMaxValue()) {
			return fmt.Errorf("Range check failed on n.IcebergQty (%v < %v > %v)", n.IcebergQtyMinValue(), n.IcebergQty, n.IcebergQtyMaxValue())
		}
	}
	if n.StrategyIdInActingVersion(actingVersion) {
		if n.StrategyId != n.StrategyIdNullValue() && (n.StrategyId < n.StrategyIdMinValue() || n.StrategyId > n.StrategyIdMaxValue()) {
			return fmt.Errorf("Range check failed on n.StrategyId (%v < %v > %v)", n.StrategyIdMinValue(), n.StrategyId, n.StrategyIdMaxValue())
		}
	}
	if n.StrategyTypeInActingVersion(actingVersion) {
		if n.StrategyType != n.StrategyTypeNullValue() && (n.StrategyType < n.StrategyTypeMinValue() || n.StrategyType > n.StrategyTypeMaxValue()) {
			return fmt.Errorf("Range check failed on n.StrategyType (%v < %v > %v)", n.StrategyTypeMinValue(), n.StrategyType, n.StrategyTypeMaxValue())
		}
	}
	if err := n.OrderCapacity.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.WorkingFloor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.SelfTradePreventionMode.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.TradeGroupIdInActingVersion(actingVersion) {
		if n.TradeGroupId != n.TradeGroupIdNullValue() && (n.TradeGroupId < n.TradeGroupIdMinValue() || n.TradeGroupId > n.TradeGroupIdMaxValue()) {
			return fmt.Errorf("Range check failed on n.TradeGroupId (%v < %v > %v)", n.TradeGroupIdMinValue(), n.TradeGroupId, n.TradeGroupIdMaxValue())
		}
	}
	if n.PreventedQuantityInActingVersion(actingVersion) {
		if n.PreventedQuantity < n.PreventedQuantityMinValue() || n.PreventedQuantity > n.PreventedQuantityMaxValue() {
			return fmt.Errorf("Range check failed on n.PreventedQuantity (%v < %v > %v)", n.PreventedQuantityMinValue(), n.PreventedQuantity, n.PreventedQuantityMaxValue())
		}
	}
	if err := n.UsedSor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.OrigQuoteOrderQtyInActingVersion(actingVersion) {
		if n.OrigQuoteOrderQty < n.OrigQuoteOrderQtyMinValue() || n.OrigQuoteOrderQty > n.OrigQuoteOrderQtyMaxValue() {
			return fmt.Errorf("Range check failed on n.OrigQuoteOrderQty (%v < %v > %v)", n.OrigQuoteOrderQtyMinValue(), n.OrigQuoteOrderQty, n.OrigQuoteOrderQtyMaxValue())
		}
	}
	if err := n.PegPriceType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.PegOffsetType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.PegOffsetValueInActingVersion(actingVersion) {
		if n.PegOffsetValue != n.PegOffsetValueNullValue() && (n.PegOffsetValue < n.PegOffsetValueMinValue() || n.PegOffsetValue > n.PegOffsetValueMaxValue()) {
			return fmt.Errorf("Range check failed on n.PegOffsetValue (%v < %v > %v)", n.PegOffsetValueMinValue(), n.PegOffsetValue, n.PegOffsetValueMaxValue())
		}
	}
	if n.PeggedPriceInActingVersion(actingVersion) {
		if n.PeggedPrice != n.PeggedPriceNullValue() && (n.PeggedPrice < n.PeggedPriceMinValue() || n.PeggedPrice > n.PeggedPriceMaxValue()) {
			return fmt.Errorf("Range check failed on n.PeggedPrice (%v < %v > %v)", n.PeggedPriceMinValue(), n.PeggedPrice, n.PeggedPriceMaxValue())
		}
	}
	if !utf8.Valid(n.Symbol[:]) {
		return errors.New("n.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(n.ClientOrderId[:]) {
		return errors.New("n.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func NewOrderResultResponseInit(n *NewOrderResultResponse) {
	n.OrderListId = math.MinInt64
	n.StopPrice = math.MinInt64
	n.TrailingDelta = math.MinInt64
	n.TrailingTime = math.MinInt64
	n.WorkingTime = math.MinInt64
	n.IcebergQty = math.MinInt64
	n.StrategyId = math.MinInt64
	n.StrategyType = math.MinInt32
	n.TradeGroupId = math.MinInt64
	n.PegOffsetValue = math.MaxUint8
	n.PeggedPrice = math.MinInt64
	return
}

func (*NewOrderResultResponse) SbeBlockLength() (blockLength uint16) {
	return 153
}

func (*NewOrderResultResponse) SbeTemplateId() (templateId uint16) {
	return 301
}

func (*NewOrderResultResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*NewOrderResultResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderResultResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*NewOrderResultResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*NewOrderResultResponse) PriceExponentId() uint16 {
	return 1
}

func (*NewOrderResultResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceExponentSinceVersion()
}

func (*NewOrderResultResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderResultResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderResultResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderResultResponse) QtyExponentId() uint16 {
	return 2
}

func (*NewOrderResultResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.QtyExponentSinceVersion()
}

func (*NewOrderResultResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderResultResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderResultResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderResultResponse) OrderIdId() uint16 {
	return 3
}

func (*NewOrderResultResponse) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderResultResponse) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) OrderIdMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) OrderListIdId() uint16 {
	return 4
}

func (*NewOrderResultResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderResultResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) OrderListIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) TransactTimeId() uint16 {
	return 5
}

func (*NewOrderResultResponse) TransactTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactTimeSinceVersion()
}

func (*NewOrderResultResponse) TransactTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) TransactTimeMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) PriceId() uint16 {
	return 6
}

func (*NewOrderResultResponse) PriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceSinceVersion()
}

func (*NewOrderResultResponse) PriceDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) PriceMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) PriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) OrigQtyId() uint16 {
	return 7
}

func (*NewOrderResultResponse) OrigQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrigQtySinceVersion()
}

func (*NewOrderResultResponse) OrigQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) OrigQtyMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) ExecutedQtyId() uint16 {
	return 8
}

func (*NewOrderResultResponse) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ExecutedQtySinceVersion()
}

func (*NewOrderResultResponse) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) ExecutedQtyMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) CummulativeQuoteQtyId() uint16 {
	return 9
}

func (*NewOrderResultResponse) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CummulativeQuoteQtySinceVersion()
}

func (*NewOrderResultResponse) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) CummulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) StatusId() uint16 {
	return 10
}

func (*NewOrderResultResponse) StatusSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StatusSinceVersion()
}

func (*NewOrderResultResponse) StatusDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) StatusMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) TimeInForceId() uint16 {
	return 11
}

func (*NewOrderResultResponse) TimeInForceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TimeInForceSinceVersion()
}

func (*NewOrderResultResponse) TimeInForceDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) TimeInForceMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) OrderTypeId() uint16 {
	return 12
}

func (*NewOrderResultResponse) OrderTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderTypeSinceVersion()
}

func (*NewOrderResultResponse) OrderTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) OrderTypeMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) SideId() uint16 {
	return 13
}

func (*NewOrderResultResponse) SideSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SideSinceVersion()
}

func (*NewOrderResultResponse) SideDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) SideMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) StopPriceId() uint16 {
	return 14
}

func (*NewOrderResultResponse) StopPriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StopPriceSinceVersion()
}

func (*NewOrderResultResponse) StopPriceDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) StopPriceMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) TrailingDeltaId() uint16 {
	return 15
}

func (*NewOrderResultResponse) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TrailingDeltaSinceVersion()
}

func (*NewOrderResultResponse) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) TrailingDeltaMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) TrailingTimeId() uint16 {
	return 16
}

func (*NewOrderResultResponse) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TrailingTimeSinceVersion()
}

func (*NewOrderResultResponse) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) TrailingTimeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) WorkingTimeId() uint16 {
	return 17
}

func (*NewOrderResultResponse) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.WorkingTimeSinceVersion()
}

func (*NewOrderResultResponse) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) WorkingTimeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) IcebergQtyId() uint16 {
	return 18
}

func (*NewOrderResultResponse) IcebergQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.IcebergQtySinceVersion()
}

func (*NewOrderResultResponse) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) IcebergQtyMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) StrategyIdId() uint16 {
	return 19
}

func (*NewOrderResultResponse) StrategyIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StrategyIdSinceVersion()
}

func (*NewOrderResultResponse) StrategyIdDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) StrategyIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) StrategyTypeId() uint16 {
	return 20
}

func (*NewOrderResultResponse) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StrategyTypeSinceVersion()
}

func (*NewOrderResultResponse) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) StrategyTypeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*NewOrderResultResponse) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*NewOrderResultResponse) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*NewOrderResultResponse) OrderCapacityId() uint16 {
	return 21
}

func (*NewOrderResultResponse) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderCapacitySinceVersion()
}

func (*NewOrderResultResponse) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) OrderCapacityMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) WorkingFloorId() uint16 {
	return 22
}

func (*NewOrderResultResponse) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.WorkingFloorSinceVersion()
}

func (*NewOrderResultResponse) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) WorkingFloorMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) SelfTradePreventionModeId() uint16 {
	return 23
}

func (*NewOrderResultResponse) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SelfTradePreventionModeSinceVersion()
}

func (*NewOrderResultResponse) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) TradeGroupIdId() uint16 {
	return 24
}

func (*NewOrderResultResponse) TradeGroupIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) TradeGroupIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TradeGroupIdSinceVersion()
}

func (*NewOrderResultResponse) TradeGroupIdDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) TradeGroupIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) TradeGroupIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) TradeGroupIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) TradeGroupIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) PreventedQuantityId() uint16 {
	return 25
}

func (*NewOrderResultResponse) PreventedQuantitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) PreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PreventedQuantitySinceVersion()
}

func (*NewOrderResultResponse) PreventedQuantityDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) PreventedQuantityMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) PreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) PreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) PreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) UsedSorId() uint16 {
	return 26
}

func (*NewOrderResultResponse) UsedSorSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.UsedSorSinceVersion()
}

func (*NewOrderResultResponse) UsedSorDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) UsedSorMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) OrigQuoteOrderQtyId() uint16 {
	return 27
}

func (*NewOrderResultResponse) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrigQuoteOrderQtySinceVersion()
}

func (*NewOrderResultResponse) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) OrigQuoteOrderQtyMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) PegPriceTypeId() uint16 {
	return 28
}

func (*NewOrderResultResponse) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (n *NewOrderResultResponse) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegPriceTypeSinceVersion()
}

func (*NewOrderResultResponse) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) PegPriceTypeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) PegOffsetTypeId() uint16 {
	return 29
}

func (*NewOrderResultResponse) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (n *NewOrderResultResponse) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegOffsetTypeSinceVersion()
}

func (*NewOrderResultResponse) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) PegOffsetTypeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) PegOffsetValueId() uint16 {
	return 30
}

func (*NewOrderResultResponse) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (n *NewOrderResultResponse) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegOffsetValueSinceVersion()
}

func (*NewOrderResultResponse) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) PegOffsetValueMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*NewOrderResultResponse) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*NewOrderResultResponse) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*NewOrderResultResponse) PeggedPriceId() uint16 {
	return 31
}

func (*NewOrderResultResponse) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (n *NewOrderResultResponse) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PeggedPriceSinceVersion()
}

func (*NewOrderResultResponse) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*NewOrderResultResponse) PeggedPriceMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "optional"
	}
	return ""
}

func (*NewOrderResultResponse) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderResultResponse) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderResultResponse) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderResultResponse) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderResultResponse) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderResultResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderResultResponse) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderResultResponse) ClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderResultResponse) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderResultResponse) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderResultResponse) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderResultResponse) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderResultResponse) ClientOrderIdHeaderLength() uint64 {
	return 1
}

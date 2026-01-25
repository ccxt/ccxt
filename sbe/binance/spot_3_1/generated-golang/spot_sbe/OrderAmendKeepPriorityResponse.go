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

type OrderAmendKeepPriorityResponse struct {
	TransactTime            int64
	ExecutionId             int64
	PriceExponent           int8
	QtyExponent             int8
	OrderId                 int64
	OrderListId             int64
	Price                   int64
	Qty                     int64
	ExecutedQty             int64
	PreventedQty            int64
	CumulativeQuoteQty      int64
	Status                  OrderStatusEnum
	TimeInForce             TimeInForceEnum
	OrderType               OrderTypeEnum
	Side                    OrderSideEnum
	StopPrice               int64
	TrailingDelta           int64
	TrailingTime            int64
	IcebergQty              int64
	WorkingTime             int64
	StrategyId              int64
	StrategyType            int32
	OrderCapacity           OrderCapacityEnum
	WorkingFloor            FloorEnum
	SelfTradePreventionMode SelfTradePreventionModeEnum
	UsedSor                 BoolEnumEnum
	PegPriceType            PegPriceTypeEnum
	PegOffsetType           PegOffsetTypeEnum
	PegOffsetValue          uint8
	PeggedPrice             int64
	ListStatus              []OrderAmendKeepPriorityResponseListStatus
	RelatedOrders           []OrderAmendKeepPriorityResponseRelatedOrders
	Symbol                  []uint8
	OrigClientOrderId       []uint8
	ClientOrderId           []uint8
}
type OrderAmendKeepPriorityResponseListStatus struct {
	OrderListId       int64
	ContingencyType   ContingencyTypeEnum
	ListOrderStatus   ListOrderStatusEnum
	Orders            []OrderAmendKeepPriorityResponseListStatusOrders
	ListClientOrderId []uint8
	Symbol            []uint8
}
type OrderAmendKeepPriorityResponseListStatusOrders struct {
	OrderId       int64
	Symbol        []uint8
	ClientOrderId []uint8
}
type OrderAmendKeepPriorityResponseRelatedOrders struct {
	OrderId                 int64
	OrderListId             int64
	Price                   int64
	Qty                     int64
	ExecutedQty             int64
	PreventedQty            int64
	CumulativeQuoteQty      int64
	Status                  OrderStatusEnum
	TimeInForce             TimeInForceEnum
	OrderType               OrderTypeEnum
	Side                    OrderSideEnum
	StopPrice               int64
	TrailingDelta           int64
	TrailingTime            int64
	IcebergQty              int64
	WorkingTime             int64
	StrategyId              int64
	StrategyType            int32
	OrderCapacity           OrderCapacityEnum
	WorkingFloor            FloorEnum
	SelfTradePreventionMode SelfTradePreventionModeEnum
	UsedSor                 BoolEnumEnum
	PegPriceType            PegPriceTypeEnum
	PegOffsetType           PegOffsetTypeEnum
	PegOffsetValue          uint8
	PeggedPrice             int64
	Symbol                  []uint8
	ClientOrderId           []uint8
}

func (o *OrderAmendKeepPriorityResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, o.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.ExecutionId); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, o.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, o.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.OrderListId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.Qty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.ExecutedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.PreventedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.CumulativeQuoteQty); err != nil {
		return err
	}
	if err := o.Status.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.TimeInForce.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.OrderType.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.Side.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.StopPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.TrailingDelta); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.TrailingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.IcebergQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.WorkingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.StrategyId); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, o.StrategyType); err != nil {
		return err
	}
	if err := o.OrderCapacity.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.WorkingFloor.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.SelfTradePreventionMode.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.UsedSor.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.PegPriceType.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.PegOffsetType.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, o.PegOffsetValue); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.PeggedPrice); err != nil {
		return err
	}
	var ListStatusBlockLength uint16 = 10
	if err := _m.WriteUint16(_w, ListStatusBlockLength); err != nil {
		return err
	}
	var ListStatusNumInGroup uint16 = uint16(len(o.ListStatus))
	if err := _m.WriteUint16(_w, ListStatusNumInGroup); err != nil {
		return err
	}
	for i := range o.ListStatus {
		if err := o.ListStatus[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var RelatedOrdersBlockLength uint16 = 127
	if err := _m.WriteUint16(_w, RelatedOrdersBlockLength); err != nil {
		return err
	}
	var RelatedOrdersNumInGroup uint16 = uint16(len(o.RelatedOrders))
	if err := _m.WriteUint16(_w, RelatedOrdersNumInGroup); err != nil {
		return err
	}
	for i := range o.RelatedOrders {
		if err := o.RelatedOrders[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(o.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.OrigClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.OrigClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (o *OrderAmendKeepPriorityResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !o.TransactTimeInActingVersion(actingVersion) {
		o.TransactTime = o.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.TransactTime); err != nil {
			return err
		}
	}
	if !o.ExecutionIdInActingVersion(actingVersion) {
		o.ExecutionId = o.ExecutionIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.ExecutionId); err != nil {
			return err
		}
	}
	if !o.PriceExponentInActingVersion(actingVersion) {
		o.PriceExponent = o.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &o.PriceExponent); err != nil {
			return err
		}
	}
	if !o.QtyExponentInActingVersion(actingVersion) {
		o.QtyExponent = o.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &o.QtyExponent); err != nil {
			return err
		}
	}
	if !o.OrderIdInActingVersion(actingVersion) {
		o.OrderId = o.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderId); err != nil {
			return err
		}
	}
	if !o.OrderListIdInActingVersion(actingVersion) {
		o.OrderListId = o.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderListId); err != nil {
			return err
		}
	}
	if !o.PriceInActingVersion(actingVersion) {
		o.Price = o.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Price); err != nil {
			return err
		}
	}
	if !o.QtyInActingVersion(actingVersion) {
		o.Qty = o.QtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Qty); err != nil {
			return err
		}
	}
	if !o.ExecutedQtyInActingVersion(actingVersion) {
		o.ExecutedQty = o.ExecutedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.ExecutedQty); err != nil {
			return err
		}
	}
	if !o.PreventedQtyInActingVersion(actingVersion) {
		o.PreventedQty = o.PreventedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.PreventedQty); err != nil {
			return err
		}
	}
	if !o.CumulativeQuoteQtyInActingVersion(actingVersion) {
		o.CumulativeQuoteQty = o.CumulativeQuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.CumulativeQuoteQty); err != nil {
			return err
		}
	}
	if o.StatusInActingVersion(actingVersion) {
		if err := o.Status.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.TimeInForceInActingVersion(actingVersion) {
		if err := o.TimeInForce.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.OrderTypeInActingVersion(actingVersion) {
		if err := o.OrderType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.SideInActingVersion(actingVersion) {
		if err := o.Side.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !o.StopPriceInActingVersion(actingVersion) {
		o.StopPrice = o.StopPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.StopPrice); err != nil {
			return err
		}
	}
	if !o.TrailingDeltaInActingVersion(actingVersion) {
		o.TrailingDelta = o.TrailingDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.TrailingDelta); err != nil {
			return err
		}
	}
	if !o.TrailingTimeInActingVersion(actingVersion) {
		o.TrailingTime = o.TrailingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.TrailingTime); err != nil {
			return err
		}
	}
	if !o.IcebergQtyInActingVersion(actingVersion) {
		o.IcebergQty = o.IcebergQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.IcebergQty); err != nil {
			return err
		}
	}
	if !o.WorkingTimeInActingVersion(actingVersion) {
		o.WorkingTime = o.WorkingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.WorkingTime); err != nil {
			return err
		}
	}
	if !o.StrategyIdInActingVersion(actingVersion) {
		o.StrategyId = o.StrategyIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.StrategyId); err != nil {
			return err
		}
	}
	if !o.StrategyTypeInActingVersion(actingVersion) {
		o.StrategyType = o.StrategyTypeNullValue()
	} else {
		if err := _m.ReadInt32(_r, &o.StrategyType); err != nil {
			return err
		}
	}
	if o.OrderCapacityInActingVersion(actingVersion) {
		if err := o.OrderCapacity.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.WorkingFloorInActingVersion(actingVersion) {
		if err := o.WorkingFloor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.SelfTradePreventionModeInActingVersion(actingVersion) {
		if err := o.SelfTradePreventionMode.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.UsedSorInActingVersion(actingVersion) {
		if err := o.UsedSor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.PegPriceTypeInActingVersion(actingVersion) {
		if err := o.PegPriceType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.PegOffsetTypeInActingVersion(actingVersion) {
		if err := o.PegOffsetType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !o.PegOffsetValueInActingVersion(actingVersion) {
		o.PegOffsetValue = o.PegOffsetValueNullValue()
	} else {
		if err := _m.ReadUint8(_r, &o.PegOffsetValue); err != nil {
			return err
		}
	}
	if !o.PeggedPriceInActingVersion(actingVersion) {
		o.PeggedPrice = o.PeggedPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.PeggedPrice); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.ListStatusInActingVersion(actingVersion) {
		var ListStatusBlockLength uint16
		if err := _m.ReadUint16(_r, &ListStatusBlockLength); err != nil {
			return err
		}
		var ListStatusNumInGroup uint16
		if err := _m.ReadUint16(_r, &ListStatusNumInGroup); err != nil {
			return err
		}
		if cap(o.ListStatus) < int(ListStatusNumInGroup) {
			o.ListStatus = make([]OrderAmendKeepPriorityResponseListStatus, ListStatusNumInGroup)
		}
		o.ListStatus = o.ListStatus[:ListStatusNumInGroup]
		for i := range o.ListStatus {
			if err := o.ListStatus[i].Decode(_m, _r, actingVersion, uint(ListStatusBlockLength)); err != nil {
				return err
			}
		}
	}

	if o.RelatedOrdersInActingVersion(actingVersion) {
		var RelatedOrdersBlockLength uint16
		if err := _m.ReadUint16(_r, &RelatedOrdersBlockLength); err != nil {
			return err
		}
		var RelatedOrdersNumInGroup uint16
		if err := _m.ReadUint16(_r, &RelatedOrdersNumInGroup); err != nil {
			return err
		}
		if cap(o.RelatedOrders) < int(RelatedOrdersNumInGroup) {
			o.RelatedOrders = make([]OrderAmendKeepPriorityResponseRelatedOrders, RelatedOrdersNumInGroup)
		}
		o.RelatedOrders = o.RelatedOrders[:RelatedOrdersNumInGroup]
		for i := range o.RelatedOrders {
			if err := o.RelatedOrders[i].Decode(_m, _r, actingVersion, uint(RelatedOrdersBlockLength)); err != nil {
				return err
			}
		}
	}

	if o.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(o.Symbol) < int(SymbolLength) {
			o.Symbol = make([]uint8, SymbolLength)
		}
		o.Symbol = o.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, o.Symbol); err != nil {
			return err
		}
	}

	if o.OrigClientOrderIdInActingVersion(actingVersion) {
		var OrigClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &OrigClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.OrigClientOrderId) < int(OrigClientOrderIdLength) {
			o.OrigClientOrderId = make([]uint8, OrigClientOrderIdLength)
		}
		o.OrigClientOrderId = o.OrigClientOrderId[:OrigClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.OrigClientOrderId); err != nil {
			return err
		}
	}

	if o.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.ClientOrderId) < int(ClientOrderIdLength) {
			o.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		o.ClientOrderId = o.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.ClientOrderId); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := o.RangeCheck(actingVersion, o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderAmendKeepPriorityResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.TransactTimeInActingVersion(actingVersion) {
		if o.TransactTime < o.TransactTimeMinValue() || o.TransactTime > o.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on o.TransactTime (%v < %v > %v)", o.TransactTimeMinValue(), o.TransactTime, o.TransactTimeMaxValue())
		}
	}
	if o.ExecutionIdInActingVersion(actingVersion) {
		if o.ExecutionId < o.ExecutionIdMinValue() || o.ExecutionId > o.ExecutionIdMaxValue() {
			return fmt.Errorf("Range check failed on o.ExecutionId (%v < %v > %v)", o.ExecutionIdMinValue(), o.ExecutionId, o.ExecutionIdMaxValue())
		}
	}
	if o.PriceExponentInActingVersion(actingVersion) {
		if o.PriceExponent < o.PriceExponentMinValue() || o.PriceExponent > o.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on o.PriceExponent (%v < %v > %v)", o.PriceExponentMinValue(), o.PriceExponent, o.PriceExponentMaxValue())
		}
	}
	if o.QtyExponentInActingVersion(actingVersion) {
		if o.QtyExponent < o.QtyExponentMinValue() || o.QtyExponent > o.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on o.QtyExponent (%v < %v > %v)", o.QtyExponentMinValue(), o.QtyExponent, o.QtyExponentMaxValue())
		}
	}
	if o.OrderIdInActingVersion(actingVersion) {
		if o.OrderId < o.OrderIdMinValue() || o.OrderId > o.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on o.OrderId (%v < %v > %v)", o.OrderIdMinValue(), o.OrderId, o.OrderIdMaxValue())
		}
	}
	if o.OrderListIdInActingVersion(actingVersion) {
		if o.OrderListId != o.OrderListIdNullValue() && (o.OrderListId < o.OrderListIdMinValue() || o.OrderListId > o.OrderListIdMaxValue()) {
			return fmt.Errorf("Range check failed on o.OrderListId (%v < %v > %v)", o.OrderListIdMinValue(), o.OrderListId, o.OrderListIdMaxValue())
		}
	}
	if o.PriceInActingVersion(actingVersion) {
		if o.Price < o.PriceMinValue() || o.Price > o.PriceMaxValue() {
			return fmt.Errorf("Range check failed on o.Price (%v < %v > %v)", o.PriceMinValue(), o.Price, o.PriceMaxValue())
		}
	}
	if o.QtyInActingVersion(actingVersion) {
		if o.Qty < o.QtyMinValue() || o.Qty > o.QtyMaxValue() {
			return fmt.Errorf("Range check failed on o.Qty (%v < %v > %v)", o.QtyMinValue(), o.Qty, o.QtyMaxValue())
		}
	}
	if o.ExecutedQtyInActingVersion(actingVersion) {
		if o.ExecutedQty < o.ExecutedQtyMinValue() || o.ExecutedQty > o.ExecutedQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.ExecutedQty (%v < %v > %v)", o.ExecutedQtyMinValue(), o.ExecutedQty, o.ExecutedQtyMaxValue())
		}
	}
	if o.PreventedQtyInActingVersion(actingVersion) {
		if o.PreventedQty < o.PreventedQtyMinValue() || o.PreventedQty > o.PreventedQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.PreventedQty (%v < %v > %v)", o.PreventedQtyMinValue(), o.PreventedQty, o.PreventedQtyMaxValue())
		}
	}
	if o.CumulativeQuoteQtyInActingVersion(actingVersion) {
		if o.CumulativeQuoteQty < o.CumulativeQuoteQtyMinValue() || o.CumulativeQuoteQty > o.CumulativeQuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.CumulativeQuoteQty (%v < %v > %v)", o.CumulativeQuoteQtyMinValue(), o.CumulativeQuoteQty, o.CumulativeQuoteQtyMaxValue())
		}
	}
	if err := o.Status.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.TimeInForce.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.OrderType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.Side.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if o.StopPriceInActingVersion(actingVersion) {
		if o.StopPrice != o.StopPriceNullValue() && (o.StopPrice < o.StopPriceMinValue() || o.StopPrice > o.StopPriceMaxValue()) {
			return fmt.Errorf("Range check failed on o.StopPrice (%v < %v > %v)", o.StopPriceMinValue(), o.StopPrice, o.StopPriceMaxValue())
		}
	}
	if o.TrailingDeltaInActingVersion(actingVersion) {
		if o.TrailingDelta != o.TrailingDeltaNullValue() && (o.TrailingDelta < o.TrailingDeltaMinValue() || o.TrailingDelta > o.TrailingDeltaMaxValue()) {
			return fmt.Errorf("Range check failed on o.TrailingDelta (%v < %v > %v)", o.TrailingDeltaMinValue(), o.TrailingDelta, o.TrailingDeltaMaxValue())
		}
	}
	if o.TrailingTimeInActingVersion(actingVersion) {
		if o.TrailingTime != o.TrailingTimeNullValue() && (o.TrailingTime < o.TrailingTimeMinValue() || o.TrailingTime > o.TrailingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on o.TrailingTime (%v < %v > %v)", o.TrailingTimeMinValue(), o.TrailingTime, o.TrailingTimeMaxValue())
		}
	}
	if o.IcebergQtyInActingVersion(actingVersion) {
		if o.IcebergQty != o.IcebergQtyNullValue() && (o.IcebergQty < o.IcebergQtyMinValue() || o.IcebergQty > o.IcebergQtyMaxValue()) {
			return fmt.Errorf("Range check failed on o.IcebergQty (%v < %v > %v)", o.IcebergQtyMinValue(), o.IcebergQty, o.IcebergQtyMaxValue())
		}
	}
	if o.WorkingTimeInActingVersion(actingVersion) {
		if o.WorkingTime != o.WorkingTimeNullValue() && (o.WorkingTime < o.WorkingTimeMinValue() || o.WorkingTime > o.WorkingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on o.WorkingTime (%v < %v > %v)", o.WorkingTimeMinValue(), o.WorkingTime, o.WorkingTimeMaxValue())
		}
	}
	if o.StrategyIdInActingVersion(actingVersion) {
		if o.StrategyId != o.StrategyIdNullValue() && (o.StrategyId < o.StrategyIdMinValue() || o.StrategyId > o.StrategyIdMaxValue()) {
			return fmt.Errorf("Range check failed on o.StrategyId (%v < %v > %v)", o.StrategyIdMinValue(), o.StrategyId, o.StrategyIdMaxValue())
		}
	}
	if o.StrategyTypeInActingVersion(actingVersion) {
		if o.StrategyType != o.StrategyTypeNullValue() && (o.StrategyType < o.StrategyTypeMinValue() || o.StrategyType > o.StrategyTypeMaxValue()) {
			return fmt.Errorf("Range check failed on o.StrategyType (%v < %v > %v)", o.StrategyTypeMinValue(), o.StrategyType, o.StrategyTypeMaxValue())
		}
	}
	if err := o.OrderCapacity.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.WorkingFloor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.SelfTradePreventionMode.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.UsedSor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.PegPriceType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.PegOffsetType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if o.PegOffsetValueInActingVersion(actingVersion) {
		if o.PegOffsetValue != o.PegOffsetValueNullValue() && (o.PegOffsetValue < o.PegOffsetValueMinValue() || o.PegOffsetValue > o.PegOffsetValueMaxValue()) {
			return fmt.Errorf("Range check failed on o.PegOffsetValue (%v < %v > %v)", o.PegOffsetValueMinValue(), o.PegOffsetValue, o.PegOffsetValueMaxValue())
		}
	}
	if o.PeggedPriceInActingVersion(actingVersion) {
		if o.PeggedPrice != o.PeggedPriceNullValue() && (o.PeggedPrice < o.PeggedPriceMinValue() || o.PeggedPrice > o.PeggedPriceMaxValue()) {
			return fmt.Errorf("Range check failed on o.PeggedPrice (%v < %v > %v)", o.PeggedPriceMinValue(), o.PeggedPrice, o.PeggedPriceMaxValue())
		}
	}
	for i := range o.ListStatus {
		if err := o.ListStatus[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range o.RelatedOrders {
		if err := o.RelatedOrders[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(o.Symbol[:]) {
		return errors.New("o.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(o.OrigClientOrderId[:]) {
		return errors.New("o.OrigClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(o.ClientOrderId[:]) {
		return errors.New("o.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func OrderAmendKeepPriorityResponseInit(o *OrderAmendKeepPriorityResponse) {
	o.OrderListId = math.MinInt64
	o.StopPrice = math.MinInt64
	o.TrailingDelta = math.MinInt64
	o.TrailingTime = math.MinInt64
	o.IcebergQty = math.MinInt64
	o.WorkingTime = math.MinInt64
	o.StrategyId = math.MinInt64
	o.StrategyType = math.MinInt32
	o.PegOffsetValue = math.MaxUint8
	o.PeggedPrice = math.MinInt64
	return
}

func (o *OrderAmendKeepPriorityResponseListStatus) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, o.OrderListId); err != nil {
		return err
	}
	if err := o.ContingencyType.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.ListOrderStatus.Encode(_m, _w); err != nil {
		return err
	}
	var OrdersBlockLength uint16 = 8
	if err := _m.WriteUint16(_w, OrdersBlockLength); err != nil {
		return err
	}
	var OrdersNumInGroup uint16 = uint16(len(o.Orders))
	if err := _m.WriteUint16(_w, OrdersNumInGroup); err != nil {
		return err
	}
	for i := range o.Orders {
		if err := o.Orders[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(o.ListClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.ListClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.Symbol); err != nil {
		return err
	}
	return nil
}

func (o *OrderAmendKeepPriorityResponseListStatus) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !o.OrderListIdInActingVersion(actingVersion) {
		o.OrderListId = o.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderListId); err != nil {
			return err
		}
	}
	if o.ContingencyTypeInActingVersion(actingVersion) {
		if err := o.ContingencyType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.ListOrderStatusInActingVersion(actingVersion) {
		if err := o.ListOrderStatus.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.OrdersInActingVersion(actingVersion) {
		var OrdersBlockLength uint16
		if err := _m.ReadUint16(_r, &OrdersBlockLength); err != nil {
			return err
		}
		var OrdersNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrdersNumInGroup); err != nil {
			return err
		}
		if cap(o.Orders) < int(OrdersNumInGroup) {
			o.Orders = make([]OrderAmendKeepPriorityResponseListStatusOrders, OrdersNumInGroup)
		}
		o.Orders = o.Orders[:OrdersNumInGroup]
		for i := range o.Orders {
			if err := o.Orders[i].Decode(_m, _r, actingVersion, uint(OrdersBlockLength)); err != nil {
				return err
			}
		}
	}

	if o.ListClientOrderIdInActingVersion(actingVersion) {
		var ListClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ListClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.ListClientOrderId) < int(ListClientOrderIdLength) {
			o.ListClientOrderId = make([]uint8, ListClientOrderIdLength)
		}
		o.ListClientOrderId = o.ListClientOrderId[:ListClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.ListClientOrderId); err != nil {
			return err
		}
	}

	if o.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(o.Symbol) < int(SymbolLength) {
			o.Symbol = make([]uint8, SymbolLength)
		}
		o.Symbol = o.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, o.Symbol); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderAmendKeepPriorityResponseListStatus) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.OrderListIdInActingVersion(actingVersion) {
		if o.OrderListId < o.OrderListIdMinValue() || o.OrderListId > o.OrderListIdMaxValue() {
			return fmt.Errorf("Range check failed on o.OrderListId (%v < %v > %v)", o.OrderListIdMinValue(), o.OrderListId, o.OrderListIdMaxValue())
		}
	}
	if err := o.ContingencyType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.ListOrderStatus.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	for i := range o.Orders {
		if err := o.Orders[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(o.ListClientOrderId[:]) {
		return errors.New("o.ListClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(o.Symbol[:]) {
		return errors.New("o.Symbol failed UTF-8 validation")
	}
	return nil
}

func OrderAmendKeepPriorityResponseListStatusInit(o *OrderAmendKeepPriorityResponseListStatus) {
	return
}

func (o *OrderAmendKeepPriorityResponseListStatusOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, o.OrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (o *OrderAmendKeepPriorityResponseListStatusOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !o.OrderIdInActingVersion(actingVersion) {
		o.OrderId = o.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderId); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(o.Symbol) < int(SymbolLength) {
			o.Symbol = make([]uint8, SymbolLength)
		}
		o.Symbol = o.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, o.Symbol); err != nil {
			return err
		}
	}

	if o.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.ClientOrderId) < int(ClientOrderIdLength) {
			o.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		o.ClientOrderId = o.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.ClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderAmendKeepPriorityResponseListStatusOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.OrderIdInActingVersion(actingVersion) {
		if o.OrderId < o.OrderIdMinValue() || o.OrderId > o.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on o.OrderId (%v < %v > %v)", o.OrderIdMinValue(), o.OrderId, o.OrderIdMaxValue())
		}
	}
	if !utf8.Valid(o.Symbol[:]) {
		return errors.New("o.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(o.ClientOrderId[:]) {
		return errors.New("o.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func OrderAmendKeepPriorityResponseListStatusOrdersInit(o *OrderAmendKeepPriorityResponseListStatusOrders) {
	return
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, o.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.OrderListId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.Qty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.ExecutedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.PreventedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.CumulativeQuoteQty); err != nil {
		return err
	}
	if err := o.Status.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.TimeInForce.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.OrderType.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.Side.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.StopPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.TrailingDelta); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.TrailingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.IcebergQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.WorkingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.StrategyId); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, o.StrategyType); err != nil {
		return err
	}
	if err := o.OrderCapacity.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.WorkingFloor.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.SelfTradePreventionMode.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.UsedSor.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.PegPriceType.Encode(_m, _w); err != nil {
		return err
	}
	if err := o.PegOffsetType.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, o.PegOffsetValue); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.PeggedPrice); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(o.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, o.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !o.OrderIdInActingVersion(actingVersion) {
		o.OrderId = o.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderId); err != nil {
			return err
		}
	}
	if !o.OrderListIdInActingVersion(actingVersion) {
		o.OrderListId = o.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrderListId); err != nil {
			return err
		}
	}
	if !o.PriceInActingVersion(actingVersion) {
		o.Price = o.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Price); err != nil {
			return err
		}
	}
	if !o.QtyInActingVersion(actingVersion) {
		o.Qty = o.QtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Qty); err != nil {
			return err
		}
	}
	if !o.ExecutedQtyInActingVersion(actingVersion) {
		o.ExecutedQty = o.ExecutedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.ExecutedQty); err != nil {
			return err
		}
	}
	if !o.PreventedQtyInActingVersion(actingVersion) {
		o.PreventedQty = o.PreventedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.PreventedQty); err != nil {
			return err
		}
	}
	if !o.CumulativeQuoteQtyInActingVersion(actingVersion) {
		o.CumulativeQuoteQty = o.CumulativeQuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.CumulativeQuoteQty); err != nil {
			return err
		}
	}
	if o.StatusInActingVersion(actingVersion) {
		if err := o.Status.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.TimeInForceInActingVersion(actingVersion) {
		if err := o.TimeInForce.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.OrderTypeInActingVersion(actingVersion) {
		if err := o.OrderType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.SideInActingVersion(actingVersion) {
		if err := o.Side.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !o.StopPriceInActingVersion(actingVersion) {
		o.StopPrice = o.StopPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.StopPrice); err != nil {
			return err
		}
	}
	if !o.TrailingDeltaInActingVersion(actingVersion) {
		o.TrailingDelta = o.TrailingDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.TrailingDelta); err != nil {
			return err
		}
	}
	if !o.TrailingTimeInActingVersion(actingVersion) {
		o.TrailingTime = o.TrailingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.TrailingTime); err != nil {
			return err
		}
	}
	if !o.IcebergQtyInActingVersion(actingVersion) {
		o.IcebergQty = o.IcebergQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.IcebergQty); err != nil {
			return err
		}
	}
	if !o.WorkingTimeInActingVersion(actingVersion) {
		o.WorkingTime = o.WorkingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.WorkingTime); err != nil {
			return err
		}
	}
	if !o.StrategyIdInActingVersion(actingVersion) {
		o.StrategyId = o.StrategyIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.StrategyId); err != nil {
			return err
		}
	}
	if !o.StrategyTypeInActingVersion(actingVersion) {
		o.StrategyType = o.StrategyTypeNullValue()
	} else {
		if err := _m.ReadInt32(_r, &o.StrategyType); err != nil {
			return err
		}
	}
	if o.OrderCapacityInActingVersion(actingVersion) {
		if err := o.OrderCapacity.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.WorkingFloorInActingVersion(actingVersion) {
		if err := o.WorkingFloor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.SelfTradePreventionModeInActingVersion(actingVersion) {
		if err := o.SelfTradePreventionMode.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.UsedSorInActingVersion(actingVersion) {
		if err := o.UsedSor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.PegPriceTypeInActingVersion(actingVersion) {
		if err := o.PegPriceType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if o.PegOffsetTypeInActingVersion(actingVersion) {
		if err := o.PegOffsetType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !o.PegOffsetValueInActingVersion(actingVersion) {
		o.PegOffsetValue = o.PegOffsetValueNullValue()
	} else {
		if err := _m.ReadUint8(_r, &o.PegOffsetValue); err != nil {
			return err
		}
	}
	if !o.PeggedPriceInActingVersion(actingVersion) {
		o.PeggedPrice = o.PeggedPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.PeggedPrice); err != nil {
			return err
		}
	}
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(o.Symbol) < int(SymbolLength) {
			o.Symbol = make([]uint8, SymbolLength)
		}
		o.Symbol = o.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, o.Symbol); err != nil {
			return err
		}
	}

	if o.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(o.ClientOrderId) < int(ClientOrderIdLength) {
			o.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		o.ClientOrderId = o.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, o.ClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if o.OrderIdInActingVersion(actingVersion) {
		if o.OrderId < o.OrderIdMinValue() || o.OrderId > o.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on o.OrderId (%v < %v > %v)", o.OrderIdMinValue(), o.OrderId, o.OrderIdMaxValue())
		}
	}
	if o.OrderListIdInActingVersion(actingVersion) {
		if o.OrderListId != o.OrderListIdNullValue() && (o.OrderListId < o.OrderListIdMinValue() || o.OrderListId > o.OrderListIdMaxValue()) {
			return fmt.Errorf("Range check failed on o.OrderListId (%v < %v > %v)", o.OrderListIdMinValue(), o.OrderListId, o.OrderListIdMaxValue())
		}
	}
	if o.PriceInActingVersion(actingVersion) {
		if o.Price < o.PriceMinValue() || o.Price > o.PriceMaxValue() {
			return fmt.Errorf("Range check failed on o.Price (%v < %v > %v)", o.PriceMinValue(), o.Price, o.PriceMaxValue())
		}
	}
	if o.QtyInActingVersion(actingVersion) {
		if o.Qty < o.QtyMinValue() || o.Qty > o.QtyMaxValue() {
			return fmt.Errorf("Range check failed on o.Qty (%v < %v > %v)", o.QtyMinValue(), o.Qty, o.QtyMaxValue())
		}
	}
	if o.ExecutedQtyInActingVersion(actingVersion) {
		if o.ExecutedQty < o.ExecutedQtyMinValue() || o.ExecutedQty > o.ExecutedQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.ExecutedQty (%v < %v > %v)", o.ExecutedQtyMinValue(), o.ExecutedQty, o.ExecutedQtyMaxValue())
		}
	}
	if o.PreventedQtyInActingVersion(actingVersion) {
		if o.PreventedQty < o.PreventedQtyMinValue() || o.PreventedQty > o.PreventedQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.PreventedQty (%v < %v > %v)", o.PreventedQtyMinValue(), o.PreventedQty, o.PreventedQtyMaxValue())
		}
	}
	if o.CumulativeQuoteQtyInActingVersion(actingVersion) {
		if o.CumulativeQuoteQty < o.CumulativeQuoteQtyMinValue() || o.CumulativeQuoteQty > o.CumulativeQuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.CumulativeQuoteQty (%v < %v > %v)", o.CumulativeQuoteQtyMinValue(), o.CumulativeQuoteQty, o.CumulativeQuoteQtyMaxValue())
		}
	}
	if err := o.Status.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.TimeInForce.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.OrderType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.Side.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if o.StopPriceInActingVersion(actingVersion) {
		if o.StopPrice != o.StopPriceNullValue() && (o.StopPrice < o.StopPriceMinValue() || o.StopPrice > o.StopPriceMaxValue()) {
			return fmt.Errorf("Range check failed on o.StopPrice (%v < %v > %v)", o.StopPriceMinValue(), o.StopPrice, o.StopPriceMaxValue())
		}
	}
	if o.TrailingDeltaInActingVersion(actingVersion) {
		if o.TrailingDelta != o.TrailingDeltaNullValue() && (o.TrailingDelta < o.TrailingDeltaMinValue() || o.TrailingDelta > o.TrailingDeltaMaxValue()) {
			return fmt.Errorf("Range check failed on o.TrailingDelta (%v < %v > %v)", o.TrailingDeltaMinValue(), o.TrailingDelta, o.TrailingDeltaMaxValue())
		}
	}
	if o.TrailingTimeInActingVersion(actingVersion) {
		if o.TrailingTime != o.TrailingTimeNullValue() && (o.TrailingTime < o.TrailingTimeMinValue() || o.TrailingTime > o.TrailingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on o.TrailingTime (%v < %v > %v)", o.TrailingTimeMinValue(), o.TrailingTime, o.TrailingTimeMaxValue())
		}
	}
	if o.IcebergQtyInActingVersion(actingVersion) {
		if o.IcebergQty != o.IcebergQtyNullValue() && (o.IcebergQty < o.IcebergQtyMinValue() || o.IcebergQty > o.IcebergQtyMaxValue()) {
			return fmt.Errorf("Range check failed on o.IcebergQty (%v < %v > %v)", o.IcebergQtyMinValue(), o.IcebergQty, o.IcebergQtyMaxValue())
		}
	}
	if o.WorkingTimeInActingVersion(actingVersion) {
		if o.WorkingTime != o.WorkingTimeNullValue() && (o.WorkingTime < o.WorkingTimeMinValue() || o.WorkingTime > o.WorkingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on o.WorkingTime (%v < %v > %v)", o.WorkingTimeMinValue(), o.WorkingTime, o.WorkingTimeMaxValue())
		}
	}
	if o.StrategyIdInActingVersion(actingVersion) {
		if o.StrategyId != o.StrategyIdNullValue() && (o.StrategyId < o.StrategyIdMinValue() || o.StrategyId > o.StrategyIdMaxValue()) {
			return fmt.Errorf("Range check failed on o.StrategyId (%v < %v > %v)", o.StrategyIdMinValue(), o.StrategyId, o.StrategyIdMaxValue())
		}
	}
	if o.StrategyTypeInActingVersion(actingVersion) {
		if o.StrategyType != o.StrategyTypeNullValue() && (o.StrategyType < o.StrategyTypeMinValue() || o.StrategyType > o.StrategyTypeMaxValue()) {
			return fmt.Errorf("Range check failed on o.StrategyType (%v < %v > %v)", o.StrategyTypeMinValue(), o.StrategyType, o.StrategyTypeMaxValue())
		}
	}
	if err := o.OrderCapacity.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.WorkingFloor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.SelfTradePreventionMode.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.UsedSor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.PegPriceType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := o.PegOffsetType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if o.PegOffsetValueInActingVersion(actingVersion) {
		if o.PegOffsetValue != o.PegOffsetValueNullValue() && (o.PegOffsetValue < o.PegOffsetValueMinValue() || o.PegOffsetValue > o.PegOffsetValueMaxValue()) {
			return fmt.Errorf("Range check failed on o.PegOffsetValue (%v < %v > %v)", o.PegOffsetValueMinValue(), o.PegOffsetValue, o.PegOffsetValueMaxValue())
		}
	}
	if o.PeggedPriceInActingVersion(actingVersion) {
		if o.PeggedPrice != o.PeggedPriceNullValue() && (o.PeggedPrice < o.PeggedPriceMinValue() || o.PeggedPrice > o.PeggedPriceMaxValue()) {
			return fmt.Errorf("Range check failed on o.PeggedPrice (%v < %v > %v)", o.PeggedPriceMinValue(), o.PeggedPrice, o.PeggedPriceMaxValue())
		}
	}
	if !utf8.Valid(o.Symbol[:]) {
		return errors.New("o.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(o.ClientOrderId[:]) {
		return errors.New("o.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func OrderAmendKeepPriorityResponseRelatedOrdersInit(o *OrderAmendKeepPriorityResponseRelatedOrders) {
	o.OrderListId = math.MinInt64
	o.StopPrice = math.MinInt64
	o.TrailingDelta = math.MinInt64
	o.TrailingTime = math.MinInt64
	o.IcebergQty = math.MinInt64
	o.WorkingTime = math.MinInt64
	o.StrategyId = math.MinInt64
	o.StrategyType = math.MinInt32
	o.PegOffsetValue = math.MaxUint8
	o.PeggedPrice = math.MinInt64
	return
}

func (*OrderAmendKeepPriorityResponse) SbeBlockLength() (blockLength uint16) {
	return 145
}

func (*OrderAmendKeepPriorityResponse) SbeTemplateId() (templateId uint16) {
	return 317
}

func (*OrderAmendKeepPriorityResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OrderAmendKeepPriorityResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderAmendKeepPriorityResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OrderAmendKeepPriorityResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*OrderAmendKeepPriorityResponse) TransactTimeId() uint16 {
	return 1
}

func (*OrderAmendKeepPriorityResponse) TransactTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TransactTimeSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) TransactTimeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) TransactTimeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) ExecutionIdId() uint16 {
	return 2
}

func (*OrderAmendKeepPriorityResponse) ExecutionIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) ExecutionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExecutionIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) ExecutionIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) ExecutionIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) ExecutionIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) ExecutionIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) ExecutionIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) PriceExponentId() uint16 {
	return 3
}

func (*OrderAmendKeepPriorityResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PriceExponentSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrderAmendKeepPriorityResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrderAmendKeepPriorityResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrderAmendKeepPriorityResponse) QtyExponentId() uint16 {
	return 4
}

func (*OrderAmendKeepPriorityResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.QtyExponentSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrderAmendKeepPriorityResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrderAmendKeepPriorityResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrderAmendKeepPriorityResponse) OrderIdId() uint16 {
	return 5
}

func (*OrderAmendKeepPriorityResponse) OrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) OrderIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) OrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) OrderListIdId() uint16 {
	return 6
}

func (*OrderAmendKeepPriorityResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderListIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) PriceId() uint16 {
	return 7
}

func (*OrderAmendKeepPriorityResponse) PriceSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PriceSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) PriceDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) PriceMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) PriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) QtyId() uint16 {
	return 8
}

func (*OrderAmendKeepPriorityResponse) QtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.QtySinceVersion()
}

func (*OrderAmendKeepPriorityResponse) QtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) QtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) QtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) ExecutedQtyId() uint16 {
	return 9
}

func (*OrderAmendKeepPriorityResponse) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExecutedQtySinceVersion()
}

func (*OrderAmendKeepPriorityResponse) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) ExecutedQtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) PreventedQtyId() uint16 {
	return 10
}

func (*OrderAmendKeepPriorityResponse) PreventedQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) PreventedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PreventedQtySinceVersion()
}

func (*OrderAmendKeepPriorityResponse) PreventedQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) PreventedQtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) PreventedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) PreventedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) PreventedQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) CumulativeQuoteQtyId() uint16 {
	return 11
}

func (*OrderAmendKeepPriorityResponse) CumulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) CumulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.CumulativeQuoteQtySinceVersion()
}

func (*OrderAmendKeepPriorityResponse) CumulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) CumulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) CumulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) CumulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) CumulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) StatusId() uint16 {
	return 12
}

func (*OrderAmendKeepPriorityResponse) StatusSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StatusSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) StatusDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) StatusMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) TimeInForceId() uint16 {
	return 13
}

func (*OrderAmendKeepPriorityResponse) TimeInForceSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TimeInForceSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) TimeInForceDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) TimeInForceMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) OrderTypeId() uint16 {
	return 14
}

func (*OrderAmendKeepPriorityResponse) OrderTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) OrderTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) OrderTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) SideId() uint16 {
	return 15
}

func (*OrderAmendKeepPriorityResponse) SideSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SideSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) SideDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) SideMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) StopPriceId() uint16 {
	return 16
}

func (*OrderAmendKeepPriorityResponse) StopPriceSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StopPriceSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) StopPriceDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) StopPriceMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) TrailingDeltaId() uint16 {
	return 17
}

func (*OrderAmendKeepPriorityResponse) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TrailingDeltaSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) TrailingDeltaMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) TrailingTimeId() uint16 {
	return 18
}

func (*OrderAmendKeepPriorityResponse) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TrailingTimeSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) TrailingTimeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) IcebergQtyId() uint16 {
	return 19
}

func (*OrderAmendKeepPriorityResponse) IcebergQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.IcebergQtySinceVersion()
}

func (*OrderAmendKeepPriorityResponse) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) IcebergQtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) WorkingTimeId() uint16 {
	return 20
}

func (*OrderAmendKeepPriorityResponse) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.WorkingTimeSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) WorkingTimeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) StrategyIdId() uint16 {
	return 21
}

func (*OrderAmendKeepPriorityResponse) StrategyIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StrategyIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) StrategyIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) StrategyIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponse) StrategyTypeId() uint16 {
	return 22
}

func (*OrderAmendKeepPriorityResponse) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StrategyTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) StrategyTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*OrderAmendKeepPriorityResponse) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*OrderAmendKeepPriorityResponse) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*OrderAmendKeepPriorityResponse) OrderCapacityId() uint16 {
	return 23
}

func (*OrderAmendKeepPriorityResponse) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderCapacitySinceVersion()
}

func (*OrderAmendKeepPriorityResponse) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) OrderCapacityMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) WorkingFloorId() uint16 {
	return 24
}

func (*OrderAmendKeepPriorityResponse) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.WorkingFloorSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) WorkingFloorMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) SelfTradePreventionModeId() uint16 {
	return 25
}

func (*OrderAmendKeepPriorityResponse) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SelfTradePreventionModeSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) UsedSorId() uint16 {
	return 26
}

func (*OrderAmendKeepPriorityResponse) UsedSorSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.UsedSorSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) UsedSorDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) UsedSorMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) PegPriceTypeId() uint16 {
	return 27
}

func (*OrderAmendKeepPriorityResponse) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (o *OrderAmendKeepPriorityResponse) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegPriceTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) PegPriceTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) PegOffsetTypeId() uint16 {
	return 28
}

func (*OrderAmendKeepPriorityResponse) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (o *OrderAmendKeepPriorityResponse) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegOffsetTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) PegOffsetValueId() uint16 {
	return 29
}

func (*OrderAmendKeepPriorityResponse) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (o *OrderAmendKeepPriorityResponse) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegOffsetValueSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) PegOffsetValueMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OrderAmendKeepPriorityResponse) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*OrderAmendKeepPriorityResponse) PeggedPriceId() uint16 {
	return 30
}

func (*OrderAmendKeepPriorityResponse) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (o *OrderAmendKeepPriorityResponse) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PeggedPriceSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponse) PeggedPriceMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponse) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponse) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseListStatus) OrderListIdId() uint16 {
	return 1
}

func (*OrderAmendKeepPriorityResponseListStatus) OrderListIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatus) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderListIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatus) OrderListIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseListStatus) OrderListIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseListStatus) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseListStatus) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseListStatus) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseListStatus) ContingencyTypeId() uint16 {
	return 2
}

func (*OrderAmendKeepPriorityResponseListStatus) ContingencyTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatus) ContingencyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ContingencyTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatus) ContingencyTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseListStatus) ContingencyTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseListStatus) ListOrderStatusId() uint16 {
	return 3
}

func (*OrderAmendKeepPriorityResponseListStatus) ListOrderStatusSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatus) ListOrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListOrderStatusSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatus) ListOrderStatusDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseListStatus) ListOrderStatusMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseListStatusOrders) OrderIdId() uint16 {
	return 1
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatusOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) OrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseListStatusOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) SymbolMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseListStatusOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatusOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) SymbolDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponseListStatusOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponseListStatusOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseListStatusOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatusOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ClientOrderIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponseListStatusOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponseListStatusOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderAmendKeepPriorityResponseListStatus) ListClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseListStatus) ListClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatus) ListClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListClientOrderIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatus) ListClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponseListStatus) ListClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponseListStatus) ListClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderAmendKeepPriorityResponseListStatus) SymbolMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseListStatus) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatus) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatus) SymbolDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponseListStatus) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponseListStatus) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderIdId() uint16 {
	return 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderListIdId() uint16 {
	return 2
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderListIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderListIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderListIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderListIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PriceId() uint16 {
	return 3
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PriceSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PriceSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PriceDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PriceMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) QtyId() uint16 {
	return 4
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) QtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.QtySinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) QtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) QtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) QtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) ExecutedQtyId() uint16 {
	return 5
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExecutedQtySinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) ExecutedQtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PreventedQtyId() uint16 {
	return 6
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PreventedQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) PreventedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PreventedQtySinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PreventedQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PreventedQtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) PreventedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PreventedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PreventedQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) CumulativeQuoteQtyId() uint16 {
	return 7
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) CumulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) CumulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.CumulativeQuoteQtySinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) CumulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) CumulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) CumulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) CumulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) CumulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StatusId() uint16 {
	return 8
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StatusSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StatusSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StatusDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StatusMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) TimeInForceId() uint16 {
	return 9
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TimeInForceSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TimeInForceSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TimeInForceDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TimeInForceMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderTypeId() uint16 {
	return 10
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) SideId() uint16 {
	return 11
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SideSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SideSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SideDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SideMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) StopPriceId() uint16 {
	return 12
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StopPriceSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StopPriceSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StopPriceDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StopPriceMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingDeltaId() uint16 {
	return 13
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TrailingDeltaSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingDeltaMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingTimeId() uint16 {
	return 14
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TrailingTimeSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingTimeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) IcebergQtyId() uint16 {
	return 15
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) IcebergQtySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.IcebergQtySinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) IcebergQtyMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingTimeId() uint16 {
	return 16
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.WorkingTimeSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingTimeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyIdId() uint16 {
	return 17
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StrategyIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyIdDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyTypeId() uint16 {
	return 18
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StrategyTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderCapacityId() uint16 {
	return 19
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderCapacitySinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) OrderCapacityMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingFloorId() uint16 {
	return 20
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.WorkingFloorSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) WorkingFloorMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) SelfTradePreventionModeId() uint16 {
	return 21
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SelfTradePreventionModeSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) UsedSorId() uint16 {
	return 22
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) UsedSorSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.UsedSorSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) UsedSorDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) UsedSorMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegPriceTypeId() uint16 {
	return 23
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegPriceTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegPriceTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetTypeId() uint16 {
	return 24
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegOffsetTypeSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetValueId() uint16 {
	return 25
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegOffsetValueSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetValueMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PeggedPriceId() uint16 {
	return 26
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PeggedPriceSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PeggedPriceMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SymbolMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SymbolDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponseRelatedOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponseRelatedOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponseRelatedOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseRelatedOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ClientOrderIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponseRelatedOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponseRelatedOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderAmendKeepPriorityResponse) ListStatusId() uint16 {
	return 101
}

func (*OrderAmendKeepPriorityResponse) ListStatusSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) ListStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ListStatusSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) ListStatusDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseListStatus) SbeBlockLength() (blockLength uint) {
	return 10
}

func (*OrderAmendKeepPriorityResponseListStatus) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderAmendKeepPriorityResponseListStatus) OrdersId() uint16 {
	return 100
}

func (*OrderAmendKeepPriorityResponseListStatus) OrdersSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponseListStatus) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrdersSinceVersion()
}

func (*OrderAmendKeepPriorityResponseListStatus) OrdersDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) SbeBlockLength() (blockLength uint) {
	return 8
}

func (*OrderAmendKeepPriorityResponseListStatusOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderAmendKeepPriorityResponse) RelatedOrdersId() uint16 {
	return 102
}

func (*OrderAmendKeepPriorityResponse) RelatedOrdersSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) RelatedOrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.RelatedOrdersSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) RelatedOrdersDeprecated() uint16 {
	return 0
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SbeBlockLength() (blockLength uint) {
	return 127
}

func (*OrderAmendKeepPriorityResponseRelatedOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderAmendKeepPriorityResponse) SymbolMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) SymbolDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponse) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderAmendKeepPriorityResponse) OrigClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) OrigClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) OrigClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrigClientOrderIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) OrigClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponse) OrigClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponse) OrigClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrderAmendKeepPriorityResponse) ClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderAmendKeepPriorityResponse) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderAmendKeepPriorityResponse) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ClientOrderIdSinceVersion()
}

func (*OrderAmendKeepPriorityResponse) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderAmendKeepPriorityResponse) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderAmendKeepPriorityResponse) ClientOrderIdHeaderLength() uint64 {
	return 1
}

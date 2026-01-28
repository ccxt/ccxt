// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type OrdersResponse struct {
	Orders []OrdersResponseOrders
}
type OrdersResponseOrders struct {
	PriceExponent           int8
	QtyExponent             int8
	OrderId                 int64
	OrderListId             int64
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
	IcebergQty              int64
	Time                    int64
	UpdateTime              int64
	IsWorking               BoolEnumEnum
	WorkingTime             int64
	OrigQuoteOrderQty       int64
	StrategyId              int64
	StrategyType            int32
	OrderCapacity           OrderCapacityEnum
	WorkingFloor            FloorEnum
	SelfTradePreventionMode SelfTradePreventionModeEnum
	PreventedMatchId        int64
	PreventedQuantity       int64
	UsedSor                 BoolEnumEnum
	PegPriceType            PegPriceTypeEnum
	PegOffsetType           PegOffsetTypeEnum
	PegOffsetValue          uint8
	PeggedPrice             int64
	Symbol                  []uint8
	ClientOrderId           []uint8
}

func (o *OrdersResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	var OrdersBlockLength uint16 = 162
	if err := _m.WriteUint16(_w, OrdersBlockLength); err != nil {
		return err
	}
	var OrdersNumInGroup uint32 = uint32(len(o.Orders))
	if err := _m.WriteUint32(_w, OrdersNumInGroup); err != nil {
		return err
	}
	for i := range o.Orders {
		if err := o.Orders[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrdersResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if actingVersion > o.SbeSchemaVersion() && blockLength > o.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-o.SbeBlockLength()))
	}

	if o.OrdersInActingVersion(actingVersion) {
		var OrdersBlockLength uint16
		if err := _m.ReadUint16(_r, &OrdersBlockLength); err != nil {
			return err
		}
		var OrdersNumInGroup uint32
		if err := _m.ReadUint32(_r, &OrdersNumInGroup); err != nil {
			return err
		}
		if cap(o.Orders) < int(OrdersNumInGroup) {
			o.Orders = make([]OrdersResponseOrders, OrdersNumInGroup)
		}
		o.Orders = o.Orders[:OrdersNumInGroup]
		for i := range o.Orders {
			if err := o.Orders[i].Decode(_m, _r, actingVersion, uint(OrdersBlockLength)); err != nil {
				return err
			}
		}
	}
	if doRangeCheck {
		if err := o.RangeCheck(actingVersion, o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrdersResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	for i := range o.Orders {
		if err := o.Orders[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	return nil
}

func OrdersResponseInit(o *OrdersResponse) {
	return
}

func (o *OrdersResponseOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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
	if err := _m.WriteInt64(_w, o.OrigQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.ExecutedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.CummulativeQuoteQty); err != nil {
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
	if err := _m.WriteInt64(_w, o.Time); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.UpdateTime); err != nil {
		return err
	}
	if err := o.IsWorking.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.WorkingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.OrigQuoteOrderQty); err != nil {
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
	if err := _m.WriteInt64(_w, o.PreventedMatchId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, o.PreventedQuantity); err != nil {
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

func (o *OrdersResponseOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	if !o.OrigQtyInActingVersion(actingVersion) {
		o.OrigQty = o.OrigQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrigQty); err != nil {
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
	if !o.CummulativeQuoteQtyInActingVersion(actingVersion) {
		o.CummulativeQuoteQty = o.CummulativeQuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.CummulativeQuoteQty); err != nil {
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
	if !o.TimeInActingVersion(actingVersion) {
		o.Time = o.TimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.Time); err != nil {
			return err
		}
	}
	if !o.UpdateTimeInActingVersion(actingVersion) {
		o.UpdateTime = o.UpdateTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.UpdateTime); err != nil {
			return err
		}
	}
	if o.IsWorkingInActingVersion(actingVersion) {
		if err := o.IsWorking.Decode(_m, _r, actingVersion); err != nil {
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
	if !o.OrigQuoteOrderQtyInActingVersion(actingVersion) {
		o.OrigQuoteOrderQty = o.OrigQuoteOrderQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.OrigQuoteOrderQty); err != nil {
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
	if !o.PreventedMatchIdInActingVersion(actingVersion) {
		o.PreventedMatchId = o.PreventedMatchIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.PreventedMatchId); err != nil {
			return err
		}
	}
	if !o.PreventedQuantityInActingVersion(actingVersion) {
		o.PreventedQuantity = o.PreventedQuantityNullValue()
	} else {
		if err := _m.ReadInt64(_r, &o.PreventedQuantity); err != nil {
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

func (o *OrdersResponseOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	if o.OrigQtyInActingVersion(actingVersion) {
		if o.OrigQty < o.OrigQtyMinValue() || o.OrigQty > o.OrigQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.OrigQty (%v < %v > %v)", o.OrigQtyMinValue(), o.OrigQty, o.OrigQtyMaxValue())
		}
	}
	if o.ExecutedQtyInActingVersion(actingVersion) {
		if o.ExecutedQty < o.ExecutedQtyMinValue() || o.ExecutedQty > o.ExecutedQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.ExecutedQty (%v < %v > %v)", o.ExecutedQtyMinValue(), o.ExecutedQty, o.ExecutedQtyMaxValue())
		}
	}
	if o.CummulativeQuoteQtyInActingVersion(actingVersion) {
		if o.CummulativeQuoteQty < o.CummulativeQuoteQtyMinValue() || o.CummulativeQuoteQty > o.CummulativeQuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.CummulativeQuoteQty (%v < %v > %v)", o.CummulativeQuoteQtyMinValue(), o.CummulativeQuoteQty, o.CummulativeQuoteQtyMaxValue())
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
	if o.TimeInActingVersion(actingVersion) {
		if o.Time < o.TimeMinValue() || o.Time > o.TimeMaxValue() {
			return fmt.Errorf("Range check failed on o.Time (%v < %v > %v)", o.TimeMinValue(), o.Time, o.TimeMaxValue())
		}
	}
	if o.UpdateTimeInActingVersion(actingVersion) {
		if o.UpdateTime < o.UpdateTimeMinValue() || o.UpdateTime > o.UpdateTimeMaxValue() {
			return fmt.Errorf("Range check failed on o.UpdateTime (%v < %v > %v)", o.UpdateTimeMinValue(), o.UpdateTime, o.UpdateTimeMaxValue())
		}
	}
	if err := o.IsWorking.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if o.WorkingTimeInActingVersion(actingVersion) {
		if o.WorkingTime != o.WorkingTimeNullValue() && (o.WorkingTime < o.WorkingTimeMinValue() || o.WorkingTime > o.WorkingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on o.WorkingTime (%v < %v > %v)", o.WorkingTimeMinValue(), o.WorkingTime, o.WorkingTimeMaxValue())
		}
	}
	if o.OrigQuoteOrderQtyInActingVersion(actingVersion) {
		if o.OrigQuoteOrderQty < o.OrigQuoteOrderQtyMinValue() || o.OrigQuoteOrderQty > o.OrigQuoteOrderQtyMaxValue() {
			return fmt.Errorf("Range check failed on o.OrigQuoteOrderQty (%v < %v > %v)", o.OrigQuoteOrderQtyMinValue(), o.OrigQuoteOrderQty, o.OrigQuoteOrderQtyMaxValue())
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
	if o.PreventedMatchIdInActingVersion(actingVersion) {
		if o.PreventedMatchId != o.PreventedMatchIdNullValue() && (o.PreventedMatchId < o.PreventedMatchIdMinValue() || o.PreventedMatchId > o.PreventedMatchIdMaxValue()) {
			return fmt.Errorf("Range check failed on o.PreventedMatchId (%v < %v > %v)", o.PreventedMatchIdMinValue(), o.PreventedMatchId, o.PreventedMatchIdMaxValue())
		}
	}
	if o.PreventedQuantityInActingVersion(actingVersion) {
		if o.PreventedQuantity < o.PreventedQuantityMinValue() || o.PreventedQuantity > o.PreventedQuantityMaxValue() {
			return fmt.Errorf("Range check failed on o.PreventedQuantity (%v < %v > %v)", o.PreventedQuantityMinValue(), o.PreventedQuantity, o.PreventedQuantityMaxValue())
		}
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

func OrdersResponseOrdersInit(o *OrdersResponseOrders) {
	o.OrderListId = math.MinInt64
	o.StopPrice = math.MinInt64
	o.TrailingDelta = math.MinInt64
	o.TrailingTime = math.MinInt64
	o.IcebergQty = math.MinInt64
	o.WorkingTime = math.MinInt64
	o.StrategyId = math.MinInt64
	o.StrategyType = math.MinInt32
	o.PreventedMatchId = math.MinInt64
	o.PegOffsetValue = math.MaxUint8
	o.PeggedPrice = math.MinInt64
	return
}

func (*OrdersResponse) SbeBlockLength() (blockLength uint16) {
	return 0
}

func (*OrdersResponse) SbeTemplateId() (templateId uint16) {
	return 308
}

func (*OrdersResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OrdersResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*OrdersResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OrdersResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*OrdersResponseOrders) PriceExponentId() uint16 {
	return 1
}

func (*OrdersResponseOrders) PriceExponentSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PriceExponentSinceVersion()
}

func (*OrdersResponseOrders) PriceExponentDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) PriceExponentMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrdersResponseOrders) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrdersResponseOrders) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrdersResponseOrders) QtyExponentId() uint16 {
	return 2
}

func (*OrdersResponseOrders) QtyExponentSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.QtyExponentSinceVersion()
}

func (*OrdersResponseOrders) QtyExponentDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) QtyExponentMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrdersResponseOrders) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrdersResponseOrders) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrdersResponseOrders) OrderIdId() uint16 {
	return 3
}

func (*OrdersResponseOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderIdSinceVersion()
}

func (*OrdersResponseOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) OrderIdMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) OrderListIdId() uint16 {
	return 4
}

func (*OrdersResponseOrders) OrderListIdSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderListIdSinceVersion()
}

func (*OrdersResponseOrders) OrderListIdDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) OrderListIdMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) PriceId() uint16 {
	return 5
}

func (*OrdersResponseOrders) PriceSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PriceSinceVersion()
}

func (*OrdersResponseOrders) PriceDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) PriceMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) PriceNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) OrigQtyId() uint16 {
	return 6
}

func (*OrdersResponseOrders) OrigQtySinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrigQtySinceVersion()
}

func (*OrdersResponseOrders) OrigQtyDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) OrigQtyMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) ExecutedQtyId() uint16 {
	return 7
}

func (*OrdersResponseOrders) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExecutedQtySinceVersion()
}

func (*OrdersResponseOrders) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) ExecutedQtyMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) CummulativeQuoteQtyId() uint16 {
	return 8
}

func (*OrdersResponseOrders) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.CummulativeQuoteQtySinceVersion()
}

func (*OrdersResponseOrders) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) CummulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) StatusId() uint16 {
	return 9
}

func (*OrdersResponseOrders) StatusSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StatusSinceVersion()
}

func (*OrdersResponseOrders) StatusDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) StatusMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) TimeInForceId() uint16 {
	return 10
}

func (*OrdersResponseOrders) TimeInForceSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TimeInForceSinceVersion()
}

func (*OrdersResponseOrders) TimeInForceDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) TimeInForceMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) OrderTypeId() uint16 {
	return 11
}

func (*OrdersResponseOrders) OrderTypeSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderTypeSinceVersion()
}

func (*OrdersResponseOrders) OrderTypeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) OrderTypeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) SideId() uint16 {
	return 12
}

func (*OrdersResponseOrders) SideSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SideSinceVersion()
}

func (*OrdersResponseOrders) SideDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) SideMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) StopPriceId() uint16 {
	return 13
}

func (*OrdersResponseOrders) StopPriceSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StopPriceSinceVersion()
}

func (*OrdersResponseOrders) StopPriceDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) StopPriceMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) TrailingDeltaId() uint16 {
	return 14
}

func (*OrdersResponseOrders) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TrailingDeltaSinceVersion()
}

func (*OrdersResponseOrders) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) TrailingDeltaMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) TrailingTimeId() uint16 {
	return 15
}

func (*OrdersResponseOrders) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TrailingTimeSinceVersion()
}

func (*OrdersResponseOrders) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) TrailingTimeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) IcebergQtyId() uint16 {
	return 16
}

func (*OrdersResponseOrders) IcebergQtySinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.IcebergQtySinceVersion()
}

func (*OrdersResponseOrders) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) IcebergQtyMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) TimeId() uint16 {
	return 17
}

func (*OrdersResponseOrders) TimeSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) TimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TimeSinceVersion()
}

func (*OrdersResponseOrders) TimeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) TimeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) TimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) TimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) TimeNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) UpdateTimeId() uint16 {
	return 18
}

func (*OrdersResponseOrders) UpdateTimeSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) UpdateTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.UpdateTimeSinceVersion()
}

func (*OrdersResponseOrders) UpdateTimeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) UpdateTimeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) UpdateTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) UpdateTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) UpdateTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) IsWorkingId() uint16 {
	return 19
}

func (*OrdersResponseOrders) IsWorkingSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) IsWorkingInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.IsWorkingSinceVersion()
}

func (*OrdersResponseOrders) IsWorkingDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) IsWorkingMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) WorkingTimeId() uint16 {
	return 20
}

func (*OrdersResponseOrders) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.WorkingTimeSinceVersion()
}

func (*OrdersResponseOrders) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) WorkingTimeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) OrigQuoteOrderQtyId() uint16 {
	return 21
}

func (*OrdersResponseOrders) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrigQuoteOrderQtySinceVersion()
}

func (*OrdersResponseOrders) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) OrigQuoteOrderQtyMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) StrategyIdId() uint16 {
	return 22
}

func (*OrdersResponseOrders) StrategyIdSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StrategyIdSinceVersion()
}

func (*OrdersResponseOrders) StrategyIdDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) StrategyIdMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) StrategyTypeId() uint16 {
	return 23
}

func (*OrdersResponseOrders) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StrategyTypeSinceVersion()
}

func (*OrdersResponseOrders) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) StrategyTypeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*OrdersResponseOrders) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*OrdersResponseOrders) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*OrdersResponseOrders) OrderCapacityId() uint16 {
	return 24
}

func (*OrdersResponseOrders) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderCapacitySinceVersion()
}

func (*OrdersResponseOrders) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) OrderCapacityMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) WorkingFloorId() uint16 {
	return 25
}

func (*OrdersResponseOrders) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.WorkingFloorSinceVersion()
}

func (*OrdersResponseOrders) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) WorkingFloorMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) SelfTradePreventionModeId() uint16 {
	return 26
}

func (*OrdersResponseOrders) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SelfTradePreventionModeSinceVersion()
}

func (*OrdersResponseOrders) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PreventedMatchIdId() uint16 {
	return 27
}

func (*OrdersResponseOrders) PreventedMatchIdSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) PreventedMatchIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PreventedMatchIdSinceVersion()
}

func (*OrdersResponseOrders) PreventedMatchIdDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) PreventedMatchIdMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PreventedMatchIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) PreventedMatchIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) PreventedMatchIdNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) PreventedQuantityId() uint16 {
	return 28
}

func (*OrdersResponseOrders) PreventedQuantitySinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) PreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PreventedQuantitySinceVersion()
}

func (*OrdersResponseOrders) PreventedQuantityDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) PreventedQuantityMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) PreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) PreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) UsedSorId() uint16 {
	return 29
}

func (*OrdersResponseOrders) UsedSorSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.UsedSorSinceVersion()
}

func (*OrdersResponseOrders) UsedSorDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) UsedSorMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PegPriceTypeId() uint16 {
	return 30
}

func (*OrdersResponseOrders) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (o *OrdersResponseOrders) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegPriceTypeSinceVersion()
}

func (*OrdersResponseOrders) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) PegPriceTypeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PegOffsetTypeId() uint16 {
	return 31
}

func (*OrdersResponseOrders) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (o *OrdersResponseOrders) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegOffsetTypeSinceVersion()
}

func (*OrdersResponseOrders) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PegOffsetValueId() uint16 {
	return 32
}

func (*OrdersResponseOrders) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (o *OrdersResponseOrders) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegOffsetValueSinceVersion()
}

func (*OrdersResponseOrders) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) PegOffsetValueMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*OrdersResponseOrders) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OrdersResponseOrders) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*OrdersResponseOrders) PeggedPriceId() uint16 {
	return 33
}

func (*OrdersResponseOrders) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (o *OrdersResponseOrders) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PeggedPriceSinceVersion()
}

func (*OrdersResponseOrders) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) PeggedPriceMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrdersResponseOrders) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrdersResponseOrders) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*OrdersResponseOrders) SymbolMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrdersResponseOrders) SymbolDeprecated() uint16 {
	return 0
}

func (OrdersResponseOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrdersResponseOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrdersResponseOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*OrdersResponseOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponseOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ClientOrderIdSinceVersion()
}

func (*OrdersResponseOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrdersResponseOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrdersResponseOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*OrdersResponse) OrdersId() uint16 {
	return 100
}

func (*OrdersResponse) OrdersSinceVersion() uint16 {
	return 0
}

func (o *OrdersResponse) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrdersSinceVersion()
}

func (*OrdersResponse) OrdersDeprecated() uint16 {
	return 0
}

func (*OrdersResponseOrders) SbeBlockLength() (blockLength uint) {
	return 162
}

func (*OrdersResponseOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"unicode/utf8"
)

type OrderResponse struct {
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

func (o *OrderResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := o.RangeCheck(o.SbeSchemaVersion(), o.SbeSchemaVersion()); err != nil {
			return err
		}
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

func (o *OrderResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
	if doRangeCheck {
		if err := o.RangeCheck(actingVersion, o.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (o *OrderResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func OrderResponseInit(o *OrderResponse) {
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

func (*OrderResponse) SbeBlockLength() (blockLength uint16) {
	return 162
}

func (*OrderResponse) SbeTemplateId() (templateId uint16) {
	return 304
}

func (*OrderResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*OrderResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*OrderResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*OrderResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*OrderResponse) PriceExponentId() uint16 {
	return 1
}

func (*OrderResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PriceExponentSinceVersion()
}

func (*OrderResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*OrderResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*OrderResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrderResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrderResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrderResponse) QtyExponentId() uint16 {
	return 2
}

func (*OrderResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.QtyExponentSinceVersion()
}

func (*OrderResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*OrderResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*OrderResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*OrderResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*OrderResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*OrderResponse) OrderIdId() uint16 {
	return 3
}

func (*OrderResponse) OrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderIdSinceVersion()
}

func (*OrderResponse) OrderIdDeprecated() uint16 {
	return 0
}

func (*OrderResponse) OrderIdMetaAttribute(meta int) string {
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

func (*OrderResponse) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) OrderListIdId() uint16 {
	return 4
}

func (*OrderResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderListIdSinceVersion()
}

func (*OrderResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*OrderResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*OrderResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) PriceId() uint16 {
	return 5
}

func (*OrderResponse) PriceSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PriceSinceVersion()
}

func (*OrderResponse) PriceDeprecated() uint16 {
	return 0
}

func (*OrderResponse) PriceMetaAttribute(meta int) string {
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

func (*OrderResponse) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) PriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) OrigQtyId() uint16 {
	return 6
}

func (*OrderResponse) OrigQtySinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrigQtySinceVersion()
}

func (*OrderResponse) OrigQtyDeprecated() uint16 {
	return 0
}

func (*OrderResponse) OrigQtyMetaAttribute(meta int) string {
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

func (*OrderResponse) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) ExecutedQtyId() uint16 {
	return 7
}

func (*OrderResponse) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExecutedQtySinceVersion()
}

func (*OrderResponse) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*OrderResponse) ExecutedQtyMetaAttribute(meta int) string {
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

func (*OrderResponse) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) CummulativeQuoteQtyId() uint16 {
	return 8
}

func (*OrderResponse) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.CummulativeQuoteQtySinceVersion()
}

func (*OrderResponse) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*OrderResponse) CummulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*OrderResponse) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) StatusId() uint16 {
	return 9
}

func (*OrderResponse) StatusSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StatusSinceVersion()
}

func (*OrderResponse) StatusDeprecated() uint16 {
	return 0
}

func (*OrderResponse) StatusMetaAttribute(meta int) string {
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

func (*OrderResponse) TimeInForceId() uint16 {
	return 10
}

func (*OrderResponse) TimeInForceSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TimeInForceSinceVersion()
}

func (*OrderResponse) TimeInForceDeprecated() uint16 {
	return 0
}

func (*OrderResponse) TimeInForceMetaAttribute(meta int) string {
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

func (*OrderResponse) OrderTypeId() uint16 {
	return 11
}

func (*OrderResponse) OrderTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderTypeSinceVersion()
}

func (*OrderResponse) OrderTypeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) OrderTypeMetaAttribute(meta int) string {
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

func (*OrderResponse) SideId() uint16 {
	return 12
}

func (*OrderResponse) SideSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SideSinceVersion()
}

func (*OrderResponse) SideDeprecated() uint16 {
	return 0
}

func (*OrderResponse) SideMetaAttribute(meta int) string {
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

func (*OrderResponse) StopPriceId() uint16 {
	return 13
}

func (*OrderResponse) StopPriceSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StopPriceSinceVersion()
}

func (*OrderResponse) StopPriceDeprecated() uint16 {
	return 0
}

func (*OrderResponse) StopPriceMetaAttribute(meta int) string {
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

func (*OrderResponse) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) TrailingDeltaId() uint16 {
	return 14
}

func (*OrderResponse) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TrailingDeltaSinceVersion()
}

func (*OrderResponse) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*OrderResponse) TrailingDeltaMetaAttribute(meta int) string {
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

func (*OrderResponse) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) TrailingTimeId() uint16 {
	return 15
}

func (*OrderResponse) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TrailingTimeSinceVersion()
}

func (*OrderResponse) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) TrailingTimeMetaAttribute(meta int) string {
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

func (*OrderResponse) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) IcebergQtyId() uint16 {
	return 16
}

func (*OrderResponse) IcebergQtySinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.IcebergQtySinceVersion()
}

func (*OrderResponse) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*OrderResponse) IcebergQtyMetaAttribute(meta int) string {
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

func (*OrderResponse) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) TimeId() uint16 {
	return 17
}

func (*OrderResponse) TimeSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) TimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TimeSinceVersion()
}

func (*OrderResponse) TimeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) TimeMetaAttribute(meta int) string {
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

func (*OrderResponse) TimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) TimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) TimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) UpdateTimeId() uint16 {
	return 18
}

func (*OrderResponse) UpdateTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) UpdateTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.UpdateTimeSinceVersion()
}

func (*OrderResponse) UpdateTimeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) UpdateTimeMetaAttribute(meta int) string {
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

func (*OrderResponse) UpdateTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) UpdateTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) UpdateTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) IsWorkingId() uint16 {
	return 19
}

func (*OrderResponse) IsWorkingSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) IsWorkingInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.IsWorkingSinceVersion()
}

func (*OrderResponse) IsWorkingDeprecated() uint16 {
	return 0
}

func (*OrderResponse) IsWorkingMetaAttribute(meta int) string {
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

func (*OrderResponse) WorkingTimeId() uint16 {
	return 20
}

func (*OrderResponse) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.WorkingTimeSinceVersion()
}

func (*OrderResponse) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) WorkingTimeMetaAttribute(meta int) string {
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

func (*OrderResponse) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) OrigQuoteOrderQtyId() uint16 {
	return 21
}

func (*OrderResponse) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrigQuoteOrderQtySinceVersion()
}

func (*OrderResponse) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*OrderResponse) OrigQuoteOrderQtyMetaAttribute(meta int) string {
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

func (*OrderResponse) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) StrategyIdId() uint16 {
	return 22
}

func (*OrderResponse) StrategyIdSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StrategyIdSinceVersion()
}

func (*OrderResponse) StrategyIdDeprecated() uint16 {
	return 0
}

func (*OrderResponse) StrategyIdMetaAttribute(meta int) string {
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

func (*OrderResponse) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) StrategyTypeId() uint16 {
	return 23
}

func (*OrderResponse) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StrategyTypeSinceVersion()
}

func (*OrderResponse) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) StrategyTypeMetaAttribute(meta int) string {
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

func (*OrderResponse) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*OrderResponse) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*OrderResponse) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*OrderResponse) OrderCapacityId() uint16 {
	return 24
}

func (*OrderResponse) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.OrderCapacitySinceVersion()
}

func (*OrderResponse) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*OrderResponse) OrderCapacityMetaAttribute(meta int) string {
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

func (*OrderResponse) WorkingFloorId() uint16 {
	return 25
}

func (*OrderResponse) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.WorkingFloorSinceVersion()
}

func (*OrderResponse) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*OrderResponse) WorkingFloorMetaAttribute(meta int) string {
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

func (*OrderResponse) SelfTradePreventionModeId() uint16 {
	return 26
}

func (*OrderResponse) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SelfTradePreventionModeSinceVersion()
}

func (*OrderResponse) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*OrderResponse) PreventedMatchIdId() uint16 {
	return 27
}

func (*OrderResponse) PreventedMatchIdSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) PreventedMatchIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PreventedMatchIdSinceVersion()
}

func (*OrderResponse) PreventedMatchIdDeprecated() uint16 {
	return 0
}

func (*OrderResponse) PreventedMatchIdMetaAttribute(meta int) string {
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

func (*OrderResponse) PreventedMatchIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) PreventedMatchIdMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) PreventedMatchIdNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) PreventedQuantityId() uint16 {
	return 28
}

func (*OrderResponse) PreventedQuantitySinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) PreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PreventedQuantitySinceVersion()
}

func (*OrderResponse) PreventedQuantityDeprecated() uint16 {
	return 0
}

func (*OrderResponse) PreventedQuantityMetaAttribute(meta int) string {
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

func (*OrderResponse) PreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) PreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) PreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) UsedSorId() uint16 {
	return 29
}

func (*OrderResponse) UsedSorSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.UsedSorSinceVersion()
}

func (*OrderResponse) UsedSorDeprecated() uint16 {
	return 0
}

func (*OrderResponse) UsedSorMetaAttribute(meta int) string {
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

func (*OrderResponse) PegPriceTypeId() uint16 {
	return 30
}

func (*OrderResponse) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (o *OrderResponse) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegPriceTypeSinceVersion()
}

func (*OrderResponse) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) PegPriceTypeMetaAttribute(meta int) string {
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

func (*OrderResponse) PegOffsetTypeId() uint16 {
	return 31
}

func (*OrderResponse) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (o *OrderResponse) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegOffsetTypeSinceVersion()
}

func (*OrderResponse) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*OrderResponse) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*OrderResponse) PegOffsetValueId() uint16 {
	return 32
}

func (*OrderResponse) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (o *OrderResponse) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PegOffsetValueSinceVersion()
}

func (*OrderResponse) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*OrderResponse) PegOffsetValueMetaAttribute(meta int) string {
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

func (*OrderResponse) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*OrderResponse) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*OrderResponse) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*OrderResponse) PeggedPriceId() uint16 {
	return 33
}

func (*OrderResponse) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (o *OrderResponse) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PeggedPriceSinceVersion()
}

func (*OrderResponse) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*OrderResponse) PeggedPriceMetaAttribute(meta int) string {
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

func (*OrderResponse) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*OrderResponse) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*OrderResponse) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*OrderResponse) SymbolMetaAttribute(meta int) string {
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

func (*OrderResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SymbolSinceVersion()
}

func (*OrderResponse) SymbolDeprecated() uint16 {
	return 0
}

func (OrderResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (OrderResponse) SymbolHeaderLength() uint64 {
	return 1
}

func (*OrderResponse) ClientOrderIdMetaAttribute(meta int) string {
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

func (*OrderResponse) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (o *OrderResponse) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ClientOrderIdSinceVersion()
}

func (*OrderResponse) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (OrderResponse) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (OrderResponse) ClientOrderIdHeaderLength() uint64 {
	return 1
}

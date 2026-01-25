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

type ExecutionReportEvent struct {
	EventTime                  int64
	TransactTime               int64
	PriceExponent              int8
	QtyExponent                int8
	CommissionExponent         int8
	OrderCreationTime          int64
	WorkingTime                int64
	OrderId                    int64
	OrderListId                int64
	OrigQty                    int64
	Price                      int64
	OrigQuoteOrderQty          int64
	IcebergQty                 int64
	StopPrice                  int64
	OrderType                  OrderTypeEnum
	Side                       OrderSideEnum
	TimeInForce                TimeInForceEnum
	ExecutionType              ExecutionTypeEnum
	OrderStatus                OrderStatusEnum
	TradeId                    int64
	ExecutionId                int64
	ExecutedQty                int64
	CummulativeQuoteQty        int64
	LastQty                    int64
	LastPrice                  int64
	QuoteQty                   int64
	Commission                 int64
	IsWorking                  BoolEnumEnum
	IsMaker                    BoolEnumEnum
	IsBestMatch                BoolEnumEnum
	MatchType                  MatchTypeEnum
	SelfTradePreventionMode    SelfTradePreventionModeEnum
	OrderCapacity              OrderCapacityEnum
	WorkingFloor               FloorEnum
	UsedSor                    BoolEnumEnum
	AllocId                    int64
	TrailingDelta              uint64
	TrailingTime               int64
	TradeGroupId               int64
	PreventedQty               int64
	LastPreventedQty           int64
	PreventedMatchId           int64
	PreventedExecutionQty      int64
	PreventedExecutionPrice    int64
	PreventedExecutionQuoteQty int64
	StrategyType               int32
	StrategyId                 int64
	CounterOrderId             int64
	SubscriptionId             uint16
	PegPriceType               PegPriceTypeEnum
	PegOffsetType              PegOffsetTypeEnum
	PegOffsetValue             uint8
	PeggedPrice                int64
	Symbol                     []uint8
	ClientOrderId              []uint8
	OrigClientOrderId          []uint8
	CommissionAsset            []uint8
	RejectReason               []uint8
	CounterSymbol              []uint8
}

func (e *ExecutionReportEvent) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := e.RangeCheck(e.SbeSchemaVersion(), e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, e.EventTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, e.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, e.QtyExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, e.CommissionExponent); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.OrderCreationTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.WorkingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.OrderListId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.OrigQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.OrigQuoteOrderQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.IcebergQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.StopPrice); err != nil {
		return err
	}
	if err := e.OrderType.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.Side.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.TimeInForce.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.ExecutionType.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.OrderStatus.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.TradeId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.ExecutionId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.ExecutedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.CummulativeQuoteQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.LastQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.LastPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.QuoteQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.Commission); err != nil {
		return err
	}
	if err := e.IsWorking.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.IsMaker.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.IsBestMatch.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.MatchType.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.SelfTradePreventionMode.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.OrderCapacity.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.WorkingFloor.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.UsedSor.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.AllocId); err != nil {
		return err
	}
	if err := _m.WriteUint64(_w, e.TrailingDelta); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.TrailingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.TradeGroupId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.PreventedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.LastPreventedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.PreventedMatchId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.PreventedExecutionQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.PreventedExecutionPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.PreventedExecutionQuoteQty); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, e.StrategyType); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.StrategyId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.CounterOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint16(_w, e.SubscriptionId); err != nil {
		return err
	}
	if err := e.PegPriceType.Encode(_m, _w); err != nil {
		return err
	}
	if err := e.PegOffsetType.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, e.PegOffsetValue); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, e.PeggedPrice); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.ClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.OrigClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.OrigClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.CommissionAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.CommissionAsset); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.RejectReason))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.RejectReason); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(e.CounterSymbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, e.CounterSymbol); err != nil {
		return err
	}
	return nil
}

func (e *ExecutionReportEvent) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !e.EventTimeInActingVersion(actingVersion) {
		e.EventTime = e.EventTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.EventTime); err != nil {
			return err
		}
	}
	if !e.TransactTimeInActingVersion(actingVersion) {
		e.TransactTime = e.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.TransactTime); err != nil {
			return err
		}
	}
	if !e.PriceExponentInActingVersion(actingVersion) {
		e.PriceExponent = e.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &e.PriceExponent); err != nil {
			return err
		}
	}
	if !e.QtyExponentInActingVersion(actingVersion) {
		e.QtyExponent = e.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &e.QtyExponent); err != nil {
			return err
		}
	}
	if !e.CommissionExponentInActingVersion(actingVersion) {
		e.CommissionExponent = e.CommissionExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &e.CommissionExponent); err != nil {
			return err
		}
	}
	if !e.OrderCreationTimeInActingVersion(actingVersion) {
		e.OrderCreationTime = e.OrderCreationTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.OrderCreationTime); err != nil {
			return err
		}
	}
	if !e.WorkingTimeInActingVersion(actingVersion) {
		e.WorkingTime = e.WorkingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.WorkingTime); err != nil {
			return err
		}
	}
	if !e.OrderIdInActingVersion(actingVersion) {
		e.OrderId = e.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.OrderId); err != nil {
			return err
		}
	}
	if !e.OrderListIdInActingVersion(actingVersion) {
		e.OrderListId = e.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.OrderListId); err != nil {
			return err
		}
	}
	if !e.OrigQtyInActingVersion(actingVersion) {
		e.OrigQty = e.OrigQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.OrigQty); err != nil {
			return err
		}
	}
	if !e.PriceInActingVersion(actingVersion) {
		e.Price = e.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.Price); err != nil {
			return err
		}
	}
	if !e.OrigQuoteOrderQtyInActingVersion(actingVersion) {
		e.OrigQuoteOrderQty = e.OrigQuoteOrderQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.OrigQuoteOrderQty); err != nil {
			return err
		}
	}
	if !e.IcebergQtyInActingVersion(actingVersion) {
		e.IcebergQty = e.IcebergQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.IcebergQty); err != nil {
			return err
		}
	}
	if !e.StopPriceInActingVersion(actingVersion) {
		e.StopPrice = e.StopPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.StopPrice); err != nil {
			return err
		}
	}
	if e.OrderTypeInActingVersion(actingVersion) {
		if err := e.OrderType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.SideInActingVersion(actingVersion) {
		if err := e.Side.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.TimeInForceInActingVersion(actingVersion) {
		if err := e.TimeInForce.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.ExecutionTypeInActingVersion(actingVersion) {
		if err := e.ExecutionType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.OrderStatusInActingVersion(actingVersion) {
		if err := e.OrderStatus.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !e.TradeIdInActingVersion(actingVersion) {
		e.TradeId = e.TradeIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.TradeId); err != nil {
			return err
		}
	}
	if !e.ExecutionIdInActingVersion(actingVersion) {
		e.ExecutionId = e.ExecutionIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.ExecutionId); err != nil {
			return err
		}
	}
	if !e.ExecutedQtyInActingVersion(actingVersion) {
		e.ExecutedQty = e.ExecutedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.ExecutedQty); err != nil {
			return err
		}
	}
	if !e.CummulativeQuoteQtyInActingVersion(actingVersion) {
		e.CummulativeQuoteQty = e.CummulativeQuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.CummulativeQuoteQty); err != nil {
			return err
		}
	}
	if !e.LastQtyInActingVersion(actingVersion) {
		e.LastQty = e.LastQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.LastQty); err != nil {
			return err
		}
	}
	if !e.LastPriceInActingVersion(actingVersion) {
		e.LastPrice = e.LastPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.LastPrice); err != nil {
			return err
		}
	}
	if !e.QuoteQtyInActingVersion(actingVersion) {
		e.QuoteQty = e.QuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.QuoteQty); err != nil {
			return err
		}
	}
	if !e.CommissionInActingVersion(actingVersion) {
		e.Commission = e.CommissionNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.Commission); err != nil {
			return err
		}
	}
	if e.IsWorkingInActingVersion(actingVersion) {
		if err := e.IsWorking.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.IsMakerInActingVersion(actingVersion) {
		if err := e.IsMaker.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.IsBestMatchInActingVersion(actingVersion) {
		if err := e.IsBestMatch.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.MatchTypeInActingVersion(actingVersion) {
		if err := e.MatchType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.SelfTradePreventionModeInActingVersion(actingVersion) {
		if err := e.SelfTradePreventionMode.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.OrderCapacityInActingVersion(actingVersion) {
		if err := e.OrderCapacity.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.WorkingFloorInActingVersion(actingVersion) {
		if err := e.WorkingFloor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.UsedSorInActingVersion(actingVersion) {
		if err := e.UsedSor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !e.AllocIdInActingVersion(actingVersion) {
		e.AllocId = e.AllocIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.AllocId); err != nil {
			return err
		}
	}
	if !e.TrailingDeltaInActingVersion(actingVersion) {
		e.TrailingDelta = e.TrailingDeltaNullValue()
	} else {
		if err := _m.ReadUint64(_r, &e.TrailingDelta); err != nil {
			return err
		}
	}
	if !e.TrailingTimeInActingVersion(actingVersion) {
		e.TrailingTime = e.TrailingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.TrailingTime); err != nil {
			return err
		}
	}
	if !e.TradeGroupIdInActingVersion(actingVersion) {
		e.TradeGroupId = e.TradeGroupIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.TradeGroupId); err != nil {
			return err
		}
	}
	if !e.PreventedQtyInActingVersion(actingVersion) {
		e.PreventedQty = e.PreventedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.PreventedQty); err != nil {
			return err
		}
	}
	if !e.LastPreventedQtyInActingVersion(actingVersion) {
		e.LastPreventedQty = e.LastPreventedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.LastPreventedQty); err != nil {
			return err
		}
	}
	if !e.PreventedMatchIdInActingVersion(actingVersion) {
		e.PreventedMatchId = e.PreventedMatchIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.PreventedMatchId); err != nil {
			return err
		}
	}
	if !e.PreventedExecutionQtyInActingVersion(actingVersion) {
		e.PreventedExecutionQty = e.PreventedExecutionQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.PreventedExecutionQty); err != nil {
			return err
		}
	}
	if !e.PreventedExecutionPriceInActingVersion(actingVersion) {
		e.PreventedExecutionPrice = e.PreventedExecutionPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.PreventedExecutionPrice); err != nil {
			return err
		}
	}
	if !e.PreventedExecutionQuoteQtyInActingVersion(actingVersion) {
		e.PreventedExecutionQuoteQty = e.PreventedExecutionQuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.PreventedExecutionQuoteQty); err != nil {
			return err
		}
	}
	if !e.StrategyTypeInActingVersion(actingVersion) {
		e.StrategyType = e.StrategyTypeNullValue()
	} else {
		if err := _m.ReadInt32(_r, &e.StrategyType); err != nil {
			return err
		}
	}
	if !e.StrategyIdInActingVersion(actingVersion) {
		e.StrategyId = e.StrategyIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.StrategyId); err != nil {
			return err
		}
	}
	if !e.CounterOrderIdInActingVersion(actingVersion) {
		e.CounterOrderId = e.CounterOrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.CounterOrderId); err != nil {
			return err
		}
	}
	if !e.SubscriptionIdInActingVersion(actingVersion) {
		e.SubscriptionId = e.SubscriptionIdNullValue()
	} else {
		if err := _m.ReadUint16(_r, &e.SubscriptionId); err != nil {
			return err
		}
	}
	if e.PegPriceTypeInActingVersion(actingVersion) {
		if err := e.PegPriceType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if e.PegOffsetTypeInActingVersion(actingVersion) {
		if err := e.PegOffsetType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !e.PegOffsetValueInActingVersion(actingVersion) {
		e.PegOffsetValue = e.PegOffsetValueNullValue()
	} else {
		if err := _m.ReadUint8(_r, &e.PegOffsetValue); err != nil {
			return err
		}
	}
	if !e.PeggedPriceInActingVersion(actingVersion) {
		e.PeggedPrice = e.PeggedPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &e.PeggedPrice); err != nil {
			return err
		}
	}
	if actingVersion > e.SbeSchemaVersion() && blockLength > e.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-e.SbeBlockLength()))
	}

	if e.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(e.Symbol) < int(SymbolLength) {
			e.Symbol = make([]uint8, SymbolLength)
		}
		e.Symbol = e.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, e.Symbol); err != nil {
			return err
		}
	}

	if e.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(e.ClientOrderId) < int(ClientOrderIdLength) {
			e.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		e.ClientOrderId = e.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, e.ClientOrderId); err != nil {
			return err
		}
	}

	if e.OrigClientOrderIdInActingVersion(actingVersion) {
		var OrigClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &OrigClientOrderIdLength); err != nil {
			return err
		}
		if cap(e.OrigClientOrderId) < int(OrigClientOrderIdLength) {
			e.OrigClientOrderId = make([]uint8, OrigClientOrderIdLength)
		}
		e.OrigClientOrderId = e.OrigClientOrderId[:OrigClientOrderIdLength]
		if err := _m.ReadBytes(_r, e.OrigClientOrderId); err != nil {
			return err
		}
	}

	if e.CommissionAssetInActingVersion(actingVersion) {
		var CommissionAssetLength uint8
		if err := _m.ReadUint8(_r, &CommissionAssetLength); err != nil {
			return err
		}
		if cap(e.CommissionAsset) < int(CommissionAssetLength) {
			e.CommissionAsset = make([]uint8, CommissionAssetLength)
		}
		e.CommissionAsset = e.CommissionAsset[:CommissionAssetLength]
		if err := _m.ReadBytes(_r, e.CommissionAsset); err != nil {
			return err
		}
	}

	if e.RejectReasonInActingVersion(actingVersion) {
		var RejectReasonLength uint8
		if err := _m.ReadUint8(_r, &RejectReasonLength); err != nil {
			return err
		}
		if cap(e.RejectReason) < int(RejectReasonLength) {
			e.RejectReason = make([]uint8, RejectReasonLength)
		}
		e.RejectReason = e.RejectReason[:RejectReasonLength]
		if err := _m.ReadBytes(_r, e.RejectReason); err != nil {
			return err
		}
	}

	if e.CounterSymbolInActingVersion(actingVersion) {
		var CounterSymbolLength uint8
		if err := _m.ReadUint8(_r, &CounterSymbolLength); err != nil {
			return err
		}
		if cap(e.CounterSymbol) < int(CounterSymbolLength) {
			e.CounterSymbol = make([]uint8, CounterSymbolLength)
		}
		e.CounterSymbol = e.CounterSymbol[:CounterSymbolLength]
		if err := _m.ReadBytes(_r, e.CounterSymbol); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := e.RangeCheck(actingVersion, e.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (e *ExecutionReportEvent) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if e.EventTimeInActingVersion(actingVersion) {
		if e.EventTime < e.EventTimeMinValue() || e.EventTime > e.EventTimeMaxValue() {
			return fmt.Errorf("Range check failed on e.EventTime (%v < %v > %v)", e.EventTimeMinValue(), e.EventTime, e.EventTimeMaxValue())
		}
	}
	if e.TransactTimeInActingVersion(actingVersion) {
		if e.TransactTime < e.TransactTimeMinValue() || e.TransactTime > e.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on e.TransactTime (%v < %v > %v)", e.TransactTimeMinValue(), e.TransactTime, e.TransactTimeMaxValue())
		}
	}
	if e.PriceExponentInActingVersion(actingVersion) {
		if e.PriceExponent < e.PriceExponentMinValue() || e.PriceExponent > e.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on e.PriceExponent (%v < %v > %v)", e.PriceExponentMinValue(), e.PriceExponent, e.PriceExponentMaxValue())
		}
	}
	if e.QtyExponentInActingVersion(actingVersion) {
		if e.QtyExponent < e.QtyExponentMinValue() || e.QtyExponent > e.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on e.QtyExponent (%v < %v > %v)", e.QtyExponentMinValue(), e.QtyExponent, e.QtyExponentMaxValue())
		}
	}
	if e.CommissionExponentInActingVersion(actingVersion) {
		if e.CommissionExponent < e.CommissionExponentMinValue() || e.CommissionExponent > e.CommissionExponentMaxValue() {
			return fmt.Errorf("Range check failed on e.CommissionExponent (%v < %v > %v)", e.CommissionExponentMinValue(), e.CommissionExponent, e.CommissionExponentMaxValue())
		}
	}
	if e.OrderCreationTimeInActingVersion(actingVersion) {
		if e.OrderCreationTime != e.OrderCreationTimeNullValue() && (e.OrderCreationTime < e.OrderCreationTimeMinValue() || e.OrderCreationTime > e.OrderCreationTimeMaxValue()) {
			return fmt.Errorf("Range check failed on e.OrderCreationTime (%v < %v > %v)", e.OrderCreationTimeMinValue(), e.OrderCreationTime, e.OrderCreationTimeMaxValue())
		}
	}
	if e.WorkingTimeInActingVersion(actingVersion) {
		if e.WorkingTime != e.WorkingTimeNullValue() && (e.WorkingTime < e.WorkingTimeMinValue() || e.WorkingTime > e.WorkingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on e.WorkingTime (%v < %v > %v)", e.WorkingTimeMinValue(), e.WorkingTime, e.WorkingTimeMaxValue())
		}
	}
	if e.OrderIdInActingVersion(actingVersion) {
		if e.OrderId < e.OrderIdMinValue() || e.OrderId > e.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on e.OrderId (%v < %v > %v)", e.OrderIdMinValue(), e.OrderId, e.OrderIdMaxValue())
		}
	}
	if e.OrderListIdInActingVersion(actingVersion) {
		if e.OrderListId != e.OrderListIdNullValue() && (e.OrderListId < e.OrderListIdMinValue() || e.OrderListId > e.OrderListIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.OrderListId (%v < %v > %v)", e.OrderListIdMinValue(), e.OrderListId, e.OrderListIdMaxValue())
		}
	}
	if e.OrigQtyInActingVersion(actingVersion) {
		if e.OrigQty < e.OrigQtyMinValue() || e.OrigQty > e.OrigQtyMaxValue() {
			return fmt.Errorf("Range check failed on e.OrigQty (%v < %v > %v)", e.OrigQtyMinValue(), e.OrigQty, e.OrigQtyMaxValue())
		}
	}
	if e.PriceInActingVersion(actingVersion) {
		if e.Price < e.PriceMinValue() || e.Price > e.PriceMaxValue() {
			return fmt.Errorf("Range check failed on e.Price (%v < %v > %v)", e.PriceMinValue(), e.Price, e.PriceMaxValue())
		}
	}
	if e.OrigQuoteOrderQtyInActingVersion(actingVersion) {
		if e.OrigQuoteOrderQty < e.OrigQuoteOrderQtyMinValue() || e.OrigQuoteOrderQty > e.OrigQuoteOrderQtyMaxValue() {
			return fmt.Errorf("Range check failed on e.OrigQuoteOrderQty (%v < %v > %v)", e.OrigQuoteOrderQtyMinValue(), e.OrigQuoteOrderQty, e.OrigQuoteOrderQtyMaxValue())
		}
	}
	if e.IcebergQtyInActingVersion(actingVersion) {
		if e.IcebergQty < e.IcebergQtyMinValue() || e.IcebergQty > e.IcebergQtyMaxValue() {
			return fmt.Errorf("Range check failed on e.IcebergQty (%v < %v > %v)", e.IcebergQtyMinValue(), e.IcebergQty, e.IcebergQtyMaxValue())
		}
	}
	if e.StopPriceInActingVersion(actingVersion) {
		if e.StopPrice < e.StopPriceMinValue() || e.StopPrice > e.StopPriceMaxValue() {
			return fmt.Errorf("Range check failed on e.StopPrice (%v < %v > %v)", e.StopPriceMinValue(), e.StopPrice, e.StopPriceMaxValue())
		}
	}
	if err := e.OrderType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.Side.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.TimeInForce.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.ExecutionType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.OrderStatus.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.TradeIdInActingVersion(actingVersion) {
		if e.TradeId != e.TradeIdNullValue() && (e.TradeId < e.TradeIdMinValue() || e.TradeId > e.TradeIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.TradeId (%v < %v > %v)", e.TradeIdMinValue(), e.TradeId, e.TradeIdMaxValue())
		}
	}
	if e.ExecutionIdInActingVersion(actingVersion) {
		if e.ExecutionId < e.ExecutionIdMinValue() || e.ExecutionId > e.ExecutionIdMaxValue() {
			return fmt.Errorf("Range check failed on e.ExecutionId (%v < %v > %v)", e.ExecutionIdMinValue(), e.ExecutionId, e.ExecutionIdMaxValue())
		}
	}
	if e.ExecutedQtyInActingVersion(actingVersion) {
		if e.ExecutedQty < e.ExecutedQtyMinValue() || e.ExecutedQty > e.ExecutedQtyMaxValue() {
			return fmt.Errorf("Range check failed on e.ExecutedQty (%v < %v > %v)", e.ExecutedQtyMinValue(), e.ExecutedQty, e.ExecutedQtyMaxValue())
		}
	}
	if e.CummulativeQuoteQtyInActingVersion(actingVersion) {
		if e.CummulativeQuoteQty < e.CummulativeQuoteQtyMinValue() || e.CummulativeQuoteQty > e.CummulativeQuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on e.CummulativeQuoteQty (%v < %v > %v)", e.CummulativeQuoteQtyMinValue(), e.CummulativeQuoteQty, e.CummulativeQuoteQtyMaxValue())
		}
	}
	if e.LastQtyInActingVersion(actingVersion) {
		if e.LastQty < e.LastQtyMinValue() || e.LastQty > e.LastQtyMaxValue() {
			return fmt.Errorf("Range check failed on e.LastQty (%v < %v > %v)", e.LastQtyMinValue(), e.LastQty, e.LastQtyMaxValue())
		}
	}
	if e.LastPriceInActingVersion(actingVersion) {
		if e.LastPrice < e.LastPriceMinValue() || e.LastPrice > e.LastPriceMaxValue() {
			return fmt.Errorf("Range check failed on e.LastPrice (%v < %v > %v)", e.LastPriceMinValue(), e.LastPrice, e.LastPriceMaxValue())
		}
	}
	if e.QuoteQtyInActingVersion(actingVersion) {
		if e.QuoteQty < e.QuoteQtyMinValue() || e.QuoteQty > e.QuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on e.QuoteQty (%v < %v > %v)", e.QuoteQtyMinValue(), e.QuoteQty, e.QuoteQtyMaxValue())
		}
	}
	if e.CommissionInActingVersion(actingVersion) {
		if e.Commission < e.CommissionMinValue() || e.Commission > e.CommissionMaxValue() {
			return fmt.Errorf("Range check failed on e.Commission (%v < %v > %v)", e.CommissionMinValue(), e.Commission, e.CommissionMaxValue())
		}
	}
	if err := e.IsWorking.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.IsMaker.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.IsBestMatch.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.MatchType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.SelfTradePreventionMode.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.OrderCapacity.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.WorkingFloor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.UsedSor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.AllocIdInActingVersion(actingVersion) {
		if e.AllocId != e.AllocIdNullValue() && (e.AllocId < e.AllocIdMinValue() || e.AllocId > e.AllocIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.AllocId (%v < %v > %v)", e.AllocIdMinValue(), e.AllocId, e.AllocIdMaxValue())
		}
	}
	if e.TrailingDeltaInActingVersion(actingVersion) {
		if e.TrailingDelta != e.TrailingDeltaNullValue() && (e.TrailingDelta < e.TrailingDeltaMinValue() || e.TrailingDelta > e.TrailingDeltaMaxValue()) {
			return fmt.Errorf("Range check failed on e.TrailingDelta (%v < %v > %v)", e.TrailingDeltaMinValue(), e.TrailingDelta, e.TrailingDeltaMaxValue())
		}
	}
	if e.TrailingTimeInActingVersion(actingVersion) {
		if e.TrailingTime != e.TrailingTimeNullValue() && (e.TrailingTime < e.TrailingTimeMinValue() || e.TrailingTime > e.TrailingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on e.TrailingTime (%v < %v > %v)", e.TrailingTimeMinValue(), e.TrailingTime, e.TrailingTimeMaxValue())
		}
	}
	if e.TradeGroupIdInActingVersion(actingVersion) {
		if e.TradeGroupId != e.TradeGroupIdNullValue() && (e.TradeGroupId < e.TradeGroupIdMinValue() || e.TradeGroupId > e.TradeGroupIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.TradeGroupId (%v < %v > %v)", e.TradeGroupIdMinValue(), e.TradeGroupId, e.TradeGroupIdMaxValue())
		}
	}
	if e.PreventedQtyInActingVersion(actingVersion) {
		if e.PreventedQty < e.PreventedQtyMinValue() || e.PreventedQty > e.PreventedQtyMaxValue() {
			return fmt.Errorf("Range check failed on e.PreventedQty (%v < %v > %v)", e.PreventedQtyMinValue(), e.PreventedQty, e.PreventedQtyMaxValue())
		}
	}
	if e.LastPreventedQtyInActingVersion(actingVersion) {
		if e.LastPreventedQty != e.LastPreventedQtyNullValue() && (e.LastPreventedQty < e.LastPreventedQtyMinValue() || e.LastPreventedQty > e.LastPreventedQtyMaxValue()) {
			return fmt.Errorf("Range check failed on e.LastPreventedQty (%v < %v > %v)", e.LastPreventedQtyMinValue(), e.LastPreventedQty, e.LastPreventedQtyMaxValue())
		}
	}
	if e.PreventedMatchIdInActingVersion(actingVersion) {
		if e.PreventedMatchId != e.PreventedMatchIdNullValue() && (e.PreventedMatchId < e.PreventedMatchIdMinValue() || e.PreventedMatchId > e.PreventedMatchIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.PreventedMatchId (%v < %v > %v)", e.PreventedMatchIdMinValue(), e.PreventedMatchId, e.PreventedMatchIdMaxValue())
		}
	}
	if e.PreventedExecutionQtyInActingVersion(actingVersion) {
		if e.PreventedExecutionQty != e.PreventedExecutionQtyNullValue() && (e.PreventedExecutionQty < e.PreventedExecutionQtyMinValue() || e.PreventedExecutionQty > e.PreventedExecutionQtyMaxValue()) {
			return fmt.Errorf("Range check failed on e.PreventedExecutionQty (%v < %v > %v)", e.PreventedExecutionQtyMinValue(), e.PreventedExecutionQty, e.PreventedExecutionQtyMaxValue())
		}
	}
	if e.PreventedExecutionPriceInActingVersion(actingVersion) {
		if e.PreventedExecutionPrice != e.PreventedExecutionPriceNullValue() && (e.PreventedExecutionPrice < e.PreventedExecutionPriceMinValue() || e.PreventedExecutionPrice > e.PreventedExecutionPriceMaxValue()) {
			return fmt.Errorf("Range check failed on e.PreventedExecutionPrice (%v < %v > %v)", e.PreventedExecutionPriceMinValue(), e.PreventedExecutionPrice, e.PreventedExecutionPriceMaxValue())
		}
	}
	if e.PreventedExecutionQuoteQtyInActingVersion(actingVersion) {
		if e.PreventedExecutionQuoteQty != e.PreventedExecutionQuoteQtyNullValue() && (e.PreventedExecutionQuoteQty < e.PreventedExecutionQuoteQtyMinValue() || e.PreventedExecutionQuoteQty > e.PreventedExecutionQuoteQtyMaxValue()) {
			return fmt.Errorf("Range check failed on e.PreventedExecutionQuoteQty (%v < %v > %v)", e.PreventedExecutionQuoteQtyMinValue(), e.PreventedExecutionQuoteQty, e.PreventedExecutionQuoteQtyMaxValue())
		}
	}
	if e.StrategyTypeInActingVersion(actingVersion) {
		if e.StrategyType != e.StrategyTypeNullValue() && (e.StrategyType < e.StrategyTypeMinValue() || e.StrategyType > e.StrategyTypeMaxValue()) {
			return fmt.Errorf("Range check failed on e.StrategyType (%v < %v > %v)", e.StrategyTypeMinValue(), e.StrategyType, e.StrategyTypeMaxValue())
		}
	}
	if e.StrategyIdInActingVersion(actingVersion) {
		if e.StrategyId != e.StrategyIdNullValue() && (e.StrategyId < e.StrategyIdMinValue() || e.StrategyId > e.StrategyIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.StrategyId (%v < %v > %v)", e.StrategyIdMinValue(), e.StrategyId, e.StrategyIdMaxValue())
		}
	}
	if e.CounterOrderIdInActingVersion(actingVersion) {
		if e.CounterOrderId != e.CounterOrderIdNullValue() && (e.CounterOrderId < e.CounterOrderIdMinValue() || e.CounterOrderId > e.CounterOrderIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.CounterOrderId (%v < %v > %v)", e.CounterOrderIdMinValue(), e.CounterOrderId, e.CounterOrderIdMaxValue())
		}
	}
	if e.SubscriptionIdInActingVersion(actingVersion) {
		if e.SubscriptionId != e.SubscriptionIdNullValue() && (e.SubscriptionId < e.SubscriptionIdMinValue() || e.SubscriptionId > e.SubscriptionIdMaxValue()) {
			return fmt.Errorf("Range check failed on e.SubscriptionId (%v < %v > %v)", e.SubscriptionIdMinValue(), e.SubscriptionId, e.SubscriptionIdMaxValue())
		}
	}
	if err := e.PegPriceType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := e.PegOffsetType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if e.PegOffsetValueInActingVersion(actingVersion) {
		if e.PegOffsetValue != e.PegOffsetValueNullValue() && (e.PegOffsetValue < e.PegOffsetValueMinValue() || e.PegOffsetValue > e.PegOffsetValueMaxValue()) {
			return fmt.Errorf("Range check failed on e.PegOffsetValue (%v < %v > %v)", e.PegOffsetValueMinValue(), e.PegOffsetValue, e.PegOffsetValueMaxValue())
		}
	}
	if e.PeggedPriceInActingVersion(actingVersion) {
		if e.PeggedPrice != e.PeggedPriceNullValue() && (e.PeggedPrice < e.PeggedPriceMinValue() || e.PeggedPrice > e.PeggedPriceMaxValue()) {
			return fmt.Errorf("Range check failed on e.PeggedPrice (%v < %v > %v)", e.PeggedPriceMinValue(), e.PeggedPrice, e.PeggedPriceMaxValue())
		}
	}
	if !utf8.Valid(e.Symbol[:]) {
		return errors.New("e.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(e.ClientOrderId[:]) {
		return errors.New("e.ClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(e.OrigClientOrderId[:]) {
		return errors.New("e.OrigClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(e.CommissionAsset[:]) {
		return errors.New("e.CommissionAsset failed UTF-8 validation")
	}
	if !utf8.Valid(e.RejectReason[:]) {
		return errors.New("e.RejectReason failed UTF-8 validation")
	}
	if !utf8.Valid(e.CounterSymbol[:]) {
		return errors.New("e.CounterSymbol failed UTF-8 validation")
	}
	return nil
}

func ExecutionReportEventInit(e *ExecutionReportEvent) {
	e.OrderCreationTime = math.MinInt64
	e.WorkingTime = math.MinInt64
	e.OrderListId = math.MinInt64
	e.TradeId = math.MinInt64
	e.AllocId = math.MinInt64
	e.TrailingDelta = math.MaxUint64
	e.TrailingTime = math.MinInt64
	e.TradeGroupId = math.MinInt64
	e.LastPreventedQty = math.MinInt64
	e.PreventedMatchId = math.MinInt64
	e.PreventedExecutionQty = math.MinInt64
	e.PreventedExecutionPrice = math.MinInt64
	e.PreventedExecutionQuoteQty = math.MinInt64
	e.StrategyType = math.MinInt32
	e.StrategyId = math.MinInt64
	e.CounterOrderId = math.MinInt64
	e.SubscriptionId = math.MaxUint16
	e.PegOffsetValue = math.MaxUint8
	e.PeggedPrice = math.MinInt64
	return
}

func (*ExecutionReportEvent) SbeBlockLength() (blockLength uint16) {
	return 281
}

func (*ExecutionReportEvent) SbeTemplateId() (templateId uint16) {
	return 603
}

func (*ExecutionReportEvent) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*ExecutionReportEvent) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*ExecutionReportEvent) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*ExecutionReportEvent) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*ExecutionReportEvent) EventTimeId() uint16 {
	return 1
}

func (*ExecutionReportEvent) EventTimeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) EventTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.EventTimeSinceVersion()
}

func (*ExecutionReportEvent) EventTimeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) EventTimeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) EventTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) EventTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) EventTimeNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) TransactTimeId() uint16 {
	return 2
}

func (*ExecutionReportEvent) TransactTimeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.TransactTimeSinceVersion()
}

func (*ExecutionReportEvent) TransactTimeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) TransactTimeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) PriceExponentId() uint16 {
	return 3
}

func (*ExecutionReportEvent) PriceExponentSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PriceExponentSinceVersion()
}

func (*ExecutionReportEvent) PriceExponentDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PriceExponentMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*ExecutionReportEvent) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*ExecutionReportEvent) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*ExecutionReportEvent) QtyExponentId() uint16 {
	return 4
}

func (*ExecutionReportEvent) QtyExponentSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.QtyExponentSinceVersion()
}

func (*ExecutionReportEvent) QtyExponentDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) QtyExponentMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*ExecutionReportEvent) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*ExecutionReportEvent) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*ExecutionReportEvent) CommissionExponentId() uint16 {
	return 5
}

func (*ExecutionReportEvent) CommissionExponentSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) CommissionExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CommissionExponentSinceVersion()
}

func (*ExecutionReportEvent) CommissionExponentDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) CommissionExponentMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) CommissionExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*ExecutionReportEvent) CommissionExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*ExecutionReportEvent) CommissionExponentNullValue() int8 {
	return math.MinInt8
}

func (*ExecutionReportEvent) OrderCreationTimeId() uint16 {
	return 6
}

func (*ExecutionReportEvent) OrderCreationTimeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrderCreationTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrderCreationTimeSinceVersion()
}

func (*ExecutionReportEvent) OrderCreationTimeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) OrderCreationTimeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) OrderCreationTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) OrderCreationTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) OrderCreationTimeNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) WorkingTimeId() uint16 {
	return 7
}

func (*ExecutionReportEvent) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.WorkingTimeSinceVersion()
}

func (*ExecutionReportEvent) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) WorkingTimeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) OrderIdId() uint16 {
	return 8
}

func (*ExecutionReportEvent) OrderIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrderIdSinceVersion()
}

func (*ExecutionReportEvent) OrderIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) OrderIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) OrderListIdId() uint16 {
	return 9
}

func (*ExecutionReportEvent) OrderListIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrderListIdSinceVersion()
}

func (*ExecutionReportEvent) OrderListIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) OrderListIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) OrigQtyId() uint16 {
	return 10
}

func (*ExecutionReportEvent) OrigQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrigQtySinceVersion()
}

func (*ExecutionReportEvent) OrigQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) OrigQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) PriceId() uint16 {
	return 11
}

func (*ExecutionReportEvent) PriceSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PriceSinceVersion()
}

func (*ExecutionReportEvent) PriceDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PriceMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) PriceNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) OrigQuoteOrderQtyId() uint16 {
	return 12
}

func (*ExecutionReportEvent) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrigQuoteOrderQtySinceVersion()
}

func (*ExecutionReportEvent) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) OrigQuoteOrderQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) IcebergQtyId() uint16 {
	return 13
}

func (*ExecutionReportEvent) IcebergQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IcebergQtySinceVersion()
}

func (*ExecutionReportEvent) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) IcebergQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) StopPriceId() uint16 {
	return 14
}

func (*ExecutionReportEvent) StopPriceSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.StopPriceSinceVersion()
}

func (*ExecutionReportEvent) StopPriceDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) StopPriceMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) OrderTypeId() uint16 {
	return 15
}

func (*ExecutionReportEvent) OrderTypeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrderTypeSinceVersion()
}

func (*ExecutionReportEvent) OrderTypeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) OrderTypeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) SideId() uint16 {
	return 16
}

func (*ExecutionReportEvent) SideSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SideSinceVersion()
}

func (*ExecutionReportEvent) SideDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) SideMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) TimeInForceId() uint16 {
	return 17
}

func (*ExecutionReportEvent) TimeInForceSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.TimeInForceSinceVersion()
}

func (*ExecutionReportEvent) TimeInForceDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) TimeInForceMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) ExecutionTypeId() uint16 {
	return 18
}

func (*ExecutionReportEvent) ExecutionTypeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) ExecutionTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ExecutionTypeSinceVersion()
}

func (*ExecutionReportEvent) ExecutionTypeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) ExecutionTypeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) OrderStatusId() uint16 {
	return 19
}

func (*ExecutionReportEvent) OrderStatusSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrderStatusSinceVersion()
}

func (*ExecutionReportEvent) OrderStatusDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) OrderStatusMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) TradeIdId() uint16 {
	return 20
}

func (*ExecutionReportEvent) TradeIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) TradeIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.TradeIdSinceVersion()
}

func (*ExecutionReportEvent) TradeIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) TradeIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) TradeIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) TradeIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) TradeIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) ExecutionIdId() uint16 {
	return 21
}

func (*ExecutionReportEvent) ExecutionIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) ExecutionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ExecutionIdSinceVersion()
}

func (*ExecutionReportEvent) ExecutionIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) ExecutionIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) ExecutionIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) ExecutionIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) ExecutionIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) ExecutedQtyId() uint16 {
	return 22
}

func (*ExecutionReportEvent) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ExecutedQtySinceVersion()
}

func (*ExecutionReportEvent) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) ExecutedQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) CummulativeQuoteQtyId() uint16 {
	return 23
}

func (*ExecutionReportEvent) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CummulativeQuoteQtySinceVersion()
}

func (*ExecutionReportEvent) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) CummulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) LastQtyId() uint16 {
	return 24
}

func (*ExecutionReportEvent) LastQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) LastQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.LastQtySinceVersion()
}

func (*ExecutionReportEvent) LastQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) LastQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) LastQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) LastQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) LastQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) LastPriceId() uint16 {
	return 25
}

func (*ExecutionReportEvent) LastPriceSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) LastPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.LastPriceSinceVersion()
}

func (*ExecutionReportEvent) LastPriceDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) LastPriceMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) LastPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) LastPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) LastPriceNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) QuoteQtyId() uint16 {
	return 26
}

func (*ExecutionReportEvent) QuoteQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) QuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.QuoteQtySinceVersion()
}

func (*ExecutionReportEvent) QuoteQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) QuoteQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) QuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) QuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) QuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) CommissionId() uint16 {
	return 27
}

func (*ExecutionReportEvent) CommissionSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) CommissionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CommissionSinceVersion()
}

func (*ExecutionReportEvent) CommissionDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) CommissionMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) CommissionMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) CommissionMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) CommissionNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) IsWorkingId() uint16 {
	return 28
}

func (*ExecutionReportEvent) IsWorkingSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) IsWorkingInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IsWorkingSinceVersion()
}

func (*ExecutionReportEvent) IsWorkingDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) IsWorkingMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) IsMakerId() uint16 {
	return 29
}

func (*ExecutionReportEvent) IsMakerSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) IsMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IsMakerSinceVersion()
}

func (*ExecutionReportEvent) IsMakerDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) IsMakerMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) IsBestMatchId() uint16 {
	return 30
}

func (*ExecutionReportEvent) IsBestMatchSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) IsBestMatchInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.IsBestMatchSinceVersion()
}

func (*ExecutionReportEvent) IsBestMatchDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) IsBestMatchMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) MatchTypeId() uint16 {
	return 31
}

func (*ExecutionReportEvent) MatchTypeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) MatchTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.MatchTypeSinceVersion()
}

func (*ExecutionReportEvent) MatchTypeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) MatchTypeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) SelfTradePreventionModeId() uint16 {
	return 32
}

func (*ExecutionReportEvent) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SelfTradePreventionModeSinceVersion()
}

func (*ExecutionReportEvent) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) OrderCapacityId() uint16 {
	return 33
}

func (*ExecutionReportEvent) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrderCapacitySinceVersion()
}

func (*ExecutionReportEvent) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) OrderCapacityMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) WorkingFloorId() uint16 {
	return 34
}

func (*ExecutionReportEvent) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.WorkingFloorSinceVersion()
}

func (*ExecutionReportEvent) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) WorkingFloorMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) UsedSorId() uint16 {
	return 35
}

func (*ExecutionReportEvent) UsedSorSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.UsedSorSinceVersion()
}

func (*ExecutionReportEvent) UsedSorDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) UsedSorMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) AllocIdId() uint16 {
	return 36
}

func (*ExecutionReportEvent) AllocIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) AllocIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.AllocIdSinceVersion()
}

func (*ExecutionReportEvent) AllocIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) AllocIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) AllocIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) AllocIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) AllocIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) TrailingDeltaId() uint16 {
	return 37
}

func (*ExecutionReportEvent) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.TrailingDeltaSinceVersion()
}

func (*ExecutionReportEvent) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) TrailingDeltaMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) TrailingDeltaMinValue() uint64 {
	return 0
}

func (*ExecutionReportEvent) TrailingDeltaMaxValue() uint64 {
	return math.MaxUint64 - 1
}

func (*ExecutionReportEvent) TrailingDeltaNullValue() uint64 {
	return math.MaxUint64
}

func (*ExecutionReportEvent) TrailingTimeId() uint16 {
	return 38
}

func (*ExecutionReportEvent) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.TrailingTimeSinceVersion()
}

func (*ExecutionReportEvent) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) TrailingTimeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) TradeGroupIdId() uint16 {
	return 39
}

func (*ExecutionReportEvent) TradeGroupIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) TradeGroupIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.TradeGroupIdSinceVersion()
}

func (*ExecutionReportEvent) TradeGroupIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) TradeGroupIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) TradeGroupIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) TradeGroupIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) TradeGroupIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) PreventedQtyId() uint16 {
	return 40
}

func (*ExecutionReportEvent) PreventedQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) PreventedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PreventedQtySinceVersion()
}

func (*ExecutionReportEvent) PreventedQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PreventedQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PreventedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) PreventedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) PreventedQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) LastPreventedQtyId() uint16 {
	return 41
}

func (*ExecutionReportEvent) LastPreventedQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) LastPreventedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.LastPreventedQtySinceVersion()
}

func (*ExecutionReportEvent) LastPreventedQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) LastPreventedQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) LastPreventedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) LastPreventedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) LastPreventedQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) PreventedMatchIdId() uint16 {
	return 42
}

func (*ExecutionReportEvent) PreventedMatchIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) PreventedMatchIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PreventedMatchIdSinceVersion()
}

func (*ExecutionReportEvent) PreventedMatchIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PreventedMatchIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PreventedMatchIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) PreventedMatchIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) PreventedMatchIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) PreventedExecutionQtyId() uint16 {
	return 43
}

func (*ExecutionReportEvent) PreventedExecutionQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) PreventedExecutionQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PreventedExecutionQtySinceVersion()
}

func (*ExecutionReportEvent) PreventedExecutionQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PreventedExecutionQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PreventedExecutionQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) PreventedExecutionQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) PreventedExecutionQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) PreventedExecutionPriceId() uint16 {
	return 44
}

func (*ExecutionReportEvent) PreventedExecutionPriceSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) PreventedExecutionPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PreventedExecutionPriceSinceVersion()
}

func (*ExecutionReportEvent) PreventedExecutionPriceDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PreventedExecutionPriceMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PreventedExecutionPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) PreventedExecutionPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) PreventedExecutionPriceNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) PreventedExecutionQuoteQtyId() uint16 {
	return 45
}

func (*ExecutionReportEvent) PreventedExecutionQuoteQtySinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) PreventedExecutionQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PreventedExecutionQuoteQtySinceVersion()
}

func (*ExecutionReportEvent) PreventedExecutionQuoteQtyDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PreventedExecutionQuoteQtyMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PreventedExecutionQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) PreventedExecutionQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) PreventedExecutionQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) StrategyTypeId() uint16 {
	return 46
}

func (*ExecutionReportEvent) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.StrategyTypeSinceVersion()
}

func (*ExecutionReportEvent) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) StrategyTypeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*ExecutionReportEvent) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*ExecutionReportEvent) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*ExecutionReportEvent) StrategyIdId() uint16 {
	return 47
}

func (*ExecutionReportEvent) StrategyIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.StrategyIdSinceVersion()
}

func (*ExecutionReportEvent) StrategyIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) StrategyIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) CounterOrderIdId() uint16 {
	return 48
}

func (*ExecutionReportEvent) CounterOrderIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) CounterOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CounterOrderIdSinceVersion()
}

func (*ExecutionReportEvent) CounterOrderIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) CounterOrderIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) CounterOrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) CounterOrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) CounterOrderIdNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) SubscriptionIdId() uint16 {
	return 49
}

func (*ExecutionReportEvent) SubscriptionIdSinceVersion() uint16 {
	return 1
}

func (e *ExecutionReportEvent) SubscriptionIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SubscriptionIdSinceVersion()
}

func (*ExecutionReportEvent) SubscriptionIdDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) SubscriptionIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) SubscriptionIdMinValue() uint16 {
	return 0
}

func (*ExecutionReportEvent) SubscriptionIdMaxValue() uint16 {
	return math.MaxUint16 - 1
}

func (*ExecutionReportEvent) SubscriptionIdNullValue() uint16 {
	return math.MaxUint16
}

func (*ExecutionReportEvent) PegPriceTypeId() uint16 {
	return 50
}

func (*ExecutionReportEvent) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (e *ExecutionReportEvent) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PegPriceTypeSinceVersion()
}

func (*ExecutionReportEvent) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PegPriceTypeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PegOffsetTypeId() uint16 {
	return 51
}

func (*ExecutionReportEvent) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (e *ExecutionReportEvent) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PegOffsetTypeSinceVersion()
}

func (*ExecutionReportEvent) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PegOffsetValueId() uint16 {
	return 52
}

func (*ExecutionReportEvent) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (e *ExecutionReportEvent) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PegOffsetValueSinceVersion()
}

func (*ExecutionReportEvent) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PegOffsetValueMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*ExecutionReportEvent) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*ExecutionReportEvent) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*ExecutionReportEvent) PeggedPriceId() uint16 {
	return 53
}

func (*ExecutionReportEvent) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (e *ExecutionReportEvent) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.PeggedPriceSinceVersion()
}

func (*ExecutionReportEvent) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*ExecutionReportEvent) PeggedPriceMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*ExecutionReportEvent) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*ExecutionReportEvent) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*ExecutionReportEvent) SymbolMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) SymbolSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.SymbolSinceVersion()
}

func (*ExecutionReportEvent) SymbolDeprecated() uint16 {
	return 0
}

func (ExecutionReportEvent) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (ExecutionReportEvent) SymbolHeaderLength() uint64 {
	return 1
}

func (*ExecutionReportEvent) ClientOrderIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ClientOrderIdSinceVersion()
}

func (*ExecutionReportEvent) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (ExecutionReportEvent) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (ExecutionReportEvent) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*ExecutionReportEvent) OrigClientOrderIdMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) OrigClientOrderIdSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) OrigClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.OrigClientOrderIdSinceVersion()
}

func (*ExecutionReportEvent) OrigClientOrderIdDeprecated() uint16 {
	return 0
}

func (ExecutionReportEvent) OrigClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (ExecutionReportEvent) OrigClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*ExecutionReportEvent) CommissionAssetMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) CommissionAssetSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) CommissionAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CommissionAssetSinceVersion()
}

func (*ExecutionReportEvent) CommissionAssetDeprecated() uint16 {
	return 0
}

func (ExecutionReportEvent) CommissionAssetCharacterEncoding() string {
	return "UTF-8"
}

func (ExecutionReportEvent) CommissionAssetHeaderLength() uint64 {
	return 1
}

func (*ExecutionReportEvent) RejectReasonMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) RejectReasonSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) RejectReasonInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.RejectReasonSinceVersion()
}

func (*ExecutionReportEvent) RejectReasonDeprecated() uint16 {
	return 0
}

func (ExecutionReportEvent) RejectReasonCharacterEncoding() string {
	return "UTF-8"
}

func (ExecutionReportEvent) RejectReasonHeaderLength() uint64 {
	return 1
}

func (*ExecutionReportEvent) CounterSymbolMetaAttribute(meta int) string {
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

func (*ExecutionReportEvent) CounterSymbolSinceVersion() uint16 {
	return 0
}

func (e *ExecutionReportEvent) CounterSymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CounterSymbolSinceVersion()
}

func (*ExecutionReportEvent) CounterSymbolDeprecated() uint16 {
	return 0
}

func (ExecutionReportEvent) CounterSymbolCharacterEncoding() string {
	return "UTF-8"
}

func (ExecutionReportEvent) CounterSymbolHeaderLength() uint64 {
	return 1
}

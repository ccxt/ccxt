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

type NewOrderFullResponse struct {
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
	Fills                   []NewOrderFullResponseFills
	PreventedMatches        []NewOrderFullResponsePreventedMatches
	Symbol                  []uint8
	ClientOrderId           []uint8
}
type NewOrderFullResponseFills struct {
	CommissionExponent int8
	MatchType          MatchTypeEnum
	Price              int64
	Qty                int64
	Commission         int64
	TradeId            int64
	AllocId            int64
	CommissionAsset    []uint8
}
type NewOrderFullResponsePreventedMatches struct {
	PreventedMatchId       int64
	MakerOrderId           int64
	Price                  int64
	TakerPreventedQuantity int64
	MakerPreventedQuantity int64
	MakerSymbol            []uint8
}

func (n *NewOrderFullResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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
	var FillsBlockLength uint16 = 42
	if err := _m.WriteUint16(_w, FillsBlockLength); err != nil {
		return err
	}
	var FillsNumInGroup uint32 = uint32(len(n.Fills))
	if err := _m.WriteUint32(_w, FillsNumInGroup); err != nil {
		return err
	}
	for i := range n.Fills {
		if err := n.Fills[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var PreventedMatchesBlockLength uint16 = 40
	if err := _m.WriteUint16(_w, PreventedMatchesBlockLength); err != nil {
		return err
	}
	var PreventedMatchesNumInGroup uint32 = uint32(len(n.PreventedMatches))
	if err := _m.WriteUint32(_w, PreventedMatchesNumInGroup); err != nil {
		return err
	}
	for i := range n.PreventedMatches {
		if err := n.PreventedMatches[i].Encode(_m, _w); err != nil {
			return err
		}
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

func (n *NewOrderFullResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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

	if n.FillsInActingVersion(actingVersion) {
		var FillsBlockLength uint16
		if err := _m.ReadUint16(_r, &FillsBlockLength); err != nil {
			return err
		}
		var FillsNumInGroup uint32
		if err := _m.ReadUint32(_r, &FillsNumInGroup); err != nil {
			return err
		}
		if cap(n.Fills) < int(FillsNumInGroup) {
			n.Fills = make([]NewOrderFullResponseFills, FillsNumInGroup)
		}
		n.Fills = n.Fills[:FillsNumInGroup]
		for i := range n.Fills {
			if err := n.Fills[i].Decode(_m, _r, actingVersion, uint(FillsBlockLength)); err != nil {
				return err
			}
		}
	}

	if n.PreventedMatchesInActingVersion(actingVersion) {
		var PreventedMatchesBlockLength uint16
		if err := _m.ReadUint16(_r, &PreventedMatchesBlockLength); err != nil {
			return err
		}
		var PreventedMatchesNumInGroup uint32
		if err := _m.ReadUint32(_r, &PreventedMatchesNumInGroup); err != nil {
			return err
		}
		if cap(n.PreventedMatches) < int(PreventedMatchesNumInGroup) {
			n.PreventedMatches = make([]NewOrderFullResponsePreventedMatches, PreventedMatchesNumInGroup)
		}
		n.PreventedMatches = n.PreventedMatches[:PreventedMatchesNumInGroup]
		for i := range n.PreventedMatches {
			if err := n.PreventedMatches[i].Decode(_m, _r, actingVersion, uint(PreventedMatchesBlockLength)); err != nil {
				return err
			}
		}
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

func (n *NewOrderFullResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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
	for i := range n.Fills {
		if err := n.Fills[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range n.PreventedMatches {
		if err := n.PreventedMatches[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
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

func NewOrderFullResponseInit(n *NewOrderFullResponse) {
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

func (n *NewOrderFullResponseFills) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, n.CommissionExponent); err != nil {
		return err
	}
	if err := n.MatchType.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.Qty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.Commission); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TradeId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.AllocId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.CommissionAsset))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.CommissionAsset); err != nil {
		return err
	}
	return nil
}

func (n *NewOrderFullResponseFills) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !n.CommissionExponentInActingVersion(actingVersion) {
		n.CommissionExponent = n.CommissionExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &n.CommissionExponent); err != nil {
			return err
		}
	}
	if n.MatchTypeInActingVersion(actingVersion) {
		if err := n.MatchType.Decode(_m, _r, actingVersion); err != nil {
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
	if !n.QtyInActingVersion(actingVersion) {
		n.Qty = n.QtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.Qty); err != nil {
			return err
		}
	}
	if !n.CommissionInActingVersion(actingVersion) {
		n.Commission = n.CommissionNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.Commission); err != nil {
			return err
		}
	}
	if !n.TradeIdInActingVersion(actingVersion) {
		n.TradeId = n.TradeIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TradeId); err != nil {
			return err
		}
	}
	if !n.AllocIdInActingVersion(actingVersion) {
		n.AllocId = n.AllocIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.AllocId); err != nil {
			return err
		}
	}
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}

	if n.CommissionAssetInActingVersion(actingVersion) {
		var CommissionAssetLength uint8
		if err := _m.ReadUint8(_r, &CommissionAssetLength); err != nil {
			return err
		}
		if cap(n.CommissionAsset) < int(CommissionAssetLength) {
			n.CommissionAsset = make([]uint8, CommissionAssetLength)
		}
		n.CommissionAsset = n.CommissionAsset[:CommissionAssetLength]
		if err := _m.ReadBytes(_r, n.CommissionAsset); err != nil {
			return err
		}
	}
	return nil
}

func (n *NewOrderFullResponseFills) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.CommissionExponentInActingVersion(actingVersion) {
		if n.CommissionExponent < n.CommissionExponentMinValue() || n.CommissionExponent > n.CommissionExponentMaxValue() {
			return fmt.Errorf("Range check failed on n.CommissionExponent (%v < %v > %v)", n.CommissionExponentMinValue(), n.CommissionExponent, n.CommissionExponentMaxValue())
		}
	}
	if err := n.MatchType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.PriceInActingVersion(actingVersion) {
		if n.Price < n.PriceMinValue() || n.Price > n.PriceMaxValue() {
			return fmt.Errorf("Range check failed on n.Price (%v < %v > %v)", n.PriceMinValue(), n.Price, n.PriceMaxValue())
		}
	}
	if n.QtyInActingVersion(actingVersion) {
		if n.Qty < n.QtyMinValue() || n.Qty > n.QtyMaxValue() {
			return fmt.Errorf("Range check failed on n.Qty (%v < %v > %v)", n.QtyMinValue(), n.Qty, n.QtyMaxValue())
		}
	}
	if n.CommissionInActingVersion(actingVersion) {
		if n.Commission < n.CommissionMinValue() || n.Commission > n.CommissionMaxValue() {
			return fmt.Errorf("Range check failed on n.Commission (%v < %v > %v)", n.CommissionMinValue(), n.Commission, n.CommissionMaxValue())
		}
	}
	if n.TradeIdInActingVersion(actingVersion) {
		if n.TradeId != n.TradeIdNullValue() && (n.TradeId < n.TradeIdMinValue() || n.TradeId > n.TradeIdMaxValue()) {
			return fmt.Errorf("Range check failed on n.TradeId (%v < %v > %v)", n.TradeIdMinValue(), n.TradeId, n.TradeIdMaxValue())
		}
	}
	if n.AllocIdInActingVersion(actingVersion) {
		if n.AllocId != n.AllocIdNullValue() && (n.AllocId < n.AllocIdMinValue() || n.AllocId > n.AllocIdMaxValue()) {
			return fmt.Errorf("Range check failed on n.AllocId (%v < %v > %v)", n.AllocIdMinValue(), n.AllocId, n.AllocIdMaxValue())
		}
	}
	if !utf8.Valid(n.CommissionAsset[:]) {
		return errors.New("n.CommissionAsset failed UTF-8 validation")
	}
	return nil
}

func NewOrderFullResponseFillsInit(n *NewOrderFullResponseFills) {
	n.TradeId = math.MinInt64
	n.AllocId = math.MinInt64
	return
}

func (n *NewOrderFullResponsePreventedMatches) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, n.PreventedMatchId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.MakerOrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TakerPreventedQuantity); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.MakerPreventedQuantity); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.MakerSymbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.MakerSymbol); err != nil {
		return err
	}
	return nil
}

func (n *NewOrderFullResponsePreventedMatches) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !n.PreventedMatchIdInActingVersion(actingVersion) {
		n.PreventedMatchId = n.PreventedMatchIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.PreventedMatchId); err != nil {
			return err
		}
	}
	if !n.MakerOrderIdInActingVersion(actingVersion) {
		n.MakerOrderId = n.MakerOrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.MakerOrderId); err != nil {
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
	if !n.TakerPreventedQuantityInActingVersion(actingVersion) {
		n.TakerPreventedQuantity = n.TakerPreventedQuantityNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TakerPreventedQuantity); err != nil {
			return err
		}
	}
	if !n.MakerPreventedQuantityInActingVersion(actingVersion) {
		n.MakerPreventedQuantity = n.MakerPreventedQuantityNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.MakerPreventedQuantity); err != nil {
			return err
		}
	}
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}

	if n.MakerSymbolInActingVersion(actingVersion) {
		var MakerSymbolLength uint8
		if err := _m.ReadUint8(_r, &MakerSymbolLength); err != nil {
			return err
		}
		if cap(n.MakerSymbol) < int(MakerSymbolLength) {
			n.MakerSymbol = make([]uint8, MakerSymbolLength)
		}
		n.MakerSymbol = n.MakerSymbol[:MakerSymbolLength]
		if err := _m.ReadBytes(_r, n.MakerSymbol); err != nil {
			return err
		}
	}
	return nil
}

func (n *NewOrderFullResponsePreventedMatches) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.PreventedMatchIdInActingVersion(actingVersion) {
		if n.PreventedMatchId < n.PreventedMatchIdMinValue() || n.PreventedMatchId > n.PreventedMatchIdMaxValue() {
			return fmt.Errorf("Range check failed on n.PreventedMatchId (%v < %v > %v)", n.PreventedMatchIdMinValue(), n.PreventedMatchId, n.PreventedMatchIdMaxValue())
		}
	}
	if n.MakerOrderIdInActingVersion(actingVersion) {
		if n.MakerOrderId != n.MakerOrderIdNullValue() && (n.MakerOrderId < n.MakerOrderIdMinValue() || n.MakerOrderId > n.MakerOrderIdMaxValue()) {
			return fmt.Errorf("Range check failed on n.MakerOrderId (%v < %v > %v)", n.MakerOrderIdMinValue(), n.MakerOrderId, n.MakerOrderIdMaxValue())
		}
	}
	if n.PriceInActingVersion(actingVersion) {
		if n.Price != n.PriceNullValue() && (n.Price < n.PriceMinValue() || n.Price > n.PriceMaxValue()) {
			return fmt.Errorf("Range check failed on n.Price (%v < %v > %v)", n.PriceMinValue(), n.Price, n.PriceMaxValue())
		}
	}
	if n.TakerPreventedQuantityInActingVersion(actingVersion) {
		if n.TakerPreventedQuantity != n.TakerPreventedQuantityNullValue() && (n.TakerPreventedQuantity < n.TakerPreventedQuantityMinValue() || n.TakerPreventedQuantity > n.TakerPreventedQuantityMaxValue()) {
			return fmt.Errorf("Range check failed on n.TakerPreventedQuantity (%v < %v > %v)", n.TakerPreventedQuantityMinValue(), n.TakerPreventedQuantity, n.TakerPreventedQuantityMaxValue())
		}
	}
	if n.MakerPreventedQuantityInActingVersion(actingVersion) {
		if n.MakerPreventedQuantity != n.MakerPreventedQuantityNullValue() && (n.MakerPreventedQuantity < n.MakerPreventedQuantityMinValue() || n.MakerPreventedQuantity > n.MakerPreventedQuantityMaxValue()) {
			return fmt.Errorf("Range check failed on n.MakerPreventedQuantity (%v < %v > %v)", n.MakerPreventedQuantityMinValue(), n.MakerPreventedQuantity, n.MakerPreventedQuantityMaxValue())
		}
	}
	if !utf8.Valid(n.MakerSymbol[:]) {
		return errors.New("n.MakerSymbol failed UTF-8 validation")
	}
	return nil
}

func NewOrderFullResponsePreventedMatchesInit(n *NewOrderFullResponsePreventedMatches) {
	n.MakerOrderId = math.MinInt64
	n.Price = math.MinInt64
	n.TakerPreventedQuantity = math.MinInt64
	n.MakerPreventedQuantity = math.MinInt64
	return
}

func (*NewOrderFullResponse) SbeBlockLength() (blockLength uint16) {
	return 153
}

func (*NewOrderFullResponse) SbeTemplateId() (templateId uint16) {
	return 302
}

func (*NewOrderFullResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*NewOrderFullResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*NewOrderFullResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*NewOrderFullResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*NewOrderFullResponse) PriceExponentId() uint16 {
	return 1
}

func (*NewOrderFullResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceExponentSinceVersion()
}

func (*NewOrderFullResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderFullResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderFullResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderFullResponse) QtyExponentId() uint16 {
	return 2
}

func (*NewOrderFullResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.QtyExponentSinceVersion()
}

func (*NewOrderFullResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderFullResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderFullResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderFullResponse) OrderIdId() uint16 {
	return 3
}

func (*NewOrderFullResponse) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderFullResponse) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) OrderIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) OrderListIdId() uint16 {
	return 4
}

func (*NewOrderFullResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderFullResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) TransactTimeId() uint16 {
	return 5
}

func (*NewOrderFullResponse) TransactTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactTimeSinceVersion()
}

func (*NewOrderFullResponse) TransactTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) TransactTimeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) PriceId() uint16 {
	return 6
}

func (*NewOrderFullResponse) PriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceSinceVersion()
}

func (*NewOrderFullResponse) PriceDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) PriceMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) PriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) OrigQtyId() uint16 {
	return 7
}

func (*NewOrderFullResponse) OrigQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrigQtySinceVersion()
}

func (*NewOrderFullResponse) OrigQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) OrigQtyMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) ExecutedQtyId() uint16 {
	return 8
}

func (*NewOrderFullResponse) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ExecutedQtySinceVersion()
}

func (*NewOrderFullResponse) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) ExecutedQtyMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) CummulativeQuoteQtyId() uint16 {
	return 9
}

func (*NewOrderFullResponse) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CummulativeQuoteQtySinceVersion()
}

func (*NewOrderFullResponse) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) CummulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) StatusId() uint16 {
	return 10
}

func (*NewOrderFullResponse) StatusSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StatusSinceVersion()
}

func (*NewOrderFullResponse) StatusDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) StatusMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) TimeInForceId() uint16 {
	return 11
}

func (*NewOrderFullResponse) TimeInForceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TimeInForceSinceVersion()
}

func (*NewOrderFullResponse) TimeInForceDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) TimeInForceMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) OrderTypeId() uint16 {
	return 12
}

func (*NewOrderFullResponse) OrderTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderTypeSinceVersion()
}

func (*NewOrderFullResponse) OrderTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) OrderTypeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) SideId() uint16 {
	return 13
}

func (*NewOrderFullResponse) SideSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SideSinceVersion()
}

func (*NewOrderFullResponse) SideDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) SideMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) StopPriceId() uint16 {
	return 14
}

func (*NewOrderFullResponse) StopPriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StopPriceSinceVersion()
}

func (*NewOrderFullResponse) StopPriceDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) StopPriceMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) TrailingDeltaId() uint16 {
	return 15
}

func (*NewOrderFullResponse) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TrailingDeltaSinceVersion()
}

func (*NewOrderFullResponse) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) TrailingDeltaMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) TrailingTimeId() uint16 {
	return 16
}

func (*NewOrderFullResponse) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TrailingTimeSinceVersion()
}

func (*NewOrderFullResponse) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) TrailingTimeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) WorkingTimeId() uint16 {
	return 17
}

func (*NewOrderFullResponse) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.WorkingTimeSinceVersion()
}

func (*NewOrderFullResponse) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) WorkingTimeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) IcebergQtyId() uint16 {
	return 18
}

func (*NewOrderFullResponse) IcebergQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.IcebergQtySinceVersion()
}

func (*NewOrderFullResponse) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) IcebergQtyMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) StrategyIdId() uint16 {
	return 19
}

func (*NewOrderFullResponse) StrategyIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StrategyIdSinceVersion()
}

func (*NewOrderFullResponse) StrategyIdDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) StrategyIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) StrategyTypeId() uint16 {
	return 20
}

func (*NewOrderFullResponse) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StrategyTypeSinceVersion()
}

func (*NewOrderFullResponse) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) StrategyTypeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*NewOrderFullResponse) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*NewOrderFullResponse) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*NewOrderFullResponse) OrderCapacityId() uint16 {
	return 21
}

func (*NewOrderFullResponse) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderCapacitySinceVersion()
}

func (*NewOrderFullResponse) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) OrderCapacityMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) WorkingFloorId() uint16 {
	return 22
}

func (*NewOrderFullResponse) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.WorkingFloorSinceVersion()
}

func (*NewOrderFullResponse) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) WorkingFloorMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) SelfTradePreventionModeId() uint16 {
	return 23
}

func (*NewOrderFullResponse) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SelfTradePreventionModeSinceVersion()
}

func (*NewOrderFullResponse) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) TradeGroupIdId() uint16 {
	return 24
}

func (*NewOrderFullResponse) TradeGroupIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) TradeGroupIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TradeGroupIdSinceVersion()
}

func (*NewOrderFullResponse) TradeGroupIdDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) TradeGroupIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) TradeGroupIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) TradeGroupIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) TradeGroupIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) PreventedQuantityId() uint16 {
	return 25
}

func (*NewOrderFullResponse) PreventedQuantitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) PreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PreventedQuantitySinceVersion()
}

func (*NewOrderFullResponse) PreventedQuantityDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) PreventedQuantityMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) PreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) PreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) PreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) UsedSorId() uint16 {
	return 26
}

func (*NewOrderFullResponse) UsedSorSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.UsedSorSinceVersion()
}

func (*NewOrderFullResponse) UsedSorDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) UsedSorMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) OrigQuoteOrderQtyId() uint16 {
	return 27
}

func (*NewOrderFullResponse) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrigQuoteOrderQtySinceVersion()
}

func (*NewOrderFullResponse) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) OrigQuoteOrderQtyMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponse) PegPriceTypeId() uint16 {
	return 28
}

func (*NewOrderFullResponse) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (n *NewOrderFullResponse) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegPriceTypeSinceVersion()
}

func (*NewOrderFullResponse) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) PegPriceTypeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) PegOffsetTypeId() uint16 {
	return 29
}

func (*NewOrderFullResponse) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (n *NewOrderFullResponse) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegOffsetTypeSinceVersion()
}

func (*NewOrderFullResponse) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) PegOffsetValueId() uint16 {
	return 30
}

func (*NewOrderFullResponse) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (n *NewOrderFullResponse) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegOffsetValueSinceVersion()
}

func (*NewOrderFullResponse) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) PegOffsetValueMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*NewOrderFullResponse) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*NewOrderFullResponse) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*NewOrderFullResponse) PeggedPriceId() uint16 {
	return 31
}

func (*NewOrderFullResponse) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (n *NewOrderFullResponse) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PeggedPriceSinceVersion()
}

func (*NewOrderFullResponse) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponse) PeggedPriceMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponse) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponse) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponseFills) CommissionExponentId() uint16 {
	return 1
}

func (*NewOrderFullResponseFills) CommissionExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponseFills) CommissionExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CommissionExponentSinceVersion()
}

func (*NewOrderFullResponseFills) CommissionExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponseFills) CommissionExponentMetaAttribute(meta int) string {
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

func (*NewOrderFullResponseFills) CommissionExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderFullResponseFills) CommissionExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderFullResponseFills) CommissionExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderFullResponseFills) MatchTypeId() uint16 {
	return 2
}

func (*NewOrderFullResponseFills) MatchTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponseFills) MatchTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MatchTypeSinceVersion()
}

func (*NewOrderFullResponseFills) MatchTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponseFills) MatchTypeMetaAttribute(meta int) string {
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

func (*NewOrderFullResponseFills) PriceId() uint16 {
	return 3
}

func (*NewOrderFullResponseFills) PriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponseFills) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceSinceVersion()
}

func (*NewOrderFullResponseFills) PriceDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponseFills) PriceMetaAttribute(meta int) string {
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

func (*NewOrderFullResponseFills) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponseFills) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponseFills) PriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponseFills) QtyId() uint16 {
	return 4
}

func (*NewOrderFullResponseFills) QtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponseFills) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.QtySinceVersion()
}

func (*NewOrderFullResponseFills) QtyDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponseFills) QtyMetaAttribute(meta int) string {
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

func (*NewOrderFullResponseFills) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponseFills) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponseFills) QtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponseFills) CommissionId() uint16 {
	return 5
}

func (*NewOrderFullResponseFills) CommissionSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponseFills) CommissionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CommissionSinceVersion()
}

func (*NewOrderFullResponseFills) CommissionDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponseFills) CommissionMetaAttribute(meta int) string {
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

func (*NewOrderFullResponseFills) CommissionMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponseFills) CommissionMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponseFills) CommissionNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponseFills) TradeIdId() uint16 {
	return 6
}

func (*NewOrderFullResponseFills) TradeIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponseFills) TradeIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TradeIdSinceVersion()
}

func (*NewOrderFullResponseFills) TradeIdDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponseFills) TradeIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponseFills) TradeIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponseFills) TradeIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponseFills) TradeIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponseFills) AllocIdId() uint16 {
	return 7
}

func (*NewOrderFullResponseFills) AllocIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponseFills) AllocIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.AllocIdSinceVersion()
}

func (*NewOrderFullResponseFills) AllocIdDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponseFills) AllocIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponseFills) AllocIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponseFills) AllocIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponseFills) AllocIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponseFills) CommissionAssetMetaAttribute(meta int) string {
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

func (*NewOrderFullResponseFills) CommissionAssetSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponseFills) CommissionAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CommissionAssetSinceVersion()
}

func (*NewOrderFullResponseFills) CommissionAssetDeprecated() uint16 {
	return 0
}

func (NewOrderFullResponseFills) CommissionAssetCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderFullResponseFills) CommissionAssetHeaderLength() uint64 {
	return 1
}

func (*NewOrderFullResponsePreventedMatches) PreventedMatchIdId() uint16 {
	return 1
}

func (*NewOrderFullResponsePreventedMatches) PreventedMatchIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponsePreventedMatches) PreventedMatchIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PreventedMatchIdSinceVersion()
}

func (*NewOrderFullResponsePreventedMatches) PreventedMatchIdDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponsePreventedMatches) PreventedMatchIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponsePreventedMatches) PreventedMatchIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponsePreventedMatches) PreventedMatchIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponsePreventedMatches) PreventedMatchIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponsePreventedMatches) MakerOrderIdId() uint16 {
	return 2
}

func (*NewOrderFullResponsePreventedMatches) MakerOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponsePreventedMatches) MakerOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MakerOrderIdSinceVersion()
}

func (*NewOrderFullResponsePreventedMatches) MakerOrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponsePreventedMatches) MakerOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponsePreventedMatches) MakerOrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponsePreventedMatches) MakerOrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponsePreventedMatches) MakerOrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponsePreventedMatches) PriceId() uint16 {
	return 3
}

func (*NewOrderFullResponsePreventedMatches) PriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponsePreventedMatches) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceSinceVersion()
}

func (*NewOrderFullResponsePreventedMatches) PriceDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponsePreventedMatches) PriceMetaAttribute(meta int) string {
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

func (*NewOrderFullResponsePreventedMatches) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponsePreventedMatches) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponsePreventedMatches) PriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponsePreventedMatches) TakerPreventedQuantityId() uint16 {
	return 4
}

func (*NewOrderFullResponsePreventedMatches) TakerPreventedQuantitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponsePreventedMatches) TakerPreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TakerPreventedQuantitySinceVersion()
}

func (*NewOrderFullResponsePreventedMatches) TakerPreventedQuantityDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponsePreventedMatches) TakerPreventedQuantityMetaAttribute(meta int) string {
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

func (*NewOrderFullResponsePreventedMatches) TakerPreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponsePreventedMatches) TakerPreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponsePreventedMatches) TakerPreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponsePreventedMatches) MakerPreventedQuantityId() uint16 {
	return 5
}

func (*NewOrderFullResponsePreventedMatches) MakerPreventedQuantitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponsePreventedMatches) MakerPreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MakerPreventedQuantitySinceVersion()
}

func (*NewOrderFullResponsePreventedMatches) MakerPreventedQuantityDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponsePreventedMatches) MakerPreventedQuantityMetaAttribute(meta int) string {
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

func (*NewOrderFullResponsePreventedMatches) MakerPreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderFullResponsePreventedMatches) MakerPreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderFullResponsePreventedMatches) MakerPreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderFullResponsePreventedMatches) MakerSymbolMetaAttribute(meta int) string {
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

func (*NewOrderFullResponsePreventedMatches) MakerSymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponsePreventedMatches) MakerSymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MakerSymbolSinceVersion()
}

func (*NewOrderFullResponsePreventedMatches) MakerSymbolDeprecated() uint16 {
	return 0
}

func (NewOrderFullResponsePreventedMatches) MakerSymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderFullResponsePreventedMatches) MakerSymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderFullResponse) FillsId() uint16 {
	return 100
}

func (*NewOrderFullResponse) FillsSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) FillsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.FillsSinceVersion()
}

func (*NewOrderFullResponse) FillsDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponseFills) SbeBlockLength() (blockLength uint) {
	return 42
}

func (*NewOrderFullResponseFills) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*NewOrderFullResponse) PreventedMatchesId() uint16 {
	return 101
}

func (*NewOrderFullResponse) PreventedMatchesSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) PreventedMatchesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PreventedMatchesSinceVersion()
}

func (*NewOrderFullResponse) PreventedMatchesDeprecated() uint16 {
	return 0
}

func (*NewOrderFullResponsePreventedMatches) SbeBlockLength() (blockLength uint) {
	return 40
}

func (*NewOrderFullResponsePreventedMatches) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*NewOrderFullResponse) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderFullResponse) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderFullResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderFullResponse) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderFullResponse) ClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderFullResponse) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderFullResponse) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderFullResponse) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderFullResponse) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderFullResponse) ClientOrderIdHeaderLength() uint64 {
	return 1
}

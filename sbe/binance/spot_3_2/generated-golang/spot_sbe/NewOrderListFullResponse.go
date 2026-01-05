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

type NewOrderListFullResponse struct {
	OrderListId       int64
	ContingencyType   ContingencyTypeEnum
	ListStatusType    ListStatusTypeEnum
	ListOrderStatus   ListOrderStatusEnum
	TransactionTime   int64
	PriceExponent     int8
	QtyExponent       int8
	Orders            []NewOrderListFullResponseOrders
	OrderReports      []NewOrderListFullResponseOrderReports
	ListClientOrderId []uint8
	Symbol            []uint8
}
type NewOrderListFullResponseOrders struct {
	OrderId       int64
	Symbol        []uint8
	ClientOrderId []uint8
}
type NewOrderListFullResponseOrderReports struct {
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
	Fills                   []NewOrderListFullResponseOrderReportsFills
	PreventedMatches        []NewOrderListFullResponseOrderReportsPreventedMatches
	Symbol                  []uint8
	ClientOrderId           []uint8
}
type NewOrderListFullResponseOrderReportsFills struct {
	CommissionExponent int8
	MatchType          MatchTypeEnum
	Price              int64
	Qty                int64
	Commission         int64
	TradeId            int64
	AllocId            int64
	CommissionAsset    []uint8
}
type NewOrderListFullResponseOrderReportsPreventedMatches struct {
	PreventedMatchId       int64
	MakerOrderId           int64
	Price                  int64
	TakerPreventedQuantity int64
	MakerPreventedQuantity int64
	MakerSymbol            []uint8
}

func (n *NewOrderListFullResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := n.RangeCheck(n.SbeSchemaVersion(), n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, n.OrderListId); err != nil {
		return err
	}
	if err := n.ContingencyType.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.ListStatusType.Encode(_m, _w); err != nil {
		return err
	}
	if err := n.ListOrderStatus.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, n.TransactionTime); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, n.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, n.QtyExponent); err != nil {
		return err
	}
	var OrdersBlockLength uint16 = 8
	if err := _m.WriteUint16(_w, OrdersBlockLength); err != nil {
		return err
	}
	var OrdersNumInGroup uint16 = uint16(len(n.Orders))
	if err := _m.WriteUint16(_w, OrdersNumInGroup); err != nil {
		return err
	}
	for i := range n.Orders {
		if err := n.Orders[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var OrderReportsBlockLength uint16 = 151
	if err := _m.WriteUint16(_w, OrderReportsBlockLength); err != nil {
		return err
	}
	var OrderReportsNumInGroup uint16 = uint16(len(n.OrderReports))
	if err := _m.WriteUint16(_w, OrderReportsNumInGroup); err != nil {
		return err
	}
	for i := range n.OrderReports {
		if err := n.OrderReports[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(n.ListClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.ListClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(n.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, n.Symbol); err != nil {
		return err
	}
	return nil
}

func (n *NewOrderListFullResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !n.OrderListIdInActingVersion(actingVersion) {
		n.OrderListId = n.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderListId); err != nil {
			return err
		}
	}
	if n.ContingencyTypeInActingVersion(actingVersion) {
		if err := n.ContingencyType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.ListStatusTypeInActingVersion(actingVersion) {
		if err := n.ListStatusType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if n.ListOrderStatusInActingVersion(actingVersion) {
		if err := n.ListOrderStatus.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !n.TransactionTimeInActingVersion(actingVersion) {
		n.TransactionTime = n.TransactionTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.TransactionTime); err != nil {
			return err
		}
	}
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
	if actingVersion > n.SbeSchemaVersion() && blockLength > n.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-n.SbeBlockLength()))
	}

	if n.OrdersInActingVersion(actingVersion) {
		var OrdersBlockLength uint16
		if err := _m.ReadUint16(_r, &OrdersBlockLength); err != nil {
			return err
		}
		var OrdersNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrdersNumInGroup); err != nil {
			return err
		}
		if cap(n.Orders) < int(OrdersNumInGroup) {
			n.Orders = make([]NewOrderListFullResponseOrders, OrdersNumInGroup)
		}
		n.Orders = n.Orders[:OrdersNumInGroup]
		for i := range n.Orders {
			if err := n.Orders[i].Decode(_m, _r, actingVersion, uint(OrdersBlockLength)); err != nil {
				return err
			}
		}
	}

	if n.OrderReportsInActingVersion(actingVersion) {
		var OrderReportsBlockLength uint16
		if err := _m.ReadUint16(_r, &OrderReportsBlockLength); err != nil {
			return err
		}
		var OrderReportsNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrderReportsNumInGroup); err != nil {
			return err
		}
		if cap(n.OrderReports) < int(OrderReportsNumInGroup) {
			n.OrderReports = make([]NewOrderListFullResponseOrderReports, OrderReportsNumInGroup)
		}
		n.OrderReports = n.OrderReports[:OrderReportsNumInGroup]
		for i := range n.OrderReports {
			if err := n.OrderReports[i].Decode(_m, _r, actingVersion, uint(OrderReportsBlockLength)); err != nil {
				return err
			}
		}
	}

	if n.ListClientOrderIdInActingVersion(actingVersion) {
		var ListClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ListClientOrderIdLength); err != nil {
			return err
		}
		if cap(n.ListClientOrderId) < int(ListClientOrderIdLength) {
			n.ListClientOrderId = make([]uint8, ListClientOrderIdLength)
		}
		n.ListClientOrderId = n.ListClientOrderId[:ListClientOrderIdLength]
		if err := _m.ReadBytes(_r, n.ListClientOrderId); err != nil {
			return err
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
	if doRangeCheck {
		if err := n.RangeCheck(actingVersion, n.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (n *NewOrderListFullResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.OrderListIdInActingVersion(actingVersion) {
		if n.OrderListId < n.OrderListIdMinValue() || n.OrderListId > n.OrderListIdMaxValue() {
			return fmt.Errorf("Range check failed on n.OrderListId (%v < %v > %v)", n.OrderListIdMinValue(), n.OrderListId, n.OrderListIdMaxValue())
		}
	}
	if err := n.ContingencyType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.ListStatusType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := n.ListOrderStatus.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if n.TransactionTimeInActingVersion(actingVersion) {
		if n.TransactionTime < n.TransactionTimeMinValue() || n.TransactionTime > n.TransactionTimeMaxValue() {
			return fmt.Errorf("Range check failed on n.TransactionTime (%v < %v > %v)", n.TransactionTimeMinValue(), n.TransactionTime, n.TransactionTimeMaxValue())
		}
	}
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
	for i := range n.Orders {
		if err := n.Orders[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range n.OrderReports {
		if err := n.OrderReports[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(n.ListClientOrderId[:]) {
		return errors.New("n.ListClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(n.Symbol[:]) {
		return errors.New("n.Symbol failed UTF-8 validation")
	}
	return nil
}

func NewOrderListFullResponseInit(n *NewOrderListFullResponse) {
	return
}

func (n *NewOrderListFullResponseOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, n.OrderId); err != nil {
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

func (n *NewOrderListFullResponseOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !n.OrderIdInActingVersion(actingVersion) {
		n.OrderId = n.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &n.OrderId); err != nil {
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
	return nil
}

func (n *NewOrderListFullResponseOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if n.OrderIdInActingVersion(actingVersion) {
		if n.OrderId < n.OrderIdMinValue() || n.OrderId > n.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on n.OrderId (%v < %v > %v)", n.OrderIdMinValue(), n.OrderId, n.OrderIdMaxValue())
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

func NewOrderListFullResponseOrdersInit(n *NewOrderListFullResponseOrders) {
	return
}

func (n *NewOrderListFullResponseOrderReports) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (n *NewOrderListFullResponseOrderReports) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
			n.Fills = make([]NewOrderListFullResponseOrderReportsFills, FillsNumInGroup)
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
			n.PreventedMatches = make([]NewOrderListFullResponseOrderReportsPreventedMatches, PreventedMatchesNumInGroup)
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
	return nil
}

func (n *NewOrderListFullResponseOrderReports) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func NewOrderListFullResponseOrderReportsInit(n *NewOrderListFullResponseOrderReports) {
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

func (n *NewOrderListFullResponseOrderReportsFills) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (n *NewOrderListFullResponseOrderReportsFills) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (n *NewOrderListFullResponseOrderReportsFills) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func NewOrderListFullResponseOrderReportsFillsInit(n *NewOrderListFullResponseOrderReportsFills) {
	n.TradeId = math.MinInt64
	n.AllocId = math.MinInt64
	return
}

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func NewOrderListFullResponseOrderReportsPreventedMatchesInit(n *NewOrderListFullResponseOrderReportsPreventedMatches) {
	n.MakerOrderId = math.MinInt64
	n.Price = math.MinInt64
	n.TakerPreventedQuantity = math.MinInt64
	n.MakerPreventedQuantity = math.MinInt64
	return
}

func (*NewOrderListFullResponse) SbeBlockLength() (blockLength uint16) {
	return 21
}

func (*NewOrderListFullResponse) SbeTemplateId() (templateId uint16) {
	return 311
}

func (*NewOrderListFullResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*NewOrderListFullResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderListFullResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*NewOrderListFullResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*NewOrderListFullResponse) OrderListIdId() uint16 {
	return 1
}

func (*NewOrderListFullResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderListFullResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponse) ContingencyTypeId() uint16 {
	return 2
}

func (*NewOrderListFullResponse) ContingencyTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) ContingencyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ContingencyTypeSinceVersion()
}

func (*NewOrderListFullResponse) ContingencyTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponse) ContingencyTypeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) ListStatusTypeId() uint16 {
	return 3
}

func (*NewOrderListFullResponse) ListStatusTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) ListStatusTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListStatusTypeSinceVersion()
}

func (*NewOrderListFullResponse) ListStatusTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponse) ListStatusTypeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) ListOrderStatusId() uint16 {
	return 4
}

func (*NewOrderListFullResponse) ListOrderStatusSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) ListOrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListOrderStatusSinceVersion()
}

func (*NewOrderListFullResponse) ListOrderStatusDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponse) ListOrderStatusMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) TransactionTimeId() uint16 {
	return 5
}

func (*NewOrderListFullResponse) TransactionTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) TransactionTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactionTimeSinceVersion()
}

func (*NewOrderListFullResponse) TransactionTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponse) TransactionTimeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) TransactionTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponse) TransactionTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponse) TransactionTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponse) PriceExponentId() uint16 {
	return 6
}

func (*NewOrderListFullResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceExponentSinceVersion()
}

func (*NewOrderListFullResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderListFullResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderListFullResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderListFullResponse) QtyExponentId() uint16 {
	return 7
}

func (*NewOrderListFullResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.QtyExponentSinceVersion()
}

func (*NewOrderListFullResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderListFullResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderListFullResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderListFullResponseOrders) OrderIdId() uint16 {
	return 1
}

func (*NewOrderListFullResponseOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderListFullResponseOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrders) OrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrders) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListFullResponseOrders) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListFullResponseOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListFullResponseOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderListFullResponseOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderListFullResponseOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListFullResponseOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListFullResponseOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListFullResponseOrderReports) OrderIdId() uint16 {
	return 1
}

func (*NewOrderListFullResponseOrderReports) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) OrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) OrderListIdId() uint16 {
	return 2
}

func (*NewOrderListFullResponseOrderReports) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) OrderListIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) TransactTimeId() uint16 {
	return 3
}

func (*NewOrderListFullResponseOrderReports) TransactTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactTimeSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) TransactTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) TransactTimeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) PriceId() uint16 {
	return 4
}

func (*NewOrderListFullResponseOrderReports) PriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) PriceDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) PriceMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) PriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) OrigQtyId() uint16 {
	return 5
}

func (*NewOrderListFullResponseOrderReports) OrigQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrigQtySinceVersion()
}

func (*NewOrderListFullResponseOrderReports) OrigQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) OrigQtyMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) ExecutedQtyId() uint16 {
	return 6
}

func (*NewOrderListFullResponseOrderReports) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ExecutedQtySinceVersion()
}

func (*NewOrderListFullResponseOrderReports) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) ExecutedQtyMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) CummulativeQuoteQtyId() uint16 {
	return 7
}

func (*NewOrderListFullResponseOrderReports) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CummulativeQuoteQtySinceVersion()
}

func (*NewOrderListFullResponseOrderReports) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) CummulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) StatusId() uint16 {
	return 8
}

func (*NewOrderListFullResponseOrderReports) StatusSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StatusSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) StatusDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) StatusMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) TimeInForceId() uint16 {
	return 9
}

func (*NewOrderListFullResponseOrderReports) TimeInForceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TimeInForceSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) TimeInForceDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) TimeInForceMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) OrderTypeId() uint16 {
	return 10
}

func (*NewOrderListFullResponseOrderReports) OrderTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderTypeSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) OrderTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) OrderTypeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) SideId() uint16 {
	return 11
}

func (*NewOrderListFullResponseOrderReports) SideSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SideSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) SideDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) SideMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) StopPriceId() uint16 {
	return 12
}

func (*NewOrderListFullResponseOrderReports) StopPriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StopPriceSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) StopPriceDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) StopPriceMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) TrailingDeltaId() uint16 {
	return 13
}

func (*NewOrderListFullResponseOrderReports) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TrailingDeltaSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) TrailingDeltaMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) TrailingTimeId() uint16 {
	return 14
}

func (*NewOrderListFullResponseOrderReports) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TrailingTimeSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) TrailingTimeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) WorkingTimeId() uint16 {
	return 15
}

func (*NewOrderListFullResponseOrderReports) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.WorkingTimeSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) WorkingTimeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) IcebergQtyId() uint16 {
	return 16
}

func (*NewOrderListFullResponseOrderReports) IcebergQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.IcebergQtySinceVersion()
}

func (*NewOrderListFullResponseOrderReports) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) IcebergQtyMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) StrategyIdId() uint16 {
	return 17
}

func (*NewOrderListFullResponseOrderReports) StrategyIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StrategyIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) StrategyIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) StrategyIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) StrategyTypeId() uint16 {
	return 18
}

func (*NewOrderListFullResponseOrderReports) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StrategyTypeSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) StrategyTypeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*NewOrderListFullResponseOrderReports) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*NewOrderListFullResponseOrderReports) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*NewOrderListFullResponseOrderReports) OrderCapacityId() uint16 {
	return 19
}

func (*NewOrderListFullResponseOrderReports) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderCapacitySinceVersion()
}

func (*NewOrderListFullResponseOrderReports) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) OrderCapacityMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) WorkingFloorId() uint16 {
	return 20
}

func (*NewOrderListFullResponseOrderReports) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.WorkingFloorSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) WorkingFloorMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) SelfTradePreventionModeId() uint16 {
	return 21
}

func (*NewOrderListFullResponseOrderReports) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SelfTradePreventionModeSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) TradeGroupIdId() uint16 {
	return 22
}

func (*NewOrderListFullResponseOrderReports) TradeGroupIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) TradeGroupIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TradeGroupIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) TradeGroupIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) TradeGroupIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) TradeGroupIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) TradeGroupIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) TradeGroupIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) PreventedQuantityId() uint16 {
	return 23
}

func (*NewOrderListFullResponseOrderReports) PreventedQuantitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) PreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PreventedQuantitySinceVersion()
}

func (*NewOrderListFullResponseOrderReports) PreventedQuantityDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) PreventedQuantityMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) PreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) PreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) PreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) UsedSorId() uint16 {
	return 24
}

func (*NewOrderListFullResponseOrderReports) UsedSorSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.UsedSorSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) UsedSorDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) UsedSorMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) OrigQuoteOrderQtyId() uint16 {
	return 25
}

func (*NewOrderListFullResponseOrderReports) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrigQuoteOrderQtySinceVersion()
}

func (*NewOrderListFullResponseOrderReports) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) OrigQuoteOrderQtyMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReports) PegPriceTypeId() uint16 {
	return 26
}

func (*NewOrderListFullResponseOrderReports) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (n *NewOrderListFullResponseOrderReports) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegPriceTypeSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) PegPriceTypeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) PegOffsetTypeId() uint16 {
	return 27
}

func (*NewOrderListFullResponseOrderReports) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (n *NewOrderListFullResponseOrderReports) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegOffsetTypeSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) PegOffsetValueId() uint16 {
	return 28
}

func (*NewOrderListFullResponseOrderReports) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (n *NewOrderListFullResponseOrderReports) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegOffsetValueSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) PegOffsetValueMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*NewOrderListFullResponseOrderReports) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*NewOrderListFullResponseOrderReports) PeggedPriceId() uint16 {
	return 29
}

func (*NewOrderListFullResponseOrderReports) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (n *NewOrderListFullResponseOrderReports) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PeggedPriceSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) PeggedPriceMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReports) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReports) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionExponentId() uint16 {
	return 1
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsFills) CommissionExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CommissionExponentSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionExponentMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsFills) CommissionExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderListFullResponseOrderReportsFills) MatchTypeId() uint16 {
	return 2
}

func (*NewOrderListFullResponseOrderReportsFills) MatchTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsFills) MatchTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MatchTypeSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsFills) MatchTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsFills) MatchTypeMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsFills) PriceId() uint16 {
	return 3
}

func (*NewOrderListFullResponseOrderReportsFills) PriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsFills) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsFills) PriceDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsFills) PriceMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsFills) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsFills) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsFills) PriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsFills) QtyId() uint16 {
	return 4
}

func (*NewOrderListFullResponseOrderReportsFills) QtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsFills) QtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.QtySinceVersion()
}

func (*NewOrderListFullResponseOrderReportsFills) QtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsFills) QtyMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsFills) QtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsFills) QtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsFills) QtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionId() uint16 {
	return 5
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsFills) CommissionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CommissionSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsFills) CommissionMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsFills) TradeIdId() uint16 {
	return 6
}

func (*NewOrderListFullResponseOrderReportsFills) TradeIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsFills) TradeIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TradeIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsFills) TradeIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsFills) TradeIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsFills) TradeIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsFills) TradeIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsFills) TradeIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsFills) AllocIdId() uint16 {
	return 7
}

func (*NewOrderListFullResponseOrderReportsFills) AllocIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsFills) AllocIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.AllocIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsFills) AllocIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsFills) AllocIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsFills) AllocIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsFills) AllocIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsFills) AllocIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionAssetMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsFills) CommissionAssetSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsFills) CommissionAssetInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CommissionAssetSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsFills) CommissionAssetDeprecated() uint16 {
	return 0
}

func (NewOrderListFullResponseOrderReportsFills) CommissionAssetCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListFullResponseOrderReportsFills) CommissionAssetHeaderLength() uint64 {
	return 1
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PreventedMatchIdId() uint16 {
	return 1
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PreventedMatchIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) PreventedMatchIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PreventedMatchIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PreventedMatchIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PreventedMatchIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PreventedMatchIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PreventedMatchIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PreventedMatchIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerOrderIdId() uint16 {
	return 2
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) MakerOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MakerOrderIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerOrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerOrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerOrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerOrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PriceId() uint16 {
	return 3
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PriceDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PriceMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) PriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) TakerPreventedQuantityId() uint16 {
	return 4
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) TakerPreventedQuantitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) TakerPreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TakerPreventedQuantitySinceVersion()
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) TakerPreventedQuantityDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) TakerPreventedQuantityMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsPreventedMatches) TakerPreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) TakerPreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) TakerPreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerPreventedQuantityId() uint16 {
	return 5
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerPreventedQuantitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) MakerPreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MakerPreventedQuantitySinceVersion()
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerPreventedQuantityDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerPreventedQuantityMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerPreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerPreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerPreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerSymbolMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerSymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReportsPreventedMatches) MakerSymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.MakerSymbolSinceVersion()
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) MakerSymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListFullResponseOrderReportsPreventedMatches) MakerSymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListFullResponseOrderReportsPreventedMatches) MakerSymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderListFullResponseOrderReports) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListFullResponseOrderReports) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListFullResponseOrderReports) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderListFullResponseOrderReports) ClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponseOrderReports) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListFullResponseOrderReports) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListFullResponseOrderReports) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListFullResponse) OrdersId() uint16 {
	return 100
}

func (*NewOrderListFullResponse) OrdersSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrdersSinceVersion()
}

func (*NewOrderListFullResponse) OrdersDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrders) SbeBlockLength() (blockLength uint) {
	return 8
}

func (*NewOrderListFullResponseOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderListFullResponse) OrderReportsId() uint16 {
	return 101
}

func (*NewOrderListFullResponse) OrderReportsSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) OrderReportsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderReportsSinceVersion()
}

func (*NewOrderListFullResponse) OrderReportsDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReports) SbeBlockLength() (blockLength uint) {
	return 151
}

func (*NewOrderListFullResponseOrderReports) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderListFullResponseOrderReports) FillsId() uint16 {
	return 100
}

func (*NewOrderListFullResponseOrderReports) FillsSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) FillsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.FillsSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) FillsDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsFills) SbeBlockLength() (blockLength uint) {
	return 42
}

func (*NewOrderListFullResponseOrderReportsFills) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderListFullResponseOrderReports) PreventedMatchesId() uint16 {
	return 101
}

func (*NewOrderListFullResponseOrderReports) PreventedMatchesSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponseOrderReports) PreventedMatchesInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PreventedMatchesSinceVersion()
}

func (*NewOrderListFullResponseOrderReports) PreventedMatchesDeprecated() uint16 {
	return 0
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) SbeBlockLength() (blockLength uint) {
	return 40
}

func (*NewOrderListFullResponseOrderReportsPreventedMatches) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*NewOrderListFullResponse) ListClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) ListClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) ListClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListClientOrderIdSinceVersion()
}

func (*NewOrderListFullResponse) ListClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListFullResponse) ListClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListFullResponse) ListClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListFullResponse) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListFullResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListFullResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListFullResponse) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListFullResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListFullResponse) SymbolHeaderLength() uint64 {
	return 1
}

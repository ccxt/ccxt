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

type NewOrderListResultResponse struct {
	OrderListId       int64
	ContingencyType   ContingencyTypeEnum
	ListStatusType    ListStatusTypeEnum
	ListOrderStatus   ListOrderStatusEnum
	TransactionTime   int64
	PriceExponent     int8
	QtyExponent       int8
	Orders            []NewOrderListResultResponseOrders
	OrderReports      []NewOrderListResultResponseOrderReports
	ListClientOrderId []uint8
	Symbol            []uint8
}
type NewOrderListResultResponseOrders struct {
	OrderId       int64
	Symbol        []uint8
	ClientOrderId []uint8
}
type NewOrderListResultResponseOrderReports struct {
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

func (n *NewOrderListResultResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
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

func (n *NewOrderListResultResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
			n.Orders = make([]NewOrderListResultResponseOrders, OrdersNumInGroup)
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
			n.OrderReports = make([]NewOrderListResultResponseOrderReports, OrderReportsNumInGroup)
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

func (n *NewOrderListResultResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func NewOrderListResultResponseInit(n *NewOrderListResultResponse) {
	return
}

func (n *NewOrderListResultResponseOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (n *NewOrderListResultResponseOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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

func (n *NewOrderListResultResponseOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func NewOrderListResultResponseOrdersInit(n *NewOrderListResultResponseOrders) {
	return
}

func (n *NewOrderListResultResponseOrderReports) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
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

func (n *NewOrderListResultResponseOrderReports) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
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
	return nil
}

func (n *NewOrderListResultResponseOrderReports) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func NewOrderListResultResponseOrderReportsInit(n *NewOrderListResultResponseOrderReports) {
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

func (*NewOrderListResultResponse) SbeBlockLength() (blockLength uint16) {
	return 21
}

func (*NewOrderListResultResponse) SbeTemplateId() (templateId uint16) {
	return 310
}

func (*NewOrderListResultResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*NewOrderListResultResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*NewOrderListResultResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*NewOrderListResultResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*NewOrderListResultResponse) OrderListIdId() uint16 {
	return 1
}

func (*NewOrderListResultResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderListResultResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponse) ContingencyTypeId() uint16 {
	return 2
}

func (*NewOrderListResultResponse) ContingencyTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) ContingencyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ContingencyTypeSinceVersion()
}

func (*NewOrderListResultResponse) ContingencyTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponse) ContingencyTypeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) ListStatusTypeId() uint16 {
	return 3
}

func (*NewOrderListResultResponse) ListStatusTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) ListStatusTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListStatusTypeSinceVersion()
}

func (*NewOrderListResultResponse) ListStatusTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponse) ListStatusTypeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) ListOrderStatusId() uint16 {
	return 4
}

func (*NewOrderListResultResponse) ListOrderStatusSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) ListOrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListOrderStatusSinceVersion()
}

func (*NewOrderListResultResponse) ListOrderStatusDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponse) ListOrderStatusMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) TransactionTimeId() uint16 {
	return 5
}

func (*NewOrderListResultResponse) TransactionTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) TransactionTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactionTimeSinceVersion()
}

func (*NewOrderListResultResponse) TransactionTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponse) TransactionTimeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) TransactionTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponse) TransactionTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponse) TransactionTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponse) PriceExponentId() uint16 {
	return 6
}

func (*NewOrderListResultResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceExponentSinceVersion()
}

func (*NewOrderListResultResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderListResultResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderListResultResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderListResultResponse) QtyExponentId() uint16 {
	return 7
}

func (*NewOrderListResultResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.QtyExponentSinceVersion()
}

func (*NewOrderListResultResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*NewOrderListResultResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*NewOrderListResultResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*NewOrderListResultResponseOrders) OrderIdId() uint16 {
	return 1
}

func (*NewOrderListResultResponseOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderListResultResponseOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrders) OrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrders) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListResultResponseOrders) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListResultResponseOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListResultResponseOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderListResultResponseOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderListResultResponseOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListResultResponseOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListResultResponseOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListResultResponseOrderReports) OrderIdId() uint16 {
	return 1
}

func (*NewOrderListResultResponseOrderReports) OrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderIdSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) OrderIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) OrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) OrderListIdId() uint16 {
	return 2
}

func (*NewOrderListResultResponseOrderReports) OrderListIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderListIdSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) OrderListIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) OrderListIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) TransactTimeId() uint16 {
	return 3
}

func (*NewOrderListResultResponseOrderReports) TransactTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TransactTimeSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) TransactTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) TransactTimeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) PriceId() uint16 {
	return 4
}

func (*NewOrderListResultResponseOrderReports) PriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PriceSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) PriceDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) PriceMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) PriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) OrigQtyId() uint16 {
	return 5
}

func (*NewOrderListResultResponseOrderReports) OrigQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrigQtySinceVersion()
}

func (*NewOrderListResultResponseOrderReports) OrigQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) OrigQtyMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) ExecutedQtyId() uint16 {
	return 6
}

func (*NewOrderListResultResponseOrderReports) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ExecutedQtySinceVersion()
}

func (*NewOrderListResultResponseOrderReports) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) ExecutedQtyMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) CummulativeQuoteQtyId() uint16 {
	return 7
}

func (*NewOrderListResultResponseOrderReports) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.CummulativeQuoteQtySinceVersion()
}

func (*NewOrderListResultResponseOrderReports) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) CummulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) StatusId() uint16 {
	return 8
}

func (*NewOrderListResultResponseOrderReports) StatusSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StatusSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) StatusDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) StatusMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) TimeInForceId() uint16 {
	return 9
}

func (*NewOrderListResultResponseOrderReports) TimeInForceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TimeInForceSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) TimeInForceDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) TimeInForceMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) OrderTypeId() uint16 {
	return 10
}

func (*NewOrderListResultResponseOrderReports) OrderTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderTypeSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) OrderTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) OrderTypeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) SideId() uint16 {
	return 11
}

func (*NewOrderListResultResponseOrderReports) SideSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SideSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) SideDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) SideMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) StopPriceId() uint16 {
	return 12
}

func (*NewOrderListResultResponseOrderReports) StopPriceSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StopPriceSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) StopPriceDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) StopPriceMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) TrailingDeltaId() uint16 {
	return 13
}

func (*NewOrderListResultResponseOrderReports) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TrailingDeltaSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) TrailingDeltaMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) TrailingTimeId() uint16 {
	return 14
}

func (*NewOrderListResultResponseOrderReports) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TrailingTimeSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) TrailingTimeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) WorkingTimeId() uint16 {
	return 15
}

func (*NewOrderListResultResponseOrderReports) WorkingTimeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) WorkingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.WorkingTimeSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) WorkingTimeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) WorkingTimeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) WorkingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) WorkingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) WorkingTimeNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) IcebergQtyId() uint16 {
	return 16
}

func (*NewOrderListResultResponseOrderReports) IcebergQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.IcebergQtySinceVersion()
}

func (*NewOrderListResultResponseOrderReports) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) IcebergQtyMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) StrategyIdId() uint16 {
	return 17
}

func (*NewOrderListResultResponseOrderReports) StrategyIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StrategyIdSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) StrategyIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) StrategyIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) StrategyTypeId() uint16 {
	return 18
}

func (*NewOrderListResultResponseOrderReports) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.StrategyTypeSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) StrategyTypeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*NewOrderListResultResponseOrderReports) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*NewOrderListResultResponseOrderReports) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*NewOrderListResultResponseOrderReports) OrderCapacityId() uint16 {
	return 19
}

func (*NewOrderListResultResponseOrderReports) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderCapacitySinceVersion()
}

func (*NewOrderListResultResponseOrderReports) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) OrderCapacityMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) WorkingFloorId() uint16 {
	return 20
}

func (*NewOrderListResultResponseOrderReports) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.WorkingFloorSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) WorkingFloorMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) SelfTradePreventionModeId() uint16 {
	return 21
}

func (*NewOrderListResultResponseOrderReports) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SelfTradePreventionModeSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) TradeGroupIdId() uint16 {
	return 22
}

func (*NewOrderListResultResponseOrderReports) TradeGroupIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) TradeGroupIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.TradeGroupIdSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) TradeGroupIdDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) TradeGroupIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) TradeGroupIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) TradeGroupIdMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) TradeGroupIdNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) PreventedQuantityId() uint16 {
	return 23
}

func (*NewOrderListResultResponseOrderReports) PreventedQuantitySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) PreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PreventedQuantitySinceVersion()
}

func (*NewOrderListResultResponseOrderReports) PreventedQuantityDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) PreventedQuantityMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) PreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) PreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) PreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) UsedSorId() uint16 {
	return 24
}

func (*NewOrderListResultResponseOrderReports) UsedSorSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.UsedSorSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) UsedSorDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) UsedSorMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) OrigQuoteOrderQtyId() uint16 {
	return 25
}

func (*NewOrderListResultResponseOrderReports) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrigQuoteOrderQtySinceVersion()
}

func (*NewOrderListResultResponseOrderReports) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) OrigQuoteOrderQtyMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) PegPriceTypeId() uint16 {
	return 26
}

func (*NewOrderListResultResponseOrderReports) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (n *NewOrderListResultResponseOrderReports) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegPriceTypeSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) PegPriceTypeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) PegOffsetTypeId() uint16 {
	return 27
}

func (*NewOrderListResultResponseOrderReports) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (n *NewOrderListResultResponseOrderReports) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegOffsetTypeSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) PegOffsetValueId() uint16 {
	return 28
}

func (*NewOrderListResultResponseOrderReports) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (n *NewOrderListResultResponseOrderReports) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PegOffsetValueSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) PegOffsetValueMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*NewOrderListResultResponseOrderReports) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*NewOrderListResultResponseOrderReports) PeggedPriceId() uint16 {
	return 29
}

func (*NewOrderListResultResponseOrderReports) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (n *NewOrderListResultResponseOrderReports) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.PeggedPriceSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) PeggedPriceMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*NewOrderListResultResponseOrderReports) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*NewOrderListResultResponseOrderReports) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*NewOrderListResultResponseOrderReports) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListResultResponseOrderReports) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListResultResponseOrderReports) SymbolHeaderLength() uint64 {
	return 1
}

func (*NewOrderListResultResponseOrderReports) ClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponseOrderReports) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponseOrderReports) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ClientOrderIdSinceVersion()
}

func (*NewOrderListResultResponseOrderReports) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListResultResponseOrderReports) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListResultResponseOrderReports) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListResultResponse) OrdersId() uint16 {
	return 100
}

func (*NewOrderListResultResponse) OrdersSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrdersSinceVersion()
}

func (*NewOrderListResultResponse) OrdersDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrders) SbeBlockLength() (blockLength uint) {
	return 8
}

func (*NewOrderListResultResponseOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*NewOrderListResultResponse) OrderReportsId() uint16 {
	return 101
}

func (*NewOrderListResultResponse) OrderReportsSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) OrderReportsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.OrderReportsSinceVersion()
}

func (*NewOrderListResultResponse) OrderReportsDeprecated() uint16 {
	return 0
}

func (*NewOrderListResultResponseOrderReports) SbeBlockLength() (blockLength uint) {
	return 151
}

func (*NewOrderListResultResponseOrderReports) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*NewOrderListResultResponse) ListClientOrderIdMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) ListClientOrderIdSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) ListClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.ListClientOrderIdSinceVersion()
}

func (*NewOrderListResultResponse) ListClientOrderIdDeprecated() uint16 {
	return 0
}

func (NewOrderListResultResponse) ListClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListResultResponse) ListClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*NewOrderListResultResponse) SymbolMetaAttribute(meta int) string {
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

func (*NewOrderListResultResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (n *NewOrderListResultResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= n.SymbolSinceVersion()
}

func (*NewOrderListResultResponse) SymbolDeprecated() uint16 {
	return 0
}

func (NewOrderListResultResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (NewOrderListResultResponse) SymbolHeaderLength() uint64 {
	return 1
}

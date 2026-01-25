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

type CancelOrderListResponse struct {
	OrderListId       int64
	ContingencyType   ContingencyTypeEnum
	ListStatusType    ListStatusTypeEnum
	ListOrderStatus   ListOrderStatusEnum
	TransactionTime   int64
	PriceExponent     int8
	QtyExponent       int8
	Orders            []CancelOrderListResponseOrders
	OrderReports      []CancelOrderListResponseOrderReports
	ListClientOrderId []uint8
	Symbol            []uint8
}
type CancelOrderListResponseOrders struct {
	OrderId       int64
	Symbol        []uint8
	ClientOrderId []uint8
}
type CancelOrderListResponseOrderReports struct {
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
	IcebergQty              int64
	StrategyId              int64
	StrategyType            int32
	OrderCapacity           OrderCapacityEnum
	WorkingFloor            FloorEnum
	SelfTradePreventionMode SelfTradePreventionModeEnum
	PreventedQuantity       int64
	UsedSor                 BoolEnumEnum
	OrigQuoteOrderQty       int64
	PegPriceType            PegPriceTypeEnum
	PegOffsetType           PegOffsetTypeEnum
	PegOffsetValue          uint8
	PeggedPrice             int64
	Symbol                  []uint8
	OrigClientOrderId       []uint8
	ClientOrderId           []uint8
}

func (c *CancelOrderListResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := c.RangeCheck(c.SbeSchemaVersion(), c.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt64(_w, c.OrderListId); err != nil {
		return err
	}
	if err := c.ContingencyType.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.ListStatusType.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.ListOrderStatus.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.TransactionTime); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, c.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, c.QtyExponent); err != nil {
		return err
	}
	var OrdersBlockLength uint16 = 8
	if err := _m.WriteUint16(_w, OrdersBlockLength); err != nil {
		return err
	}
	var OrdersNumInGroup uint16 = uint16(len(c.Orders))
	if err := _m.WriteUint16(_w, OrdersNumInGroup); err != nil {
		return err
	}
	for i := range c.Orders {
		if err := c.Orders[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	var OrderReportsBlockLength uint16 = 135
	if err := _m.WriteUint16(_w, OrderReportsBlockLength); err != nil {
		return err
	}
	var OrderReportsNumInGroup uint16 = uint16(len(c.OrderReports))
	if err := _m.WriteUint16(_w, OrderReportsNumInGroup); err != nil {
		return err
	}
	for i := range c.OrderReports {
		if err := c.OrderReports[i].Encode(_m, _w); err != nil {
			return err
		}
	}
	if err := _m.WriteUint8(_w, uint8(len(c.ListClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.ListClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(c.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.Symbol); err != nil {
		return err
	}
	return nil
}

func (c *CancelOrderListResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
	if !c.OrderListIdInActingVersion(actingVersion) {
		c.OrderListId = c.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.OrderListId); err != nil {
			return err
		}
	}
	if c.ContingencyTypeInActingVersion(actingVersion) {
		if err := c.ContingencyType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.ListStatusTypeInActingVersion(actingVersion) {
		if err := c.ListStatusType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.ListOrderStatusInActingVersion(actingVersion) {
		if err := c.ListOrderStatus.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !c.TransactionTimeInActingVersion(actingVersion) {
		c.TransactionTime = c.TransactionTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.TransactionTime); err != nil {
			return err
		}
	}
	if !c.PriceExponentInActingVersion(actingVersion) {
		c.PriceExponent = c.PriceExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &c.PriceExponent); err != nil {
			return err
		}
	}
	if !c.QtyExponentInActingVersion(actingVersion) {
		c.QtyExponent = c.QtyExponentNullValue()
	} else {
		if err := _m.ReadInt8(_r, &c.QtyExponent); err != nil {
			return err
		}
	}
	if actingVersion > c.SbeSchemaVersion() && blockLength > c.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-c.SbeBlockLength()))
	}

	if c.OrdersInActingVersion(actingVersion) {
		var OrdersBlockLength uint16
		if err := _m.ReadUint16(_r, &OrdersBlockLength); err != nil {
			return err
		}
		var OrdersNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrdersNumInGroup); err != nil {
			return err
		}
		if cap(c.Orders) < int(OrdersNumInGroup) {
			c.Orders = make([]CancelOrderListResponseOrders, OrdersNumInGroup)
		}
		c.Orders = c.Orders[:OrdersNumInGroup]
		for i := range c.Orders {
			if err := c.Orders[i].Decode(_m, _r, actingVersion, uint(OrdersBlockLength)); err != nil {
				return err
			}
		}
	}

	if c.OrderReportsInActingVersion(actingVersion) {
		var OrderReportsBlockLength uint16
		if err := _m.ReadUint16(_r, &OrderReportsBlockLength); err != nil {
			return err
		}
		var OrderReportsNumInGroup uint16
		if err := _m.ReadUint16(_r, &OrderReportsNumInGroup); err != nil {
			return err
		}
		if cap(c.OrderReports) < int(OrderReportsNumInGroup) {
			c.OrderReports = make([]CancelOrderListResponseOrderReports, OrderReportsNumInGroup)
		}
		c.OrderReports = c.OrderReports[:OrderReportsNumInGroup]
		for i := range c.OrderReports {
			if err := c.OrderReports[i].Decode(_m, _r, actingVersion, uint(OrderReportsBlockLength)); err != nil {
				return err
			}
		}
	}

	if c.ListClientOrderIdInActingVersion(actingVersion) {
		var ListClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ListClientOrderIdLength); err != nil {
			return err
		}
		if cap(c.ListClientOrderId) < int(ListClientOrderIdLength) {
			c.ListClientOrderId = make([]uint8, ListClientOrderIdLength)
		}
		c.ListClientOrderId = c.ListClientOrderId[:ListClientOrderIdLength]
		if err := _m.ReadBytes(_r, c.ListClientOrderId); err != nil {
			return err
		}
	}

	if c.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(c.Symbol) < int(SymbolLength) {
			c.Symbol = make([]uint8, SymbolLength)
		}
		c.Symbol = c.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, c.Symbol); err != nil {
			return err
		}
	}
	if doRangeCheck {
		if err := c.RangeCheck(actingVersion, c.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (c *CancelOrderListResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if c.OrderListIdInActingVersion(actingVersion) {
		if c.OrderListId < c.OrderListIdMinValue() || c.OrderListId > c.OrderListIdMaxValue() {
			return fmt.Errorf("Range check failed on c.OrderListId (%v < %v > %v)", c.OrderListIdMinValue(), c.OrderListId, c.OrderListIdMaxValue())
		}
	}
	if err := c.ContingencyType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.ListStatusType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.ListOrderStatus.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if c.TransactionTimeInActingVersion(actingVersion) {
		if c.TransactionTime < c.TransactionTimeMinValue() || c.TransactionTime > c.TransactionTimeMaxValue() {
			return fmt.Errorf("Range check failed on c.TransactionTime (%v < %v > %v)", c.TransactionTimeMinValue(), c.TransactionTime, c.TransactionTimeMaxValue())
		}
	}
	if c.PriceExponentInActingVersion(actingVersion) {
		if c.PriceExponent < c.PriceExponentMinValue() || c.PriceExponent > c.PriceExponentMaxValue() {
			return fmt.Errorf("Range check failed on c.PriceExponent (%v < %v > %v)", c.PriceExponentMinValue(), c.PriceExponent, c.PriceExponentMaxValue())
		}
	}
	if c.QtyExponentInActingVersion(actingVersion) {
		if c.QtyExponent < c.QtyExponentMinValue() || c.QtyExponent > c.QtyExponentMaxValue() {
			return fmt.Errorf("Range check failed on c.QtyExponent (%v < %v > %v)", c.QtyExponentMinValue(), c.QtyExponent, c.QtyExponentMaxValue())
		}
	}
	for i := range c.Orders {
		if err := c.Orders[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	for i := range c.OrderReports {
		if err := c.OrderReports[i].RangeCheck(actingVersion, schemaVersion); err != nil {
			return err
		}
	}
	if !utf8.Valid(c.ListClientOrderId[:]) {
		return errors.New("c.ListClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(c.Symbol[:]) {
		return errors.New("c.Symbol failed UTF-8 validation")
	}
	return nil
}

func CancelOrderListResponseInit(c *CancelOrderListResponse) {
	return
}

func (c *CancelOrderListResponseOrders) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, c.OrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(c.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(c.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (c *CancelOrderListResponseOrders) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !c.OrderIdInActingVersion(actingVersion) {
		c.OrderId = c.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.OrderId); err != nil {
			return err
		}
	}
	if actingVersion > c.SbeSchemaVersion() && blockLength > c.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-c.SbeBlockLength()))
	}

	if c.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(c.Symbol) < int(SymbolLength) {
			c.Symbol = make([]uint8, SymbolLength)
		}
		c.Symbol = c.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, c.Symbol); err != nil {
			return err
		}
	}

	if c.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(c.ClientOrderId) < int(ClientOrderIdLength) {
			c.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		c.ClientOrderId = c.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, c.ClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (c *CancelOrderListResponseOrders) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if c.OrderIdInActingVersion(actingVersion) {
		if c.OrderId < c.OrderIdMinValue() || c.OrderId > c.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on c.OrderId (%v < %v > %v)", c.OrderIdMinValue(), c.OrderId, c.OrderIdMaxValue())
		}
	}
	if !utf8.Valid(c.Symbol[:]) {
		return errors.New("c.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(c.ClientOrderId[:]) {
		return errors.New("c.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func CancelOrderListResponseOrdersInit(c *CancelOrderListResponseOrders) {
	return
}

func (c *CancelOrderListResponseOrderReports) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt64(_w, c.OrderId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.OrderListId); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.TransactTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.Price); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.OrigQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.ExecutedQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.CummulativeQuoteQty); err != nil {
		return err
	}
	if err := c.Status.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.TimeInForce.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.OrderType.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.Side.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.StopPrice); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.TrailingDelta); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.TrailingTime); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.IcebergQty); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.StrategyId); err != nil {
		return err
	}
	if err := _m.WriteInt32(_w, c.StrategyType); err != nil {
		return err
	}
	if err := c.OrderCapacity.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.WorkingFloor.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.SelfTradePreventionMode.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.PreventedQuantity); err != nil {
		return err
	}
	if err := c.UsedSor.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.OrigQuoteOrderQty); err != nil {
		return err
	}
	if err := c.PegPriceType.Encode(_m, _w); err != nil {
		return err
	}
	if err := c.PegOffsetType.Encode(_m, _w); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, c.PegOffsetValue); err != nil {
		return err
	}
	if err := _m.WriteInt64(_w, c.PeggedPrice); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(c.Symbol))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.Symbol); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(c.OrigClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.OrigClientOrderId); err != nil {
		return err
	}
	if err := _m.WriteUint8(_w, uint8(len(c.ClientOrderId))); err != nil {
		return err
	}
	if err := _m.WriteBytes(_w, c.ClientOrderId); err != nil {
		return err
	}
	return nil
}

func (c *CancelOrderListResponseOrderReports) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint) error {
	if !c.OrderIdInActingVersion(actingVersion) {
		c.OrderId = c.OrderIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.OrderId); err != nil {
			return err
		}
	}
	if !c.OrderListIdInActingVersion(actingVersion) {
		c.OrderListId = c.OrderListIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.OrderListId); err != nil {
			return err
		}
	}
	if !c.TransactTimeInActingVersion(actingVersion) {
		c.TransactTime = c.TransactTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.TransactTime); err != nil {
			return err
		}
	}
	if !c.PriceInActingVersion(actingVersion) {
		c.Price = c.PriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.Price); err != nil {
			return err
		}
	}
	if !c.OrigQtyInActingVersion(actingVersion) {
		c.OrigQty = c.OrigQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.OrigQty); err != nil {
			return err
		}
	}
	if !c.ExecutedQtyInActingVersion(actingVersion) {
		c.ExecutedQty = c.ExecutedQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.ExecutedQty); err != nil {
			return err
		}
	}
	if !c.CummulativeQuoteQtyInActingVersion(actingVersion) {
		c.CummulativeQuoteQty = c.CummulativeQuoteQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.CummulativeQuoteQty); err != nil {
			return err
		}
	}
	if c.StatusInActingVersion(actingVersion) {
		if err := c.Status.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.TimeInForceInActingVersion(actingVersion) {
		if err := c.TimeInForce.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.OrderTypeInActingVersion(actingVersion) {
		if err := c.OrderType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.SideInActingVersion(actingVersion) {
		if err := c.Side.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !c.StopPriceInActingVersion(actingVersion) {
		c.StopPrice = c.StopPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.StopPrice); err != nil {
			return err
		}
	}
	if !c.TrailingDeltaInActingVersion(actingVersion) {
		c.TrailingDelta = c.TrailingDeltaNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.TrailingDelta); err != nil {
			return err
		}
	}
	if !c.TrailingTimeInActingVersion(actingVersion) {
		c.TrailingTime = c.TrailingTimeNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.TrailingTime); err != nil {
			return err
		}
	}
	if !c.IcebergQtyInActingVersion(actingVersion) {
		c.IcebergQty = c.IcebergQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.IcebergQty); err != nil {
			return err
		}
	}
	if !c.StrategyIdInActingVersion(actingVersion) {
		c.StrategyId = c.StrategyIdNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.StrategyId); err != nil {
			return err
		}
	}
	if !c.StrategyTypeInActingVersion(actingVersion) {
		c.StrategyType = c.StrategyTypeNullValue()
	} else {
		if err := _m.ReadInt32(_r, &c.StrategyType); err != nil {
			return err
		}
	}
	if c.OrderCapacityInActingVersion(actingVersion) {
		if err := c.OrderCapacity.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.WorkingFloorInActingVersion(actingVersion) {
		if err := c.WorkingFloor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.SelfTradePreventionModeInActingVersion(actingVersion) {
		if err := c.SelfTradePreventionMode.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !c.PreventedQuantityInActingVersion(actingVersion) {
		c.PreventedQuantity = c.PreventedQuantityNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.PreventedQuantity); err != nil {
			return err
		}
	}
	if c.UsedSorInActingVersion(actingVersion) {
		if err := c.UsedSor.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !c.OrigQuoteOrderQtyInActingVersion(actingVersion) {
		c.OrigQuoteOrderQty = c.OrigQuoteOrderQtyNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.OrigQuoteOrderQty); err != nil {
			return err
		}
	}
	if c.PegPriceTypeInActingVersion(actingVersion) {
		if err := c.PegPriceType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if c.PegOffsetTypeInActingVersion(actingVersion) {
		if err := c.PegOffsetType.Decode(_m, _r, actingVersion); err != nil {
			return err
		}
	}
	if !c.PegOffsetValueInActingVersion(actingVersion) {
		c.PegOffsetValue = c.PegOffsetValueNullValue()
	} else {
		if err := _m.ReadUint8(_r, &c.PegOffsetValue); err != nil {
			return err
		}
	}
	if !c.PeggedPriceInActingVersion(actingVersion) {
		c.PeggedPrice = c.PeggedPriceNullValue()
	} else {
		if err := _m.ReadInt64(_r, &c.PeggedPrice); err != nil {
			return err
		}
	}
	if actingVersion > c.SbeSchemaVersion() && blockLength > c.SbeBlockLength() {
		io.CopyN(ioutil.Discard, _r, int64(blockLength-c.SbeBlockLength()))
	}

	if c.SymbolInActingVersion(actingVersion) {
		var SymbolLength uint8
		if err := _m.ReadUint8(_r, &SymbolLength); err != nil {
			return err
		}
		if cap(c.Symbol) < int(SymbolLength) {
			c.Symbol = make([]uint8, SymbolLength)
		}
		c.Symbol = c.Symbol[:SymbolLength]
		if err := _m.ReadBytes(_r, c.Symbol); err != nil {
			return err
		}
	}

	if c.OrigClientOrderIdInActingVersion(actingVersion) {
		var OrigClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &OrigClientOrderIdLength); err != nil {
			return err
		}
		if cap(c.OrigClientOrderId) < int(OrigClientOrderIdLength) {
			c.OrigClientOrderId = make([]uint8, OrigClientOrderIdLength)
		}
		c.OrigClientOrderId = c.OrigClientOrderId[:OrigClientOrderIdLength]
		if err := _m.ReadBytes(_r, c.OrigClientOrderId); err != nil {
			return err
		}
	}

	if c.ClientOrderIdInActingVersion(actingVersion) {
		var ClientOrderIdLength uint8
		if err := _m.ReadUint8(_r, &ClientOrderIdLength); err != nil {
			return err
		}
		if cap(c.ClientOrderId) < int(ClientOrderIdLength) {
			c.ClientOrderId = make([]uint8, ClientOrderIdLength)
		}
		c.ClientOrderId = c.ClientOrderId[:ClientOrderIdLength]
		if err := _m.ReadBytes(_r, c.ClientOrderId); err != nil {
			return err
		}
	}
	return nil
}

func (c *CancelOrderListResponseOrderReports) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if c.OrderIdInActingVersion(actingVersion) {
		if c.OrderId < c.OrderIdMinValue() || c.OrderId > c.OrderIdMaxValue() {
			return fmt.Errorf("Range check failed on c.OrderId (%v < %v > %v)", c.OrderIdMinValue(), c.OrderId, c.OrderIdMaxValue())
		}
	}
	if c.OrderListIdInActingVersion(actingVersion) {
		if c.OrderListId != c.OrderListIdNullValue() && (c.OrderListId < c.OrderListIdMinValue() || c.OrderListId > c.OrderListIdMaxValue()) {
			return fmt.Errorf("Range check failed on c.OrderListId (%v < %v > %v)", c.OrderListIdMinValue(), c.OrderListId, c.OrderListIdMaxValue())
		}
	}
	if c.TransactTimeInActingVersion(actingVersion) {
		if c.TransactTime < c.TransactTimeMinValue() || c.TransactTime > c.TransactTimeMaxValue() {
			return fmt.Errorf("Range check failed on c.TransactTime (%v < %v > %v)", c.TransactTimeMinValue(), c.TransactTime, c.TransactTimeMaxValue())
		}
	}
	if c.PriceInActingVersion(actingVersion) {
		if c.Price < c.PriceMinValue() || c.Price > c.PriceMaxValue() {
			return fmt.Errorf("Range check failed on c.Price (%v < %v > %v)", c.PriceMinValue(), c.Price, c.PriceMaxValue())
		}
	}
	if c.OrigQtyInActingVersion(actingVersion) {
		if c.OrigQty < c.OrigQtyMinValue() || c.OrigQty > c.OrigQtyMaxValue() {
			return fmt.Errorf("Range check failed on c.OrigQty (%v < %v > %v)", c.OrigQtyMinValue(), c.OrigQty, c.OrigQtyMaxValue())
		}
	}
	if c.ExecutedQtyInActingVersion(actingVersion) {
		if c.ExecutedQty < c.ExecutedQtyMinValue() || c.ExecutedQty > c.ExecutedQtyMaxValue() {
			return fmt.Errorf("Range check failed on c.ExecutedQty (%v < %v > %v)", c.ExecutedQtyMinValue(), c.ExecutedQty, c.ExecutedQtyMaxValue())
		}
	}
	if c.CummulativeQuoteQtyInActingVersion(actingVersion) {
		if c.CummulativeQuoteQty < c.CummulativeQuoteQtyMinValue() || c.CummulativeQuoteQty > c.CummulativeQuoteQtyMaxValue() {
			return fmt.Errorf("Range check failed on c.CummulativeQuoteQty (%v < %v > %v)", c.CummulativeQuoteQtyMinValue(), c.CummulativeQuoteQty, c.CummulativeQuoteQtyMaxValue())
		}
	}
	if err := c.Status.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.TimeInForce.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.OrderType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.Side.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if c.StopPriceInActingVersion(actingVersion) {
		if c.StopPrice != c.StopPriceNullValue() && (c.StopPrice < c.StopPriceMinValue() || c.StopPrice > c.StopPriceMaxValue()) {
			return fmt.Errorf("Range check failed on c.StopPrice (%v < %v > %v)", c.StopPriceMinValue(), c.StopPrice, c.StopPriceMaxValue())
		}
	}
	if c.TrailingDeltaInActingVersion(actingVersion) {
		if c.TrailingDelta != c.TrailingDeltaNullValue() && (c.TrailingDelta < c.TrailingDeltaMinValue() || c.TrailingDelta > c.TrailingDeltaMaxValue()) {
			return fmt.Errorf("Range check failed on c.TrailingDelta (%v < %v > %v)", c.TrailingDeltaMinValue(), c.TrailingDelta, c.TrailingDeltaMaxValue())
		}
	}
	if c.TrailingTimeInActingVersion(actingVersion) {
		if c.TrailingTime != c.TrailingTimeNullValue() && (c.TrailingTime < c.TrailingTimeMinValue() || c.TrailingTime > c.TrailingTimeMaxValue()) {
			return fmt.Errorf("Range check failed on c.TrailingTime (%v < %v > %v)", c.TrailingTimeMinValue(), c.TrailingTime, c.TrailingTimeMaxValue())
		}
	}
	if c.IcebergQtyInActingVersion(actingVersion) {
		if c.IcebergQty != c.IcebergQtyNullValue() && (c.IcebergQty < c.IcebergQtyMinValue() || c.IcebergQty > c.IcebergQtyMaxValue()) {
			return fmt.Errorf("Range check failed on c.IcebergQty (%v < %v > %v)", c.IcebergQtyMinValue(), c.IcebergQty, c.IcebergQtyMaxValue())
		}
	}
	if c.StrategyIdInActingVersion(actingVersion) {
		if c.StrategyId != c.StrategyIdNullValue() && (c.StrategyId < c.StrategyIdMinValue() || c.StrategyId > c.StrategyIdMaxValue()) {
			return fmt.Errorf("Range check failed on c.StrategyId (%v < %v > %v)", c.StrategyIdMinValue(), c.StrategyId, c.StrategyIdMaxValue())
		}
	}
	if c.StrategyTypeInActingVersion(actingVersion) {
		if c.StrategyType != c.StrategyTypeNullValue() && (c.StrategyType < c.StrategyTypeMinValue() || c.StrategyType > c.StrategyTypeMaxValue()) {
			return fmt.Errorf("Range check failed on c.StrategyType (%v < %v > %v)", c.StrategyTypeMinValue(), c.StrategyType, c.StrategyTypeMaxValue())
		}
	}
	if err := c.OrderCapacity.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.WorkingFloor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.SelfTradePreventionMode.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if c.PreventedQuantityInActingVersion(actingVersion) {
		if c.PreventedQuantity < c.PreventedQuantityMinValue() || c.PreventedQuantity > c.PreventedQuantityMaxValue() {
			return fmt.Errorf("Range check failed on c.PreventedQuantity (%v < %v > %v)", c.PreventedQuantityMinValue(), c.PreventedQuantity, c.PreventedQuantityMaxValue())
		}
	}
	if err := c.UsedSor.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if c.OrigQuoteOrderQtyInActingVersion(actingVersion) {
		if c.OrigQuoteOrderQty < c.OrigQuoteOrderQtyMinValue() || c.OrigQuoteOrderQty > c.OrigQuoteOrderQtyMaxValue() {
			return fmt.Errorf("Range check failed on c.OrigQuoteOrderQty (%v < %v > %v)", c.OrigQuoteOrderQtyMinValue(), c.OrigQuoteOrderQty, c.OrigQuoteOrderQtyMaxValue())
		}
	}
	if err := c.PegPriceType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if err := c.PegOffsetType.RangeCheck(actingVersion, schemaVersion); err != nil {
		return err
	}
	if c.PegOffsetValueInActingVersion(actingVersion) {
		if c.PegOffsetValue != c.PegOffsetValueNullValue() && (c.PegOffsetValue < c.PegOffsetValueMinValue() || c.PegOffsetValue > c.PegOffsetValueMaxValue()) {
			return fmt.Errorf("Range check failed on c.PegOffsetValue (%v < %v > %v)", c.PegOffsetValueMinValue(), c.PegOffsetValue, c.PegOffsetValueMaxValue())
		}
	}
	if c.PeggedPriceInActingVersion(actingVersion) {
		if c.PeggedPrice != c.PeggedPriceNullValue() && (c.PeggedPrice < c.PeggedPriceMinValue() || c.PeggedPrice > c.PeggedPriceMaxValue()) {
			return fmt.Errorf("Range check failed on c.PeggedPrice (%v < %v > %v)", c.PeggedPriceMinValue(), c.PeggedPrice, c.PeggedPriceMaxValue())
		}
	}
	if !utf8.Valid(c.Symbol[:]) {
		return errors.New("c.Symbol failed UTF-8 validation")
	}
	if !utf8.Valid(c.OrigClientOrderId[:]) {
		return errors.New("c.OrigClientOrderId failed UTF-8 validation")
	}
	if !utf8.Valid(c.ClientOrderId[:]) {
		return errors.New("c.ClientOrderId failed UTF-8 validation")
	}
	return nil
}

func CancelOrderListResponseOrderReportsInit(c *CancelOrderListResponseOrderReports) {
	c.OrderListId = math.MinInt64
	c.StopPrice = math.MinInt64
	c.TrailingDelta = math.MinInt64
	c.TrailingTime = math.MinInt64
	c.IcebergQty = math.MinInt64
	c.StrategyId = math.MinInt64
	c.StrategyType = math.MinInt32
	c.PegOffsetValue = math.MaxUint8
	c.PeggedPrice = math.MinInt64
	return
}

func (*CancelOrderListResponse) SbeBlockLength() (blockLength uint16) {
	return 21
}

func (*CancelOrderListResponse) SbeTemplateId() (templateId uint16) {
	return 312
}

func (*CancelOrderListResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*CancelOrderListResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*CancelOrderListResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*CancelOrderListResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*CancelOrderListResponse) OrderListIdId() uint16 {
	return 1
}

func (*CancelOrderListResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderListIdSinceVersion()
}

func (*CancelOrderListResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponse) ContingencyTypeId() uint16 {
	return 2
}

func (*CancelOrderListResponse) ContingencyTypeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) ContingencyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ContingencyTypeSinceVersion()
}

func (*CancelOrderListResponse) ContingencyTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponse) ContingencyTypeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) ListStatusTypeId() uint16 {
	return 3
}

func (*CancelOrderListResponse) ListStatusTypeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) ListStatusTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ListStatusTypeSinceVersion()
}

func (*CancelOrderListResponse) ListStatusTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponse) ListStatusTypeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) ListOrderStatusId() uint16 {
	return 4
}

func (*CancelOrderListResponse) ListOrderStatusSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) ListOrderStatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ListOrderStatusSinceVersion()
}

func (*CancelOrderListResponse) ListOrderStatusDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponse) ListOrderStatusMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) TransactionTimeId() uint16 {
	return 5
}

func (*CancelOrderListResponse) TransactionTimeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) TransactionTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TransactionTimeSinceVersion()
}

func (*CancelOrderListResponse) TransactionTimeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponse) TransactionTimeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) TransactionTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponse) TransactionTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponse) TransactionTimeNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponse) PriceExponentId() uint16 {
	return 6
}

func (*CancelOrderListResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PriceExponentSinceVersion()
}

func (*CancelOrderListResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponse) PriceExponentMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*CancelOrderListResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*CancelOrderListResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*CancelOrderListResponse) QtyExponentId() uint16 {
	return 7
}

func (*CancelOrderListResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.QtyExponentSinceVersion()
}

func (*CancelOrderListResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponse) QtyExponentMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*CancelOrderListResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*CancelOrderListResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*CancelOrderListResponseOrders) OrderIdId() uint16 {
	return 1
}

func (*CancelOrderListResponseOrders) OrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrders) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderIdSinceVersion()
}

func (*CancelOrderListResponseOrders) OrderIdDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrders) OrderIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrders) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrders) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrders) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrders) SymbolMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrders) SymbolSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrders) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SymbolSinceVersion()
}

func (*CancelOrderListResponseOrders) SymbolDeprecated() uint16 {
	return 0
}

func (CancelOrderListResponseOrders) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderListResponseOrders) SymbolHeaderLength() uint64 {
	return 1
}

func (*CancelOrderListResponseOrders) ClientOrderIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrders) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrders) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ClientOrderIdSinceVersion()
}

func (*CancelOrderListResponseOrders) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (CancelOrderListResponseOrders) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderListResponseOrders) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*CancelOrderListResponseOrderReports) OrderIdId() uint16 {
	return 1
}

func (*CancelOrderListResponseOrderReports) OrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderIdSinceVersion()
}

func (*CancelOrderListResponseOrderReports) OrderIdDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) OrderIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) OrderListIdId() uint16 {
	return 2
}

func (*CancelOrderListResponseOrderReports) OrderListIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderListIdSinceVersion()
}

func (*CancelOrderListResponseOrderReports) OrderListIdDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) OrderListIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) TransactTimeId() uint16 {
	return 3
}

func (*CancelOrderListResponseOrderReports) TransactTimeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TransactTimeSinceVersion()
}

func (*CancelOrderListResponseOrderReports) TransactTimeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) TransactTimeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) PriceId() uint16 {
	return 4
}

func (*CancelOrderListResponseOrderReports) PriceSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PriceSinceVersion()
}

func (*CancelOrderListResponseOrderReports) PriceDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) PriceMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) PriceNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) OrigQtyId() uint16 {
	return 5
}

func (*CancelOrderListResponseOrderReports) OrigQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrigQtySinceVersion()
}

func (*CancelOrderListResponseOrderReports) OrigQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) OrigQtyMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) ExecutedQtyId() uint16 {
	return 6
}

func (*CancelOrderListResponseOrderReports) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ExecutedQtySinceVersion()
}

func (*CancelOrderListResponseOrderReports) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) ExecutedQtyMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) CummulativeQuoteQtyId() uint16 {
	return 7
}

func (*CancelOrderListResponseOrderReports) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.CummulativeQuoteQtySinceVersion()
}

func (*CancelOrderListResponseOrderReports) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) CummulativeQuoteQtyMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) StatusId() uint16 {
	return 8
}

func (*CancelOrderListResponseOrderReports) StatusSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.StatusSinceVersion()
}

func (*CancelOrderListResponseOrderReports) StatusDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) StatusMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) TimeInForceId() uint16 {
	return 9
}

func (*CancelOrderListResponseOrderReports) TimeInForceSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TimeInForceSinceVersion()
}

func (*CancelOrderListResponseOrderReports) TimeInForceDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) TimeInForceMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) OrderTypeId() uint16 {
	return 10
}

func (*CancelOrderListResponseOrderReports) OrderTypeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderTypeSinceVersion()
}

func (*CancelOrderListResponseOrderReports) OrderTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) OrderTypeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) SideId() uint16 {
	return 11
}

func (*CancelOrderListResponseOrderReports) SideSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SideSinceVersion()
}

func (*CancelOrderListResponseOrderReports) SideDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) SideMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) StopPriceId() uint16 {
	return 12
}

func (*CancelOrderListResponseOrderReports) StopPriceSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.StopPriceSinceVersion()
}

func (*CancelOrderListResponseOrderReports) StopPriceDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) StopPriceMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) TrailingDeltaId() uint16 {
	return 13
}

func (*CancelOrderListResponseOrderReports) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TrailingDeltaSinceVersion()
}

func (*CancelOrderListResponseOrderReports) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) TrailingDeltaMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) TrailingTimeId() uint16 {
	return 14
}

func (*CancelOrderListResponseOrderReports) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TrailingTimeSinceVersion()
}

func (*CancelOrderListResponseOrderReports) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) TrailingTimeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) IcebergQtyId() uint16 {
	return 15
}

func (*CancelOrderListResponseOrderReports) IcebergQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.IcebergQtySinceVersion()
}

func (*CancelOrderListResponseOrderReports) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) IcebergQtyMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) StrategyIdId() uint16 {
	return 16
}

func (*CancelOrderListResponseOrderReports) StrategyIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.StrategyIdSinceVersion()
}

func (*CancelOrderListResponseOrderReports) StrategyIdDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) StrategyIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) StrategyTypeId() uint16 {
	return 17
}

func (*CancelOrderListResponseOrderReports) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.StrategyTypeSinceVersion()
}

func (*CancelOrderListResponseOrderReports) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) StrategyTypeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*CancelOrderListResponseOrderReports) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*CancelOrderListResponseOrderReports) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*CancelOrderListResponseOrderReports) OrderCapacityId() uint16 {
	return 18
}

func (*CancelOrderListResponseOrderReports) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderCapacitySinceVersion()
}

func (*CancelOrderListResponseOrderReports) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) OrderCapacityMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) WorkingFloorId() uint16 {
	return 19
}

func (*CancelOrderListResponseOrderReports) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.WorkingFloorSinceVersion()
}

func (*CancelOrderListResponseOrderReports) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) WorkingFloorMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) SelfTradePreventionModeId() uint16 {
	return 20
}

func (*CancelOrderListResponseOrderReports) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SelfTradePreventionModeSinceVersion()
}

func (*CancelOrderListResponseOrderReports) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) SelfTradePreventionModeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) PreventedQuantityId() uint16 {
	return 21
}

func (*CancelOrderListResponseOrderReports) PreventedQuantitySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) PreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PreventedQuantitySinceVersion()
}

func (*CancelOrderListResponseOrderReports) PreventedQuantityDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) PreventedQuantityMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) PreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) PreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) PreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) UsedSorId() uint16 {
	return 22
}

func (*CancelOrderListResponseOrderReports) UsedSorSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.UsedSorSinceVersion()
}

func (*CancelOrderListResponseOrderReports) UsedSorDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) UsedSorMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) OrigQuoteOrderQtyId() uint16 {
	return 23
}

func (*CancelOrderListResponseOrderReports) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrigQuoteOrderQtySinceVersion()
}

func (*CancelOrderListResponseOrderReports) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) OrigQuoteOrderQtyMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) PegPriceTypeId() uint16 {
	return 24
}

func (*CancelOrderListResponseOrderReports) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (c *CancelOrderListResponseOrderReports) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PegPriceTypeSinceVersion()
}

func (*CancelOrderListResponseOrderReports) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) PegPriceTypeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) PegOffsetTypeId() uint16 {
	return 25
}

func (*CancelOrderListResponseOrderReports) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (c *CancelOrderListResponseOrderReports) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PegOffsetTypeSinceVersion()
}

func (*CancelOrderListResponseOrderReports) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) PegOffsetValueId() uint16 {
	return 26
}

func (*CancelOrderListResponseOrderReports) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (c *CancelOrderListResponseOrderReports) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PegOffsetValueSinceVersion()
}

func (*CancelOrderListResponseOrderReports) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) PegOffsetValueMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*CancelOrderListResponseOrderReports) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*CancelOrderListResponseOrderReports) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*CancelOrderListResponseOrderReports) PeggedPriceId() uint16 {
	return 27
}

func (*CancelOrderListResponseOrderReports) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (c *CancelOrderListResponseOrderReports) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PeggedPriceSinceVersion()
}

func (*CancelOrderListResponseOrderReports) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) PeggedPriceMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderListResponseOrderReports) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderListResponseOrderReports) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderListResponseOrderReports) SymbolMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) SymbolSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SymbolSinceVersion()
}

func (*CancelOrderListResponseOrderReports) SymbolDeprecated() uint16 {
	return 0
}

func (CancelOrderListResponseOrderReports) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderListResponseOrderReports) SymbolHeaderLength() uint64 {
	return 1
}

func (*CancelOrderListResponseOrderReports) OrigClientOrderIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) OrigClientOrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) OrigClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrigClientOrderIdSinceVersion()
}

func (*CancelOrderListResponseOrderReports) OrigClientOrderIdDeprecated() uint16 {
	return 0
}

func (CancelOrderListResponseOrderReports) OrigClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderListResponseOrderReports) OrigClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*CancelOrderListResponseOrderReports) ClientOrderIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponseOrderReports) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponseOrderReports) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ClientOrderIdSinceVersion()
}

func (*CancelOrderListResponseOrderReports) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (CancelOrderListResponseOrderReports) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderListResponseOrderReports) ClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*CancelOrderListResponse) OrdersId() uint16 {
	return 100
}

func (*CancelOrderListResponse) OrdersSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) OrdersInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrdersSinceVersion()
}

func (*CancelOrderListResponse) OrdersDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrders) SbeBlockLength() (blockLength uint) {
	return 8
}

func (*CancelOrderListResponseOrders) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*CancelOrderListResponse) OrderReportsId() uint16 {
	return 101
}

func (*CancelOrderListResponse) OrderReportsSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) OrderReportsInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderReportsSinceVersion()
}

func (*CancelOrderListResponse) OrderReportsDeprecated() uint16 {
	return 0
}

func (*CancelOrderListResponseOrderReports) SbeBlockLength() (blockLength uint) {
	return 135
}

func (*CancelOrderListResponseOrderReports) SbeSchemaVersion() (schemaVersion uint16) {
	return 1
}

func (*CancelOrderListResponse) ListClientOrderIdMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) ListClientOrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) ListClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ListClientOrderIdSinceVersion()
}

func (*CancelOrderListResponse) ListClientOrderIdDeprecated() uint16 {
	return 0
}

func (CancelOrderListResponse) ListClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderListResponse) ListClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*CancelOrderListResponse) SymbolMetaAttribute(meta int) string {
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

func (*CancelOrderListResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderListResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SymbolSinceVersion()
}

func (*CancelOrderListResponse) SymbolDeprecated() uint16 {
	return 0
}

func (CancelOrderListResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderListResponse) SymbolHeaderLength() uint64 {
	return 1
}

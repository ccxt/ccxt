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

type CancelOrderResponse struct {
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

func (c *CancelOrderResponse) Encode(_m *SbeGoMarshaller, _w io.Writer, doRangeCheck bool) error {
	if doRangeCheck {
		if err := c.RangeCheck(c.SbeSchemaVersion(), c.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	if err := _m.WriteInt8(_w, c.PriceExponent); err != nil {
		return err
	}
	if err := _m.WriteInt8(_w, c.QtyExponent); err != nil {
		return err
	}
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

func (c *CancelOrderResponse) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16, blockLength uint16, doRangeCheck bool) error {
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
	if doRangeCheck {
		if err := c.RangeCheck(actingVersion, c.SbeSchemaVersion()); err != nil {
			return err
		}
	}
	return nil
}

func (c *CancelOrderResponse) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
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

func CancelOrderResponseInit(c *CancelOrderResponse) {
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

func (*CancelOrderResponse) SbeBlockLength() (blockLength uint16) {
	return 137
}

func (*CancelOrderResponse) SbeTemplateId() (templateId uint16) {
	return 305
}

func (*CancelOrderResponse) SbeSchemaId() (schemaId uint16) {
	return 3
}

func (*CancelOrderResponse) SbeSchemaVersion() (schemaVersion uint16) {
	return 2
}

func (*CancelOrderResponse) SbeSemanticType() (semanticType []byte) {
	return []byte("")
}

func (*CancelOrderResponse) SbeSemanticVersion() (semanticVersion string) {
	return "5.2"
}

func (*CancelOrderResponse) PriceExponentId() uint16 {
	return 1
}

func (*CancelOrderResponse) PriceExponentSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) PriceExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PriceExponentSinceVersion()
}

func (*CancelOrderResponse) PriceExponentDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) PriceExponentMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) PriceExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*CancelOrderResponse) PriceExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*CancelOrderResponse) PriceExponentNullValue() int8 {
	return math.MinInt8
}

func (*CancelOrderResponse) QtyExponentId() uint16 {
	return 2
}

func (*CancelOrderResponse) QtyExponentSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) QtyExponentInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.QtyExponentSinceVersion()
}

func (*CancelOrderResponse) QtyExponentDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) QtyExponentMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) QtyExponentMinValue() int8 {
	return math.MinInt8 + 1
}

func (*CancelOrderResponse) QtyExponentMaxValue() int8 {
	return math.MaxInt8
}

func (*CancelOrderResponse) QtyExponentNullValue() int8 {
	return math.MinInt8
}

func (*CancelOrderResponse) OrderIdId() uint16 {
	return 3
}

func (*CancelOrderResponse) OrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) OrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderIdSinceVersion()
}

func (*CancelOrderResponse) OrderIdDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) OrderIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) OrderIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) OrderIdMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) OrderIdNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) OrderListIdId() uint16 {
	return 4
}

func (*CancelOrderResponse) OrderListIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) OrderListIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderListIdSinceVersion()
}

func (*CancelOrderResponse) OrderListIdDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) OrderListIdMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) OrderListIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) OrderListIdMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) OrderListIdNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) TransactTimeId() uint16 {
	return 5
}

func (*CancelOrderResponse) TransactTimeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) TransactTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TransactTimeSinceVersion()
}

func (*CancelOrderResponse) TransactTimeDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) TransactTimeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) TransactTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) TransactTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) TransactTimeNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) PriceId() uint16 {
	return 6
}

func (*CancelOrderResponse) PriceSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) PriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PriceSinceVersion()
}

func (*CancelOrderResponse) PriceDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) PriceMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) PriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) PriceMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) PriceNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) OrigQtyId() uint16 {
	return 7
}

func (*CancelOrderResponse) OrigQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) OrigQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrigQtySinceVersion()
}

func (*CancelOrderResponse) OrigQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) OrigQtyMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) OrigQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) OrigQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) OrigQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) ExecutedQtyId() uint16 {
	return 8
}

func (*CancelOrderResponse) ExecutedQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) ExecutedQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ExecutedQtySinceVersion()
}

func (*CancelOrderResponse) ExecutedQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) ExecutedQtyMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) ExecutedQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) ExecutedQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) ExecutedQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) CummulativeQuoteQtyId() uint16 {
	return 9
}

func (*CancelOrderResponse) CummulativeQuoteQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) CummulativeQuoteQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.CummulativeQuoteQtySinceVersion()
}

func (*CancelOrderResponse) CummulativeQuoteQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) CummulativeQuoteQtyMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) CummulativeQuoteQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) CummulativeQuoteQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) CummulativeQuoteQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) StatusId() uint16 {
	return 10
}

func (*CancelOrderResponse) StatusSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) StatusInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.StatusSinceVersion()
}

func (*CancelOrderResponse) StatusDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) StatusMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) TimeInForceId() uint16 {
	return 11
}

func (*CancelOrderResponse) TimeInForceSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) TimeInForceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TimeInForceSinceVersion()
}

func (*CancelOrderResponse) TimeInForceDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) TimeInForceMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) OrderTypeId() uint16 {
	return 12
}

func (*CancelOrderResponse) OrderTypeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) OrderTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderTypeSinceVersion()
}

func (*CancelOrderResponse) OrderTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) OrderTypeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) SideId() uint16 {
	return 13
}

func (*CancelOrderResponse) SideSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) SideInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SideSinceVersion()
}

func (*CancelOrderResponse) SideDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) SideMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) StopPriceId() uint16 {
	return 14
}

func (*CancelOrderResponse) StopPriceSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) StopPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.StopPriceSinceVersion()
}

func (*CancelOrderResponse) StopPriceDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) StopPriceMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) StopPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) StopPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) StopPriceNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) TrailingDeltaId() uint16 {
	return 15
}

func (*CancelOrderResponse) TrailingDeltaSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) TrailingDeltaInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TrailingDeltaSinceVersion()
}

func (*CancelOrderResponse) TrailingDeltaDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) TrailingDeltaMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) TrailingDeltaMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) TrailingDeltaMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) TrailingDeltaNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) TrailingTimeId() uint16 {
	return 16
}

func (*CancelOrderResponse) TrailingTimeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) TrailingTimeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.TrailingTimeSinceVersion()
}

func (*CancelOrderResponse) TrailingTimeDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) TrailingTimeMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) TrailingTimeMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) TrailingTimeMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) TrailingTimeNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) IcebergQtyId() uint16 {
	return 17
}

func (*CancelOrderResponse) IcebergQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) IcebergQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.IcebergQtySinceVersion()
}

func (*CancelOrderResponse) IcebergQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) IcebergQtyMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) IcebergQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) IcebergQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) IcebergQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) StrategyIdId() uint16 {
	return 18
}

func (*CancelOrderResponse) StrategyIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) StrategyIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.StrategyIdSinceVersion()
}

func (*CancelOrderResponse) StrategyIdDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) StrategyIdMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) StrategyIdMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) StrategyIdMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) StrategyIdNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) StrategyTypeId() uint16 {
	return 19
}

func (*CancelOrderResponse) StrategyTypeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) StrategyTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.StrategyTypeSinceVersion()
}

func (*CancelOrderResponse) StrategyTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) StrategyTypeMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) StrategyTypeMinValue() int32 {
	return math.MinInt32 + 1
}

func (*CancelOrderResponse) StrategyTypeMaxValue() int32 {
	return math.MaxInt32
}

func (*CancelOrderResponse) StrategyTypeNullValue() int32 {
	return math.MinInt32
}

func (*CancelOrderResponse) OrderCapacityId() uint16 {
	return 20
}

func (*CancelOrderResponse) OrderCapacitySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) OrderCapacityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrderCapacitySinceVersion()
}

func (*CancelOrderResponse) OrderCapacityDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) OrderCapacityMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) WorkingFloorId() uint16 {
	return 21
}

func (*CancelOrderResponse) WorkingFloorSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) WorkingFloorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.WorkingFloorSinceVersion()
}

func (*CancelOrderResponse) WorkingFloorDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) WorkingFloorMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) SelfTradePreventionModeId() uint16 {
	return 22
}

func (*CancelOrderResponse) SelfTradePreventionModeSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) SelfTradePreventionModeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SelfTradePreventionModeSinceVersion()
}

func (*CancelOrderResponse) SelfTradePreventionModeDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) SelfTradePreventionModeMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) PreventedQuantityId() uint16 {
	return 23
}

func (*CancelOrderResponse) PreventedQuantitySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) PreventedQuantityInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PreventedQuantitySinceVersion()
}

func (*CancelOrderResponse) PreventedQuantityDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) PreventedQuantityMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) PreventedQuantityMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) PreventedQuantityMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) PreventedQuantityNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) UsedSorId() uint16 {
	return 24
}

func (*CancelOrderResponse) UsedSorSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) UsedSorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.UsedSorSinceVersion()
}

func (*CancelOrderResponse) UsedSorDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) UsedSorMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) OrigQuoteOrderQtyId() uint16 {
	return 25
}

func (*CancelOrderResponse) OrigQuoteOrderQtySinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) OrigQuoteOrderQtyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrigQuoteOrderQtySinceVersion()
}

func (*CancelOrderResponse) OrigQuoteOrderQtyDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) OrigQuoteOrderQtyMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) OrigQuoteOrderQtyMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) OrigQuoteOrderQtyMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) OrigQuoteOrderQtyNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) PegPriceTypeId() uint16 {
	return 26
}

func (*CancelOrderResponse) PegPriceTypeSinceVersion() uint16 {
	return 1
}

func (c *CancelOrderResponse) PegPriceTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PegPriceTypeSinceVersion()
}

func (*CancelOrderResponse) PegPriceTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) PegPriceTypeMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) PegOffsetTypeId() uint16 {
	return 27
}

func (*CancelOrderResponse) PegOffsetTypeSinceVersion() uint16 {
	return 1
}

func (c *CancelOrderResponse) PegOffsetTypeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PegOffsetTypeSinceVersion()
}

func (*CancelOrderResponse) PegOffsetTypeDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) PegOffsetTypeMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) PegOffsetValueId() uint16 {
	return 28
}

func (*CancelOrderResponse) PegOffsetValueSinceVersion() uint16 {
	return 1
}

func (c *CancelOrderResponse) PegOffsetValueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PegOffsetValueSinceVersion()
}

func (*CancelOrderResponse) PegOffsetValueDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) PegOffsetValueMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) PegOffsetValueMinValue() uint8 {
	return 0
}

func (*CancelOrderResponse) PegOffsetValueMaxValue() uint8 {
	return math.MaxUint8 - 1
}

func (*CancelOrderResponse) PegOffsetValueNullValue() uint8 {
	return math.MaxUint8
}

func (*CancelOrderResponse) PeggedPriceId() uint16 {
	return 29
}

func (*CancelOrderResponse) PeggedPriceSinceVersion() uint16 {
	return 1
}

func (c *CancelOrderResponse) PeggedPriceInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.PeggedPriceSinceVersion()
}

func (*CancelOrderResponse) PeggedPriceDeprecated() uint16 {
	return 0
}

func (*CancelOrderResponse) PeggedPriceMetaAttribute(meta int) string {
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

func (*CancelOrderResponse) PeggedPriceMinValue() int64 {
	return math.MinInt64 + 1
}

func (*CancelOrderResponse) PeggedPriceMaxValue() int64 {
	return math.MaxInt64
}

func (*CancelOrderResponse) PeggedPriceNullValue() int64 {
	return math.MinInt64
}

func (*CancelOrderResponse) SymbolMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) SymbolSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) SymbolInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.SymbolSinceVersion()
}

func (*CancelOrderResponse) SymbolDeprecated() uint16 {
	return 0
}

func (CancelOrderResponse) SymbolCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderResponse) SymbolHeaderLength() uint64 {
	return 1
}

func (*CancelOrderResponse) OrigClientOrderIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) OrigClientOrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) OrigClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.OrigClientOrderIdSinceVersion()
}

func (*CancelOrderResponse) OrigClientOrderIdDeprecated() uint16 {
	return 0
}

func (CancelOrderResponse) OrigClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderResponse) OrigClientOrderIdHeaderLength() uint64 {
	return 1
}

func (*CancelOrderResponse) ClientOrderIdMetaAttribute(meta int) string {
	switch meta {
	case 1:
		return ""
	case 2:
		return ""
	case 3:
		return ""
	case 4:
		return "required"
	}
	return ""
}

func (*CancelOrderResponse) ClientOrderIdSinceVersion() uint16 {
	return 0
}

func (c *CancelOrderResponse) ClientOrderIdInActingVersion(actingVersion uint16) bool {
	return actingVersion >= c.ClientOrderIdSinceVersion()
}

func (*CancelOrderResponse) ClientOrderIdDeprecated() uint16 {
	return 0
}

func (CancelOrderResponse) ClientOrderIdCharacterEncoding() string {
	return "UTF-8"
}

func (CancelOrderResponse) ClientOrderIdHeaderLength() uint64 {
	return 1
}

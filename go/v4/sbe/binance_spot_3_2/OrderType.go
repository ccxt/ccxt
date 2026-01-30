// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"reflect"
)

type OrderTypeEnum uint8
type OrderTypeValues struct {
	Market           OrderTypeEnum
	Limit            OrderTypeEnum
	StopLoss         OrderTypeEnum
	StopLossLimit    OrderTypeEnum
	TakeProfit       OrderTypeEnum
	TakeProfitLimit  OrderTypeEnum
	LimitMaker       OrderTypeEnum
	NonRepresentable OrderTypeEnum
	NullValue        OrderTypeEnum
}

var OrderType = OrderTypeValues{0, 1, 2, 3, 4, 5, 6, 254, 255}

func (o OrderTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(o)); err != nil {
		return err
	}
	return nil
}

func (o *OrderTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(o)); err != nil {
		return err
	}
	return nil
}

func (o OrderTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(OrderType)
	for idx := 0; idx < value.NumField(); idx++ {
		if o == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on OrderType, unknown enumeration value %d", o)
}

func (*OrderTypeEnum) EncodedLength() int64 {
	return 1
}

func (*OrderTypeEnum) MarketSinceVersion() uint16 {
	return 0
}

func (o *OrderTypeEnum) MarketInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.MarketSinceVersion()
}

func (*OrderTypeEnum) MarketDeprecated() uint16 {
	return 0
}

func (*OrderTypeEnum) LimitSinceVersion() uint16 {
	return 0
}

func (o *OrderTypeEnum) LimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LimitSinceVersion()
}

func (*OrderTypeEnum) LimitDeprecated() uint16 {
	return 0
}

func (*OrderTypeEnum) StopLossSinceVersion() uint16 {
	return 0
}

func (o *OrderTypeEnum) StopLossInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StopLossSinceVersion()
}

func (*OrderTypeEnum) StopLossDeprecated() uint16 {
	return 0
}

func (*OrderTypeEnum) StopLossLimitSinceVersion() uint16 {
	return 0
}

func (o *OrderTypeEnum) StopLossLimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.StopLossLimitSinceVersion()
}

func (*OrderTypeEnum) StopLossLimitDeprecated() uint16 {
	return 0
}

func (*OrderTypeEnum) TakeProfitSinceVersion() uint16 {
	return 0
}

func (o *OrderTypeEnum) TakeProfitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TakeProfitSinceVersion()
}

func (*OrderTypeEnum) TakeProfitDeprecated() uint16 {
	return 0
}

func (*OrderTypeEnum) TakeProfitLimitSinceVersion() uint16 {
	return 0
}

func (o *OrderTypeEnum) TakeProfitLimitInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.TakeProfitLimitSinceVersion()
}

func (*OrderTypeEnum) TakeProfitLimitDeprecated() uint16 {
	return 0
}

func (*OrderTypeEnum) LimitMakerSinceVersion() uint16 {
	return 0
}

func (o *OrderTypeEnum) LimitMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.LimitMakerSinceVersion()
}

func (*OrderTypeEnum) LimitMakerDeprecated() uint16 {
	return 0
}

func (*OrderTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (o *OrderTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.NonRepresentableSinceVersion()
}

func (*OrderTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

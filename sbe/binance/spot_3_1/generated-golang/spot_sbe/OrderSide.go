// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type OrderSideEnum uint8
type OrderSideValues struct {
	Buy              OrderSideEnum
	Sell             OrderSideEnum
	NonRepresentable OrderSideEnum
	NullValue        OrderSideEnum
}

var OrderSide = OrderSideValues{0, 1, 254, 255}

func (o OrderSideEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(o)); err != nil {
		return err
	}
	return nil
}

func (o *OrderSideEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(o)); err != nil {
		return err
	}
	return nil
}

func (o OrderSideEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(OrderSide)
	for idx := 0; idx < value.NumField(); idx++ {
		if o == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on OrderSide, unknown enumeration value %d", o)
}

func (*OrderSideEnum) EncodedLength() int64 {
	return 1
}

func (*OrderSideEnum) BuySinceVersion() uint16 {
	return 0
}

func (o *OrderSideEnum) BuyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.BuySinceVersion()
}

func (*OrderSideEnum) BuyDeprecated() uint16 {
	return 0
}

func (*OrderSideEnum) SellSinceVersion() uint16 {
	return 0
}

func (o *OrderSideEnum) SellInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.SellSinceVersion()
}

func (*OrderSideEnum) SellDeprecated() uint16 {
	return 0
}

func (*OrderSideEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (o *OrderSideEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.NonRepresentableSinceVersion()
}

func (*OrderSideEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

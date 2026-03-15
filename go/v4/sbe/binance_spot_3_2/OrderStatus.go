// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"reflect"
)

type OrderStatusEnum uint8
type OrderStatusValues struct {
	New              OrderStatusEnum
	PartiallyFilled  OrderStatusEnum
	Filled           OrderStatusEnum
	Canceled         OrderStatusEnum
	PendingCancel    OrderStatusEnum
	Rejected         OrderStatusEnum
	Expired          OrderStatusEnum
	ExpiredInMatch   OrderStatusEnum
	PendingNew       OrderStatusEnum
	Unknown          OrderStatusEnum
	NonRepresentable OrderStatusEnum
	NullValue        OrderStatusEnum
}

var OrderStatus = OrderStatusValues{0, 1, 2, 3, 4, 5, 6, 9, 11, 253, 254, 255}

func (o OrderStatusEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(o)); err != nil {
		return err
	}
	return nil
}

func (o *OrderStatusEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(o)); err != nil {
		return err
	}
	return nil
}

func (o OrderStatusEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(OrderStatus)
	for idx := 0; idx < value.NumField(); idx++ {
		if o == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on OrderStatus, unknown enumeration value %d", o)
}

func (*OrderStatusEnum) EncodedLength() int64 {
	return 1
}

func (*OrderStatusEnum) NewSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) NewInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.NewSinceVersion()
}

func (*OrderStatusEnum) NewDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) PartiallyFilledSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) PartiallyFilledInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PartiallyFilledSinceVersion()
}

func (*OrderStatusEnum) PartiallyFilledDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) FilledSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) FilledInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.FilledSinceVersion()
}

func (*OrderStatusEnum) FilledDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) CanceledSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) CanceledInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.CanceledSinceVersion()
}

func (*OrderStatusEnum) CanceledDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) PendingCancelSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) PendingCancelInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PendingCancelSinceVersion()
}

func (*OrderStatusEnum) PendingCancelDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) RejectedSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) RejectedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.RejectedSinceVersion()
}

func (*OrderStatusEnum) RejectedDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) ExpiredSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) ExpiredInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExpiredSinceVersion()
}

func (*OrderStatusEnum) ExpiredDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) ExpiredInMatchSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) ExpiredInMatchInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.ExpiredInMatchSinceVersion()
}

func (*OrderStatusEnum) ExpiredInMatchDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) PendingNewSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) PendingNewInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PendingNewSinceVersion()
}

func (*OrderStatusEnum) PendingNewDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) UnknownSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) UnknownInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.UnknownSinceVersion()
}

func (*OrderStatusEnum) UnknownDeprecated() uint16 {
	return 0
}

func (*OrderStatusEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (o *OrderStatusEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.NonRepresentableSinceVersion()
}

func (*OrderStatusEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

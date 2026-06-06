// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_1

import (
	"fmt"
	"io"
	"reflect"
)

type OrderCapacityEnum uint8
type OrderCapacityValues struct {
	Principal        OrderCapacityEnum
	Agency           OrderCapacityEnum
	NonRepresentable OrderCapacityEnum
	NullValue        OrderCapacityEnum
}

var OrderCapacity = OrderCapacityValues{1, 2, 254, 255}

func (o OrderCapacityEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(o)); err != nil {
		return err
	}
	return nil
}

func (o *OrderCapacityEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(o)); err != nil {
		return err
	}
	return nil
}

func (o OrderCapacityEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(OrderCapacity)
	for idx := 0; idx < value.NumField(); idx++ {
		if o == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on OrderCapacity, unknown enumeration value %d", o)
}

func (*OrderCapacityEnum) EncodedLength() int64 {
	return 1
}

func (*OrderCapacityEnum) PrincipalSinceVersion() uint16 {
	return 0
}

func (o *OrderCapacityEnum) PrincipalInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.PrincipalSinceVersion()
}

func (*OrderCapacityEnum) PrincipalDeprecated() uint16 {
	return 0
}

func (*OrderCapacityEnum) AgencySinceVersion() uint16 {
	return 0
}

func (o *OrderCapacityEnum) AgencyInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.AgencySinceVersion()
}

func (*OrderCapacityEnum) AgencyDeprecated() uint16 {
	return 0
}

func (*OrderCapacityEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (o *OrderCapacityEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= o.NonRepresentableSinceVersion()
}

func (*OrderCapacityEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

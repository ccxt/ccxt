// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type AllocationTypeEnum uint8
type AllocationTypeValues struct {
	Unknown          AllocationTypeEnum
	Sor              AllocationTypeEnum
	NonRepresentable AllocationTypeEnum
	NullValue        AllocationTypeEnum
}

var AllocationType = AllocationTypeValues{0, 2, 254, 255}

func (a AllocationTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(a)); err != nil {
		return err
	}
	return nil
}

func (a *AllocationTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(a)); err != nil {
		return err
	}
	return nil
}

func (a AllocationTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(AllocationType)
	for idx := 0; idx < value.NumField(); idx++ {
		if a == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on AllocationType, unknown enumeration value %d", a)
}

func (*AllocationTypeEnum) EncodedLength() int64 {
	return 1
}

func (*AllocationTypeEnum) UnknownSinceVersion() uint16 {
	return 0
}

func (a *AllocationTypeEnum) UnknownInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.UnknownSinceVersion()
}

func (*AllocationTypeEnum) UnknownDeprecated() uint16 {
	return 0
}

func (*AllocationTypeEnum) SorSinceVersion() uint16 {
	return 0
}

func (a *AllocationTypeEnum) SorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SorSinceVersion()
}

func (*AllocationTypeEnum) SorDeprecated() uint16 {
	return 0
}

func (*AllocationTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (a *AllocationTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.NonRepresentableSinceVersion()
}

func (*AllocationTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

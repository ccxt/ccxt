// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type AccountTypeEnum uint8
type AccountTypeValues struct {
	Spot             AccountTypeEnum
	Unknown          AccountTypeEnum
	NonRepresentable AccountTypeEnum
	NullValue        AccountTypeEnum
}

var AccountType = AccountTypeValues{0, 2, 254, 255}

func (a AccountTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(a)); err != nil {
		return err
	}
	return nil
}

func (a *AccountTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(a)); err != nil {
		return err
	}
	return nil
}

func (a AccountTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(AccountType)
	for idx := 0; idx < value.NumField(); idx++ {
		if a == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on AccountType, unknown enumeration value %d", a)
}

func (*AccountTypeEnum) EncodedLength() int64 {
	return 1
}

func (*AccountTypeEnum) SpotSinceVersion() uint16 {
	return 0
}

func (a *AccountTypeEnum) SpotInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.SpotSinceVersion()
}

func (*AccountTypeEnum) SpotDeprecated() uint16 {
	return 0
}

func (*AccountTypeEnum) UnknownSinceVersion() uint16 {
	return 0
}

func (a *AccountTypeEnum) UnknownInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.UnknownSinceVersion()
}

func (*AccountTypeEnum) UnknownDeprecated() uint16 {
	return 0
}

func (*AccountTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (a *AccountTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= a.NonRepresentableSinceVersion()
}

func (*AccountTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

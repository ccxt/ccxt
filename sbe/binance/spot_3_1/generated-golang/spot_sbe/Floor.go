// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type FloorEnum uint8
type FloorValues struct {
	Exchange         FloorEnum
	Broker           FloorEnum
	Sor              FloorEnum
	NonRepresentable FloorEnum
	NullValue        FloorEnum
}

var Floor = FloorValues{1, 2, 3, 254, 255}

func (f FloorEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(f)); err != nil {
		return err
	}
	return nil
}

func (f *FloorEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(f)); err != nil {
		return err
	}
	return nil
}

func (f FloorEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(Floor)
	for idx := 0; idx < value.NumField(); idx++ {
		if f == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on Floor, unknown enumeration value %d", f)
}

func (*FloorEnum) EncodedLength() int64 {
	return 1
}

func (*FloorEnum) ExchangeSinceVersion() uint16 {
	return 0
}

func (f *FloorEnum) ExchangeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.ExchangeSinceVersion()
}

func (*FloorEnum) ExchangeDeprecated() uint16 {
	return 0
}

func (*FloorEnum) BrokerSinceVersion() uint16 {
	return 0
}

func (f *FloorEnum) BrokerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.BrokerSinceVersion()
}

func (*FloorEnum) BrokerDeprecated() uint16 {
	return 0
}

func (*FloorEnum) SorSinceVersion() uint16 {
	return 0
}

func (f *FloorEnum) SorInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.SorSinceVersion()
}

func (*FloorEnum) SorDeprecated() uint16 {
	return 0
}

func (*FloorEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (f *FloorEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= f.NonRepresentableSinceVersion()
}

func (*FloorEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

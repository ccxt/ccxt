// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"reflect"
)

type BoolEnumEnum uint8
type BoolEnumValues struct {
	False     BoolEnumEnum
	True      BoolEnumEnum
	NullValue BoolEnumEnum
}

var BoolEnum = BoolEnumValues{0, 1, 255}

func (b BoolEnumEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(b)); err != nil {
		return err
	}
	return nil
}

func (b *BoolEnumEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(b)); err != nil {
		return err
	}
	return nil
}

func (b BoolEnumEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(BoolEnum)
	for idx := 0; idx < value.NumField(); idx++ {
		if b == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on BoolEnum, unknown enumeration value %d", b)
}

func (*BoolEnumEnum) EncodedLength() int64 {
	return 1
}

func (*BoolEnumEnum) FalseSinceVersion() uint16 {
	return 0
}

func (b *BoolEnumEnum) FalseInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.FalseSinceVersion()
}

func (*BoolEnumEnum) FalseDeprecated() uint16 {
	return 0
}

func (*BoolEnumEnum) TrueSinceVersion() uint16 {
	return 0
}

func (b *BoolEnumEnum) TrueInActingVersion(actingVersion uint16) bool {
	return actingVersion >= b.TrueSinceVersion()
}

func (*BoolEnumEnum) TrueDeprecated() uint16 {
	return 0
}

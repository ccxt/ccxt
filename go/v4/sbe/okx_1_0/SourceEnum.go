// Generated SBE (Simple Binary Encoding) message codec

package okx_1_0

import (
	"fmt"
	"io"
	"reflect"
)

type SourceEnumEnum int8
type SourceEnumValues struct {
	NORMAL    SourceEnumEnum
	ELP       SourceEnumEnum
	NullValue SourceEnumEnum
}

var SourceEnum = SourceEnumValues{0, 1, -128}

func (s SourceEnumEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteInt8(_w, int8(s)); err != nil {
		return err
	}
	return nil
}

func (s *SourceEnumEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadInt8(_r, (*int8)(s)); err != nil {
		return err
	}
	return nil
}

func (s SourceEnumEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(SourceEnum)
	for idx := 0; idx < value.NumField(); idx++ {
		if s == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on SourceEnum, unknown enumeration value %d", s)
}

func (*SourceEnumEnum) EncodedLength() int64 {
	return 1
}

func (*SourceEnumEnum) NORMALSinceVersion() uint16 {
	return 0
}

func (s *SourceEnumEnum) NORMALInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.NORMALSinceVersion()
}

func (*SourceEnumEnum) NORMALDeprecated() uint16 {
	return 0
}

func (*SourceEnumEnum) ELPSinceVersion() uint16 {
	return 0
}

func (s *SourceEnumEnum) ELPInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.ELPSinceVersion()
}

func (*SourceEnumEnum) ELPDeprecated() uint16 {
	return 0
}

// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type MatchTypeEnum uint8
type MatchTypeValues struct {
	AutoMatch           MatchTypeEnum
	OnePartyTradeReport MatchTypeEnum
	NonRepresentable    MatchTypeEnum
	NullValue           MatchTypeEnum
}

var MatchType = MatchTypeValues{1, 2, 254, 255}

func (m MatchTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(m)); err != nil {
		return err
	}
	return nil
}

func (m *MatchTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(m)); err != nil {
		return err
	}
	return nil
}

func (m MatchTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(MatchType)
	for idx := 0; idx < value.NumField(); idx++ {
		if m == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on MatchType, unknown enumeration value %d", m)
}

func (*MatchTypeEnum) EncodedLength() int64 {
	return 1
}

func (*MatchTypeEnum) AutoMatchSinceVersion() uint16 {
	return 0
}

func (m *MatchTypeEnum) AutoMatchInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.AutoMatchSinceVersion()
}

func (*MatchTypeEnum) AutoMatchDeprecated() uint16 {
	return 0
}

func (*MatchTypeEnum) OnePartyTradeReportSinceVersion() uint16 {
	return 0
}

func (m *MatchTypeEnum) OnePartyTradeReportInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.OnePartyTradeReportSinceVersion()
}

func (*MatchTypeEnum) OnePartyTradeReportDeprecated() uint16 {
	return 0
}

func (*MatchTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (m *MatchTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= m.NonRepresentableSinceVersion()
}

func (*MatchTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

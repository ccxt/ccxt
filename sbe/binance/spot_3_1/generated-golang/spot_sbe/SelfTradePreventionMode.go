// Generated SBE (Simple Binary Encoding) message codec

package spot_sbe

import (
	"fmt"
	"io"
	"reflect"
)

type SelfTradePreventionModeEnum uint8
type SelfTradePreventionModeValues struct {
	None             SelfTradePreventionModeEnum
	ExpireTaker      SelfTradePreventionModeEnum
	ExpireMaker      SelfTradePreventionModeEnum
	ExpireBoth       SelfTradePreventionModeEnum
	Decrement        SelfTradePreventionModeEnum
	NonRepresentable SelfTradePreventionModeEnum
	NullValue        SelfTradePreventionModeEnum
}

var SelfTradePreventionMode = SelfTradePreventionModeValues{1, 2, 3, 4, 5, 254, 255}

func (s SelfTradePreventionModeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(s)); err != nil {
		return err
	}
	return nil
}

func (s *SelfTradePreventionModeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(s)); err != nil {
		return err
	}
	return nil
}

func (s SelfTradePreventionModeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(SelfTradePreventionMode)
	for idx := 0; idx < value.NumField(); idx++ {
		if s == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on SelfTradePreventionMode, unknown enumeration value %d", s)
}

func (*SelfTradePreventionModeEnum) EncodedLength() int64 {
	return 1
}

func (*SelfTradePreventionModeEnum) NoneSinceVersion() uint16 {
	return 0
}

func (s *SelfTradePreventionModeEnum) NoneInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.NoneSinceVersion()
}

func (*SelfTradePreventionModeEnum) NoneDeprecated() uint16 {
	return 0
}

func (*SelfTradePreventionModeEnum) ExpireTakerSinceVersion() uint16 {
	return 0
}

func (s *SelfTradePreventionModeEnum) ExpireTakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.ExpireTakerSinceVersion()
}

func (*SelfTradePreventionModeEnum) ExpireTakerDeprecated() uint16 {
	return 0
}

func (*SelfTradePreventionModeEnum) ExpireMakerSinceVersion() uint16 {
	return 0
}

func (s *SelfTradePreventionModeEnum) ExpireMakerInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.ExpireMakerSinceVersion()
}

func (*SelfTradePreventionModeEnum) ExpireMakerDeprecated() uint16 {
	return 0
}

func (*SelfTradePreventionModeEnum) ExpireBothSinceVersion() uint16 {
	return 0
}

func (s *SelfTradePreventionModeEnum) ExpireBothInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.ExpireBothSinceVersion()
}

func (*SelfTradePreventionModeEnum) ExpireBothDeprecated() uint16 {
	return 0
}

func (*SelfTradePreventionModeEnum) DecrementSinceVersion() uint16 {
	return 0
}

func (s *SelfTradePreventionModeEnum) DecrementInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.DecrementSinceVersion()
}

func (*SelfTradePreventionModeEnum) DecrementDeprecated() uint16 {
	return 0
}

func (*SelfTradePreventionModeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (s *SelfTradePreventionModeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.NonRepresentableSinceVersion()
}

func (*SelfTradePreventionModeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

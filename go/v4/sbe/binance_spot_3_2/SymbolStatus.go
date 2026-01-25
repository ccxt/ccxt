// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"reflect"
)

type SymbolStatusEnum uint8
type SymbolStatusValues struct {
	Trading          SymbolStatusEnum
	EndOfDay         SymbolStatusEnum
	Halt             SymbolStatusEnum
	Break            SymbolStatusEnum
	NonRepresentable SymbolStatusEnum
	NullValue        SymbolStatusEnum
}

var SymbolStatus = SymbolStatusValues{0, 1, 2, 3, 254, 255}

func (s SymbolStatusEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(s)); err != nil {
		return err
	}
	return nil
}

func (s *SymbolStatusEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(s)); err != nil {
		return err
	}
	return nil
}

func (s SymbolStatusEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(SymbolStatus)
	for idx := 0; idx < value.NumField(); idx++ {
		if s == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on SymbolStatus, unknown enumeration value %d", s)
}

func (*SymbolStatusEnum) EncodedLength() int64 {
	return 1
}

func (*SymbolStatusEnum) TradingSinceVersion() uint16 {
	return 0
}

func (s *SymbolStatusEnum) TradingInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.TradingSinceVersion()
}

func (*SymbolStatusEnum) TradingDeprecated() uint16 {
	return 0
}

func (*SymbolStatusEnum) EndOfDaySinceVersion() uint16 {
	return 0
}

func (s *SymbolStatusEnum) EndOfDayInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.EndOfDaySinceVersion()
}

func (*SymbolStatusEnum) EndOfDayDeprecated() uint16 {
	return 0
}

func (*SymbolStatusEnum) HaltSinceVersion() uint16 {
	return 0
}

func (s *SymbolStatusEnum) HaltInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.HaltSinceVersion()
}

func (*SymbolStatusEnum) HaltDeprecated() uint16 {
	return 0
}

func (*SymbolStatusEnum) BreakSinceVersion() uint16 {
	return 0
}

func (s *SymbolStatusEnum) BreakInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.BreakSinceVersion()
}

func (*SymbolStatusEnum) BreakDeprecated() uint16 {
	return 0
}

func (*SymbolStatusEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (s *SymbolStatusEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= s.NonRepresentableSinceVersion()
}

func (*SymbolStatusEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"reflect"
)

type ExecutionTypeEnum uint8
type ExecutionTypeValues struct {
	New              ExecutionTypeEnum
	Canceled         ExecutionTypeEnum
	Replaced         ExecutionTypeEnum
	Rejected         ExecutionTypeEnum
	Trade            ExecutionTypeEnum
	Expired          ExecutionTypeEnum
	TradePrevention  ExecutionTypeEnum
	Unknown          ExecutionTypeEnum
	NonRepresentable ExecutionTypeEnum
	NullValue        ExecutionTypeEnum
}

var ExecutionType = ExecutionTypeValues{0, 1, 2, 3, 4, 5, 8, 253, 254, 255}

func (e ExecutionTypeEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(e)); err != nil {
		return err
	}
	return nil
}

func (e *ExecutionTypeEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(e)); err != nil {
		return err
	}
	return nil
}

func (e ExecutionTypeEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(ExecutionType)
	for idx := 0; idx < value.NumField(); idx++ {
		if e == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on ExecutionType, unknown enumeration value %d", e)
}

func (*ExecutionTypeEnum) EncodedLength() int64 {
	return 1
}

func (*ExecutionTypeEnum) NewSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) NewInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.NewSinceVersion()
}

func (*ExecutionTypeEnum) NewDeprecated() uint16 {
	return 0
}

func (*ExecutionTypeEnum) CanceledSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) CanceledInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.CanceledSinceVersion()
}

func (*ExecutionTypeEnum) CanceledDeprecated() uint16 {
	return 0
}

func (*ExecutionTypeEnum) ReplacedSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) ReplacedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ReplacedSinceVersion()
}

func (*ExecutionTypeEnum) ReplacedDeprecated() uint16 {
	return 0
}

func (*ExecutionTypeEnum) RejectedSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) RejectedInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.RejectedSinceVersion()
}

func (*ExecutionTypeEnum) RejectedDeprecated() uint16 {
	return 0
}

func (*ExecutionTypeEnum) TradeSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) TradeInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.TradeSinceVersion()
}

func (*ExecutionTypeEnum) TradeDeprecated() uint16 {
	return 0
}

func (*ExecutionTypeEnum) ExpiredSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) ExpiredInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.ExpiredSinceVersion()
}

func (*ExecutionTypeEnum) ExpiredDeprecated() uint16 {
	return 0
}

func (*ExecutionTypeEnum) TradePreventionSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) TradePreventionInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.TradePreventionSinceVersion()
}

func (*ExecutionTypeEnum) TradePreventionDeprecated() uint16 {
	return 0
}

func (*ExecutionTypeEnum) UnknownSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) UnknownInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.UnknownSinceVersion()
}

func (*ExecutionTypeEnum) UnknownDeprecated() uint16 {
	return 0
}

func (*ExecutionTypeEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (e *ExecutionTypeEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= e.NonRepresentableSinceVersion()
}

func (*ExecutionTypeEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

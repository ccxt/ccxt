// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"reflect"
)

type TimeInForceEnum uint8
type TimeInForceValues struct {
	Gtc              TimeInForceEnum
	Ioc              TimeInForceEnum
	Fok              TimeInForceEnum
	NonRepresentable TimeInForceEnum
	NullValue        TimeInForceEnum
}

var TimeInForce = TimeInForceValues{0, 1, 2, 254, 255}

func (t TimeInForceEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(t)); err != nil {
		return err
	}
	return nil
}

func (t *TimeInForceEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(t)); err != nil {
		return err
	}
	return nil
}

func (t TimeInForceEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(TimeInForce)
	for idx := 0; idx < value.NumField(); idx++ {
		if t == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on TimeInForce, unknown enumeration value %d", t)
}

func (*TimeInForceEnum) EncodedLength() int64 {
	return 1
}

func (*TimeInForceEnum) GtcSinceVersion() uint16 {
	return 0
}

func (t *TimeInForceEnum) GtcInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.GtcSinceVersion()
}

func (*TimeInForceEnum) GtcDeprecated() uint16 {
	return 0
}

func (*TimeInForceEnum) IocSinceVersion() uint16 {
	return 0
}

func (t *TimeInForceEnum) IocInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.IocSinceVersion()
}

func (*TimeInForceEnum) IocDeprecated() uint16 {
	return 0
}

func (*TimeInForceEnum) FokSinceVersion() uint16 {
	return 0
}

func (t *TimeInForceEnum) FokInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.FokSinceVersion()
}

func (*TimeInForceEnum) FokDeprecated() uint16 {
	return 0
}

func (*TimeInForceEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (t *TimeInForceEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= t.NonRepresentableSinceVersion()
}

func (*TimeInForceEnum) NonRepresentableDeprecated() uint16 {
	return 0
}

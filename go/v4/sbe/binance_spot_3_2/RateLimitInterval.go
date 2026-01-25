// Generated SBE (Simple Binary Encoding) message codec

package binance_spot_3_2

import (
	"fmt"
	"io"
	"reflect"
)

type RateLimitIntervalEnum uint8
type RateLimitIntervalValues struct {
	Second           RateLimitIntervalEnum
	Minute           RateLimitIntervalEnum
	Hour             RateLimitIntervalEnum
	Day              RateLimitIntervalEnum
	NonRepresentable RateLimitIntervalEnum
	NullValue        RateLimitIntervalEnum
}

var RateLimitInterval = RateLimitIntervalValues{0, 1, 2, 3, 254, 255}

func (r RateLimitIntervalEnum) Encode(_m *SbeGoMarshaller, _w io.Writer) error {
	if err := _m.WriteUint8(_w, uint8(r)); err != nil {
		return err
	}
	return nil
}

func (r *RateLimitIntervalEnum) Decode(_m *SbeGoMarshaller, _r io.Reader, actingVersion uint16) error {
	if err := _m.ReadUint8(_r, (*uint8)(r)); err != nil {
		return err
	}
	return nil
}

func (r RateLimitIntervalEnum) RangeCheck(actingVersion uint16, schemaVersion uint16) error {
	if actingVersion > schemaVersion {
		return nil
	}
	value := reflect.ValueOf(RateLimitInterval)
	for idx := 0; idx < value.NumField(); idx++ {
		if r == value.Field(idx).Interface() {
			return nil
		}
	}
	return fmt.Errorf("Range check failed on RateLimitInterval, unknown enumeration value %d", r)
}

func (*RateLimitIntervalEnum) EncodedLength() int64 {
	return 1
}

func (*RateLimitIntervalEnum) SecondSinceVersion() uint16 {
	return 0
}

func (r *RateLimitIntervalEnum) SecondInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.SecondSinceVersion()
}

func (*RateLimitIntervalEnum) SecondDeprecated() uint16 {
	return 0
}

func (*RateLimitIntervalEnum) MinuteSinceVersion() uint16 {
	return 0
}

func (r *RateLimitIntervalEnum) MinuteInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.MinuteSinceVersion()
}

func (*RateLimitIntervalEnum) MinuteDeprecated() uint16 {
	return 0
}

func (*RateLimitIntervalEnum) HourSinceVersion() uint16 {
	return 0
}

func (r *RateLimitIntervalEnum) HourInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.HourSinceVersion()
}

func (*RateLimitIntervalEnum) HourDeprecated() uint16 {
	return 0
}

func (*RateLimitIntervalEnum) DaySinceVersion() uint16 {
	return 0
}

func (r *RateLimitIntervalEnum) DayInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.DaySinceVersion()
}

func (*RateLimitIntervalEnum) DayDeprecated() uint16 {
	return 0
}

func (*RateLimitIntervalEnum) NonRepresentableSinceVersion() uint16 {
	return 0
}

func (r *RateLimitIntervalEnum) NonRepresentableInActingVersion(actingVersion uint16) bool {
	return actingVersion >= r.NonRepresentableSinceVersion()
}

func (*RateLimitIntervalEnum) NonRepresentableDeprecated() uint16 {
	return 0
}
